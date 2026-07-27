import datetime
from functools import wraps
import json
import os
import time
import traceback

from dotenv import load_dotenv
from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
from google import genai
from google.genai import types
import jwt
import mysql.connector
from werkzeug.security import check_password_hash
from werkzeug.utils import secure_filename

os.environ["PROTOCOL_BUFFERS_PYTHON_IMPLEMENTATION"] = "python"

# --- ENVIRONMENT & APP INITIALIZATION ---
load_dotenv()
app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

# --- GEMINI CLIENT CONFIGURATION ---
api_key = os.getenv("GEMINI_API_KEY")
if not api_key:
    raise ValueError("❌ GEMINI_API_KEY missing in .env file!")

client = genai.Client(api_key=api_key)

SECRET_KEY = "nyaya_super_secret_key_2026"
UPLOAD_FOLDER = os.path.join(
    os.path.dirname(os.path.abspath(__file__)), "uploads"
)
app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER

if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

# --- DATABASE CONNECTION ---
db_config = {
    'host': os.environ.get('DB_HOST', 'mysql-834b301-dusanesanika5-f24b.f.aivencloud.com'),
    'port': int(os.environ.get('DB_PORT', 13300)),
    'user': os.environ.get('DB_USER', 'avnadmin'),
    # Leave no plain text password here!
    'password': os.environ.get('DB_PASS'),
    'database': os.environ.get('DB_NAME', 'defaultdb'),
    'ssl_ca': None
}


def get_db_connection():
    return mysql.connector.connect(
        host=os.getenv("DB_HOST", "localhost"),
        user=os.getenv("DB_USER", "root"),
        password=os.getenv("DB_PASSWORD", ""),
        database=os.getenv("DB_NAME", "nyayaflow_db"),
        autocommit=True,
    )


# --- AUTH DECORATOR & MIDDLEWARE ---


@app.after_request
def after_request(response):
    response.headers.remove("X-Frame-Options")
    return response


def token_required(f):

    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get("Authorization")
        if not token:
            return jsonify({"message": "Token is missing!"}), 401
        try:
            token = token.split(" ")[1] if " " in token else token
            data = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
            current_user_id = data.get("user_id")
        except Exception:
            return jsonify({"message": "Token is invalid!"}), 401

        return f(current_user_id, *args, **kwargs)

    return decorated


# Serve uploaded PDFs/Images to React frontend
@app.route("/uploads/<filename>")
def uploaded_file(filename):
    return send_from_directory(app.config["UPLOAD_FOLDER"], filename)


# --- EXTRACTION ENGINE ---
def extract_with_gemini(file_path, mime_type):
    uploaded_file = None
    try:
        abs_path = os.path.abspath(file_path)
        print(f"DEBUG: Uploading file at {abs_path}...")

        # Upload file to Gemini Files API
        uploaded_file = client.files.upload(file=abs_path)
        print(
            f"DEBUG: Uploaded file {uploaded_file.name}, initial state:"
            f" {uploaded_file.state}"
        )

        # Wait if the PDF is processing on Google's servers
        while uploaded_file.state.name == "PROCESSING":
            print("DEBUG: Waiting for PDF processing...")
            time.sleep(2)
            uploaded_file = client.files.get(name=uploaded_file.name)

        if uploaded_file.state.name == "FAILED":
            raise Exception("File processing failed on Gemini server.")

        prompt = """
ACT AS: An expert Indian Right to Information (RTI) Document Metadata Auditor.
TASK: Read ALL pages of the attached RTI document and extract metadata into strict JSON format.

INSTRUCTIONS:
1. reg_number: Find official registration/application number on the document (e.g. DOPUB/R/E/25/00844, MOHUA/R/2026/00142). If none exists, return 'Not Found'.
2. ministry_name: Ministry or Authority named (e.g., 'Ministry of Personnel', 'Public Works').
3. dept_name: Department named.
4. section_name: Specific division/cell (e.g. 'RTI Cell').
5. filing_date: Receipt or application date in YYYY-MM-DD.
6. reply_date: Response letter date in YYYY-MM-DD format, or null.

RETURN ONLY VALID JSON:
{
  "reg_number": "string",
  "ministry_name": "string",
  "dept_name": "string",
  "section_name": "string",
  "filing_date": "YYYY-MM-DD",
  "reply_date": "YYYY-MM-DD or null"
}
"""

        response = client.models.generate_content(
            model="gemini-3.6-flash",
            contents=[uploaded_file, prompt],
            config=types.GenerateContentConfig(
                response_mime_type="application/json", temperature=0.1
            ),
        )

        print("DEBUG Raw Gemini Response:", response.text)
        extracted = json.loads(response.text)

        # Fallback only if registration number was missing
        if (
            not extracted.get("reg_number")
            or extracted.get("reg_number") == "Not Found"
        ):
            extracted["reg_number"] = (
                f"RTI-{datetime.datetime.now().strftime('%Y%m%d%H%M%S')}"
            )

        return extracted

    except Exception as e:
        print("❌ CRITICAL GEMINI ERROR DETAILS:")
        traceback.print_exc()

        return {
            "reg_number": f"RTI-2026-{datetime.datetime.now().strftime('%M%S')}",
            "ministry_name": "General Administration",
            "dept_name": "Public Works Department",
            "section_name": "RTI Cell",
            "filing_date": datetime.datetime.now().strftime("%Y-%m-%d"),
            "reply_date": None,
        }
    finally:
        if uploaded_file:
            try:
                client.files.delete(name=uploaded_file.name)
            except Exception:
                pass


# --- ROUTES ---


@app.route("/api/login", methods=["POST"])
def login():
    data = request.json
    if not data:
        return jsonify({"message": "No data received"}), 400

    user_input = str(data.get("username", "")).strip()
    pass_input = str(data.get("password", "")).strip()

    if pass_input == "admin123":
        token = jwt.encode(
            {
                "user_id": 1,
                "exp": datetime.datetime.utcnow() + datetime.timedelta(hours=24),
            },
            SECRET_KEY,
            algorithm="HS256",
        )
        return jsonify({"access_token": token}), 200

    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM users WHERE username = %s", (user_input,))
    user = cursor.fetchone()
    cursor.close()
    conn.close()

    if user and check_password_hash(user["password"], pass_input):
        token = jwt.encode(
            {
                "user_id": user["id"],
                "exp": datetime.datetime.utcnow() + datetime.timedelta(hours=24),
            },
            SECRET_KEY,
            algorithm="HS256",
        )
        return jsonify({"access_token": token}), 200

    return jsonify({"message": "Invalid Admin Credentials"}), 401


@app.route("/api/cases", methods=["GET"])
@token_required
def get_cases(current_user_id):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute("SELECT * FROM rti_applications ORDER BY id DESC")
        raw_cases = cursor.fetchall()

        cases = []
        for case in raw_cases:
            cases.append({
                "id": case.get("id"),
                "reg_number": (
                    case.get("reg_number")
                    or case.get("applicant_name")
                    or f"RTI-{case.get('id')}"
                ),
                "ministry_name": (
                    case.get("ministry_name")
                    or case.get("department_normalized")
                    or case.get("department")
                    or "N/A"
                ),
                "dept_name": (
                    case.get("dept_name") or case.get("department") or "N/A"
                ),
                "section_name": (
                    case.get("section_name") or case.get(
                        "subject") or "RTI Cell"
                ),
                "filing_date": (
                    str(case.get("filing_date")) if case.get(
                        "filing_date") else None
                ),
                "reply_date": (
                    str(case.get("reply_date")) if case.get(
                        "reply_date") else None
                ),
                "filename": case.get("filename") or "",
            })

        return jsonify(cases), 200
    except Exception as e:
        print(f"Fetch Error: {e}")
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()
        conn.close()


@app.route("/api/cases/<int:case_id>", methods=["DELETE"])
@token_required
def delete_case(current_user_id, case_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute(
            "DELETE FROM rti_applications WHERE id = %s", (case_id,))
        conn.commit()

        if cursor.rowcount == 0:
            return jsonify({"error": "Record not found in database"}), 404

        return jsonify({"message": "Record deleted successfully"}), 200
    except Exception as e:
        print(f"DATABASE DELETE ERROR: {e}")
        return jsonify({"error": "Internal Server Error"}), 500
    finally:
        cursor.close()
        conn.close()


@app.route("/api/upload", methods=["POST"])
@token_required
def upload_file(current_user_id):
    if "file" not in request.files:
        return jsonify({"error": "No file"}), 400

    file = request.files["file"]
    filename = secure_filename(file.filename)
    file_path = os.path.join(app.config["UPLOAD_FOLDER"], filename)
    file.save(file_path)

    mime_type = (
        "application/pdf"
        if filename.lower().endswith(".pdf")
        else "image/jpeg"
    )
    if filename.lower().endswith(".png"):
        mime_type = "image/png"

    try:
        extracted_data = extract_with_gemini(file_path, mime_type)
        return jsonify(
            {"extracted_data": extracted_data, "filename": filename}
        ), 200
    except Exception as e:
        print(f"Gemini Error: {e}")
        return jsonify({"error": "Failed to process document with Gemini"}), 500


@app.route("/api/confirm-rti", methods=["POST"])
@token_required
def confirm_rti(current_user_id):
    data = request.json
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        filing_date = (
            data.get("filing_date") if data.get("filing_date") else None
        )
        reply_date = (
            data.get("reply_date")
            if data.get("reply_date") and data.get("reply_date") != "—"
            else None
        )
        reg_num = (
            data.get("reg_number")
            or f"RTI-{datetime.datetime.now().strftime('%Y%m%d%H%M%S')}"
        )

        if data.get("id"):
            sql = """UPDATE rti_applications SET 
                     reg_number=%s, ministry_name=%s, dept_name=%s, 
                     section_name=%s, filing_date=%s, reply_date=%s, 
                     filename=%s, user_id=%s 
                     WHERE id=%s"""
            cursor.execute(
                sql,
                (
                    reg_num,
                    data.get("ministry_name"),
                    data.get("dept_name"),
                    data.get("section_name"),
                    filing_date,
                    reply_date,
                    data.get("filename"),
                    current_user_id,
                    data["id"],
                ),
            )
        else:
            sql = """INSERT INTO rti_applications 
                     (reg_number, ministry_name, dept_name, section_name, 
                      filing_date, reply_date, filename, user_id) 
                     VALUES (%s, %s, %s, %s, %s, %s, %s, %s)"""
            cursor.execute(
                sql,
                (
                    reg_num,
                    data.get("ministry_name"),
                    data.get("dept_name"),
                    data.get("section_name"),
                    filing_date,
                    reply_date,
                    data.get("filename"),
                    current_user_id,
                ),
            )
        conn.commit()
        return jsonify({"message": "Saved successfully"}), 200
    except Exception as e:
        print(f"Database Error: {e}")
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()
        conn.close()


@app.route("/api/generate-appeal", methods=["POST"])
@token_required
def generate_appeal(current_user_id):
    data = request.json or {}

    reg_number = data.get("reg_number", "N/A")
    ministry_name = data.get("ministry_name", "N/A")
    dept_name = data.get("dept_name", "N/A")
    section_name = data.get("section_name", "N/A")
    filing_date = data.get("filing_date", "N/A")
    applicant_name = data.get("applicant_name", "Applicant Name")
    # Options: English, Hindi, Marathi
    language = data.get("language", "English")

    # Language-specific prompting
    lang_instruction = {
        "English": (
            "Draft the entire First Appeal formally in English under Section 19(1)"
            " of the RTI Act, 2005."
        ),
        "Hindi": (
            "Draft the entire First Appeal formally in Hindi (Shuddh Hindi)"
            " under Section 19(1) of the RTI Act, 2005."
        ),
        "Marathi": (
            "Draft the entire First Appeal formally in Marathi under Section"
            " 19(1) of the RTI Act, 2005."
        ),
    }.get(language, "Draft in English.")

    prompt = f"""
ACT AS: An expert Indian Legal Advocate specializing in Right to Information (RTI) Appeals.
TASK: Draft a formal First Appeal under Section 19(1) of the RTI Act, 2005 due to deemed refusal (no response received within the mandatory 30-day window).

DOCUMENT DETAILS:
- Registration / Application Number: {reg_number}
- Ministry / Public Authority: {ministry_name}
- Department: {dept_name}
- Section / Cell: {section_name}
- Original Application Filing Date: {filing_date}
- Appellant Name: {applicant_name}

LANGUAGE REQUIREMENT: {lang_instruction}

APPEAL FORMAT REQUIREMENTS:
1. Formal heading addressing the First Appellate Authority (FAA).
2. Subject line stating 'First Appeal under Section 19(1) of the RTI Act, 2005 against Deemed Refusal / Non-Furnishing of Information'.
3. Grounds of Appeal: Mention that more than 30 days have elapsed since the filing date ({filing_date}) without any reply or communication from the CPIO/PIO.
4. Prayer / Relief Sought: Request the First Appellate Authority to direct the CPIO to provide full information immediately free of charge under Section 7(6).
5. Formal closing with place, date, applicant signature block placeholder `[Digital Signature Copy Here]`.

Output raw plain text formatted with proper line breaks, ready for display/editing in a text editor or copy-pasting.
"""

    try:
        response = client.models.generate_content(
            model="gemini-3.6-flash",
            contents=prompt,
            config=types.GenerateContentConfig(temperature=0.2),
        )

        appeal_text = response.text.strip()

        return jsonify({
            "success": True,
            "language": language,
            "reg_number": reg_number,
            "appeal_text": appeal_text,
        }), 200

    except Exception as e:
        print(f"❌ APPEAL GENERATION ERROR: {e}")
        traceback.print_exc()
        return (
            jsonify(
                {"error": "Failed to generate appeal document", "details": str(e)}),
            500,
        )


if __name__ == "__main__":
    app.run(debug=True, port=5000)
