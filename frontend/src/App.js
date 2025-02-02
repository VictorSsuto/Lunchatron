import React, { useState, useRef } from "react";
import "./App.css";

function App() {
  const [message, setMessage] = useState(""); // Message from the backend
  const [ingredients, setIngredients] = useState([]); // Detected ingredients
  const [recipes, setRecipes] = useState([]); // Fetched recipes
  const [loading, setLoading] = useState(false); // Loading state
  const [imagePreview, setImagePreview] = useState(null); // Image preview
  const fileInputRef = useRef(null); // Ref for file input

  // Handle file upload and analyze ingredients
  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Create an image preview
    const reader = new FileReader();
    reader.onload = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);

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

      setMessage(data.message || "Ingredients detected successfully!");
      setIngredients(data.ingredients || []);
    } catch (error) {
      console.error(error);
      alert("Failed to upload image or analyze ingredients.");
    } finally {
      setLoading(false);
    }
  };

  // Capture image from camera
  const captureImage = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      const track = stream.getVideoTracks()[0];
      const imageCapture = new ImageCapture(track);

      const blob = await imageCapture.takePhoto();
      const imageUrl = URL.createObjectURL(blob);
      setImagePreview(imageUrl);

      // Send the captured image to the backend
      await sendImage(blob);

      track.stop();
    } catch (error) {
      console.error("Error capturing image:", error);
      alert("Failed to access the camera.");
    }
  };

  // Send image blob to the backend
  const sendImage = async (imageBlob) => {
    setLoading(true);
    const formData = new FormData();
    formData.append("file", imageBlob, "captured_image.jpg");

    try {
      const response = await fetch("http://127.0.0.1:8000/ingredients/", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Failed to analyze image");

      const data = await response.json();
      console.log("Image Processed:", data);

      setMessage(data.message || "Ingredients detected successfully!");
      setIngredients(data.ingredients || []);
    } catch (error) {
      console.error(error);
      alert("Failed to process image.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch Recipes Based on Ingredients
  const fetchRecipes = async () => {
    if (ingredients.length === 0) {
      alert("Please upload or capture an image with ingredients first.");
      return;
    }
    setLoading(true);

    try {
      const response = await fetch("http://127.0.0.1:8000/recipes/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(ingredients),
      });

      const data = await response.json();
      setRecipes(data.recipes || []);
    } catch (error) {
      alert("Failed to fetch recipes.");
    } finally {
      setLoading(false);
    }
  };

  // Reset all states and clear file input
  const resetApp = () => {
    setMessage("");
    setIngredients([]);
    setRecipes([]);
    setImagePreview(null);
    setLoading(false);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Lunchatron Recipe Generator</h1>
      </header>

      <main className="App-main">
        {/* Take a Photo */}
        <button className="search-button" onClick={captureImage}>
          Take a Photo
        </button>

        {/* File Upload Button */}
        <label htmlFor="file-upload" className="upload-button">
          Upload a Photo
        </label>
        <input
          type="file"
          accept="image/*"
          id="file-upload"
          className="upload-input"
          onChange={handleFileUpload}
          ref={fileInputRef}
          style={{ display: "none" }}  // Hide the file input
        />

        {/* Image Preview */}
        {imagePreview && (
          <div className="image-preview">
            <h3>Preview of Your Image</h3>
            <img src={imagePreview} alt="Preview" />
          </div>
        )}

        {/* Loading State */}
        {loading && <p>Processing your image...</p>}

        {/* Display Detected Ingredients */}
        {message && <h2>{message}</h2>}
        {ingredients.length > 0 && (
          <div className="ingredients-list">
            <h3>Detected Ingredients:</h3>
            {ingredients.map((ingredient, index) => (
              <div key={index} className="ingredient-item">
                {ingredient}
              </div>
            ))}
          </div>
        )}

        {/* Find Recipes Button */}
        <button
          className="search-button"
          onClick={fetchRecipes}
          disabled={loading || !ingredients.length}
        >
          {loading ? "Searching..." : "Find Recipes"}
        </button>

        {/* Display Recipes */}
        {recipes.length > 0 && (
          <div className="recipes-list">
            {recipes.map((recipe, index) => (
              <div key={index} className="recipe-item">
                {recipe.image && <img src={recipe.image} alt={recipe.title} />}
                <h4>{recipe.title}</h4>
                <a href={recipe.link} target="_blank" rel="noopener noreferrer">
                  Click for Recipe
                </a>
              </div>
            ))}
          </div>
        )}

        {/* Reset Button */}
        <button className="reset-button" onClick={resetApp}>
          Reset
        </button>
      </main>
    </div>
  );
}

export default App;
