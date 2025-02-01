import logo from './logo.svg';
import React, { useState } from "react";
import { recognizeIngredients, getRecipes } from './api';
import "./App.css";

function App(){
  const [ingredients, setIngredients] = useState([]); // Detected ingredients
  const [foodType, setFoodType] = useState(""); // selected food type
  const [recipes, setRecipes] = useState([]); // fetch recipes
  const [loading, setLoading] = useState(false); // loading state

  // Handle file upload and recognize ingredients
  const handleFileUpload = async (event)  => {
    const file = event.target.files[0];
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
    alert ("Please upload an image and select a food type!");
    returnl
  }

  setLoading(true);
  try {
    const recipeList = await getRecipes(ingredients, foodType); // API call
  } catch (error) {
    alert("Failed to fetch recipes. Pls try again.");
  } finally {
    setLoading(false);
  }
};

return (
  <div className="App">
    <h1>Lunchatron Recipe Generator</h1>

    {/* File upload for ingredient recognition */}
    <input type="file" onChange={handleFileUpload} />
    {loading && <p>Loading ingredients...</p>}

    {/* Dropdown for selecting food type*/}
    <select value={foodType} onChange={(e) => setFoodType(e.target.value)}>
      <option value="">Select Food type</option>
      <option value="Italian">Italian</option>
      <option value="Vegan">Vegan</option>
      <option value="Dessert">Dessert</option>
    </select>

    {/* Search Button */}
    <button onClick={handleSearchRecipes} disabled={loading || !ingredients.length}>
      {loading ? "Searching..." : "Find Recipes"}
    </button>

    {/* Display detected ingredients */}
    <h2> Detected ingredient</h2>
    <ul>
      {ingredients.map((ingredient, index) => (
        <li key={index}>{ingredient}</li>
      ))}
    </ul>

      {/* Display fetched recipes */}
      <h2>Recipes:</h2>
    <ul>
      {recipes.map((ingredient, index) => (
        <li key={index}>
          <h3>{recipe.name}</h3>
          <p><strong>Ingredients:</strong> {recipe.ingredients}</p>
          <p><strong>Instructions::</strong> {recipe.instructions}</p>
          <p><strong>Cook TIME:</strong> {recipe.cook_time}</p>
          <p><strong>Calories:</strong> {recipe.calories}</p>
          </li>
      ))}
    </ul>
  </div>
);

export default App;
