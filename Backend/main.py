from fastapi import FastAPI, File, UploadFile, Query
from fastapi.middleware.cors import CORSMiddleware
from typing import List
import sqlite3
import shutil
import os
from PIL import Image
import cv2
import numpy as np

app = FastAPI()

# Allow CORS for communication with React frontend
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

@app.get("/")
def read_root():
    return {"message": "Hello, Lunchatron is running!"}

# ✅ FIXED: Corrected POST method for file upload
@app.post("/ingredients/")
async def recognize_ingredients(file: UploadFile = File(...)):
    """
    Receive an image file and process it.
    Returns a list of detected ingredients (Mock for now).
    """
    file_path = f"{UPLOAD_FOLDER}/{file.filename}"

    # Save the uploaded file
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # Open image using PIL
    image = Image.open(file_path)

    # Convert image to numpy array (for OpenCV processing)
    image_cv = cv2.imread(file_path)
    height, width, _ = image_cv.shape

    # Mock ingredient detection (Replace with AI model)
    detected_ingredients = ["Tomato", "Cheese", "Basil"]

    return {
        "message": "Image received successfully",
        "filename": file.filename,
        "image_size": {"width": width, "height": height},
        "ingredients": detected_ingredients,
    }

# ✅ FIXED: Corrected SQL Query and Response Format
@app.get("/recipes/")
async def get_recipes(
    ingredients: List[str] = Query([]),
    food_type: str = Query("")
):
    """
    Retrieve recipes based on ingredients and food type.
    """
    conn = sqlite3.connect("recipes.db")
    cursor = conn.cursor()
    
    # Build SQL query for matching ingredients and category
    placeholders = ' AND '.join([f"ingredients LIKE ?" for _ in ingredients])
    query = f"""
        SELECT name, ingredients, instructions, cook_time, calories
        FROM recipes
        WHERE ({placeholders}) AND category LIKE ?
    """
    
    cursor.execute(query, [f"%{i}%" for i in ingredients] + [f"%{food_type}%"])
    recipes = cursor.fetchall()
    conn.close()
    
    # Format recipes into a list of dictionaries
    recipe_list = [
        {
            "name": r[0],
            "ingredients": r[1],
            "instructions": r[2],
            "cook_time": r[3],
            "calories": r[4],
        }
        for r in recipes
    ]
    
    return {"recipes": recipe_list}
