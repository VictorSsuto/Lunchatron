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
      const detectedIngredients = await recognizeIngredients(file); // API call
      setIngredients(detectedIngredients);
    } catch (error) {
      alert("Failed to recognize ingredients. Please try again.");
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
      <h1>Lunchatron Recipe Generator</h1>

      {/* File upload for ingredient recognition */}
      <input type="file" onChange={handleFileUpload} accept="image/*" />
      {loading && <p>Loading ingredients...</p>}

      {/* Dropdown for selecting food type */}
      <select value={foodType} onChange={(e) => setFoodType(e.target.value)}>
        <option value="">Select Food Type</option>
        <option value="Italian">Italian</option>
        <option value="Vegan">Vegan</option>
        <option value="Dessert">Dessert</option>
      </select>

      {/* Search Button */}
      <button onClick={handleSearchRecipes} disabled={loading || !ingredients.length}>
        {loading ? "Searching..." : "Find Recipes"}
      </button>

      {/* Display detected ingredients */}
      {ingredients.length > 0 && (
        <>
          <h2>Detected Ingredients:</h2>
          <ul>
            {ingredients.map((ingredient, index) => (
              <li key={index}>{ingredient}</li>
            ))}
          </ul>
        </>
      )}

      {/* Display fetched recipes */}
      {recipes.length > 0 && (
        <>
          <h2>Recipes:</h2>
          <ul>
            {recipes.map((recipe, index) => (
              <li key={index}>
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
        </>
      )}
    </div>
  );
}

export default App;
