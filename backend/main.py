import asyncio
import os
from fastapi import FastAPI, Request
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from google import genai
from google.genai import types
from openai import AsyncOpenAI

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

# ── Clients ────────────────────────────────────────
gemini_client = genai.Client(api_key=settings.GEMINI_API_KEY)

# NVIDIA NIM hosts DeepSeek V4 Pro via an OpenAI-compatible API
nvidia_client = AsyncOpenAI(
    api_key=settings.NVIDIA_API_KEY or "no-key",
    base_url="https://integrate.api.nvidia.com/v1",
) if settings.NVIDIA_API_KEY else None

# ── System Prompt ──────────────────────────────────
SYSTEM_INSTRUCTION = """You are the "AlgoMentor Persona". You are an elite, strict engineering interviewer specializing in C++ competitive programming.
Your core directives are:
1. Lock yourself strictly to technical algorithms and C++ coding. Refuse to discuss non-coding or non-technical topics.
2. Focus deeply on Big O time and space complexity in your analyses.
3. Provide strategic hints and guidance instead of giving full code refactors or complete answers.
4. Format ALL your responses using Markdown:
   - Use **bold** for emphasis on key terms.
   - Use `inline code` for variable names, keywords, and short expressions.
   - Use fenced code blocks with the cpp language tag for C++ code snippets.
   - Use headers (##, ###) to structure long explanations.
   - Use bullet or numbered lists to present multiple points clearly.
   - Write Big-O complexity using plain text like O(n log n) or O(1) — do NOT use LaTeX math notation like $\mathcal{O}$.
"""

# ── Route ──────────────────────────────────────────
@app.post("/api/chat/stream")
async def chat_stream(payload: ChatPayload, request: Request):
    model = payload.model

    # ── Gemini branch ──────────────────────────────
    if model.startswith("gemini"):
        async def gemini_event_generator():
            contents = []
            for msg in payload.history:
                role = "user" if msg.role == "user" else "model"
                contents.append(
                    types.Content(role=role, parts=[types.Part.from_text(text=msg.content)])
                )
            if payload.current_code:
                contents.append(
                    types.Content(
                        role="user",
                        parts=[types.Part.from_text(text=f"Here is my current code context:\n```cpp\n{payload.current_code}\n```")]
                    )
                )
            config = types.GenerateContentConfig(
                system_instruction=SYSTEM_INSTRUCTION,
                temperature=0.2,
            )
            try:
                stream = await gemini_client.aio.models.generate_content_stream(
                    model=model,
                    contents=contents,
                    config=config
                )
                async for chunk in stream:
                    if await request.is_disconnected():
                        break
                    if chunk.text:
                        safe_text = chunk.text.replace('\n', '\\n')
                        yield f"data: {safe_text}\n\n"
            except asyncio.CancelledError:
                pass
            except Exception as e:
                yield f"data: [ERROR] {str(e)}\n\n"

        async def gemini_heartbeat():
            queue = asyncio.Queue()
            async def fetch():
                try:
                    async for chunk in gemini_event_generator():
                        await queue.put(chunk)
                finally:
                    await queue.put(None)
            fetch_task = asyncio.create_task(fetch())
            try:
                while True:
                    if await request.is_disconnected():
                        fetch_task.cancel(); break
                    try:
                        chunk = await asyncio.wait_for(queue.get(), timeout=15.0)
                        if chunk is None: break
                        yield chunk
                    except asyncio.TimeoutError:
                        yield ": heartbeat\n\n"
            except (asyncio.CancelledError, Exception):
                fetch_task.cancel()

        return StreamingResponse(gemini_heartbeat(), media_type="text/event-stream")

    # ── NVIDIA NIM / DeepSeek V4 Pro branch ───────────
    elif model.startswith("deepseek"):
        if not nvidia_client:
            async def err():
                yield "data: [ERROR] NVIDIA_API_KEY is not set in your .env file.\n\n"
            return StreamingResponse(err(), media_type="text/event-stream")

        async def nvidia_event_generator():
            messages = [{"role": "system", "content": SYSTEM_INSTRUCTION}]
            for msg in payload.history:
                messages.append({"role": msg.role if msg.role == "user" else "assistant", "content": msg.content})
            if payload.current_code:
                messages.append({
                    "role": "user",
                    "content": f"Here is my current code context:\n```cpp\n{payload.current_code}\n```"
                })
            try:
                stream = await nvidia_client.chat.completions.create(
                    model="deepseek-ai/deepseek-v4-pro",
                    messages=messages,
                    temperature=1,
                    top_p=0.95,
                    max_tokens=16384,
                    extra_body={"chat_template_kwargs": {"thinking": False}},
                    stream=True,
                )
                async for chunk in stream:
                    if await request.is_disconnected():
                        break
                    delta = chunk.choices[0].delta.content if chunk.choices else None
                    if delta:
                        safe_text = delta.replace('\n', '\\n')
                        yield f"data: {safe_text}\n\n"
            except asyncio.CancelledError:
                pass
            except Exception as e:
                yield f"data: [ERROR] {str(e)}\n\n"

        return StreamingResponse(nvidia_event_generator(), media_type="text/event-stream")

    else:
        async def unknown():
            yield f"data: [ERROR] Unknown model: {model}\n\n"
        return StreamingResponse(unknown(), media_type="text/event-stream")


# ── Static Files (production monolith) ─────────────
STATIC_DIR = os.getenv("STATIC_DIR", "/static")
if os.path.exists(STATIC_DIR):
    app.mount("/", StaticFiles(directory=STATIC_DIR, html=True), name="static")
