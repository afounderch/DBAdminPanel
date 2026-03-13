import { NavLink } from "react-router-dom";

const collectionItems = [
  //need to the recipe page after the change
  // { path: "/todo", label: "ToDo Labels" },
  // { path: "/supplement", label: "Supplements" },
  {path:"/diseasekit",label:"DiseaseKit"},
  { path: "/step", label: "Steps" },
  {path:"/modsubcat",label:"Mod-SubCategory"}
  
];

const edgeItems = [
  // { path: "/todoEdge", label: "PreDefined ToDo Left TO Right" },
  // { path: "/todoSupplementEdge", label: " Predefined ToDo TO Supplements" },
  { path: "/modSubCatHasStepsEdge", label: "Mod-SubCategory HAS Steps" },
  { path: "/diseasekitHasModSubCatEdge", label: "DiseaseKit HAS Mod-SubCategory" },
];

const Sidebar = () => {
  return (
    <div
      style={{
        width: "240px",
        background: "#030303",
        color: "white",
        padding: "4px 20px"
      }}
    >
      <h2 style={{ marginBottom: "24px", }} > <a href="/" style={{textDecoration:"none", color:"white"}}>Admin Panel</a></h2>
      <h4  style={{ margin: "16px 0px" }} >➡️Individual Collections</h4>
      <ul style={{ listStyle: "circle", paddingLeft: 12,marginLeft: 12 }}>
        {collectionItems.map((item) => (
          <li key={item.path}>
            <NavLink
              to={item.path}
              style={({ isActive }) => ({
                display: "block",
                padding: "4px",
                marginBottom: "2px",
                color: "white",
                textDecoration: "none",
                borderRadius: "6px",
                backgroundColor: isActive ? "#374151" : "transparent"
              })}
            >
              {item.label}
            </NavLink>
          </li>
        ))}
      </ul>
      <h4  style={{ margin: "16px 0px" }} >➡️Edge Mapping</h4>
      <ul style={{ listStyle: "circle", paddingLeft: 12,marginLeft: 12 }}>
        {edgeItems.map((item) => (
          <li key={item.path}>
            <NavLink
              to={item.path}
              style={({ isActive }) => ({
                display: "block",
                padding: "4px",
                marginBottom: "2px",
                color: "white",
                textDecoration: "none",
                borderRadius: "6px",
                backgroundColor: isActive ? "#374151" : "transparent"
              })}
            >
              {item.label}
            </NavLink>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Sidebar;