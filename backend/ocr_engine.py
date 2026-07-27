import os
import base64
import json
from dotenv import load_dotenv
import google.generativeai as genai

load_dotenv()

# Configure Gemini
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))


def process_rti_document(file_path):
    """
    Surgical replacement of OCR/Regex with Gemini 3 Flash.
    Handles PDF/Images directly and returns structured data.
    """
    print(f"Gemini is analyzing: {file_path}")

    # 1. Prepare the file for Gemini
    with open(file_path, "rb") as f:
        doc_data = f.read()

    mime_type = "application/pdf" if file_path.lower().endswith('.pdf') else "image/jpeg"

    # 2. Initialize Gemini 3 Flash
    model = genai.GenerativeModel(model_name="gemini-3-flash")

    # 3. The "Extraction Command" (Replaces all Regex and Anchor logic)
    prompt = """
    Strictly analyze this RTI document and return ONLY a JSON object with these keys:
    {
      "dept_name": "Full name of the Ministry/Department",
      "filing_date": "YYYY-MM-DD",
      "reply_date": "YYYY-MM-DD",
      "reg_number": "The Registration Number (e.g., DEPT/R/E/25/00000)",
      "confidence": 0.95
    }
    Notes: 
    - Convert all dates to YYYY-MM-DD format.
    - If a field is missing, use "Not Found".
    - Focus on Indian RTI document structures.
    """

    # 4. Multimodal Request
    response = model.generate_content([
        prompt,
        {"mime_type": mime_type, "data": doc_data}
    ])

    # 5. Parsing the AI response
    try:
        # Remove any markdown backticks if Gemini includes them
        clean_json = response.text.replace(
            "```json", "").replace("```", "").strip()
        extracted_data = json.loads(clean_json)
        full_text = response.text  # Keep this for your database logs
    except Exception as e:
        print(f"Parsing Error: {e}")
        # Fallback if AI output is messy
        extracted_data = {
            "dept_name": "Detection Error",
            "filing_date": None,
            "reply_date": None,
            "reg_number": "Not Found",
            "confidence": 0.0
        }
        full_text = "Error parsing AI response"

    return extracted_data, full_text
