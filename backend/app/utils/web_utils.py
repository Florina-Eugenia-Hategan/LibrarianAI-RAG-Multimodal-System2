# web_utils.py
"""
Utility functions for extracting text from web pages and URLs.
"""

import requests
from bs4 import BeautifulSoup

def extract_text_from_url(url: str) -> str:
    response = requests.get(url)
    response.raise_for_status()
    soup = BeautifulSoup(response.text, "html.parser")
    # Extrage doar textul vizibil
    text = soup.get_text(separator=" ", strip=True)
    return text
