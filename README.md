# AlgoMentor AI 🧠💻

**AlgoMentor AI** is an elite, strict C++ and algorithms interview coach designed to help software engineers master competitive programming and technical interviews. Built with a fast, modern **FastAPI** backend and a responsive, high-performance **React + Vite + Tailwind CSS** frontend, it acts as a demanding mock interviewer.

---

## 🌟 Core Directives & Persona

AlgoMentor AI adheres to the strict **"AlgoMentor Persona"**:
1. **Strict Technical Scope**: Locked strictly to technical algorithms, data structures, and C++ coding. It will refuse to discuss non-coding or non-technical topics.
2. **Big-O Focus**: Delivers in-depth time and space complexity analysis for all questions and code blocks.
3. **Strategic Hinting**: Provides progressive hints, guiding questions, and strategic concepts instead of spoon-feeding full code refactors or complete answers.
4. **Clean Formatting**: Outputs beautiful Markdown with syntax-highlighted C++ code, clear lists, and bold emphasis on technical terms.

---

## 🚀 Features

- **Split-Screen Workspace**: Write or paste your current C++ code on the left, and chat with the AI mentor on the right.
- **Dual AI Engine**:
  - **Google Gemini**: Built-in support for Gemini models (e.g., `gemini-3.5-flash`, `gemini-2.5-pro`) using the official `google-genai` SDK.
  - **DeepSeek V4 Pro**: Integration via NVIDIA NIM API (`deepseek-ai/deepseek-v4-pro`) for high-fidelity reasoning.
- **Heartbeat & Event Streaming**: Responsive real-time Streaming Responses (Server-Sent Events) with built-in connection heartbeat monitoring.
- **Dockerized Ready**: Production-grade multi-stage Docker build containerizing both the frontend and backend.

---

## 📁 Directory Structure

```text
Mentor/
├── backend/                 # FastAPI Backend Application
│   ├── config.py            # Configuration & Settings using Pydantic Settings
│   ├── main.py              # Application setup, router, and streaming logic
│   ├── schemas.py           # Pydantic data schemas for chat payloads
│   └── requirements.txt     # Python backend dependencies
├── frontend/                # React Vite Frontend Application
│   ├── src/
│   │   ├── components/      # UI components (e.g., Waves background)
│   │   ├── pages/           # LandingPage and main workspace
│   │   ├── App.jsx          # Main Chat App workspace UI
│   │   └── index.css        # Tailwind CSS and global style definitions
│   ├── package.json         # Frontend Node dependencies & scripts
│   └── vite.config.js       # Vite configuration
├── Dockerfile               # Multi-stage production Dockerfile
├── setup.ps1                # Automated setup script (Windows PowerShell)
└── README.md                # Root project documentation (this file)
```

---

## 🛠️ Setup & Installation

### Option 1: Automated Script (Windows)

Run the following script to create a Python virtual environment, install backend packages, configure Vite, and install frontend node packages:
```powershell
./setup.ps1
```

### Option 2: Manual Step-by-Step Setup

#### 1. Configure Environment Variables
Create a `.env` file in the `backend/` directory (or the root directory) with the following content:
```env
GEMINI_API_KEY="your-google-gemini-api-key"
NVIDIA_API_KEY="your-nvidia-nim-api-key" # Optional, for DeepSeek V4 Pro
```

#### 2. Backend Setup
Navigate to the `backend/` folder:
```bash
cd backend
# Create virtual environment
python -m venv .venv
# Activate virtual environment
# On Windows:
.\.venv\Scripts\activate
# On macOS/Linux:
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

#### 3. Frontend Setup
Navigate to the `frontend/` folder:
```bash
cd ../frontend
# Install npm dependencies
npm install
```

---

## 🖥️ Running the Application

### Running Locally

To run the application locally for development, run both the backend and frontend servers:

1. **Start the Backend Server**:
   From the `backend/` directory with `.venv` active:
   ```bash
   uvicorn backend.main:app --reload --port 8000
   ```
   The backend API will run at `http://localhost:8000`.

2. **Start the Frontend Dev Server**:
   From the `frontend/` directory:
   ```bash
   npm run dev
   ```
   Open `http://localhost:5173` in your browser.

---

## 🐳 Docker Deployment

The application includes a production-ready, multi-stage Docker build which serves the pre-built React frontend directly from the FastAPI backend server as static assets.

1. **Build the Docker Image**:
   From the root directory:
   ```bash
   docker build -t algomentor-ai .
   ```

2. **Run the Container**:
   Pass your API keys as environment variables:
   ```bash
   docker run -p 8000:8000 \
     -e GEMINI_API_KEY="your-google-gemini-api-key" \
     -e NVIDIA_API_KEY="your-nvidia-nim-api-key" \
     algomentor-ai
   ```
   Access the full unified app at `http://localhost:8000`.

---

## 📝 Technologies Used

- **Frontend**: React 19, Vite, Tailwind CSS v4, React Router DOM, React Markdown (GitHub Flavored Markdown), Prism Syntax Highlighter.
- **Backend**: FastAPI, Uvicorn, Pydantic v2 (Settings), Google GenAI SDK, OpenAI Client SDK (compatible with NVIDIA NIM API).
- **Deployment**: Docker multi-stage builds.
