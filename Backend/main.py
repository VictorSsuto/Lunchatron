
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import List
import shutil
import os
import base64
import requests
from google.cloud import language_v1
import logging
from dotenv import load_dotenv
load_dotenv()

app = FastAPI()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("uvicorn.error")

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

GOOGLE_CLOUD_API_KEY = os.getenv("GOOGLE_CLOUD_API_KEY")
SEARCH_ENGINE_ID = os.getenv("SEARCH_ENGINE_ID")
GOOGLE_APPLICATION_CREDENTIALS = os.getenv("GOOGLE_APPLICATION_CREDENTIALS")

# Set up Google Natural Language credentials
os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = GOOGLE_APPLICATION_CREDENTIALS


@app.post("/upload-image/")
async def upload_image(file: UploadFile = File(...)):
    """
    Endpoint to save an uploaded image from the frontend.
    """
    try:
        file_path = f"{UPLOAD_FOLDER}/{file.filename}"
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        logger.info(f"✅ Image saved at: {file_path}")
        return {"message": "Image uploaded successfully!", "path": file_path}
    except Exception as e:
        logger.error(f"❌ Error in /upload-image/: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to upload image.")


@app.post("/ingredients/")
async def recognize_ingredients(file: UploadFile = File(...)):
    """
    Recognizes food items in an image using Google Vision API and filters them using Google Natural Language API.
    """
    try:
        # Step 1: Save the uploaded image
        file_path = f"{UPLOAD_FOLDER}/{file.filename}"
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        logger.info(f"✅ Image saved at: {file_path}")

        # Step 2: Read and encode the image in base64
        with open(file_path, "rb") as image_file:
            image_content = base64.b64encode(image_file.read()).decode("utf-8")

        # Step 3: Call Google Vision API
        url = f"https://vision.googleapis.com/v1/images:annotate?key={GOOGLE_CLOUD_API_KEY}"
        payload = {
            "requests": [
                {
                    "image": {"content": image_content},
                    "features": [{"type": "LABEL_DETECTION", "maxResults": 20}],
                }
            ]
        }

        response = requests.post(url, json=payload)
        response.raise_for_status()
        data = response.json()

        # Step 4: Extract and log labels
        labels = [
            annotation["description"]
            for annotation in data["responses"][0].get("labelAnnotations", [])
            if annotation["score"] >= 0.7  # Adjusted confidence threshold
        ]
        logger.info(f"Detected labels: {labels}")

        # Step 5: Filter labels using predefined keywords
        predefined_ingredient_keywords = [
            "tomato", "carrot", "onion", "potato", "apple", "cheese", "chicken", "beef", "fish",
            "rice", "lettuce", "pepper", "garlic", "broccoli", "spinach", "eggplant", "mushroom",
            "zucchini", "corn", "banana", "orange", "strawberry", "lemon", "blueberry", "cucumber",
            "chili", "asparagus", "sweet potato", "watermelon", "pear", "mango", "peach", "coconut",
            "milk", "butter", "flour", "sugar", "chocolate", "yogurt", "bread", "pasta", "shrimp",
            "pork", "turkey", "beans", "peas", "nuts", "almonds", "walnuts", "cashews", "pineapple",
            "papaya", "grapes", "kiwi", "avocado", "pumpkin", "cabbage", "cauliflower"
        ]
        filtered_ingredients = [
            label for label in labels if label.lower() in predefined_ingredient_keywords
        ]
        logger.info(f"Filtered ingredients: {filtered_ingredients}")

        return {"message": "Ingredients detected successfully!", "ingredients": filtered_ingredients}
    except Exception as e:
        logger.error(f"❌ Error in /ingredients/: {str(e)}")
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")


@app.post("/recipes/")
async def get_recipes(ingredients: List[str]):
    """
    Retrieve recipes based on ingredients using Google Custom Search API.
    """
    if not ingredients:
        raise HTTPException(status_code=400, detail="No ingredients provided.")

    try:
        logger.info(f"Ingredients received: {ingredients}")
        query = f"recipes with {', '.join(ingredients)}"
        url = "https://www.googleapis.com/customsearch/v1"
        params = {"key": GOOGLE_CLOUD_API_KEY, "cx": SEARCH_ENGINE_ID, "q": query}

        response = requests.get(url, params=params)
        response.raise_for_status()
        results = response.json()

        if "items" not in results:
            logger.warning("No search results returned by the Custom Search API.")
            return {"recipes": []}

        recipes = [
            {
                "title": item.get("title", "No title available"),
                "link": item.get("link"),
                "description": item.get("snippet", "No description available"),
                "image": item.get("pagemap", {}).get("cse_image", [{}])[0].get("src", None),
            }
            for item in results.get("items", [])
        ]
        return {"recipes": recipes}
    except Exception as e:
        logger.error(f"❌ Error in /recipes/: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))