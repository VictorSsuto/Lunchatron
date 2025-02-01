from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMIddelware
from typing import List
import sqlite3


app = FastAPI()

MODEL_PATH = "mobilenet_v2.pb"

app.add_middleware(
    CORSMIddelware, 
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Hello, Lunchatron is running!"}

@app.post("/ingredients")
async def recognize_ingredients(file: UploadFile = File(...)):
    """
    Retrieve recipes based on ingredients and food type.
    """
    conn = sqlite3.connect("recipes.db")
    cursor = conn.cursor()
    
    # Build SQL query for matching ingredients and catgeory
