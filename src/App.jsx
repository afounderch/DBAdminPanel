import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import RecipeForm from "./pages/recipe/AddRecipe";  // adjust path
import ToDoLabels from "./pages/ToDo/TodoLabelList"; // fixed casing in path
import ToDoLeftRightEdge from "./pages/ToDo/ToDoLeftToToDoRight"; // adjust path casing
import Supplements from "./pages/Supplements/Supplements"; // adjust path


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
            </li>
            <li key="supplements">
              <Link to="/DBAdminPanel/supplements">Supplements</Link>
            </li> */}

          </ul>
        </nav>


        <Routes>
          <Route exact path="/DBAdminPanel" element={<h1>Hello</h1>} />
        
          <Route path="/DBAdminPanel/recipe" element={<RecipeForm />} />
          <Route path="/todo" element={<ToDoLabels />} />
          <Route path="/supplements" element={<Supplements />} />
          <Route path="/todoEdge" element={<ToDoLeftRightEdge />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
