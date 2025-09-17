import React, { useState } from "react";
import "./AddRecipe.css"; // For custom styling

const CheckboxGroup = ({ options, selectedValues, onChange, category, legend }) => (
  <fieldset>
    <legend>{legend}</legend>
    {options.map((option) => (
      <div key={option}>
        <label>
          <input
            type="checkbox"
            value={option}
            checked={selectedValues.includes(option)}
            onChange={() => onChange(category, option)}
          />
          {option}
        </label>
      </div>
    ))}
  </fieldset>
);

const Dropdown = ({ name, value, onChange, options, label }) => (
  <fieldset>
    <legend>{label}</legend>
    <label htmlFor={name}>
      <select id={name} name={name} value={value} onChange={onChange} required>
        <option value="">Select an option</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  </fieldset>
);

const RecipeForm = () => {
  const [recipe, setRecipe] = useState({
    _key: '',
    Recipe_Title: '',
    Recipe_Description: 'It is a simple and delicious dish made with fresh ingredients. It is perfect for a quick meal and is full of flavor and nutrients.',
    Recipe_Method: [],
    Dietary_Preferences: [],
    Allergies_Free: [],
    Type_OF_Recipe: [],
    Recipe_Nutritional_Goal_Category: [],
    Style_OF_Cusine: [],
    Ayurvedic_Type: [],
    Recipe_Prep_Time: [],
    Recipe_Shopping_Requirements: [],
    Recipe_Cooking_Time: "",
    Recipe_Note: [],
    Recipe_Nutritional_Info: [],
  });

  const [loading, setLoading] = useState(false);
  const [alertMessage, setAlertMessage] = useState(""); // State to track alert message
  const [alertType, setAlertType] = useState("");


  const DietaryList = ["Jain Vegetarian (No onion or garlic, avoid root vegetables)", "Vegan (No animal products)", "Vegetarian (Includes dairy and/or eggs, no meat or fish)", "Pescatarian (Includes fish, no other meat)", "Beef Restricted Non-Vegetarians (Includes meat other than beef)", "Pork Restricted Non-Vegetarians (Includes meat other than pork)"];
  const AllergiesList = ["Dairy-Free", "Nut-Free (Includes peanuts and tree nuts)", "Soy-Free", "Egg-Free", "Shellfish-Free", "Sesame-Free", "Gluten-Free", "No Known Allergies Or Intolerances"];
  const TypeOfRecipe = ["Breakfast", "Lunch", "Supper/Dinner", "Beverages", "Snacks", "Seasonings"];
  const NutritionalGoalCategory = [
    "Lentils and Beans Dominant",
    "Grains, Lentils and Beans",
    "Paneer Based",
    "Rice Staple",
    "Barley Based",
    "One Pot Meal",
    "Flatbreads",
    "Pasta",
    "Vegetable Dominant Curry",
    "Vegetable Protein Enhanced (Protein Blends Added)",
    "Vegetable Protein Enhanced (High Protein Vegetables Option)",
    "Yogurt",
  ];
  const StyleOfCuisine = ["Punjabi Style", "North Indian Style","South Indian Style", "Konkan Style (Coconut Based)", "Mediterranean Style", "Indo Western Fusion Style"];
  const AyurvedicType = ["A Pacifying", "B Pacifying", "C Pacifying"];
  const PrepTime = ["12 hours before", "8 hours before", "6 hours before", "4 hours before", "2 hours before", "1 hour before","30 minutes before" ,"15 minutes before","10 minutes before","Chopping Veggies", "Pressure cooker", "No preparation"];
  const ShoppingRequirements = ["Veggies", "Veggies optional", "Paneer","Paneer optional", "Ginger", "Coriander leaves","Coriander leaves optional", "Curry leaves optional", "Curry leaves", "Mint leaves","Mint leaves optional","Included in Pantry List", "Provided by Cheah"];
  const CookingTime = ["10 min", "15 min", "20 min", "30 min", "45 min", "1 hour"];

  const handleCheckboxChange = (category, value) => {
    setRecipe((prev) => {
      const currentValues = prev[category];
      if (currentValues.includes(value)) {
        return { ...prev, [category]: currentValues.filter((item) => item !== value) };
      } else {
        return { ...prev, [category]: [...currentValues, value] };
      }
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setRecipe((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); // Start loading
    console.log("Loading started");
  

      // List of required array fields
  const requiredFields = [
    "Recipe_Method",
    "Dietary_Preferences",
    "Allergies_Free",
    "Type_OF_Recipe",
    "Style_OF_Cusine",
    "Ayurvedic_Type",
    "Recipe_Prep_Time",
  ];

  const emptyFields = requiredFields.filter((field) => recipe[field].length === 0);

  if (emptyFields.length > 0) {
    //setAlertMessage(`The following fields are required and cannot be empty: ${emptyFields.join(", ")}`);
    setAlertMessage(`Make sure you fill all the fields :-)`);
    setAlertType("error");
    setLoading(false);
    return; // Stop submission
  }

    try {
      const trimmedRecipe = {
        ...recipe,
        _key: recipe._key.trim(),
        Recipe_Title: recipe.Recipe_Title.trim(),
        Recipe_Description: recipe.Recipe_Description.trim(),
        Recipe_Method: recipe.Recipe_Method.map((step) => step.trim()),
      };
  
      const response = await fetch(
        "https://3ts36w67tspxpy4i2mq2lrtsiq0tyuzr.lambda-url.ap-south-1.on.aws/insertRecipe",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(trimmedRecipe),
        }
      );
      const result = await response.json();
  
      if (result.success) {
        setAlertMessage("Recipe Added successfully!");
        setAlertType("success")
        setRecipe({
          _key: '',
          Recipe_Title: '',
          Recipe_Description: 'It is a simple and delicious dish made with fresh ingredients. It is perfect for a quick meal and is full of flavor and nutrients.',
          Recipe_Method: [],
          Dietary_Preferences: [],
          Allergies_Free: [],
          Type_OF_Recipe: [],
          Recipe_Nutritional_Goal_Category: [],
          Style_OF_Cusine: [],
          Ayurvedic_Type: [],
          Recipe_Prep_Time: [],
          Recipe_Shopping_Requirements: [],
          Recipe_Cooking_Time: "",
          Recipe_Note: [],
          Recipe_Nutritional_Info: []
        });
      } else {
        setAlertMessage("Failed to add recipe.");
        setAlertType("error");
      }
    } catch (error) {
      console.error("Error:", error);
      setAlertMessage("Error submitting recipe.");
      setAlertType("error");
    } finally {
      setLoading(false); // Stop loading
      console.log("Loading stopped");
    }
  };
  

  const handleMethodChange = (index, value) => {
    const updatedMethods = [...recipe.Recipe_Method];
    updatedMethods[index] = value;
    setRecipe((prev) => ({ ...prev, Recipe_Method: updatedMethods }));
  };

  const addMethodStep = () => {
    setRecipe((prev) => ({ ...prev, Recipe_Method: [...prev.Recipe_Method, ''] }));
  };

  // New function to remove a method step
  const removeMethodStep = (index) => {
    setRecipe((prev) => ({
      ...prev,
      Recipe_Method: prev.Recipe_Method.filter((_, i) => i !== index)
    }));
  };

  return (
    <form onSubmit={handleSubmit}>
      <h1>Add Recipe Form</h1>

      <div className="row">
        <div className="column">
          <legend>Recipe Id:</legend>
          <label>
            <input type="text" name="_key" value={recipe._key} onChange={handleChange} required />
          </label>
        </div>
        <div className="column">
          <legend>Recipe Title:</legend>
          <label>
            <input type="text" name="Recipe_Title" value={recipe.Recipe_Title} onChange={handleChange} required />
          </label>
        </div>
      </div>

      {/* Row Layout for Dietary Preferences and Allergies */}
      <div className="row">
        <div className="column">
          <CheckboxGroup
            options={DietaryList}
            selectedValues={recipe.Dietary_Preferences}
            onChange={handleCheckboxChange}
            category="Dietary_Preferences"
            legend="Dietary Preferences"
            
          />
        </div>
        <div className="column">
          <CheckboxGroup
            options={AllergiesList}
            selectedValues={recipe.Allergies_Free}
            onChange={handleCheckboxChange}
            category="Allergies_Free"
            legend="Allergies and Intolerances"
            
          />
        </div>
      </div>

      {/* Other Fields */}
      <div className="row">
        <div className="column">
          <CheckboxGroup
            options={TypeOfRecipe}
            selectedValues={recipe.Type_OF_Recipe}
            onChange={handleCheckboxChange}
            category="Type_OF_Recipe"
            legend="Type of Recipe (Select all that apply)"
            
          />
        </div>
        <div className="column">
          <CheckboxGroup
            options={NutritionalGoalCategory}
            selectedValues={recipe.Recipe_Nutritional_Goal_Category}
            onChange={handleCheckboxChange}
            category="Recipe_Nutritional_Goal_Category"
            legend="Nutritional Goal Category (Select all that apply)"
            
          />
        </div>
      </div>

      <div className="row">
        <div className="column">
          <CheckboxGroup
            options={StyleOfCuisine}
            selectedValues={recipe.Style_OF_Cusine}
            onChange={handleCheckboxChange}
            category="Style_OF_Cusine"
            legend="Style of Cuisine"
            
          />
        </div>
        <div className="column">
          <CheckboxGroup
            options={AyurvedicType}
            selectedValues={recipe.Ayurvedic_Type}
            onChange={handleCheckboxChange}
            category="Ayurvedic_Type"
            legend="Ayurvedic Type"
            
          />
        </div>
      </div>

      <div className="row">
        <div className="column">
          <CheckboxGroup
            options={PrepTime}
            selectedValues={recipe.Recipe_Prep_Time}
            onChange={handleCheckboxChange}
            category="Recipe_Prep_Time"
            legend="Recipe needs Prep Ahead of Time"
            
          />
        </div>
        <div className="column">
          <CheckboxGroup
            options={ShoppingRequirements}
            selectedValues={recipe.Recipe_Shopping_Requirements}
            onChange={handleCheckboxChange}
            category="Recipe_Shopping_Requirements"
            legend="Shopping Requirements (Select all that apply)"
            
          />
        </div>
      </div>

      <div className="row">
        <div className="column">
          <Dropdown
            name="Recipe_Cooking_Time"
            value={recipe.Recipe_Cooking_Time}
            onChange={handleChange}
            options={CookingTime}
            label="Cooking Time"
            
          />
        </div>
      </div>

      <div className="row">
        <div className="column">
          <legend>Recipe Short Description</legend>
          <label>
            <textarea
              name="Recipe_Description"
              value={recipe.Recipe_Description}
              onChange={handleChange}
              
            />
          </label>
        </div>
      </div>

      <div className="row">
        <div className="column">
          <fieldset>
            <legend>Recipe Method:</legend>
            {recipe.Recipe_Method.map((step, index) => (
              <div key={index} style={{ display: 'flex', marginBottom: '10px' }}>
                <input
                  type="text"
                  value={step}
                  onChange={(e) => handleMethodChange(index, e.target.value)}
                  style={{ width: "90%", marginRight: '4px' }} 
                />
                <button
                  type="button"
                  onClick={() => removeMethodStep(index)}
                  style={{
                    width: "10%",
                    cursor: "pointer",
                    border: 'none',
                    padding:'10px',
                    background: 'red',
                    color: 'white',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                Remove
                </button>
              </div>
            ))}

            <button type="button" onClick={addMethodStep}>
              Add Step
            </button>

          </fieldset>
        </div>
      </div>
  {/* Show a loading indicator while the form is submitting */}
      {/* {loading &&  <div className="loading-overlay">
          <div className="spinner"></div>
        </div>} */}


        {loading && (
        <div className="alert-modal">
          <div className="alert-content">
            <div className="spinner"></div>
          </div>
        </div>
      )}

        {alertMessage && (
        <div className={`alert-modal ${alertType}`}>
          <div className="alert-content">
            <p>{alertMessage}</p>
            <button onClick={() => setAlertMessage("")}>Close</button>
          </div>
        </div>
      )}


      <div className="row">
        <div className="column">
           <button type="submit" disabled={loading}>Add Recipe</button>
        </div>
      </div>
     
    </form>
  );
};

export default RecipeForm;
