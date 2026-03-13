import { api } from "../../../config/api";
import axios from "axios"

const getData = async () => {
  try {
    const response = await api.get("getSteps");
    return response.data;
  } catch (error) {
    console.log("Error getting data:", error);
  }
};

const addData = async (data) => {
  try {
    const response = await api.post("insertStep", data);
    return response.status === 200;
  } catch (error) {
    console.log(error);
  }
};
const insertBulkData = async (data) => {
  try {
    const response = await api.post("insertStepBulk", {data:data});
    return response.status === 200;
  } catch (error) {
    console.log(error);
  }
};

const updateData = async (id, data) => {
  try {
    const response = await api.put(`updateStep/${id}`, data);
    return response.status === 200;
  } catch (error) {
    console.log(error);
  }
};

const removeStep = async (id) => {
  try {
    const res = await api.delete(`deleteStep/${id}`);
    return res.data.Status;
  } catch (error) {
    console.log(error);
    return false;
  }
};

const uploadToS3 = async (file) => {
  try {
    const res = await api.post("uploadMedia", {
      fileName: file.name,
      fileType: file.type
    });

    const { uploadURL, key } = res.data;

    await axios.put(uploadURL, file, {
      headers: {
        "Content-Type": file.type
      }
    });

    console.log("File uploaded successfully");

    return key;

  } catch (err) {
    console.log("Upload failed", err);
  }
};

export {
  getData,
  addData,
  updateData,
  removeStep,
  uploadToS3,
  insertBulkData
};