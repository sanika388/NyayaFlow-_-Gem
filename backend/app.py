import os
import jwt
import json
import google.generativeai as genai
from flask import send_from_directory
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import mysql.connector
import datetime
from werkzeug.utils import secure_filename
from werkzeug.security import check_password_hash
from functools import wraps
from dotenv import load_dotenv
# In app.py
from flask_cors import CORS

# Setup Environment
load_dotenv()
app = Flask(__name__)

CORS(app, resources={r"/*": {"origins": "*"}})
# Configure Gemini
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
# Configure Gemini for Structured Output
model = genai.GenerativeModel(
    # Or 'gemini-1.5-flash' depending on your specific API access
    model_name='gemini-2.5-flash',
    generation_config={
        "response_mime_type": "application/json",
        "temperature": 0.1
    }
)

SECRET_KEY = "nyaya_super_secret_key_2026"
UPLOAD_FOLDER = os.path.join(os.path.dirname(
    os.path.abspath(__file__)), 'uploads')
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

# --- DATABASE CONNECTION ---


def get_db_connection():
    return mysql.connector.connect(
        host=os.getenv("DB_HOST"),
        user=os.getenv("DB_USER"),
        password=os.getenv("DB_PASSWORD"),
        database=os.getenv("DB_NAME"),
        autocommit=True
    )

# --- AUTH DECORATOR ---


@app.after_request
def after_request(response):
    response.headers.remove('X-Frame-Options')
    return response


def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization')
        if not token:
            return jsonify({'message': 'Token is missing!'}), 401
        try:
            token = token.split(" ")[1] if " " in token else token
            # Decode the token to get the data inside (including user_id)
            data = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
            # Make sure your login route puts this in the JWT
            current_user_id = data.get('user_id')
        except:
            return jsonify({'message': 'Token is invalid!'}), 401

        # Pass the user_id to the route function
        return f(current_user_id, *args, **kwargs)
    return decorated


# This allows the React app to "see" the PDF files
@app.route('/uploads/<filename>')
def uploaded_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)
# --- THE GEMINI EXTRACTION ENGINE ---


def extract_with_gemini(file_path, mime_type):
    # 1. READ FILE
    with open(file_path, "rb") as f:
        file_data = f.read()

    prompt = """
    ACT AS: An expert RTI (Right to Information) Data Entry Clerk.
    TASK: Extract metadata from the provided RTI document.
    
    EXTRACTION HIERARCHY for 'section_name':
    1. Look for keywords like "Section", "Cell", "Branch", or "Unit".
    2. If not found, look at the Letterhead/Header for the specific office name.
    3. If multiple sections are mentioned, pick the one handling the 'Disposal' or 'CPIO'.
    4. Default to 'RTI Cell' if a specific branch is not identifiable but it's clearly an RTI response.

    LANGUAGE RULE:
    - If the document is in Hindi (or any regional language), TRANSLATE all values to English.

    JSON SCHEMA (Strict):
    {
      "reg_number": "Exact registration string (e.g., MOEAF/R/2023/12345)",
      "ministry_name": "Full name of the Ministry",
      "dept_name": "Full name of the Department",
      "section_name": "Specific Section/Branch/Cell name",
      "filing_date": "YYYY-MM-DD (Date of application/receipt)",
      "reply_date": "YYYY-MM-DD or null (Date of this response letter)"
    }
    """

    response = model.generate_content([
        prompt,
        {"mime_type": mime_type, "data": file_data}
    ])

    try:

        return json.loads(response.text)
    except Exception as e:
        print(f"Extraction Error: {e}")
        return {
            "reg_number": "Not Found",
            "ministry_name": "Not Found",
            "dept_name": "Not Found",
            "section_name": "Not Found",
            "filing_date": "Not Found",
            "reply_date": None
        }


# --- ROUTES ---
@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    if not data:
        return jsonify({"message": "No data received"}), 400

    user_input = str(data.get('username', '')).strip()
    pass_input = str(data.get('password', '')).strip()

    # 1. Connect to MySQL
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    # 2. Search for the user in the DB
    cursor.execute("SELECT * FROM users WHERE username = %s", (user_input,))
    user = cursor.fetchone()

    cursor.close()
    conn.close()

    # 3. Use check_password_hash to handle that "scrypt" string from your image
    if user and check_password_hash(user['password'], pass_input):
        token = jwt.encode({
            'user_id': user['id'],
            'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=24)
        }, SECRET_KEY, algorithm="HS256")

        return jsonify({'access_token': token}), 200

    return jsonify({'message': 'Invalid Admin Credentials'}), 401


@app.route('/api/cases', methods=['GET'])
@token_required
def get_cases(current_user_id):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute("SELECT * FROM rti_applications ORDER BY id DESC")
        cases = cursor.fetchall()

        # This belongs INSIDE the try block for debugging
        print(
            f"DEBUG: Found {len(cases)} cases in DB for user {current_user_id}")

        for case in cases:
            if case.get('filing_date'):
                case['filing_date'] = str(case['filing_date'])
            if case.get('reply_date'):
                case['reply_date'] = str(case['reply_date'])

        return jsonify(cases), 200
    except Exception as e:
        print(f"Fetch Error: {e}")
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()
        conn.close()


@app.route('/api/cases/<int:case_id>', methods=['DELETE'])
@token_required
def delete_case(current_user_id, case_id):
    # Get a fresh connection from your function
    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        # Step 1: Execute the delete
        # Note: We use %s to safely pass the case_id
        sql = "DELETE FROM rti_applications WHERE id = %s"
        cursor.execute(sql, (case_id,))

        # Step 2: COMMIT THE CHANGE
        # MySQL will not save the deletion without this line!
        conn.commit()

        # Check if a row was actually deleted
        if cursor.rowcount == 0:
            return jsonify({"error": "Record not found in database"}), 404

        return jsonify({"message": "Record deleted successfully"}), 200

    except Exception as e:
        print(f"DATABASE DELETE ERROR: {e}")
        return jsonify({"error": "Internal Server Error"}), 500
    finally:
        # Always close the connection to prevent "Too many connections" errors
        cursor.close()
        conn.close()


@app.route('/api/upload', methods=['POST'])
@token_required
def upload_file(current_user_id):
    if 'file' not in request.files:
        return jsonify({"error": "No file"}), 400

    file = request.files['file']
    filename = secure_filename(file.filename)
    file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
    file.save(file_path)

    # Determine MIME type for Gemini
    mime_type = "application/pdf" if filename.lower().endswith('.pdf') else "image/jpeg"
    if filename.lower().endswith('.png'):
        mime_type = "image/png"

    try:
        # One simple call replaces all OCR and Regex logic
        extracted_data = extract_with_gemini(file_path, mime_type)
        return jsonify({
            "extracted_data": extracted_data,
            "filename": filename
        }), 200
    except Exception as e:
        print(f"Gemini Error: {e}")
        return jsonify({"error": "Failed to process document with Gemini"}), 500


@app.route('/api/confirm-rti', methods=['POST'])
@token_required
def confirm_rti(current_user_id):  # Add current_user_id here
    data = request.json
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        if data.get('id'):
            # UPDATE existing record
            sql = """UPDATE rti_applications SET 
                     reg_number=%s, ministry_name=%s, dept_name=%s, 
                     section_name=%s, filing_date=%s, reply_date=%s, 
                     filename=%s, user_id=%s 
                     WHERE id=%s"""
            cursor.execute(sql, (
                data['reg_number'], data['ministry_name'], data['dept_name'],
                data['section_name'], data['filing_date'], data['reply_date'],
                data['filename'], current_user_id, data['id']
            ))
        else:
            # INSERT new record
            sql = """INSERT INTO rti_applications 
                     (reg_number, ministry_name, dept_name, section_name, 
                      filing_date, reply_date, filename, user_id) 
                     VALUES (%s, %s, %s, %s, %s, %s, %s, %s)"""
            cursor.execute(sql, (
                data['reg_number'], data['ministry_name'], data['dept_name'],
                data['section_name'], data['filing_date'], data['reply_date'],
                data['filename'], current_user_id
            ))
        return jsonify({"message": "Saved successfully"}), 200
    except Exception as e:
        # This helps you see the error in the terminal
        print(f"Database Error: {e}")
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()
        conn.close()
# Keep your existing get_cases, delete_case, and login routes here...
# [Omitted for brevity, but they stay exactly as you had them]


if __name__ == '__main__':
    app.run(debug=True, port=5000)
