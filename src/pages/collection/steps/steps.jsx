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
import OperationStatus from "../../../components/OperationStatus";
import Loader from "../../../components/Loader";

import {
  getData,
  addData,
  updateData,
  removeStep,
  uploadToS3,
  insertBulkData
} from "./stepApi";

const { Option } = Select;
const { TextArea } = Input;
const { Title } = Typography;

const Steps = () => {
  const mediaTypes = ["Video", "Audio"];
  const S3UploadTypes = ["Yes", "No"];

  const [allSteps, setAllSteps] = useState([]);
  const [stepData, setStepData] = useState([]);
  const [fileSize, setFileSize] = useState("");
  const [fileName, setFileName] = useState("")
  const [fileType,setFileType]  = useState("")
  const [minutes, setMinutes] = useState("");
  const [seconds, setSeconds] = useState("");
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
  const [sortBySize, setSortBySize]= useState('asc')
  const [filterByMediaType, setFilterByMediaType] = useState("");
  const [filterByS3Upload, setFilterByS3Upload] = useState("");
  const [searchStepByID, setSearchStepByID] = useState("");

  const [isModalActive, setIsModalActive] = useState("");
  const [editingRecord, setEditingRecord] = useState(null);

  const [form] = Form.useForm();
  const [fileList, setFileList] = useState([]);

  const [importfileModalVisible, setImportFileModalVisible] = useState(false);
  const [fileInputKey, setFileInputKey] = useState(Date.now());



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
  const fetchData = async () => {
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
        showTotal: (total, range) =>
          `${range[0]}-${range[1]} of ${total} items`,
      }));
      setLoading(false);
    } else {
      message.error("Failed to load Steps");
    }
    setLoading(false);
  };

    // DELETE
  const handleDelete = async (id) => {
    let res = await removeStep(id);
    if (res) {
      await fetchData()
      // const updated = allSteps.filter((step) => step.key !== id);
      // setAllSteps(updated);
      setOperationStatus("deleted");
      message.success("Step deleted");
    } else {
      setOperationStatus("error");
      message.error("Failed to delete. Try again.");
    }
  };

  // SORT
  const handleKeySort = () => {
    setSortByKey((prev) => (prev === "asc" ? "desc" : "asc"));
  };
  //   const handleSizeSort = () => {
  //   setSortBySize((prev) => (prev === "asc" ? "desc" : "asc"));
  // };

  // SEARCH + FILTER + SORT
  const handleSearchAndFilterSort = () => {
    let result = [...allSteps];

   if (searchStepByID) {
  const lower = searchStepByID.toLowerCase();

  result = result.filter(
    (item) =>
      item?.key?.toLowerCase()?.includes(lower) ||
      item?.stepName?.toLowerCase()?.includes(lower)
  );
}

    if (filterByMediaType) {
      result = result.filter((step) => step?.mediaType === filterByMediaType);
    }
    if (filterByS3Upload) {
      result = result.filter((step) => step?.s3Uploaded === filterByS3Upload);
    }

    result.sort((a, b) =>
      sortByKey === "asc"
        ? a.key.localeCompare(b.key)
        : b.key.localeCompare(a.key),
    );

    if(sortBySize){
      result.sort((a, b) =>
      sortBySize === "asc"
        ? a.key.localeCompare(b.key)
        : b.key.localeCompare(a.key),
    );
    }

    setPagination((prev) => ({
      ...prev,
      total: result.length,
      showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
    }));

    setStepData(result);
  };

  // SUBMIT
  const handleSubmit = async () => {
    const values = await form.validateFields();
    setLoading(true);
    let fileUploaded = "No";
    let file = fileList[0]; 
    if (editingRecord) {
      const updatedDataForBackend = {
        Step_Name: values.stepName,
        Duration_IN_Minutes: minutes || editingRecord?.minutes,
        Duration_IN_Seconds: seconds || editingRecord?.seconds,
        Media_Type: fileType || editingRecord?.mediaType,
        Size: fileSize || editingRecord?.size || "0 MB",
        S3Uploaded: editingRecord?.s3Uploaded,
      };

      let res = await updateData(editingRecord.key, updatedDataForBackend);
      if (file) {
        const key = await uploadToS3(file);
        if (key) {
          fileUploaded = "Yes";
        }
      }

      if (res) {
        await fetchData()
        // const updatedData = {
        //   key: editingRecord.key,
        //   stepName: values.stepName,
        //   minutes: minutes || editingRecord?.minutes,
        //   seconds: seconds || editingRecord?.seconds,
        //   mediaType: fileType || editingRecord?.mediaType,
        //   size: fileSize || editingRecord?.size || "0 MB",
        //   s3Uploaded: editingRecord?.s3Uploaded,
        // };

        // const updated = allSteps.map((item) =>
        //   item.key === editingRecord.key ? { ...item, ...updatedData } : item,
        // );
        // setAllSteps(updated);
        setLoading(false);
        setIsModalActive("");
        setOperationStatus("updated");
        message.success("Step updated");
        setAddModalError(false);
        setErrorText(false);
      } else {
        setLoading(false);
        setIsModalActive("");
        setOperationStatus("error");
        message.error("Failed to Update. Try again.");
      }
    } else {
      if (file) {
        if (file?.name.replace(".mp4","") == fileName) {
          const key = await uploadToS3(file);
          if (key) {
            fileUploaded = "Yes";
            const newStepForDB = {
                _key: fileName,
                Step_Name: values.stepName,
                Duration_IN_Minutes: minutes,
                Duration_IN_Seconds: seconds,
                Media_Type: fileType,
                Size: fileSize || "0 MB",
                S3Uploaded: fileUploaded,
              };
            let res = await addData(newStepForDB);
            if (res) {
              await fetchData()
              // const newStep = {
              //   key: fileName,
              //   stepName: values.stepName,
              //   minutes: minutes,
              //   seconds: seconds,
              //   mediaType: fileType,
              //   size: fileSize || "0 MB",
              //   s3Uploaded: fileUploaded,
              // };
              // setAllSteps([newStep, ...allSteps]);
              setOperationStatus("inserted");
              message.success("Step added");
            } else {
              setOperationStatus("error");
              message.error("Failed to delete. Try again.");
            }
            setLoading(false);
            setIsModalActive("");
            setAddModalError(false);
            setErrorText(false);
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
    fetchData();
  }, []);

  // FILTER / SEARCH / SORT
  useEffect(() => {
    handleSearchAndFilterSort();
  }, [
    sortByKey,
    sortBySize,
    filterByMediaType,
    searchStepByID,
    filterByS3Upload,
    allSteps,
  ]);

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
    setLoading(true)

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
        try{
             const headers = results.meta.fields || [];
          
              const requiredHeaders = [
                "Key",
                "Step Name",
                "Duration IN Minutes",
                "Duration IN Seconds",
                "Media Type",
                "Size",
                "S3Uploaded"
              ];

              const missingHeaders = requiredHeaders.filter(
                header => !headers.includes(header)
              );

              if (missingHeaders.length > 0) {       message.error(
                  "Invalid CSV format"
                );
                setImporting(false)
                setImportFileModalVisible(false)
                setOperationStatus("fileError")
                setLoading(false)
                return;
        }
          const importedData = results.data.map((row) => ({
          _key: row.key || row.Key,
          Step_Name: row.stepName || row["Step Name"],
          Duration_IN_Minutes: row.minutes || row["Duration IN Minutes"] || "",
          Duration_IN_Seconds: row.seconds || row["Duration IN Seconds"] || "",
          Media_Type: row.mediaType || row["Media Type"] || "",
          Size: row.size || row["Size"],
          S3Uploaded: row.s3Uploaded || row["S3Uploaded"],
        }));

         if (importedData.length === 0) {
          message.warning("No valid rows found in CSV.");
          setImporting(false);
         setLoading(false)
          return;
        }
         setImportProgress((prev) => ({ ...prev, total: importedData.length }));

          const res = await insertBulkData(importedData);
          if (res) {
          setImportProgress({
            total: importedData.length,
            processed: importedData.length,
            successful: importedData.length,
            failedKeys: [],
          });
          setAllSteps((prev) => [...importedData, ...prev]);
         setOperationStatus(`${importedData.length} records imported successfully`)
        } else {
          message.error("Bulk import failed.");
        }
        setSelectedFile(null);
        setImportFileModalVisible(false);
        setImportProgress({
          total: 0,
          processed: 0,
          successful: 0,
          failedKeys: [],
        });
        setImporting(false);
        setSelectedFile(null);
        setFileInputKey(Date.now()); 
        fetchData();


        }catch(err){
          console.log(err);
          setOperationStatus("error")
          setImporting(false);
          setLoading(false)
        }
      },
      error: (err) => {
        console.error(err);
        message.error("Failed to parse CSV");
        setImporting(false);
        setLoading(false)
      },
    });
  };

const getMediaDuration = (file) =>
  new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const media = document.createElement(file.type.startsWith("audio") ? "audio" : "video");
    media.preload = "metadata";
    media.src = url;
    media.onloadedmetadata = () => {
      const duration = media.duration;
      URL.revokeObjectURL(url);
      resolve(duration);
    };
    media.onerror = () => {
      URL.revokeObjectURL(url);
      reject("Unable to read media duration");
    };
  });

  const uploadProps = {
    beforeUpload: async (file) => {

      const sizeMB = (file.size / 1024 / 1024).toFixed(2) + " MB";
      const duration = await getMediaDuration(file);
      const fName = file.name.substring(0, file.name.lastIndexOf(".")) || file.name;
      const fType = file.type.startsWith("video") ? "Video" : "Audio";
      const min = Math.floor(duration / 60);
      const sec = Math.floor(duration % 60);

      setFileName(fName)
      setFileType(fType)
      setMinutes(min)
      setSeconds(sec)
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
        marginBottom: 10,
        padding: "0px 20px",
        background: "#fff",
        borderRadius: 8,
        boxShadow: "0 2px 8px #f0f1f2",
      }}
    >
      {/* SEARCH + FILTER */}

      <Title level={1} style={{ marginBottom: 48, textAlign: "center" }}>
        Collection: Steps 
      </Title>

      <div
        style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}
      >
        <Input
          placeholder="Search by Step ID or Step Name"
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
            setFilterByS3Upload("");
            setSortByKey("asc");
            setSortBySize("");
            setOperationStatus(null);
            fetchData();
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

        <Button type="primary" onClick={() => {
           setImportFileModalVisible(true)
           setFileInputKey(Date.now()); 
        }}>
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
          setIsModalActive("");
          setMinutes("")
          setSeconds("")
          setFileSize("")
          setFileName("")
          setFileType("")
          setAddModalError(false);
          setErrorText(false);
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
        <Loader loading={isLoading} />
        {addModalError ? (
          <Title level={5} style={{ textAlign: "center", color: "red" }}>
            {errorText}
          </Title>
        ) : (
          <></>
        )}
        <Form form={form} layout="vertical" style={{ padding: 10 }}>


           <Form.Item label="Upload File" rules={[{ required: true }]}>
            <Upload {...uploadProps}>
              <Button icon={<UploadOutlined />}>Select File</Button>
            </Upload>
          </Form.Item>
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Step Id"
              >
                <Input style={{ width: "100%" }} 
                 value={fileName} 
                 readOnly  
                 placeholder="Step Id will generate according to the selected file"/>
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="stepName"
                label="Step Name"
                rules={[{ required: true , message: "Please enter a step name",}]}
              >
                <Input placeholder="Provide a Name to Identify the Step Easily"/>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Media Type"
              >
                <InputNumber style={{ width: "100%" }}  
                value={fileType} 
                readOnly
                 placeholder="Media Type will decide according to the file"
                />
              </Form.Item>
            </Col>
          </Row>

            <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Minutes"
              >
                <InputNumber style={{ width: "100%" }}  
                value={minutes} 
                readOnly
                 placeholder="Minutes will appear after selecting file"
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Seconds"
              >
                <InputNumber style={{ width: "100%" }} 
                 value={seconds} 
                 readOnly  
                 placeholder="Seconds will appear after selecting file"/>
              </Form.Item>
            </Col>
          </Row>
          <Form.Item label="File Size">
            <Input
              value={fileSize}
              readOnly
              placeholder="Size will calculate after selecting file"
            />
          </Form.Item>
        </Form>
      </Modal>
      {/* Import File Modal */}
      <Modal
        title="Import Steps Data from CSV"
        open={importfileModalVisible}
        onCancel={() => {
          setImportFileModalVisible(false);
          setImporting(false);
          setSelectedFile(null);
          setFileInputKey(Date.now()); // reset file input
        }}
        footer={null}
        centered
        width={600}
      >
       <Loader loading={isLoading} />
        <p>
          The CSV file must contain the following header: <br />
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
