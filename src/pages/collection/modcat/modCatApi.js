import {api} from "../../../config/api"

const getData=async()=>{
    try {
        const response= await api.get("getModCat")
        return response.data
    } catch (error) {
        console.log(error)
    }
}

const insertData = async (data) => {
  try {
    const response = await api.post("insertModCat", data);
    return response.status === 200;
  } catch (error) {
    console.log(error);
  }
};

const updateData = async (id, data) => {
  try {
    const response = await api.put(`updateModCat/${id}`, data);
    return response.status === 200;
  } catch (error) {
    console.log(error);
  }
};

const removeData = async (id) => {
  try {
    const res = await api.delete(`deleteModCat/${id}`);
    return res.data.Status;
  } catch (error) {
    console.log(error);
    return false;
  }
};

const insertBulkData = async (data) => {
  try {
    const response = await api.post("insertModCatBulk", {data:data});
    return response.status === 200;
  } catch (error) {
    console.log(error);
  }
};

export {
    getData,
    insertData,
    updateData,
    removeData,
    insertBulkData
}