from bson import ObjectId
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
from pymongo import MongoClient
from dotenv import load_dotenv
from pydantic import BaseModel
from datetime import datetime
from google import genai
from fastapi import HTTPException

app = FastAPI(title="AI-Powered Content Manager API")
load_dotenv()
gemini_client = genai.Client(
    api_key=os.getenv("GEMINI_API_KEY")
)


mongo_client = MongoClient(
    os.getenv("MONGO_URI"),
    serverSelectionTimeoutMS=5000
)

db = mongo_client[os.getenv("DATABASE_NAME")]

class ContentRequest(BaseModel):
    topic: str
    content_type: str
    tone: str
    generated_content: str = ""

class RewriteRequest(BaseModel):
    content: str
    tone: str    

class SummaryRequest(BaseModel):
    content: str

# Allow React frontend to communicate with FastAPI
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def home():
    return {
        "message": "AI-Powered Content Manager API is running!"
    }

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "service": "AI Content Manager Backend"
    }

@app.get("/api/db-health")
def database_health():
    try:
        mongo_client.admin.command("ping")

        return {
            "status": "connected",
            "database": os.getenv("DATABASE_NAME")
        }

    except Exception as e:
        return {
            "status": "error",
            "message": str(e)
        }

@app.post("/api/content")
def save_content(content: ContentRequest):
    content_data = content.dict()

    content_data["created_at"] = datetime.utcnow()

    result = db["contents"].insert_one(content_data)

    return {
        "message": "Content saved successfully!",
        "content_id": str(result.inserted_id)
    }

@app.get("/api/content")
def get_all_content():
    contents = list(
        db["contents"].find().sort("created_at", -1)
    )

    for content in contents:
        content["_id"] = str(content["_id"])
        content["created_at"] = content["created_at"].isoformat()

    return contents

@app.post("/api/generate")
def generate_content(request: ContentRequest):
    try:
        if not request.topic.strip():
            raise HTTPException(
                status_code=400,
                detail="Topic cannot be empty."
            )

        prompt = f"""
        You are an expert content writer.

        Create high-quality content using these details:

        Topic: {request.topic}
        Content Type: {request.content_type}
        Tone: {request.tone}

        Generate original, engaging and well-structured content.
        Return only the generated content.
        """

        response = gemini_client.models.generate_content(
            model="gemini-3.5-flash-lite",
            contents=prompt
        )

        if not response.text:
            raise HTTPException(
                status_code=502,
                detail="AI did not return any content."
            )

        return {
            "generated_content": response.text
        }

    except HTTPException:
        raise

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Content generation failed: {str(e)}"
        )

@app.delete("/api/content/{content_id}")
def delete_content(content_id: str):
    try:
        if not ObjectId.is_valid(content_id):
            raise HTTPException(
                status_code=400,
                detail="Invalid content ID"
            )

        result = db["contents"].delete_one({
            "_id": ObjectId(content_id)
        })

        if result.deleted_count == 0:
            raise HTTPException(
                status_code=404,
                detail="Content not found"
            )

        return {
            "message": "Content deleted successfully!"
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )

@app.post("/api/rewrite")
def rewrite_content(request: RewriteRequest):
    try:
        if not request.content.strip():
            raise HTTPException(
                status_code=400,
                detail="Content cannot be empty."
            )

        prompt = f"""
        You are an expert content editor.

        Rewrite the following content while preserving
        its original meaning and important information.

        Required tone: {request.tone}

        Original content:
        {request.content}

        Return only the rewritten content.
        """

        response = gemini_client.models.generate_content(
            model="gemini-3.5-flash-lite",
            contents=prompt
        )

        if not response.text:
            raise HTTPException(
                status_code=502,
                detail="AI did not return rewritten content."
            )

        return {
            "rewritten_content": response.text
        }

    except HTTPException:
        raise

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Content rewriting failed: {str(e)}"
        )   

@app.post("/api/summarize")
def summarize_content(request: SummaryRequest):
    try:
        if not request.content.strip():
            raise HTTPException(
                status_code=400,
                detail="Content cannot be empty."
            )

        prompt = f"""
        You are an expert summarizer.

        Create a concise and easy-to-understand summary
        of the following content.

        Preserve the main ideas and important information.
        Avoid unnecessary details.

        Content:
        {request.content}

        Return only the summary.
        """

        response = gemini_client.models.generate_content(
            model="gemini-3.5-flash-lite",
            contents=prompt
        )

        if not response.text:
            raise HTTPException(
                status_code=502,
                detail="AI did not return a summary."
            )

        return {
            "summary": response.text
        }

    except HTTPException:
        raise

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Summarization failed: {str(e)}"
        )   