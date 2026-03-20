import {api} from "../../../config/api"

const getEdgeData=async()=>{
    try {
        const response= await api.get("getDiseaseKitHasModSubCatEdgeData")
        return response.data
    } catch (error) {
        console.log(error)
    }
}

const getCollectionData=async()=>{
    try {
        const response= await api.get("getDiseaseKitModSubCatData")
        return response.data
    } catch (error) {
        console.log(error)
    }
}
const insertData = async (data) => {
  try {
    const response = await api.post("/insertDiseaseKitHasModSubCat", data);
    return response.status === 200;
  } catch (error) {
    console.log(error);
  }
};

const updateData = async (id, data) => {
  try {
    const response = await api.put(`/updateDiseaseKitHasModSubCat/${id}`, data);
    return response.status === 200;
  } catch (error) {
    console.log(error);
  }
};

const removeData = async (id) => {
  try {
    const res = await api.delete(`deleteDiseaseKitHasModSubCat/${id}`);
    return res.data.Status;
  } catch (error) {
    console.log(error);
    return false;
  }
};


export {
    getEdgeData,
    getCollectionData,
    insertData,
    updateData,
    removeData,
}