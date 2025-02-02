import React, { useState, useRef } from "react";
import "./App.css";

function App() {
  const [message, setMessage] = useState(""); // Descriptive message from the backend
  const [ingredients, setIngredients] = useState([]); // Detected ingredients
  const [recipes, setRecipes] = useState([]); // Fetched recipes
  const [loading, setLoading] = useState(false); // Loading state
  const fileInputRef = useRef(null); // Ref for the file input

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

  // Capture Image from Camera
  const captureImage = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      const track = stream.getVideoTracks()[0];
      const imageCapture = new ImageCapture(track);

      const blob = await imageCapture.takePhoto(); // Capture photo
      sendImage(blob);

      track.stop(); // Stop camera
    } catch (error) {
      alert("Failed to access the camera.");
    }
  };

  // Send Image to Backend for ingredient recognition
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

      setMessage(data.message || "Here are the detected items:");
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
    setLoading(false);

    // Reset the file input value
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
        <button className="search-button" onClick={captureImage}>
          Take a Photo
        </button>

        <input
          type="file"
          accept="image/*"
          capture="environment"
          className="upload-input"
          onChange={handleFileUpload}
          ref={fileInputRef}
        />
        {loading && <p>Processing your image...</p>}

        {message && <h2>{message}</h2>}
        {ingredients.length > 0 && (
          <div className="ingredients-list">
            {ingredients.map((ingredient, index) => (
              <div key={index}>{ingredient}</div>
            ))}
          </div>
        )}

        <button
          className="search-button"
          onClick={fetchRecipes}
          disabled={loading || !ingredients.length}
        >
          {loading ? "Searching..." : "Find Recipes"}
        </button>

        {recipes.length > 0 && (
          <>
            <h2>Recipes:</h2>
            <div className="recipes-list">
              {recipes.map((recipe, index) => (
                <div key={index} className="recipe-item">
                  {recipe.image ? (
                    <img
                      src={recipe.image}
                      alt={recipe.title}
                      className="recipe-image"
                    />
                  ) : (
                    <div>No image available</div>
                  )}
                  <h3>{recipe.title}</h3>
                  <p>{recipe.description}</p>
                  <a href={recipe.link} target="_blank" rel="noopener noreferrer">
                    Click for Recipe
                  </a>
                </div>
              ))}
            </div>
          </>
        )}

        <button className="reset-button" onClick={resetApp}>
          Reset
        </button>
      </main>
    </div>
  );
}

export default App;
