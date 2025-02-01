const BASE_URL = "http://127.0.0.1:8000"; 
/**
 * upload an image to recognize ingredients
 * @param {File} file - image uploaded by user
 * @returns {Promise<Array>} - a list of detected ingredients
 */

export const recognizeIngredients = async (file) => {
    const formData = new FormData();
    formData.append("file", file);

    try {
        const resposnse = await fetch(`{$BASE_URL}/ingredients`, {
            method: "POST",
            body: formData,
        });

        if (!response.ok) {
            throw new Error (`Error: ${response.statusText}`);
        }

        const data = await response.json();
        return data.ingredients; // returns an array of detected ingredients
    } catch (error) {
        console.error("Error recognizing ingredients:"), error;
        throw error;
    }
};

/**
 * Fetch recipes based on ingredients and food types
 * @param {Array} ingredients - list of detected ingreidents
 * @param {string } foodType - the type of food selected
 * @returns {Promise<Array>} - a list of matching recpies based on ingredients
 */

export const getRecipes = async (ingredients, foodType) => {
    try{
        const response = await fetch(`${BASE_URL}/recipes`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ingredients, food_type: foodType }),
            });

            if (!response.ok){
                throw new Error(`Error: ${response.statusText}`);
            }

            const data = await response.json();
            return data.recipes;
    } catch (error) {
        console.error("Error getting recipes:", error);
        throw error;
    }
};