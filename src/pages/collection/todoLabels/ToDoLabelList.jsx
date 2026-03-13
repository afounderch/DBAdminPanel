import React, { useState, useEffect } from "react";
import {
    Table,
    Button,
    Modal,
    Form,
    Input,
    Select,
    Space,
    Popconfirm,
    Typography,
    message,
    Alert,
    Row,
    Col,
} from "antd";

import Papa from "papaparse";
import OperationStatus from "../../../components/OperationStatus"
import Loader from "../../../components/Loader";

import { api } from "../../../config/api"


const { Option } = Select;
const { TextArea } = Input;
const { Title } = Typography;

const labelTypes = ["Left", "Right"];
const toDoListTypes = ["Specific", "General"];

const TodoLabelList = () => {
    const [allData, setAllData] = useState([]); // all data
    const [data, setData] = useState([]); // filtered + paginated

    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingRecord, setEditingRecord] = useState(null);
    const [form] = Form.useForm();

    const [searchText, setSearchText] = useState("");
    const [filterLabelType, setFilterLabelType] = useState("");
    const [filterToDoListType, setFilterToDoListType] = useState("");
    const [sortByKey, setSortByKey] = useState("ascend");
    const [sortLabelOrder, setSortLabelOrder] = useState("ascend");

    const [modalLoading, setModalLoading] = useState(false);
    const [modalError, setModalError] = useState("");
    const [isLoading, setLoading] = useState(false);

    const [importfileModalVisible, setImportFileModalVisible] = useState(false);
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 15,
        total: 0,
    });
    const [operationStatus, setOperationStatus] = useState(null);

    // ===================== CSV Import =====================
    // Add two new state variables
    const [selectedFile, setSelectedFile] = useState(null);
    const [fileInputKey, setFileInputKey] = useState(Date.now());
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
        setLoading(true)
        setImporting(true);
        setImportProgress({ total: 0, processed: 0, successful: 0, failedKeys: [] });

        Papa.parse(selectedFile, {
            header: true,
            skipEmptyLines: true,
            complete: async (results) => {
                try {
                    const headers = results.meta.fields || [];
                              
                    const requiredHeaders = ['Key', 'Label Name', 'Long Text', 'Short Text', 'Description', 'Label Type', 'Label Order', 'ToDo List Type']
    
                    const missingHeaders = requiredHeaders.filter(
                    header => !headers.includes(header)
                    );
    
                    if (missingHeaders.length > 0) {      
                    setImporting(false)
                    setImportFileModalVisible(false)
                    setOperationStatus("fileError")
                    setLoading(false)
                    return;
                 }
                 const importedData = results.data.map((row) => ({
                    key: row.key || row.Key,
                    labelName: row.labelName || row["Label Name"],
                    longText: row.longText || row["Long Text"] || "",
                    shortText: row.shortText || row["Short Text"] || "",
                    description: row.description || row.Description || "",
                    labelType: row.labelType || row["Label Type"],
                    toDoListType: row.toDoListType || row["ToDo List Type"],
                    labelOrder: row.labelOrder || row["Label Order"] || "",
                }));
                if (importedData.length === 0) {
                          message.warning("No valid rows found in CSV.");
                          setImporting(false);
                         setLoading(false)
                          return;
                        }
                setImportProgress((prev) => ({ ...prev, total: importedData.length }));                       
                const res = await toDoLabelDBOperations(importedData, "insertBulk");
                if (res) {
               setImportProgress({
            total: importedData.length,
            processed: importedData.length,
            successful: importedData.length,
            failedKeys: [],
          }); setAllData((prev) => [...importedData, ...prev]);
                   setOperationStatus(`${importedData.length} records imported successfully`)
                  } else {
                    message.error("Bulk import failed.");
                  }
                setSelectedFile(null);
                setImportFileModalVisible(false);
                fetchLabels();
                setImportProgress({ total: 0, processed: 0, successful: 0, failedKeys: [] });
                setFileInputKey(Date.now()); 
                setImporting(false);
                setLoading(false)
                } catch (error) {
                    console.log(error);
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




    // =======================================================

    const showModal = (record = null) => {
        setEditingRecord(record);
        setIsModalVisible(true);
        setModalError("");
        if (record) {
            form.setFieldsValue(record);
        } else {
            form.resetFields();
        }
    };

    const handleCancel = () => {
        setIsModalVisible(false);
        setEditingRecord(null);
        setModalError("");
        form.resetFields();
    };
    

    // ========== DB Operations (fetch/update/delete/insert) ==========
const endpoints = {
  insert: (v) => api.post("insertToDoLabels", v),
  update: (v) => api.put(`updateToDoLabels/${v.key}`, v),
  delete: (v) => api.delete(`deleteToDoLabels/${v.key}`),
  get: (v) => api.post("getToDoLabelList", v),
  insertBulk: (v)=> api.post('insertToDoBulk',{data:v})
};

const toDoLabelDBOperations = async (values, type) => {
  try {
    const res = await endpoints[type](values);
    return res.data;
  } catch (error) {
    console.error("DB Operation failed:", error);
    return { operationStatus: false };
  }
};

    const handleFinish = async (values) => {
        setLoading(true)
        setModalLoading(true);
        setModalError("");
        const isEdit = !!editingRecord;

        // Check if labelOrder is not equal to or less than the maximum existing value
        // const maxLabelOrder = allData.reduce((max, item) => {
        //     return item.labelType === "Left" && item.labelOrder
        //         ? Math.max(max, Number(item.labelOrder))
        //         : max;
        // }, 0);

        // if (values.labelOrder <= maxLabelOrder) {
        //     setModalError("Label Order must be greater than existing values.");
        //     setModalLoading(false);
        //     return;
        // }

        try {
            console.log(values)
            const type = isEdit ? "update" : "insert";
            const ok = await toDoLabelDBOperations(
               values,
                type
            );
            if (!ok.operationStatus) {
                setModalError(
                    "Failed to save. Key might already exist. Check and try again."
                );
                setOperationStatus("error");
                setModalLoading(false);
                return;
            }

            setOperationStatus(type === "insert" ? "inserted" : "updated");
            handleCancel();
            fetchLabels(); // reload after insert/update
        } catch (e) {
            setModalError("An error occurred. Please try again.",e);
        } finally {
            setModalLoading(false);
            setLoading(false)
        }
    };

    const handleDelete = async (key) => {
        const ok = await toDoLabelDBOperations({ key }, "delete");
        if (ok.operationStatus) {
            setOperationStatus("deleted");
            message.success("Deleted");
            fetchLabels();
        } else {
            message.error("Failed to delete. Try again.");
        }
    };

    // fetch ALL once
    const fetchLabels = async () => {
        setLoading(true)
        const result = await toDoLabelDBOperations({}, "get");
        if (result.operationStatus) {
            const mapped = result.data.map((item) => ({
                key: item._key,
                labelName: item.LabelName,
                labelOrder: item.LabelOrder,
                longText: item.LongText,
                shortText: item.ShortText,
                description: item.Description,
                labelType: item.LabelType,
                toDoListType: item.TodoListType,
            }));
            setAllData(mapped);
            setPagination((prev) => ({ ...prev, total: mapped.length }));
        } else {
            message.error("Failed to load ToDo Labels.");
        }
         setLoading(false)
    };

    // ========== Filter + Search + Sort locally ==========
    const handleSearchAndFilter = () => {
        let result = [...allData];

        if (searchText) {
            const lower = searchText.toLowerCase();
            result = result.filter(
                (item) =>
                    item.labelName.toLowerCase().includes(lower) ||
                    item.key.toLowerCase().includes(lower)
            );
        }

        if (filterLabelType) {
            result = result.filter((item) => item.labelType === filterLabelType);
        }

        if (filterToDoListType) {
            result = result.filter((item) => item.toDoListType === filterToDoListType);
        }

        if (sortByKey) {
            result.sort((a, b) =>
                sortByKey === "ascend"
                    ? a.key.localeCompare(b.key)
                    : b.key.localeCompare(a.key)
            );
        }
        if(sortLabelOrder){
            result.sort((a, b) => {
                const aOrder = a.labelType === "Left" ? Number(a.labelOrder) : Infinity;
                const bOrder = b.labelType === "Left" ? Number(b.labelOrder) : Infinity;
                return sortLabelOrder === "ascend" ? aOrder - bOrder : bOrder - aOrder;
            });
        }

        setPagination((prev) => ({ ...prev, total: result.length }));
        setData(result);
    };

    useEffect(() => {
        fetchLabels();
    }, []);

    useEffect(() => {
        handleSearchAndFilter();
    }, [searchText, filterLabelType, filterToDoListType, sortByKey, sortLabelOrder,allData]);

    const handleTableChange = (newPagination) => {
        setPagination(newPagination); // client-side pagination
    };

    const handleKeySort = () => {
        if (sortByKey === "ascend") setSortByKey("descend");
        else if (sortByKey === "descend") setSortByKey("ascend");
    };
        const handleLeftLabelSort = () => {
        if (sortLabelOrder === "ascend") setSortLabelOrder("descend");
        else if (sortLabelOrder === "descend") setSortLabelOrder("ascend");
    };

    const columns = [
        {
            title: (
                <span
                    style={{ cursor: "pointer", userSelect: "none" }}
                    onClick={handleKeySort}
                >
                    Key{sortByKey === "ascend" ? "↑" : "↓"}
                </span>
            ),
            dataIndex: "key",
            key: "key",
        },
        { title: "Label Name", dataIndex: "labelName", key: "labelName" },
        { title: "Label Type", dataIndex: "labelType", key: "labelType" },
        // show labelOrder only when labelType is "Left"
        {
            title: (
                <span
                    style={{ cursor: "pointer", userSelect: "none" }}
                    onClick={handleLeftLabelSort}
                >
                    Left Label Order{sortLabelOrder === "ascend" ? "↑" : "↓"}
                </span>
            ),
            dataIndex: "labelOrder",
            key: "labelOrder",
            render: (text, record) => (record.labelType === "Left" ? text : "N/A"),
        },
        { title: "Long Text", dataIndex: "longText", key: "longText" },
        { title: "Short Text", dataIndex: "shortText", key: "shortText" },
        { title: "Description", dataIndex: "description", key: "description" },
        { title: "ToDo List Type", dataIndex: "toDoListType", key: "toDoListType" },
        {
            title: "Actions",
            key: "actions",
            render: (_, record) => (
                <Space>
                    <Button type="link" onClick={() => showModal(record)}>
                        Edit
                    </Button>
                    <Popconfirm
                        title="Are you sure to delete?"
                        onConfirm={() => handleDelete(record.key)}
                        okText="Yes"
                        cancelText="No"
                    >
                        <Button type="link" danger>
                            Delete
                        </Button>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    const paginatedData = data.slice(
        (pagination.current - 1) * pagination.pageSize,
        pagination.current * pagination.pageSize
    );

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
             <Loader loading={isLoading} />
            <Title level={1} style={{ marginBottom: 48, textAlign: "center" }}>
                To-Do Label Collection
            </Title>

            <div
                style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}
            >
                <Input
                    placeholder="Search by Label Name or Key"
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    style={{ width: 260, padding: 4, marginTop: 0 }}
                />
                <Select
                    allowClear
                    placeholder="Filter by Label Type"
                    value={filterLabelType || undefined}
                    onChange={(value) => setFilterLabelType(value || "")}
                    style={{ width: 220 }}
                >
                    {labelTypes.map((type) => (
                        <Option key={type} value={type}>
                            {type}
                        </Option>
                    ))}
                </Select>
                <Select
                    allowClear
                    placeholder="Filter by ToDo List Type"
                    value={filterToDoListType || undefined}
                    onChange={(value) => setFilterToDoListType(value || "")}
                    style={{ width: 220 }}
                >
                    {toDoListTypes.map((type) => (
                        <Option key={type} value={type}>
                            {type}
                        </Option>
                    ))}
                </Select>

                <Button
                    type="primary"
                    onClick={() => {
                        setSearchText("");
                        setFilterLabelType("");
                        setFilterToDoListType("");
                        setSortByKey("ascend");
                        setSortLabelOrder("ascend");
                        setOperationStatus(null);
                        fetchLabels();
                    }}
                >
                    Reset
                </Button>

                <Button
                    type="primary"
                    style={{ marginLeft: "auto" }}
                    onClick={() => showModal()}
                >
                    Add New Label
                </Button>

                {/* Import button */}
                <Button type="primary" onClick={() => {
                      setImportFileModalVisible(true)
                      setFileInputKey(Date.now());
                }}>
                    Import CSV
                </Button>
            </div>

            <OperationStatus status={operationStatus} />

            <Table
                columns={columns}
                dataSource={paginatedData}
                rowKey="key"
                bordered
                pagination={{
                    current: pagination.current,
                    pageSize: pagination.pageSize,
                    total: pagination.total,
                    showSizeChanger: true,
                    pageSizeOptions: ["10", "15", "20", "50"],
                    showTotal: (total, range) =>
                        `${range[0]}-${range[1]} of ${total} items`,
                }}
                onChange={handleTableChange}
            />

            {/* Modal */}
            <Modal
                title={editingRecord ? "Edit Label" : "Add New Label"}
                open={isModalVisible}
                onCancel={handleCancel}
                onOk={() => form.submit()}
                okText={editingRecord ? "Update" : "Create"}
                okButtonProps={{
                    style: { backgroundColor: "#0e8fffff", width: 200, fontWeight: "bold" },
                }}
                cancelButtonProps={{
                    style: { width: 200, backgroundColor: "#d6d6d6ff", fontWeight: "bolder" },
                }}
                confirmLoading={modalLoading}
                centered
                width={1000}
            >
                {modalError && (
                    <Alert
                        message={modalError}
                        type="error"
                        showIcon
                        style={{ marginBottom: 16 }}
                    />
                )}
                 <Loader loading={isLoading} />
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleFinish}
                    initialValues={{
                        labelType: labelTypes[0],
                        labelOrder: allData.reduce((max, item) => {
                            return item.labelType === "Left" && item.labelOrder
                                ? Math.max(max, Number(item.labelOrder))
                                : max;
                        }, 0) + 1, // Set initial value to one more than the maximum existing value
                        toDoListType: toDoListTypes[0],
                        description: "",
                        shortText: "",
                        longText: "",
                    }}
                    style={{ padding: 10 }}
                >
                    <Row gutter={16}>
                        <Col xs={24} sm={12}>
                            <Form.Item
                                name="key"
                                label="Key"
                                rules={[{ required: true, message: "Please enter key" }]}
                            >
                                <Input disabled={!!editingRecord} />
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={12}>
                            <Form.Item
                                name="labelName"
                                label="Label Name"
                                rules={[{ required: true, message: "Please input label name" }]}
                            >
                                <Input />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col xs={24} sm={12}>
                            <Form.Item
                                name="labelType"
                                label="Label Type"
                                rules={[{ required: true, message: "Please select label type" }]}
                            >
                                <Select>
                                    {labelTypes.map((type) => (
                                        <Option key={type} value={type}>
                                            {type}
                                        </Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={12}>
                            <Form.Item
                                name="toDoListType"
                                label="ToDo List Type"
                                rules={[{ required: true, message: "Please select to-do list type" }]}
                            >
                                <Select>
                                    {toDoListTypes.map((type) => (
                                        <Option key={type} value={type}>
                                            {type}
                                        </Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>

                    </Row>
                    <Row gutter={16}>
                        <Col xs={24} sm={12}>
                            {/* Render labelOrder input only when labelType === "Left" */}
                            <Form.Item
                                shouldUpdate={(prevValues, curValues) =>
                                    prevValues.labelType !== curValues.labelType
                                }
                                noStyle
                            >
                                {() => {
                                    const currentType = form.getFieldValue("labelType");
                                    return currentType === "Left" ? (
                                        <Form.Item
                                            name="labelOrder"
                                            label="Left Label Order"
                                            rules={[{ required: true, message: "Please input left label order" }]}
                                        >
                                            <Input type="number" />
                                        </Form.Item>
                                    ) : null;
                                }}
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col xs={24} sm={12}>
                            <Form.Item name="longText" label="Long Text">
                                <TextArea rows={2} />
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={12}>
                            <Form.Item name="shortText" label="Short Text">
                                <Input />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col xs={24}>
                            <Form.Item name="description" label="Description">
                                <TextArea rows={2} />
                            </Form.Item>
                        </Col>
                    </Row>
                </Form>
            </Modal>

            {/* Import File Modal */}
            <Modal
                title="Import To-Do Labels from CSV"
                open={importfileModalVisible}
                onCancel={() => {
                    setImportFileModalVisible(false)
                    setImporting(false);
                    setSelectedFile(null);
                    setFileInputKey(Date.now()); 
                }}
                footer={null}
                centered
                width={600}
            >
                 <Loader loading={isLoading} />
                <p>
                    Please select a CSV file with the following headers: <br />
                    Key, Label Name, Long Text, Short Text, Description, Label Type, Label Order, ToDo List Type.
                </p>
                <p>
                    Total: {importProgress.total} | Processed: {importProgress.processed} |
                    Successful: {importProgress.successful} | Failed: {importProgress.failedKeys.length}
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
                    style={{ width: '100%' }}
                >
                    {importing ? 'Importing...' : 'Import'}
                </Button>
            </Modal>


        </div>
    );
};

export default TodoLabelList;
