/* eslint-disable no-unused-vars */

import React, { useState, useEffect } from "react";
import {
  Table,
  Button,
  Select,
  Space,
  Popconfirm,
  Input,
  message,
  Modal,
  Form,
  InputNumber,
  Upload,
  Progress
} from "antd";

import { UploadOutlined } from "@ant-design/icons";
import OperationStatus from "../../components/OperationStatus";

import { getData, addData, updateData, removeStep, uploadToS3} from "./stepApi";
import Loader from "../../components/Loader"; 


const { Option } = Select;

const Step = () => {

  const mediaTypes = ["Video", "Audio"];

  const [allSteps, setAllSteps] = useState([]);
  const [stepData, setStepData] = useState([]);
  const [fileSize, setFileSize] = useState("");
  const [isLoading, setLoading] = useState(false);
  const [operationStatus, setOperationStatus] = useState(null);

  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 20,
    total: 0
  });

  const [sortByKey, setSortByKey] = useState("asc");
  const [filterByMediaType, setfilterByMediaType] = useState("");
  const [searchStepByID, setSearchStepByID] = useState("");

  const [isModalActive, setIsModalActive] = useState("");
  const [editingRecord, setEditingRecord] = useState(null);

  const [form] = Form.useForm();
  const [fileList, setFileList] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);  

  const simulateUpload = () => {

  setUploading(true);
  setUploadProgress(0);

  const interval = setInterval(() => {

    setUploadProgress(prev => {

      if (prev >= 100) {
        clearInterval(interval);
        setUploading(false);
        return 100;
      }

      return prev + 10;

    });

  }, 200);

};

  // DELETE
const handleDelete = async(id)=>{
  let res = await removeStep(id);
  if(res){
    const updated = allSteps.filter(step => step.key !== id);
    setAllSteps(updated);
    setOperationStatus("deleted");
    message.success("Step deleted")
  }else{
        setOperationStatus("error");
        message.error("Failed to delete. Try again.");
    }
}

  // EDIT
  const handleEdit = (record) => {
    setEditingRecord(record);
    form.setFieldsValue(record);
    setFileList([]);
    setIsModalActive("edit");
  };

  // ADD
  const addNewStep = () => {
    setEditingRecord(null);
    form.resetFields();
    setFileList([]);
    setIsModalActive("add");
  };

  // FETCH DATA
  const fetchLabels = async () => {
    setLoading(true)
    const result = await getData();

    if (result?.length > 0) {

      const mapped = result.map((item) => ({
        key: item._key,
        stepName: item.Step_Name,
        minutes: item.Duration_IN_Minutes,
        seconds: item.Duration_IN_Seconds,
        mediaType: item.Media_Type,
        size: item.Size,
        s3Uploaded: item.S3Uploaded || "No"
      }));

      setAllSteps(mapped);
      setStepData(mapped);

      setPagination((prev) => ({
        ...prev,
        total: mapped.length
      }));
      setLoading(false)

    } else {

      message.error("Failed to load Steps");

    }
    setLoading(false)
  };

  // SORT
  const handleKeySort = () => {

    setSortByKey(prev => prev === "asc" ? "desc" : "asc");

  };

  // SEARCH + FILTER + SORT
  const handleSearchAndFilterSort = () => {

    let result = [...allSteps];

    if (searchStepByID) {

      const lower = searchStepByID.toLowerCase();

      result = result.filter((item) =>
        item.key.toLowerCase().includes(lower)
      );

    }

    if (filterByMediaType) {

      result = result.filter(
        (step) => step.mediaType === filterByMediaType
      );

    }

    result.sort((a, b) =>
      sortByKey === "asc"
        ? a.key.localeCompare(b.key)
        : b.key.localeCompare(a.key)
    );

    setPagination(prev => ({
      ...prev,
      total: result.length
    }));

    setStepData(result);

  };

 
  // SUBMIT
const handleSubmit = async () => {

  const values = await form.validateFields();
  setLoading(true)

  let fileUploaded = "No";

  let file = fileList[0]; // 👈 get file from Upload component

  if (file) {

    const key = await uploadToS3(file);

    if (key) {
      fileUploaded = "Yes";
    }

  }
if (editingRecord) {

  const updatedDataForBackend = {
    "Step_Name": values.stepName,
    "Duration_IN_Minutes": values.minutes,
    "Duration_IN_Seconds": values.seconds,
    "Media_Type": values.mediaType,
    "Size": fileSize || editingRecord?.size || "0 MB",
    "S3Uploaded": fileUploaded
  };

  let res = await updateData(editingRecord.key, updatedDataForBackend);

  if(res){
  const updatedData = {
    key: editingRecord.key,
    stepName: values.stepName,
    minutes: values.minutes,
    seconds: values.seconds,
    mediaType: values.mediaType,
    size: fileSize || editingRecord?.size || "0 MB",
    s3Uploaded: fileUploaded
  };

  const updated = allSteps.map((item) =>
    item.key === editingRecord.key
      ? { ...item, ...updatedData }
      : item
  );
    setAllSteps(updated);
    setLoading(false)
    setOperationStatus("updated");
    message.success("Step updated");
  }else{  setOperationStatus("error");
    message.error("Failed to delete. Try again.");
  }

} else {

    const newStep={    
        "_key":values.key,
        "Step_Name": values.stepName,
        "Duration_IN_Minutes": values.minutes,
        "Duration_IN_Seconds": values.seconds,
        "Media_Type": values.mediaType,
        "Size": fileSize || "0 MB",
        "S3Uploaded": fileUploaded
    }
    
    let res=await addData(newStep)
    if(res){
    setAllSteps([newStep, ...allSteps]);
    setOperationStatus("inserted");
    message.success("Step added");
    }else{
        setOperationStatus("error");
        message.error("Failed to delete. Try again.");
    }

    setLoading(false)
  }

  setIsModalActive("");

};

  // INITIAL LOAD
  useEffect(() => {

    fetchLabels();

  }, []);

  // FILTER / SEARCH / SORT
  useEffect(() => {

    handleSearchAndFilterSort();

  }, [sortByKey, filterByMediaType, searchStepByID, allSteps]);

  const handleTableChange = (newPagination) => {

    setPagination(newPagination);

  };

  // FILE UPLOAD HANDLER
const uploadProps = {

  beforeUpload: (file) => {

    const sizeMB = (file.size / 1024 / 1024).toFixed(2) + " MB";

    setFileList([file]);
    setFileSize(sizeMB);

    return false; // prevent auto upload

  },

  fileList

};

  const tableCol = [

    {
      title: (
        <span
          style={{ cursor: "pointer", userSelect: "none" }}
          onClick={handleKeySort}
        >
          Step Id {sortByKey === "asc" ? "↑" : "↓"}
        </span>
      ),
      dataIndex: "key"
    },

    { title: "Step Name", dataIndex: "stepName" },

    { title: "Media Type", dataIndex: "mediaType" },

    { title: "Minutes", dataIndex: "minutes" },

    { title: "Seconds", dataIndex: "seconds" },

    { title: "Size", dataIndex: "size" },

    { title: "S3 Upload", dataIndex: "s3Uploaded" },

    {
      title: "Actions",

      render: (_, record) => (

        <Space>

          <Button type="link" onClick={() => handleEdit(record)}>
            Edit
          </Button>

          <Popconfirm
            title="Are you sure to delete?"
            onConfirm={() => handleDelete(record.key)}
          >

            <Button danger type="link">
              Delete
            </Button>

          </Popconfirm>

        </Space>

      )

    }

  ];

  return (

    <div>

      {/* SEARCH + FILTER */}

      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>

        <Input
          placeholder="Search Step ID"
          value={searchStepByID}
          onChange={(e) => setSearchStepByID(e.target.value)}
          style={{ width: 260 }}
        />

        <Select
          allowClear
          placeholder="Filter by Media Type"
          value={filterByMediaType || undefined}
          onChange={(value) => setfilterByMediaType(value || "")}
          style={{ width: 220 }}
        >

          {mediaTypes.map(type => (

            <Option key={type} value={type}>
              {type}
            </Option>

          ))}

        </Select>

        <Button type="primary" onClick={addNewStep}>
          Add Step
        </Button>

      </div>

 <OperationStatus status={operationStatus} />
      {/* TABLE */}

      <Table
        columns={tableCol}
        dataSource={stepData}
        rowKey="key"
        bordered
        pagination={pagination}
        onChange={handleTableChange}
      />

      {/* MODAL */}

      <Modal
        title={editingRecord ? "Edit Step" : "Add Step"}
        open={isModalActive === "add" || isModalActive === "edit"}
        onCancel={() => setIsModalActive("")}
        onOk={handleSubmit}
      >

        <Form form={form} layout="vertical">
          <Form.Item
            name="key"
            label="Step Id"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="stepName"
            label="Step Name"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="mediaType"
            label="Media Type"
            rules={[{ required: true }]}
          >
            <Select>

              <Option value="Video">Video</Option>
              <Option value="Audio">Audio</Option>

            </Select>
          </Form.Item>

          <Form.Item
            name="minutes"
            label="Minutes"
              rules={[{ required: true }]}
          >
            <InputNumber style={{ width: "100%" }}  maxLength={2} />
          </Form.Item>

          <Form.Item
            name="seconds"
            label="Seconds"
              rules={[{ required: true }]}
          >
            <InputNumber style={{ width: "100%" }} maxLength={2} />
          </Form.Item>

          <Form.Item label="Upload File"   rules={[{ required: true }]}>

            <Upload {...uploadProps}>

              <Button icon={<UploadOutlined />}>
                Select File
              </Button>


            </Upload>

          </Form.Item>

          <Form.Item label="File Size">

            <Input
                value={fileSize}
                readOnly
                placeholder="Size will appear after selecting file"
            />

            </Form.Item>

            {uploading && (
  <Progress
    percent={uploadProgress}
    status={uploadProgress === 100 ? "success" : "active"}
  />
)}

        </Form>

      </Modal>
    <Loader loading={isLoading}  />
    </div>

  );

};

export default Step;