import {api} from "../../../config/api"

const getData=async()=>{
    try {
        const response= await api.get("getModSubCat")
        return response.data
    } catch (error) {
        console.log(error)
    }
}

const insertData = async (data) => {
  try {
    const response = await api.post("insertModSubCat", data);
    return response.status === 200;
  } catch (error) {
    console.log(error);
  }
};

const updateData = async (id, data) => {
  try {
    const response = await api.put(`updateModSubCat/${id}`, data);
    return response.status === 200;
  } catch (error) {
    console.log(error);
  }
};

const removeData = async (id) => {
  try {
    const res = await api.delete(`deleteModSubCat/${id}`);
    return res.data.Status;
  } catch (error) {
    console.log(error);
    return false;
  }
};

const insertBulkData = async (data) => {
  try {
    const response = await api.post("insertModSubCatBulk", {data:data});
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