import asyncio
import os
from fastapi import FastAPI, Request
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from google import genai
from google.genai import types

from backend.config import settings
from backend.schemas import ChatPayload

app = FastAPI(title="AlgoMentor AI")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

client = genai.Client(api_key=settings.GEMINI_API_KEY)

SYSTEM_INSTRUCTION = """You are the "AlgoMentor Persona". You are an elite, strict engineering interviewer specializing in C++ competitive programming.
Your core directives are:
1. Lock yourself strictly to technical algorithms and C++ coding. Refuse to discuss non-coding or non-technical topics.
2. Focus deeply on Big O time and space complexity in your analyses.
3. Provide strategic hints and guidance instead of giving full code refactors or complete answers.
"""

@app.post("/api/chat/stream")
async def chat_stream(payload: ChatPayload, request: Request):
    async def event_generator():
        contents = []
        for msg in payload.history:
            role = "user" if msg.role == "user" else "model"
            contents.append(
                types.Content(role=role, parts=[types.Part.from_text(msg.content)])
            )
            
        if payload.current_code:
            contents.append(
                types.Content(
                    role="user", 
                    parts=[types.Part.from_text(f"Here is my current code context:\n```cpp\n{payload.current_code}\n```")]
                )
            )

        config = types.GenerateContentConfig(
            system_instruction=SYSTEM_INSTRUCTION,
            temperature=0.2,
        )

        try:
            stream = await client.aio.models.generate_content_stream(
                model='gemini-2.5-pro',
                contents=contents,
                config=config
            )
            
            async for chunk in stream:
                if await request.is_disconnected():
                    break
                if chunk.text:
                    yield f"data: {chunk.text}\n\n"
                    
        except asyncio.CancelledError:
            pass
        except Exception as e:
            yield f"data: [ERROR] {str(e)}\n\n"

    async def heartbeat_generator():
        queue = asyncio.Queue()
        
        async def fetch():
            try:
                async for chunk in event_generator():
                    await queue.put(chunk)
            finally:
                await queue.put(None)
                
        fetch_task = asyncio.create_task(fetch())
        
        try:
            while True:
                if await request.is_disconnected():
                    fetch_task.cancel()
                    break
                    
                try:
                    chunk = await asyncio.wait_for(queue.get(), timeout=15.0)
                    if chunk is None:
                        break
                    yield chunk
                except asyncio.TimeoutError:
                    yield ": heartbeat\n\n"
        except asyncio.CancelledError:
            fetch_task.cancel()
        except Exception:
            fetch_task.cancel()

    return StreamingResponse(heartbeat_generator(), media_type="text/event-stream")

# Mount Static Files for Monolith Deployment
STATIC_DIR = os.getenv("STATIC_DIR", "/static")
if os.path.exists(STATIC_DIR):
    app.mount("/", StaticFiles(directory=STATIC_DIR, html=True), name="static")
