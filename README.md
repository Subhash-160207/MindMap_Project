# MindMap Studio 📋

An interactive Kanban board web app built with Flask, MongoDB, and vanilla JavaScript.

---

## What it does

- Create boards to organize your projects
- Add lists (columns) like "To Do", "Doing", "Done"
- Add cards (tasks) inside each list
- Drag and drop cards between lists
- Set priority and due dates on each card
- Login/Signup with JWT authentication

---

## Tech Stack

- **Frontend:** HTML, CSS, JavaScript (Vanilla)
- **Backend:** Python + Flask
- **Database:** MongoDB

---

## Setup Instructions (Windows 11 + VS Code)

### Step 1: Install MongoDB

1. Download MongoDB Community Server from https://www.mongodb.com/try/download/community
2. Install it (keep default settings)
3. MongoDB will run as a service automatically on port 27017

### Step 2: Set up and run the backend

Open the **backend** folder in VS Code terminal:

```bash
cd backend
pip install -r requirements.txt
python app.py
```

You will see:
```
========================================
  MindMap Studio is running!
  Open this in your browser:
  http://localhost:5000
========================================
```

### Step 3: Open in browser

Just open your browser and go to:
```
http://localhost:5000
```

That's it! No Live Server needed. Flask serves everything.

---

## Project Structure

```
MindMap-Studio/
├── backend/
│   ├── app.py              ← Start the server from here
│   ├── config.py           ← MongoDB URL and JWT secret
│   ├── requirements.txt    ← Python packages
│   ├── routes/             ← API endpoints
│   ├── services/           ← JWT helper
│   └── database/           ← MongoDB connection
│
└── frontend/
    ├── login.html          ← Login page
    ├── signup.html         ← Signup page
    ├── dashboard.html      ← Your boards
    ├── index.html          ← The Kanban board
    ├── css/                ← Stylesheets
    └── js/                 ← JavaScript files
```

---

## How to use

1. Open `login.html` and create an account
2. On the dashboard, click **+ Create Board**
3. Open a board and click **+ Add List** to add columns
4. Inside each column, click **+ Add a card**
5. Drag cards between columns to move them
6. Click a card to edit its title, description, priority, and due date

---

## Notes

- Make sure MongoDB is running before starting the backend
- The backend must be running on port 5000 for the frontend to work
- If you see a "Cannot connect to server" error, check that `python app.py` is running
