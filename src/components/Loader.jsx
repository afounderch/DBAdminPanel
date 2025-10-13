// components/Loader.js
import { Spin } from "antd";

export default function Loader({ loading: isLoading }) {
 
  return (
      <>
       {isLoading && (
           <div
             aria-hidden="true"
             style={{
               position: "fixed",
               inset: 0,
               display: "flex",
               alignItems: "center",
               justifyContent: "center",
               background: "rgba(255,255,255,0.6)",
               backdropFilter: "blur(6px)",
               WebkitBackdropFilter: "blur(6px)",
               zIndex: 1200,
             }}
           >
             <div style={{ textAlign: "center", padding: 24, borderRadius: 8 }}>
               <Spin size="large" tip="Saving..." />
             </div>
           </div>
         )}
         </>
  );
}
// Usage example in another file:
// import Loader from 'path/to/Loader';
// NEW: overlay state to show saving indicator
//  const [isLoading, setLoading] = useState(false);
// <Loader loading={isLoading}  />