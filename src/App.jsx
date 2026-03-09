import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import RecipeForm from "./pages/recipe/AddRecipe";  // adjust path
import ToDoLabels from "./pages/ToDo/ToDoLabelList"; // corrected casing
import ToDoLeftRightEdge from "./pages/ToDo/ToDoLeftToToDoRight"; // adjust path casing
//import Supplements from "./pages/Supplements/Supplements"; // adjust path
import SupplementsToDo from "./pages/Supplements/SupplementToDo";
import Steps from "./pages/steps/step";

const App = () => {


  return (
    <Router>
      <div>
                <nav className="bg-gray-800 p-4">
          <ul className="flex space-x-4">
             <li key="todo">
              <Link to="/todo">ToDo Labels</Link>
            </li>
            <li key="todoEdge">
              <Link to="/todoEdge">ToDo Left/Right Edge Mappings</Link>
            </li>
            {/* <li key="recipe">
              <Link to="/DBAdminPanel/recipe">Recipe</Link>
            </li>*/}
            <li key="supplements">
              <Link to="/supplements">Supplements</Link>
            </li> 
              <li key="steps">
              <Link to="/step">Steps</Link>
            </li> 

          </ul>
        </nav>


        <Routes>
          <Route exact path="/" element={<h1>Hello</h1>} />
        
          <Route path="/recipe" element={<RecipeForm />} />
          <Route path="/todo" element={<ToDoLabels />} />
          <Route path="/supplements" element={<SupplementsToDo />} />
          <Route path="/todoEdge" element={<ToDoLeftRightEdge />} />
          <Route path="/step" element={<Steps />}/>
        </Routes>
      </div>
    </Router>
  );
};

export default App;
