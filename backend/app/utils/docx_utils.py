# docx_utils.py
"""
Utility functions for extracting text from DOCX files.
"""

import io
from docx import Document

def extract_text_from_docx_bytes(docx_bytes: bytes) -> str:
    file_stream = io.BytesIO(docx_bytes)
    doc = Document(file_stream)
    text = "\n".join([para.text for para in doc.paragraphs])
    return text
