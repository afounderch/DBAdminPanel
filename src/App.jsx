import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import RecipeForm from "./pages/recipe/AddRecipe";  // adjust path
import ToDoLabels from "./pages/ToDo/ToDoLeftToToDoRight";

const App = () => {
  const menuItems = [
    { title: "Users", path: "/users", color: "bg-blue-500" },
    { title: "Settings", path: "/settings", color: "bg-green-500" },
    { title: "Reports", path: "/reports", color: "bg-purple-500" },
    { title: "Analytics", path: "/analytics", color: "bg-orange-500" },
  ];

  return (
    <Router>
      <div>
        <nav className="bg-gray-800 p-4">
          <ul className="flex space-x-4">
            <li key="home">
              <Link to="/">Home</Link>
            </li>
            <li key="recipe">
              <Link to="/recipe">Recipe</Link>
            </li>
            <li key="todo">
              <Link to="/todo">ToDo Labels</Link>
            </li>
          </ul>
        </nav>

        <Routes>
          <Route path="/" element={<h1>Hello, world!</h1>} />
          <Route path="/recipe" element={<RecipeForm />} />
          <Route path="/todo" element={<ToDoLabels />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
