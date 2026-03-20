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
} from "./modCatApi"
import OperationStatus from "../../../components/OperationStatus";
import Loader from "../../../components/Loader";


const ModCatComponent=()=>{
    
    const [allModcatData,setAllModcatData]= useState([])
    const [modcatData,setModcatData]= useState([])
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
                    "ModCatName":element.ModCatName,
                    "ModCatOrder":element.ModCatOrder
                }))
                setModcatData(mapped)
                setAllModcatData(mapped)
                setPagination((prev) => ({
                    ...prev,
                    total: mapped.length,
                    showTotal: (total, range) =>
                    `${range[0]}-${range[1]} of ${total} items`,
                }));
            
            } else{
                setModcatData([])
                setAllModcatData([])
            }
            setLoading(false);
        } catch (error) {
            console.log("Error getting the data",error);
            setLoading(false);
        }
    }
    
    // const handleKeySort = () => {
    //     setSortByKey((prev) => (prev === "asc" ? "desc" : "asc"));
    // };

    const handleTableChange = (newPagination) => {
        setPagination(newPagination);
    };

    useEffect(()=>{
      fetchData()
    },[])

    const handleSearchAndFilterSort=()=>{
        try {
            let result = [...allModcatData];

         if (searchByID) {
             const lower = searchByID.toLowerCase();

            result = result.filter(
                (item) =>
                item?._key?.toLowerCase()?.replace("_"," ").includes(lower) 
            );
            }

       
        result.sort((a, b) =>a.ModCatOrder-b.ModCatOrder );

                setPagination((prev) => ({
            ...prev,
            total: result.length,
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
            }));

            setModcatData(result);

        } catch (error) {
            console.log(error);
        }
    }

    useEffect(()=>{
            handleSearchAndFilterSort()
        },[searchByID,sortByKey,allModcatData])
    
    const handleDelete = async (id) => {
        let res = await removeData(id);
        if (res) {
          await fetchData()
        // const updated = allModcatData.filter((modsubcat) => modsubcat._key !== id);
        // setAllModcatData(updated);
        setOperationStatus("deleted");
        message.success("deleted");
        } else {
        setOperationStatus("error");
        message.error("Failed to delete. Try again.");
        }
    }

    const handleEdit = (record) => {
        setEditingRecord(record);
        form.setFieldsValue(record);
        setIsModalActive("edit");
    };

    const handleAdd = () => {
        setEditingRecord(null);
        form.resetFields();
        setIsModalActive("add");
    };

       const tableCol=[
        {title: "Mod-Cat Id",dataIndex:"_key"},
        //{title: "Mod-Sub-Cat Name",dataIndex:"ModCatName"},
        {title: "Order",dataIndex:"ModCatOrder"},
        {
            title: "Actions",

            render: (_, record) => (
                <Space>
                <Button type="link" onClick={() => handleEdit(record)}>
                    Edit
                </Button>

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
      ModCatName: values.ModCatName || editingRecord.ModCatName,
      ModCatOrder: values.ModCatOrder
    };

    const res = await updateData(editingRecord._key, updatedData);

    if (res) {

      const updated = allModcatData.map((item) =>
        item._key === editingRecord._key
          ? { ...item, ...updatedData }
          : item
      );

      setAllModcatData(updated);
      setLoading(false);
      setIsModalActive("");
      setOperationStatus("updated");
      message.success("ModCat updated");

    } else {

      setLoading(false);
      setIsModalActive("");
      setOperationStatus("error");
      message.error("Failed to update. Try again.");

    }

  } else {

    const newData = {
      _key: values?.ModCatName
        ?.toLowerCase()
        ?.replace(/\b\w/g, c => c.toUpperCase())
        ?.replace("-", "_")
        ?.replace(/\s+/g, "_"),

      ModCatName: values.ModCatName,
      ModCatOrder: values.ModCatOrder
    };

    const res = await insertData(newData);

    if (res) {
      await fetchData();
      setOperationStatus("inserted");
      message.success("ModCat added");
    } else {
      setOperationStatus("error");
      message.error("Insert failed");
    }

    setLoading(false);
    setIsModalActive("");
  }
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
      try {
        const headers = results.meta.fields || [];
    
           const requiredHeaders = [
                "ModCatName",
                "ModCatOrder",
              ];

              const missingHeaders = requiredHeaders.filter(
                header => !headers.includes(header)
              );

        if (missingHeaders.length > 0) {      
          message.error(
            "Invalid CSV format"
          );
          setImporting(false)
          setImportFileModalVisible(false)
          setOperationStatus("fileError")
          setLoading(false)
          return;
        }

        // ✅ Prepare Data
        const importedData = results.data
          .filter((row) => row.ModCatName && row.ModCatName.trim() !== "")
          .map((row) => ({
            _key: row.ModCatName
              ?.toLowerCase()
              ?.replace(/\b\w/g, (c) => c.toUpperCase())
              ?.replace(/\s+/g, "_"),

            ModCatName: row.ModCatName.trim()?.toLowerCase()
              ?.replace(/\b\w/g, (c) => c.toUpperCase())
              ?.replace(/\s+/g, "_"),
            ModCatOrder:row.ModCatOrder
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

          setAllModcatData((prev) => [...importedData, ...prev]);

          message.success(
            `${importedData.length} ModCat records imported successfully`
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
            Collection: Mod-Cat 
        </Title>

        <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
            <Input
                      placeholder="Search by Mod Cat"
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
                      Add New
            </Button>
             {/* <Button type="primary" onClick={() => { 
                setImportFileModalVisible(true)
                setSelectedFile(null)
                setFileInputKey(Date.now()); 
             }}>
                      Import CSV
                    </Button> */}
        </div>

        <OperationStatus status={operationStatus} />
        <Loader loading={isLoading} />

        <Table
            columns={tableCol}
            dataSource={modcatData}
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
                 placeholder="Id will generate according to the ModCatName"/>
              </Form.Item>
            </Col>
           
          </Row> */}

          <Row gutter={16}>
            <Col xs={24} sm={24}>
              <Form.Item
                name="ModCatName"
                label="Mod-Category Id"
                rules={[{ required: true , message: "Mod-Cat is required",}]}
                
              >
                <Input 
                placeholder="ModCat Name will be treated as database key" 
                style={{ width: "100%" }} 
                readOnly={editingRecord ? true:false}
                />
              </Form.Item>
              <Form.Item
                name="ModCatOrder"
                label="Order"
                rules={[{ required: true , message: "Order required",}]}
              >
                <InputNumber placeholder="ModCat Order" style={{ width: "100%" } } />
              </Form.Item>
            </Col>
          </Row>
          
        </Form>
      </Modal>
       <Modal
              title="Import ModCat Data from CSV"
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
                ModCatName, ModCatOrder
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

export default ModCatComponent