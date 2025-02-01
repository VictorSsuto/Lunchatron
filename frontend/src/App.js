import React, { useState } from "react";
import { recognizeIngredients, getRecipes } from "./api";
import "./App.css";

function App() {
  const [ingredients, setIngredients] = useState([]); // Detected ingredients
  const [foodType, setFoodType] = useState(""); // Selected food type
  const [recipes, setRecipes] = useState([]); // Fetched recipes
  const [loading, setLoading] = useState(false); // Loading state

  // Handle file upload and recognize ingredients
  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setLoading(true);
    try {
      const detectedIngredients = await recognizeIngredients(file);
      setIngredients(detectedIngredients);
    } catch (error) {
      alert("Failed to upload image. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Handle recipe search
  const handleSearchRecipes = async () => {
    if (!ingredients.length || !foodType) {
      alert("Please upload an image and select a food type!");
      return;
    }

    setLoading(true);
    try {
      const recipeList = await getRecipes(ingredients, foodType); // API call
      setRecipes(recipeList);
    } catch (error) {
      alert("Failed to fetch recipes. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Lunchatron Recipe Generator</h1>
      </header>

      <main className="App-main">
        <section className="upload-section">
          <h2>Upload an Image</h2>
          <input
            type="file"
            onChange={handleFileUpload}
            accept="image/*"
            className="upload-input"
          />
          {loading && <p className="loading-text">Processing image...</p>}
        </section>

        <section className="food-type-section">
          <h2>Select Food Type</h2>
          <select
            value={foodType}
            onChange={(e) => setFoodType(e.target.value)}
            className="dropdown"
          >
            <option value="">Select Food Type</option>
            <option value="Italian">Italian</option>
            <option value="Vegan">Vegan</option>
            <option value="Dessert">Dessert</option>
          </select>
        </section>

        <button
          onClick={handleSearchRecipes}
          disabled={loading || !ingredients.length}
          className="search-button"
        >
          {loading ? "Searching..." : "Find Recipes"}
        </button>

        {ingredients.length > 0 && (
          <section className="ingredients-section">
            <h2>Detected Ingredients</h2>
            <ul className="ingredients-list">
              {ingredients.map((ingredient, index) => (
                <li key={index} className="ingredient-item">
                  {ingredient}
                </li>
              ))}
            </ul>
          </section>
        )}

        {recipes.length > 0 && (
          <section className="recipes-section">
            <h2>Recipes</h2>
            <ul className="recipes-list">
              {recipes.map((recipe, index) => (
                <li key={index} className="recipe-card">
                  <h3>{recipe.name}</h3>
                  <p>
                    <strong>Ingredients:</strong> {recipe.ingredients.join(", ")}
                  </p>
                  <p>
                    <strong>Instructions:</strong> {recipe.instructions}
                  </p>
                  <p>
                    <strong>Cook Time:</strong> {recipe.cook_time} minutes
                  </p>
                  <p>
                    <strong>Calories:</strong> {recipe.calories} kcal
                  </p>
                </li>
              ))}
            </ul>
          </section>
        )}
      </main>
    </div>
  );
}

export default App;
