NyayaFlow ⚖️

Intelligent RTI Analysis & Automation System

NyayaFlow is a professional-grade system designed to analyze Right to Information (RTI) response delays using Data Science, Computer Vision, and Generative AI. This system is built for real-world deployment and transforms raw RTI documents into structured, actionable insights.

🚀 Core Features
Gemini AI OCR Extraction: Leverages Gemini AI to extract high-accuracy data from RTI files, including handwritten content.

Canvas Copilot: Interactive visualization workspace for tracking compliance and delay metrics.

End-to-End Pipeline: A fully functional data flow from PDF upload to automated analytical reporting.

Privacy-First Architecture: Designed to handle sensitive documents securely with local environment configurations.

🛠️ Tech Stack
AI Engine: Google Gemini AI (Multimodal OCR & Extraction).

Backend: Python-based API logic for data processing.

Frontend: React-based UI for system interaction and visualization.

Database: Structured storage for RTI metadata and tracking.

📁 Project Structure
Plaintext
NyayaFlow_Gem/
├── backend/            # AI & API logic (Python)
│   ├── ocr_engine.py   # Gemini AI extraction core
│   └── .env            # Private API keys (Hidden from Git)
├── frontend/           # React user interface
└── requirements.txt    # System dependencies
⚙️ Professional Setup & Security
To ensure this system is ready to deploy while keeping credentials secret, follow these steps:

Environment Variables: Create a .env file in the backend folder.

API Configuration: Add your key as GEMINI_API_KEY=your_key_here.

Security: The .env file is strictly ignored by Git to prevent exposing private keys.
