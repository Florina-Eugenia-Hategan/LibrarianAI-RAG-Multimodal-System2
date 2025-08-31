# pdf_utils.py
"""
Utility functions for extracting text from PDF files.
"""

import io
from PyPDF2 import PdfReader

def extract_text_from_pdf_bytes(pdf_bytes: bytes) -> str:
    reader = PdfReader(io.BytesIO(pdf_bytes))
    text = ""
    for page in reader.pages:
        text += page.extract_text() or ""
    return text
