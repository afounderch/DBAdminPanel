import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Sidebar from "./components/SideBarComponent";

import RecipeForm from "./pages/collection/recipes/AddRecipe"; 
import ToDoLabels from "./pages/collection/todoLabels/ToDoLabelList";
import Steps from "./pages/collection/steps/steps";
import Supplements from "./pages/collection/supplements/Supplements"
import ModSubCatComponent from "./pages/collection/modsubcat/ModSubCat";
import ModCatComponent from "./pages/collection/modcat/ModCat";
import DiseaseKitComponent from "./pages/collection/diseasekit/DiseaseKit";

import ToDoLeftRightEdge from "./pages/edges/toDoLeftToRight/ToDoLeftToToDoRight";
import ToDoSupplementsMapping from "./pages/edges/toDoSupplementEdge/ToDoSupplementsMapping";
import ModSubCatHasStepsEdgeComponent from "./pages/edges/modsubcatHasStepsEdge/ModSubCatHasStepsEdge";
import ModCatHasModSubCatEdgeComponent from "./pages/edges/modcatHasmodsubcat/ModCatHasModSubCatEdge";
import DiseaseKitModSubCatEdgeComponent from "./pages/edges/diseasekitHasModsubcatEdge/DiseaseKitHasModSubCatEdge";
import DiseaseKitModCatEdgeComponent from "./pages/edges/diseasekitHasModCat/DiseaseKitHasModCatEdge";




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
            <Route path="/modsubcat" element={<ModSubCatComponent />} />
             <Route path="/modcat" element={<ModCatComponent />} />
            <Route path="/diseasekit" element={<DiseaseKitComponent />} />
            
            <Route path="/todoEdge" element={<ToDoLeftRightEdge />} />
            <Route path="/todoSupplementEdge" element={<ToDoSupplementsMapping />} />
            <Route path="/modSubCatHasStepsEdge" element={<ModSubCatHasStepsEdgeComponent />} />
            <Route path="/modCatHasModSubCatEdge" element={<ModCatHasModSubCatEdgeComponent />} />
            <Route path="/diseasekitHasModSubCatEdge" element={<DiseaseKitModSubCatEdgeComponent />}/>
            <Route path="/diseasekitHasModCatEdge" element={<DiseaseKitModCatEdgeComponent />}/>
           
          </Routes>
        </div>

      </div>
    </Router>
  );
};

export default App;