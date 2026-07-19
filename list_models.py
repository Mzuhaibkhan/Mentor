import asyncio
from google import genai
from backend.config import settings

client = genai.Client(api_key=settings.GEMINI_API_KEY)
for model in client.models.list():
    if 'flash' in model.name.lower() and 'generateContent' in model.supported_generation_methods:
        print(f"Found flash model: {model.name}")
