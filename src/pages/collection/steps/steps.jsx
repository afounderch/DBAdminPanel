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
  Progress,
  Typography,
  Row,
  Col,
} from "antd";
import Papa from "papaparse";

import { UploadOutlined } from "@ant-design/icons";
import OperationStatus from "../../../components/OperationStatus"
import Loader from "../../../components/Loader"; 

import {
  getData,
  addData,
  updateData,
  removeStep,
  uploadToS3,
} from "./stepApi";


const { Option } = Select;
const { TextArea } = Input;
const { Title } = Typography;

const Steps = () => {
  const mediaTypes = ["Video", "Audio"];
  const S3UploadTypes=["Yes","No"]

  const [allSteps, setAllSteps] = useState([]);
  const [stepData, setStepData] = useState([]);
  const [fileSize, setFileSize] = useState("");
  const [isLoading, setLoading] = useState(false);
  const [operationStatus, setOperationStatus] = useState(null);
  const [addModalError, setAddModalError] = useState(false);
  const [errorText, setErrorText] = useState("");

  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 20,
    total: 0,
  });

  const [sortByKey, setSortByKey] = useState("asc");
  const [filterByMediaType, setFilterByMediaType] = useState("");
  const [filterByS3Upload, setFilterByS3Upload] = useState("");
  const [searchStepByID, setSearchStepByID] = useState("");

  const [isModalActive, setIsModalActive] = useState("");
  const [editingRecord, setEditingRecord] = useState(null);

  const [form] = Form.useForm();
  const [fileList, setFileList] = useState([]);
  
  const [importfileModalVisible, setImportFileModalVisible] = useState(false);
  const [fileInputKey, setFileInputKey] = useState(Date.now());



  // DELETE
  const handleDelete = async (id) => {
    let res = await removeStep(id);
    if (res) {
      const updated = allSteps.filter((step) => step.key !== id);
      setAllSteps(updated);
      setOperationStatus("deleted");
      message.success("Step deleted");
    } else {
      setOperationStatus("error");
      message.error("Failed to delete. Try again.");
    }
  };

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
    setLoading(true);
    const result = await getData();

    if (result?.length > 0) {
      const mapped = result.map((item) => ({
        key: item._key,
        stepName: item.Step_Name,
        minutes: item.Duration_IN_Minutes,
        seconds: item.Duration_IN_Seconds,
        mediaType: item.Media_Type,
        size: item.Size,
        s3Uploaded: item.S3Uploaded || "No",
      }));

      setAllSteps(mapped);
      setStepData(mapped);

      setPagination((prev) => ({
        ...prev,
        total: mapped.length,
         showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`
      }));
      setLoading(false);
    } else {
      message.error("Failed to load Steps");
    }
    setLoading(false);
  };

  // SORT
  const handleKeySort = () => {
    setSortByKey((prev) => (prev === "asc" ? "desc" : "asc"));
  };

  // SEARCH + FILTER + SORT
  const handleSearchAndFilterSort = () => {
    let result = [...allSteps];

    if (searchStepByID) {
      const lower = searchStepByID.toLowerCase();

      result = result.filter((item) => item.key.toLowerCase().includes(lower));
    }

    if (filterByMediaType) {
      result = result.filter((step) => step.mediaType === filterByMediaType);
    }
     if (filterByS3Upload) {
      result = result.filter((step) => step.s3Uploaded === filterByS3Upload);
    }


    result.sort((a, b) =>
      sortByKey === "asc"
        ? a.key.localeCompare(b.key)
        : b.key.localeCompare(a.key),
    );

    setPagination((prev) => ({
      ...prev,
      total: result.length,
      showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`
    }));

    setStepData(result);
  };

  // SUBMIT
  const handleSubmit = async () => {
    const values = await form.validateFields();
    setLoading(true);

    let fileUploaded = "No";

    let file = fileList[0]; // 👈 get file from Upload component

    if (editingRecord) {
      const updatedDataForBackend = {
        Step_Name: values.stepName,
        Duration_IN_Minutes: values.minutes,
        Duration_IN_Seconds: values.seconds,
        Media_Type: values.mediaType,
        Size: fileSize || editingRecord?.size || "0 MB",
        S3Uploaded: fileUploaded,
      };

      let res = await updateData(editingRecord.key, updatedDataForBackend);
      if (file) {
        const key = await uploadToS3(file);
        if (key) {
          fileUploaded = "Yes";
        }
      }

      if (res) {
        const updatedData = {
          key: editingRecord.key,
          stepName: values.stepName,
          minutes: values.minutes,
          seconds: values.seconds,
          mediaType: values.mediaType,
          size: fileSize || editingRecord?.size || "0 MB",
          s3Uploaded: fileUploaded,
        };

        const updated = allSteps.map((item) =>
          item.key === editingRecord.key ? { ...item, ...updatedData } : item,
        );
        setAllSteps(updated);
        setLoading(false);
        setOperationStatus("updated");
        message.success("Step updated");
        setAddModalError(false)
        setErrorText(false)
      } else {
        setLoading(false);
        setOperationStatus("error");
        message.error("Failed to delete. Try again.");
      }
    } else {
      if (file) {
        if (file?.name == values.key) {
          const key = await uploadToS3(file);
          if (key) {
            fileUploaded = "Yes";
            const newStep = {
              _key: values.key,
              Step_Name: values.stepName,
              Duration_IN_Minutes: values.minutes,
              Duration_IN_Seconds: values.seconds,
              Media_Type: values.mediaType,
              Size: fileSize || "0 MB",
              S3Uploaded: fileUploaded,
            };
            let res = await addData(newStep);
            if (res) {
              setAllSteps([newStep, ...allSteps]);
              setOperationStatus("inserted");
              message.success("Step added");
            } else {
              setOperationStatus("error");
              message.error("Failed to delete. Try again.");
            }
            setLoading(false);
            setIsModalActive("");
            setAddModalError(false)
            setErrorText(false)
          }
        } else {
          setLoading(false);
          setAddModalError(true);
          setErrorText("Step Id and File Name must be same.");
        }
      } else {
        setLoading(false);
        setAddModalError(true);
        setErrorText("Upload the file");
      }
    }
  };

  // INITIAL LOAD
  useEffect(() => {
    fetchLabels();
  }, []);

  // FILTER / SEARCH / SORT
  useEffect(() => {
    handleSearchAndFilterSort();
  }, [sortByKey, filterByMediaType, searchStepByID, filterByS3Upload,allSteps]);

  const handleTableChange = (newPagination) => {
    setPagination(newPagination);
  };

  // ===================== CSV Import =====================
  // Add two new state variables
  const [selectedFile, setSelectedFile] = useState(null);
  // Add new state variables for progress
  const [importProgress, setImportProgress] = useState({
    total: 0,
    processed: 0,
    successful: 0,
    failedKeys: [],
  });
  const [importing, setImporting] = useState(false);

  // Step 1: File selection
  const handleFileSelect = (event) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
      message.info(`File "${event.target.files[0].name}" selected`);
    }
  };

  // Step 2: Click button to import
  const handleImportCSV = async () => {
    if (!selectedFile) {
      message.error("Please select a CSV file first!");
      return;
    }

    setImporting(true);
    setImportProgress({
      total: 0,
      processed: 0,
      successful: 0,
      failedKeys: [],
    });

    Papa.parse(selectedFile, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        const importedData = results.data.map((row) => ({
          _key: row.key || row.Key,
          Step_Name: row.stepName || row["Step Name"],
          Duration_IN_Minutes: row.minutes || row["Duration IN Minutes"] || "",
          Duration_IN_Seconds: row.seconds || row["Duration IN Seconds"] || "",
          Media_Type: row.mediaType || row["Media Type"] || "",
          Size: row.size || row["Size"],
          S3Uploaded: row.s3Uploaded || row["S3Uploaded"],
        }));

        setImportProgress((prev) => ({ ...prev, total: importedData.length }));

        // Map each insert into a promise
        const insertPromises = importedData.map(async (item) => {
          const ok = await addData(item);

          // Update progress after each insert
          setImportProgress((prev) => ({
            ...prev,
            processed: prev.processed + 1,
            successful: ok.operationStatus
              ? prev.successful + 1
              : prev.successful,
            failedKeys: ok.operationStatus
              ? prev.failedKeys
              : [...prev.failedKeys, item._key],
          }));

          if (ok.operationStatus) {
            setAllSteps((prev) => [...prev, item]);
          }
        });

        // Wait for all inserts to complete
        await Promise.allSettled(insertPromises);

        // Show final messages
        const { successful, failedKeys } = importProgress;
        if (successful) {
          message.success(`${successful} rows imported successfully.`);
        }
        if (failedKeys.length) {
          message.warning(`Failed to insert keys: ${failedKeys.join(", ")}`);
        }

        setSelectedFile(null);
        setImportFileModalVisible(false);
        fetchLabels();
        setImportProgress({
          total: 0,
          processed: 0,
          successful: 0,
          failedKeys: [],
        });
        setImporting(false);
        setSelectedFile(null);
        setFileInputKey(Date.now()); // reset file input
      },
      error: (err) => {
        console.error(err);
        message.error("Failed to parse CSV");
        setImporting(false);
      },
    });
  };

  // FILE UPLOAD HANDLER
  const uploadProps = {
    beforeUpload: (file) => {
      const sizeMB = (file.size / 1024 / 1024).toFixed(2) + " MB";

      setFileList([file]);
      setFileSize(sizeMB);

      return false; // prevent auto upload
    },

    fileList,
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
      dataIndex: "key",
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
      ),
    },
  ];

  return (
    <div
      style={{
        maxWidth: 1400,
        margin: "auto",
        marginBottom:10,
        padding: "0px 20px",
        background: "#fff",
        borderRadius: 8,
        boxShadow: "0 2px 8px #f0f1f2",
      }}
    >
      {/* SEARCH + FILTER */}

      <Title level={1} style={{ marginBottom: 48, textAlign: "center" }}>
        CRUD Operations For Steps Collection
      </Title>

      <div
        style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}
      >
        <Input
          placeholder="Search Step ID"
          value={searchStepByID}
          onChange={(e) => setSearchStepByID(e.target.value)}
          style={{ width: 260, padding: 4, marginTop: 0 }}
        />

        <Select
          allowClear
          placeholder="Filter by Media Type"
          value={filterByMediaType || undefined}
          onChange={(value) => setFilterByMediaType(value || "")}
          style={{ width: 200 }}
        >
          {mediaTypes.map((type) => (
            <Option key={type} value={type}>
              {type}
            </Option>
          ))}
        </Select>
         <Select
          allowClear
          placeholder="Filter by S3 Upload"
          value={filterByS3Upload || undefined}
          onChange={(value) => setFilterByS3Upload(value || "")}
          style={{ width: 200 }}
        >
          {S3UploadTypes.map((type) => (
            <Option key={type} value={type}>
              {type}
            </Option>
          ))}
        </Select>
        <Button
          type="primary"
          onClick={() => {
            setSearchStepByID("");
            setFilterByMediaType("");
            setFilterByS3Upload("")
            setSortByKey("asc");
            setOperationStatus(null);
            fetchLabels();
          }}
        >
          Reset
        </Button>

        <Button
          type="primary"
          onClick={addNewStep}
          style={{ marginLeft: "auto" }}
        >
          Add Step
        </Button>

        <Button type="primary" onClick={() => setImportFileModalVisible(true)}>
          Import CSV
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
        onCancel={() => {
          setIsModalActive("")
          setAddModalError(false)
          setErrorText(false)
        }}
        
        onOk={handleSubmit}
        okButtonProps={{
          style: {
            backgroundColor: "#0e8fffff",
            width: 200,
            fontWeight: "bold",
            marginLeft: 48,
          },
        }}
        cancelButtonProps={{
          style: {
            width: 200,
            backgroundColor: "#d6d6d6ff",
            fontWeight: "bolder",
          },
        }}
        centered
        width={1000}
      >
        {addModalError ? (
          <Title level={5} style={{ textAlign: "center", color: "red" }}>
            {errorText}
          </Title>
        ) : (
          <></>
        )}
        <Form form={form} layout="vertical" style={{ padding: 10 }}>
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="key"
                label="Step Id"
                rules={[{ required: true }]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="stepName"
                label="Step Name"
                rules={[{ required: true }]}
              >
                <Input />
              </Form.Item>
            </Col>
          </Row>

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
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="minutes"
                label="Minutes"
                rules={[{ required: true }]}
              >
                <InputNumber style={{ width: "100%" }} maxLength={2} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="seconds"
                label="Seconds"
                rules={[{ required: true }]}
              >
                <InputNumber style={{ width: "100%" }} maxLength={2} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item label="Upload File" rules={[{ required: true }]}>
            <Upload {...uploadProps}>
              <Button icon={<UploadOutlined />}>Select File</Button>
            </Upload>
          </Form.Item>

          <Form.Item label="File Size">
            <Input
              value={fileSize}
              readOnly
              placeholder="Size will appear after selecting file"
            />
          </Form.Item>
        </Form>
      </Modal>
      {/* Import File Modal */}
      <Modal
        title="Import To-Do Labels from CSV"
        open={importfileModalVisible}
        onCancel={() => {
          setImportFileModalVisible(false);
          setImporting(false);
          setSelectedFile(null);
        }}
        footer={null}
        centered
        width={600}
      >
        <p>
          Please select a CSV file with the following headers: <br />
          Key, Step Name, Duration IN Minutes, Duration IN Seconds, Media Type,
          Size, S3Uploaded.
        </p>
        <p>
          Total: {importProgress.total} | Processed: {importProgress.processed}{" "}
          | Successful: {importProgress.successful} | Failed:{" "}
          {importProgress.failedKeys.length}
        </p>

        <Input
          key={fileInputKey}
          type="file"
          accept=".csv"
          onChange={handleFileSelect}
          style={{ marginBottom: 16 }}
        />
        <Button
          type="primary"
          onClick={handleImportCSV}
          disabled={!selectedFile || importing}
          style={{ width: "100%" }}
        >
          {importing ? "Importing..." : "Import"}
        </Button>
      </Modal>
      <Loader loading={isLoading} />
    </div>
  );
};

export default Steps;
