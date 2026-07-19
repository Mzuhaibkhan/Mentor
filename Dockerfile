# Stage 1: Build the React frontend
FROM node:20-alpine AS build-stage
WORKDIR /app/frontend

# Copy package files and install precisely matching versions
COPY frontend/package*.json ./
RUN npm ci

# Copy source and build
COPY frontend/ ./
ENV NODE_ENV=production
RUN npm run build

# Stage 2: Setup Python FastAPI backend
FROM python:3.11-slim
WORKDIR /app

# Create a non-root user for security
RUN adduser --disabled-password --gecos '' appuser

# Install python dependencies
COPY backend/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy the backend code
COPY backend/ ./backend/

# Copy the built frontend artifacts into the /static directory
COPY --from=build-stage /app/frontend/dist /static

# Change ownership of the app directory to the non-root user
RUN chown -R appuser:appuser /app
USER appuser

# Expose the application port
EXPOSE 8000

# Set environment variables for production
ENV PYTHONUNBUFFERED=1
ENV STATIC_DIR="/static"

# Run Uvicorn server
CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8000"]
