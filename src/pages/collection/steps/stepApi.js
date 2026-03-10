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
    const response = await api.delete(`deleteStep/${id}`);
    return response.status === 200;
  } catch (error) {
    console.log(error);
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
  uploadToS3
};