from fastapi import FastAPI, File, UploadFile, Query
from fastapi.middleware.cors import CORSMiddleware
from typing import List
import shutil
import os
import base64
import requests

app = FastAPI()

# Allow CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Ensure 'uploads' directory exists
UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Set your Google Cloud Vision API key
GOOGLE_CLOUD_API_KEY = "AIzaSyAp4_NG5S_jFKnBYxwqb-dF0pv4YgthH1w"

@app.get("/")
def read_root():
    """
    Health check endpoint.
    """
    return {"message": "Hello, Lunchatron is running!"}

@app.post("/ingredients/")
async def recognize_ingredients(file: UploadFile = File(...)):
    """
    Recognizes food items in an image using Google Vision API (via REST).
    """
    try:
        # Step 1: Save uploaded image
        file_path = f"{UPLOAD_FOLDER}/{file.filename}"
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        print(f"✅ Image saved at: {file_path}")

        # Step 2: Read and encode the image in base64
        with open(file_path, "rb") as image_file:
            image_content = base64.b64encode(image_file.read()).decode("utf-8")

        # Google Vision API URL
        url = f"https://vision.googleapis.com/v1/images:annotate?key={GOOGLE_CLOUD_API_KEY}"

        # Prepare request payload
        payload = {
            "requests": [
                {
                    "image": {"content": image_content},
                    "features": [{"type": "LABEL_DETECTION", "maxResults": 10}],
                }
            ]
        }

        # Send request
        response = requests.post(url, json=payload)
        response.raise_for_status()
        data = response.json()

        # Extract labels from the response
        labels = [annotation["description"] for annotation in data["responses"][0].get("labelAnnotations", [])]

        return {
            "message": "Ingredients detected successfully!",
            "ingredients": labels,
        }

    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return {"error": f"An error occurred: {str(e)}"}

@app.get("/recipes/")
async def get_recipes(
    ingredients: List[str] = Query([]),
    food_type: str = Query("")
):
    """
    Retrieve recipes based on ingredients and food type.
    """
    # Placeholder for database logic
    return {"recipes": []}
