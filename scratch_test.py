import asyncio
from backend.config import settings
from google import genai
from google.genai import types

async def test():
    client = genai.Client(api_key=settings.GEMINI_API_KEY)
    contents = [types.Content(role="user", parts=[types.Part.from_text(text="Hello")])]
    config = types.GenerateContentConfig(
        system_instruction="You are an elite, strict engineering interviewer.",
        temperature=0.2,
    )
    try:
        stream = await client.aio.models.generate_content_stream(
            model='gemini-2.5-pro',
            contents=contents,
            config=config
        )
        async for chunk in stream:
            print(chunk.text)
    except Exception as e:
        print(f"ERROR: {type(e).__name__} - {e}")

asyncio.run(test())
