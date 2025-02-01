from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from typing import List
import sqlite3


app = FastAPI()

MODEL_PATH = "mobilenet_v2.pb"

# Allow CORS for communication with the React frontened
app.add_middleware(
    CORSMiddleware, 
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Root endpoint for health check
@app.get("/")
def read_root():
    return {"message": "Hello, Lunchatron is running!"}

@app.get("/ingredients")
async def recognize_ingredients(file: UploadFile = File(...)):
    """
    Retrieve recipes based on ingredients and food type.
    """
    # Mock ingredients
    ingredients = ["Tomato", "Cheese", "Basil"]
    return {"ingredients": ingredients}

@app.get("/recipes")
async def get_recipes(ingredients: List[str], food_type: str):
    """
    Retrieve recipes based on ingredients and food type.
    """
    conn = sqlite3.connect("recipes.db")
    cursor = conn.cursor()
    
    # Build SQL query for matching ingredients and catgeory
    placeholders = ' AND ' .join([f"ingredients LIKE ? " for _ in ingredients])
    query = f"""
        SELECT name, ingredients, instructions, cook_time, calories
        FROM recipes
        WHERE ({placeholders}) AND category LIKE ?
    """
    cursor.execute(query, [f"%{i}%" for i in ingredients] + {f"%{food_type}%"})
    recipes = cursor/fetchall()
    conn.close()
    
    # Format recipes into a lsit of dictionnaries
    recipe_list = {
        {
            "name": r[0],
            "ingredients": r[1],
            "instructions": r[2],
            "cook_time": r[3],
            "calories": r[4],
        }
        for r in recipes
    }
    
    return {"recipes": recipe_list}
    


 