# Simple To-Do List App

## Features
- Add a task
- View all tasks
- Delete a task

## Tech Stack
- **Backend:** FastAPI (Python, in-memory storage)
- **Frontend:** React.js (Vite)

---

## Getting Started

### 1. Backend (FastAPI)

```
cd backend
# Activate virtual environment (Windows)
venv\Scripts\activate
# Install dependencies
pip install -r requirements.txt
# Run the server
uvicorn main:app --reload
```

The backend will be available at `http://localhost:8000`.

### 2. Frontend (React + Vite)

```
cd frontend
npm install
npm run dev
```

The frontend will be available at the URL shown in your terminal (usually `http://localhost:5173`).

---

## Usage
- Add a task using the input and button.
- View all tasks in the list.
- Delete a task by clicking the delete button next to it.

---

**Note:** This app uses in-memory storage, so tasks will reset when the backend restarts. 