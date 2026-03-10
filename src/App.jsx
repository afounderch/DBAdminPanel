import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Sidebar from "./components/SideBarComponent";

import RecipeForm from "./pages/collection/recipes/AddRecipe"; //recipe
import ToDoLabels from "./pages/collection/todoLabels/ToDoLabelList";
import Steps from "./pages/collection/steps/steps";
import Supplements from "./pages/collection/supplements/Supplements"

import ToDoLeftRightEdge from "./pages/edges/toDoLeftToRight/ToDoLeftToToDoRight";
import ToDoSupplementsMapping from "./pages/edges/toDoSupplementEdge/ToDoSupplementsMapping";




const App = () => {
  
  return (
    <Router>
      <div style={{ display: "flex", height: "100vh" }}>

        <Sidebar />

        <div style={{ flex: 1, overflowY: "auto" }}>
          <Routes>
            <Route path="/" element={<h2>Welcome</h2>} />
            
            <Route path="/recipe" element={<RecipeForm />} />
            <Route path="/todo" element={<ToDoLabels />} />
            <Route path="/step" element={<Steps />} />
            <Route path="/supplement" element={<Supplements />} />
            
            <Route path="/todoEdge" element={<ToDoLeftRightEdge />} />
            <Route path="/todoSupplementEdge" element={<ToDoSupplementsMapping />} />
           
          </Routes>
        </div>

      </div>
    </Router>
  );
};

export default App;