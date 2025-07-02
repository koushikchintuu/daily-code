from fastapi import FastAPI, HTTPException, Query, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBasic, HTTPBasicCredentials
from pydantic import BaseModel
from typing import List, Optional
import secrets

app = FastAPI()

# Enable CORS for all origins (for development)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

security = HTTPBasic()

class User(BaseModel):
    username: str
    password: str

users: List[User] = []

def get_current_user(credentials: HTTPBasicCredentials = Depends(security)):
    for user in users:
        if user.username == credentials.username and user.password == credentials.password:
            return user.username
    raise HTTPException(status_code=401, detail="Invalid credentials")

@app.post("/register")
def register(user: User):
    if any(u.username == user.username for u in users):
        raise HTTPException(status_code=400, detail="Username already exists.")
    users.append(user)
    print(users)
    return {"message": "User registered successfully."}

@app.post("/login")
def login(credentials: HTTPBasicCredentials = Depends(security)):
    for user in users:
        if user.username == credentials.username and user.password == credentials.password:
            return {"token": user.username}
    raise HTTPException(status_code=401, detail="Invalid credentials")

class Task(BaseModel):
    id: int
    title: str
    completed: bool = False
    due_date: Optional[str] = None  # ISO format string
    priority: Optional[int] = None  # 1 (high) - 5 (low)
    category: Optional[str] = None
    user: str

tasks: List[Task] = []

@app.get("/tasks", response_model=List[Task])
def get_tasks(user: str = Depends(get_current_user)):
    return [t for t in tasks if t.user == user]

@app.post("/tasks", response_model=Task)
def add_task(task: Task, user: str = Depends(get_current_user)):
    if any(t.id == task.id for t in tasks):
        raise HTTPException(status_code=400, detail="Task with this ID already exists.")
    task.user = user
    tasks.append(task)
    return task

@app.delete("/tasks/{task_id}", response_model=Task)
def delete_task(task_id: int, user: str = Depends(get_current_user)):
    for i, t in enumerate(tasks):
        if t.id == task_id and t.user == user:
            removed = tasks.pop(i)
            return removed
    raise HTTPException(status_code=404, detail="Task not found.")

@app.put("/tasks/{task_id}", response_model=Task)
def update_task(task_id: int, updated_task: Task, user: str = Depends(get_current_user)):
    for i, t in enumerate(tasks):
        if t.id == task_id and t.user == user:
            updated_task.user = user
            tasks[i] = updated_task
            return updated_task
    raise HTTPException(status_code=404, detail="Task not found.")

@app.get("/tasks/search", response_model=List[Task])
def search_tasks(
    title: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    completed: Optional[bool] = Query(None),
    due_date: Optional[str] = Query(None),
    priority: Optional[int] = Query(None),
    user: str = Depends(get_current_user),
):
    results = [t for t in tasks if t.user == user]
    if title is not None:
        results = [t for t in results if title.lower() in t.title.lower()]
    if category is not None:
        results = [t for t in results if t.category == category]
    if completed is not None:
        results = [t for t in results if t.completed == completed]
    if due_date is not None:
        results = [t for t in results if t.due_date == due_date]
    if priority is not None:
        results = [t for t in results if t.priority == priority]
    return results 