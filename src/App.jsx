import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import RecipeForm from "./pages/recipe/AddRecipe";  // adjust path
import ToDoLabels from "./pages/ToDo/ToDoLeftToToDoRight"; // adjust path casing
import Supplements from "./pages/Supplements/Supplements"; // adjust path
import Home from "./pages/ToDo/ToDoLeftToToDoRight"; // new import


const App = () => {


  return (
    <Router>
      <div>


        <Routes>
          <Route exact path="/DBAdminPanel" element={        <nav className="bg-gray-800 p-4">
          <ul className="flex space-x-4">
            <li key="recipe">
              <Link to="/DBAdminPanel/recipe">Recipe</Link>
            </li>
            <li key="todo">
              <Link to="/DBAdminPanel/todo">ToDo Labels</Link>
            </li>
            <li key="supplements">
              <Link to="/DBAdminPanel/supplements">Supplements</Link>
            </li>

          </ul>
        </nav>} />
        
          <Route path="/DBAdminPanel/recipe" element={<RecipeForm />} />
          <Route path="/DBAdminPanel/todo" element={<ToDoLabels />} />
          <Route path="/DBAdminPanel/supplements" element={<Supplements />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
