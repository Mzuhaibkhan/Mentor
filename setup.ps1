cd backend
python -m venv .venv
.\.venv\Scripts\activate
pip install -r requirements.txt
cd ..
npm create vite@latest frontend -- --template react --yes
cd frontend
npm install
npm install -D @tailwindcss/vite tailwindcss
