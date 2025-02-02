from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import List
import shutil
import os
import base64
import requests
from google.cloud import language_v1

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

# Google API Keys
GOOGLE_CLOUD_API_KEY = "AIzaSyBxZg8xmqIWovJgjq2o6xbn-q5JJxVUszE"  # Replace with your Custom Search API key
SEARCH_ENGINE_ID = "24f6d6863057e4796"  # Replace with your CX (Search Engine ID)

# Set up Google Natural Language credentials
os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = "serviceaccountkey.json"  # Path to your service account JSON key

@app.get("/")
def read_root():
    """
    Health check endpoint.
    """
    return {"message": "Hello, Lunchatron is running!"}

@app.post("/ingredients/")
async def recognize_ingredients(file: UploadFile = File(...)):
    """
    Recognizes food items in an image using Google Vision API and filters them using Google Natural Language API.
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
                    "features": [{"type": "LABEL_DETECTION", "maxResults": 20}],
                }
            ]
        }

        # Send request
        response = requests.post(url, json=payload)
        response.raise_for_status()
        data = response.json()

        # Extract labels from the response and filter by confidence
        labels = [
            annotation["description"]
            for annotation in data["responses"][0].get("labelAnnotations", [])
            if annotation["score"] >= 0.8  # Only keep labels with confidence greater than 80%
        ]
        print(f"Detected labels: {labels}")

        # Filter labels using Google Natural Language API
        client = language_v1.LanguageServiceClient()
        filtered_ingredients = []
        predefined_ingredient_keywords = [
            "tomato", "carrot", "onion", "potato", "apple", "cheese", "chicken", "beef", "fish", 
            "rice", "lettuce", "pepper", "garlic", "broccoli", "spinach", "eggplant", "mushroom", 
            "zucchini", "corn", "banana", "orange", "strawberry", "lemon", "blueberry", "cucumber", 
            "chili", "spinach", "cucumber", "asparagus", "sweet potato", "watermelon", "pear", 
            "mango", "peach", "coconut", "milk", "butter", "flour", "sugar", "chocolate", "yogurt"
        ]

        # Filter using Google Natural Language API
        for label in labels:
            document = language_v1.Document(content=label, type_=language_v1.Document.Type.PLAIN_TEXT)
            response = client.analyze_entities(document=document)
            for entity in response.entities:
                if (
                    entity.name.lower() in predefined_ingredient_keywords or
                    "food" in entity.name.lower() or
                    "ingredient" in entity.name.lower()
                ):
                    if entity.salience > 0.3:  # Consider high salience entities as more relevant
                        filtered_ingredients.append(label)

        # Remove generic terms and deduplicate
        generic_terms = {"food", "ingredient", "natural foods", "produce", "Food", "Food group"}
        filtered_ingredients = [
            item for item in filtered_ingredients if item.lower() not in generic_terms
        ]
        filtered_ingredients = list(set(filtered_ingredients))

        print(f"Filtered ingredients: {filtered_ingredients}")
        return {
            "message": "Ingredients detected successfully!",
            "ingredients": filtered_ingredients,
        }

    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return {"error": f"An error occurred: {str(e)}"}

def search_recipes(food_items: List[str]) -> List[dict]:
    """
    Search for recipes using Google Custom Search JSON API.
    """
    try:
        # Build search query
        query = f"recipes with {', '.join(food_items)}"

        # Perform search request
        url = "https://www.googleapis.com/customsearch/v1"
        params = {
            "key": GOOGLE_CLOUD_API_KEY,
            "cx": SEARCH_ENGINE_ID,
            "q": query,
        }
        response = requests.get(url, params=params)
        response.raise_for_status()

        # Extract recipe links, images, and descriptions
        results = response.json()
        recipes = [
            {
                "title": item['title'],
                "link": item['link'],
                "description": item.get('snippet', 'No description available'),
                "image": item.get('pagemap', {}).get('cse_image', [{}])[0].get('src', None)
            }
            for item in results.get("items", [])
        ]

        return recipes

    except Exception as e:
        raise RuntimeError(f"Error searching for recipes: {str(e)}")

@app.post("/recipes/")
async def get_recipes(ingredients: List[str]):
    """
    Retrieve recipes based on ingredients using Google Custom Search API.
    """
    if not ingredients:
        raise HTTPException(status_code=400, detail="No ingredients provided.")

    try:
        # Search for recipes using the provided ingredients
        recipes = search_recipes(ingredients)

        return {"recipes": recipes}

    except RuntimeError as e:
        raise HTTPException(status_code=500, detail=str(e))
