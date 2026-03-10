import { Spin } from "antd";

 const Loader=({ loading }) =>{
  return <Spin fullscreen spinning={loading} tip="" />;
}
export default Loader