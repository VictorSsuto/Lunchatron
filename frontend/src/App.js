import logo from './logo.svg';
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}

export default App;

const handleSearchRecipes = async () => {
  try {
    const response = await fetch ("http://127.0.0.1:8000/recipes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ingredients, foot_type: foodType }), // use the detected ingredients and food type
    });
    const data = await response.json();
    setRecipes(data.recipes); // Update the recipe state with the response
  } catch (error) {
    console.error("Error getting recipes:", error);
  }
};