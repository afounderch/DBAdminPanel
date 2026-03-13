import { useEffect, useState } from "react"
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
  Alert,
} from "antd";

const { Title } = Typography;
import Papa from "papaparse";
import {
    getData,
    insertData,
    updateData,
    removeData,
    insertBulkData
} from "./modSubCatApi"
import OperationStatus from "../../../components/OperationStatus";
import Loader from "../../../components/Loader";


const ModSubCatComponent=()=>{
    
    const [allModsubcatData,setAllModsubcatData]= useState([])
    const [modsubcatData,setModsubcatData]= useState([])
     const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
        total: 0,
      });

    const [isLoading, setLoading] = useState(false);
    const [operationStatus, setOperationStatus] = useState(null);

    const [isModalActive, setIsModalActive] = useState("");
    const [editingRecord, setEditingRecord] = useState(null);

    const [searchByID, setSearchByID] = useState("");
    const [sortByKey, setSortByKey] = useState("asc");

    const [importfileModalVisible, setImportFileModalVisible] = useState(false);
    const [fileInputKey, setFileInputKey] = useState(Date.now());
    
    
    const [form] = Form.useForm();

    const fetchData= async()=>{
        try {
             setLoading(true);
            const data =await getData();
            if(data?.length>0){
                const mapped=data.map( (element)=> (
                {
                    "_key":element._key,
                    "ModSubCatName":element.ModSubCatName
                }))
                setModsubcatData(mapped)
                setAllModsubcatData(mapped)
                setPagination((prev) => ({
                    ...prev,
                    total: mapped.length,
                    showTotal: (total, range) =>
                    `${range[0]}-${range[1]} of ${total} items`,
                }));
            
            } else{
                setModsubcatData([])
                setAllModsubcatData([])
            }
            setLoading(false);
        } catch (error) {
            console.log("Error getting the data",error);
            setLoading(false);
        }
    }
    
    const handleKeySort = () => {
        setSortByKey((prev) => (prev === "asc" ? "desc" : "asc"));
    };

    const handleTableChange = (newPagination) => {
        setPagination(newPagination);
    };

    useEffect(()=>{
      fetchData()
    },[])

    const handleSearchAndFilterSort=()=>{
        try {
            let result = [...allModsubcatData];

         if (searchByID) {
             const lower = searchByID.toLowerCase();

            result = result.filter(
                (item) =>
                item?._key?.toLowerCase()?.replace("_"," ").includes(lower) 
            );
            }

       
        result.sort((a, b) =>
            sortByKey === "asc"
                ? a._key.localeCompare(b._key)
                : b._key.localeCompare(a._key),
            );

                setPagination((prev) => ({
            ...prev,
            total: result.length,
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
            }));

            setModsubcatData(result);

        } catch (error) {
            console.log(error);
        }
    }

    useEffect(()=>{
            handleSearchAndFilterSort()
        },[searchByID,sortByKey,allModsubcatData])
    
    const handleDelete = async (id) => {
        let res = await removeData(id);
        if (res) {
          await fetchData()
        // const updated = allModsubcatData.filter((modsubcat) => modsubcat._key !== id);
        // setAllModsubcatData(updated);
        setOperationStatus("deleted");
        message.success("Step deleted");
        } else {
        setOperationStatus("error");
        message.error("Failed to delete. Try again.");
        }
    }

    // const handleEdit = (record) => {
    //     setEditingRecord(record);
    //     form.setFieldsValue(record);
    //     setIsModalActive("edit");
    // };

    const handleAdd = () => {
        setEditingRecord(null);
        form.resetFields();
        setIsModalActive("add");
    };

       const tableCol=[
        {title: ( <span
          style={{ cursor: "pointer", userSelect: "none" }}
          onClick={handleKeySort}
        >
          Mod-Sub-Cat Id {sortByKey === "asc" ? "↑" : "↓"}
        </span>),dataIndex:"_key"},
        //{title: "Mod-Sub-Cat Name",dataIndex:"ModSubCatName"},
        {
            title: "Actions",

            render: (_, record) => (
                <Space>
                {/* <Button type="link" onClick={() => handleEdit(record)}>
                    Edit
                </Button> */}

                <Popconfirm
                    title="Are you sure to delete?"
                    onConfirm={() => handleDelete(record._key)}
                >
                    <Button danger type="link">
                    Delete
                    </Button>
                </Popconfirm>
                </Space>
            )
        },
    ]

 
    const handleSubmit = async () => {
    const values = await form.validateFields();
    setLoading(true);
    if (editingRecord) {
       const updatedData = {
          _key: editingRecord.key,
          stepName: values.ModSubCatName || editingRecord.ModSubCatName,
        };

      let res = await updateData(editingRecord.key, updatedData);
      if (res) {
        const updated = allModsubcatData.map((item) =>
          item._key === editingRecord._key ? { ...item, ...updatedData } : item,
        );
        setAllModsubcatData(updated);
        setLoading(false);
        setIsModalActive("");
        setOperationStatus("updated");
        message.success("ModSubCat updated");
      } else {
        setLoading(false);
        setIsModalActive("");
        setOperationStatus("error");
        message.error("Failed to Update. Try again.");
      }
    } else {
      const newData = {
                _key: values?.ModSubCatName
                ?.toLowerCase()
                ?.replace(/\b\w/g, c => c.toUpperCase())
                ?.replace(/\s+/g, "_"),
                ModSubCatName: values.ModSubCatName,
        };
            let res = await insertData(newData);
            if (res) {
              await fetchData()
              //setAllModsubcatData([newData, ...allModsubcatData]);
              setOperationStatus("inserted");
              message.success("ModSubCat added");
            } else {
              setOperationStatus("error");
              message.error("Failed to INSERT Try again.");
            }
            setLoading(false);
            setIsModalActive("");
          }
        }

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
      try {
        const headers = results.meta.fields || [];
    
        // ✅ Validate CSV Header
        if (!headers.includes("ModSubCatName")) {
            
          message.error(
            "Invalid CSV format. Header must contain: ModSubCatName"
          );
          setImporting(false);
          setImportFileModalVisible(false)
          setOperationStatus("fileError")
          setLoading(false)
          return;
        }

        // ✅ Prepare Data
        const importedData = results.data
          .filter((row) => row.ModSubCatName && row.ModSubCatName.trim() !== "")
          .map((row) => ({
            _key: row.ModSubCatName
              ?.toLowerCase()
              ?.replace(/\b\w/g, (c) => c.toUpperCase())
              ?.replace(/\s+/g, "_"),

            ModSubCatName: row.ModSubCatName.trim(),
          }));

        if (importedData.length === 0) {
          message.warning("No valid rows found in CSV.");
          setImporting(false);
         setLoading(false)
          return;
        }

        setImportProgress((prev) => ({
          ...prev,
          total: importedData.length,
        }));

        // ✅ Bulk Insert API Call
       
        const res = await insertBulkData(importedData);
        
        if (res) {
          setImportProgress({
            total: importedData.length,
            processed: importedData.length,
            successful: importedData.length,
            failedKeys: [],
          });

          setAllModsubcatData((prev) => [...importedData, ...prev]);

          message.success(
            `${importedData.length} ModSubCat records imported successfully`
          );

          setOperationStatus(`${importedData.length} records imported successfully`)
        } else {
          message.error("Bulk import failed.");
        
        }

        // ✅ Reset everything
        setSelectedFile(null);
        setImportFileModalVisible(false);
        setFileInputKey(Date.now());
        setImporting(false);
        setLoading(false)
        setImportProgress({
          total: 0,
          processed: 0,
          successful: 0,
          failedKeys: [],
        });

        fetchData();
      } catch (error) {
        console.log(error);
        message.error("Error processing CSV file.");
        setImporting(false);
        setLoading(false)
      }
    },

    error: (error) => {
      console.error(error);
      message.error("Failed to parse CSV.");
      setImporting(false);
      setLoading(false)
    },
  });
};


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
  
        <Title level={1} style={{ marginBottom: 48, textAlign: "center" }}>
            Collection: Mod-SubCat 
        </Title>

        <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
            <Input
                      placeholder="Search by Mod Sub Cat Name"
                      value={searchByID}
                      onChange={(e) => setSearchByID(e.target.value)}
                      style={{ width: 260, padding: 4, marginTop: 0 }}
                    />
             <Button
                       type="primary"
                       onClick={() => {
                         setSearchByID("");
                         setSortByKey("asc");
                         setOperationStatus(null);
                         fetchData();
                       }}
                     >
                       Reset
                     </Button>
             <Button
                      type="primary"
                      onClick={handleAdd}
                      style={{ marginLeft: "auto" }}
                    >
                      Add Step
            </Button>
             <Button type="primary" onClick={() => { 
                setImportFileModalVisible(true)
                setSelectedFile(null)
                setFileInputKey(Date.now()); 
             }}>
                      Import CSV
                    </Button>
        </div>

        <OperationStatus status={operationStatus} />
        <Loader loading={isLoading} />

        <Table
            columns={tableCol}
            dataSource={modsubcatData}
            rowKey="_key"
            bordered
            pagination={{
          ...pagination,
          showSizeChanger: true
        }}
            onChange={handleTableChange}
        />

         <Modal
        title={editingRecord ? "Edit Step" : "Add Step"}
        open={isModalActive === "add" || isModalActive === "edit"}
        onCancel={() => {
          setIsModalActive("");
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
       
        <Form form={form} layout="vertical" style={{ padding: 10 }}>

          {/* <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Mod-Sub-Cat Id"
              >
                <Input style={{ width: "100%" } } 
                 readOnly
                 placeholder="Id will generate according to the ModSubCatName"/>
              </Form.Item>
            </Col>
           
          </Row> */}

          <Row gutter={16}>
            <Col xs={24} sm={24}>
              <Form.Item
                name="ModSubCatName"
                label="Mod-Sub-Category Id"
                rules={[{ required: true , message: "Mod-Sub-Cat is required",}]}
              >
                <Input placeholder="ModSubCat Name will be treated as database key" style={{ width: "100%" } } />
              </Form.Item>
            </Col>
          </Row>
          
        </Form>
      </Modal>
       <Modal
              title="Import ModSubCat Data from CSV"
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
                ModSubCatName
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
        </div>
    )
}

export default ModSubCatComponent