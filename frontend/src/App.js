 import React, { useState } from "react";
import "./App.css";

function App() {
  const [message, setMessage] = useState(""); // Descriptive message from the backend
  const [ingredients, setIngredients] = useState([]); // Detected ingredients
  const [foodType, setFoodType] = useState(""); // Selected food type
  const [recipes, setRecipes] = useState([]); // Fetched recipes
  const [loading, setLoading] = useState(false); // Loading state

  // Handle file upload and analyze ingredients
  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setLoading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("http://127.0.0.1:8000/ingredients/", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Failed to analyze image");

      const data = await response.json();
      console.log("Image Processed:", data);

      // Update message and ingredients
      setMessage(data.message || "Here are the detected items:");
      setIngredients(data.ingredients || []);
    } catch (error) {
      console.error(error);
      alert("Failed to upload image or analyze ingredients.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="App">
      <h1>Lunchatron Recipe Generator</h1>

      {/* File upload for ingredient recognition */}
      <input type="file" onChange={handleFileUpload} accept="image/*" />
      {loading && <p>Processing your image...</p>}

      {/* Display detected ingredients */}
      {message && <h2>{message}</h2>}
      {ingredients.length > 0 && (
        <ul>
          {ingredients.map((ingredient, index) => (
            <li key={index}>{ingredient}</li>
          ))}
        </ul>
      )}

      {/* Dropdown for selecting food type */}
      <select value={foodType} onChange={(e) => setFoodType(e.target.value)}>
        <option value="">Select Food Type</option>
        <option value="Italian">Italian</option>
        <option value="Vegan">Vegan</option>
        <option value="Dessert">Dessert</option>
      </select>

      {/* Search Button */}
      <button onClick={() => {}} disabled={loading || !ingredients.length}>
        {loading ? "Searching..." : "Find Recipes"}
      </button>
    </div>
  );
}

export default App;

