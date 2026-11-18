
# AI-Powered Content Manager

An AI-powered web application that helps users generate, rewrite, summarize, and manage content using Google Gemini AI.

## Features

- AI Content Generation
- AI Content Rewriting with Different Tones
- AI Content Summarization
- Save Generated Content
- View Saved Content
- Delete Saved Content
- Copy Content to Clipboard
- MongoDB Database Integration

## Tech Stack

### Frontend
- React.js
- Vite
- CSS
- Lucide React

### Backend
- Python
- FastAPI
- REST API
- Google Gemini AI

### Database
- MongoDB

## Project Structure

```text
AI-Powered-Content-Manager/
├── backend/
│   ├── app.py
│   └── requirements.txt
├── frontend/
│   ├── src/
│   └── package.json
├── .gitignore
└── README.md
```

## Installation and Setup

### 1. Clone the repository

```bash
git clone YOUR_GITHUB_REPOSITORY_URL
cd AI-Powered-Content-Manager
```

### 2. Backend Setup

Create and activate a virtual environment:

```bash
python -m venv venv
venv\Scripts\activate
```

Install dependencies:

```bash
pip install -r backend/requirements.txt
```

### 3. Configure Environment Variables

Create a `.env` file inside the backend folder.

Add:

```env
MONGO_URI=mongodb://localhost:27017/
DATABASE_NAME=ai_content_manager
GEMINI_API_KEY=your_gemini_api_key
```

Replace `your_gemini_api_key` with your own Google Gemini API key.

### 4. Run the Backend

```bash
cd backend
uvicorn app:app --reload
```

Backend URL:

http://127.0.0.1:8000

API Documentation:

http://127.0.0.1:8000/docs

### 5. Frontend Setup

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

Frontend URL:

http://localhost:5173

## Database

This application uses MongoDB to store generated content.

Make sure MongoDB is installed and running before starting the application.

## Author

Ayaan Khan
