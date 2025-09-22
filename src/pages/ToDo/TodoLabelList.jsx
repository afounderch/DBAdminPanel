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
import OperationStatus from "../../components/OperationStatus";

const { Option } = Select;
const { TextArea } = Input;
const { Title } = Typography;

const labelTypes = ["Left", "Right"];
const toDoListTypes = ["ToDo", "General"];

const TodoLabelList = () => {
    const [allData, setAllData] = useState([]); // keep everything here
    const [data, setData] = useState([]); // filtered + paginated data

    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingRecord, setEditingRecord] = useState(null);
    const [form] = Form.useForm();

    const [searchText, setSearchText] = useState("");
    const [filterLabelType, setFilterLabelType] = useState("");
    const [filterToDoListType, setFilterToDoListType] = useState("");
    const [sortOrder, setSortOrder] = useState("ascend");

    const [modalLoading, setModalLoading] = useState(false);
    const [modalError, setModalError] = useState("");

    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 15,
        total: 0,
    });
     const [operationStatus, setOperationStatus] = useState(null);

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

    const toDoLabelDBOperations = async (values, type) => {
        try {
            let url = "";
             const link="https://u5w4o3jcorm74cmr6dcc4k3t740mauug.lambda-url.ap-south-1.on.aws/"
            let method = "POST";

            if (type === "update") {
                url =
                    link+"updateToDoLabels/" +
                    values.key;
                method = "PUT";
            } else if (type === "insert") {
                url =
                   link+"insertToDoLabels";
                method = "POST";
            } else if (type === "delete") {
                url =
                    link+"deleteToDoLabels/" +
                    values.key;
                method = "DELETE";
            } else if (type === "get") {
                url =
                   link+"getToDoLabelList";
                method = "POST";
            }

            const response = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                },
                body:
                    type === "get" || (method !== "GET" && method !== "DELETE")
                        ? JSON.stringify(values)
                        : null,
            });

            const result = await response.json();
            return result;
        } catch (error) {
            console.error("DB Operation failed:", error);
            return { operationStatus: false };
        }
    };

    const handleFinish = async (values) => {

        setModalLoading(true);
        setModalError("");
        const isEdit = !!editingRecord;

        try {
            const type = isEdit ? "update" : "insert";
            const ok = await toDoLabelDBOperations(values, type);

            if (!ok.operationStatus) {
                setModalError("Failed to save. Key might already exist. Check and try again.");
                    setOperationStatus("error");
                setModalLoading(false);
                return;
            }

            setOperationStatus(type === "insert" ? "inserted" : "updated");
            handleCancel();
            fetchLabels(); // reload all after insert/update
        } catch (e) {
            setModalError("An error occurred. Please try again.");
        } finally {
            setModalLoading(false);
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
        const result = await toDoLabelDBOperations({}, "get");
        if (result.operationStatus) {
            const mapped = result.data.map((item) => ({
                key: item._key,
                labelName: item.label_name,
                longText: item.long_text,
                shortText: item.short_text,
                description: item.description,
                labelType: item.label_type,
                toDoListType: item.todo_list_type,
            }));
            setAllData(mapped);
            setPagination((prev) => ({ ...prev, total: mapped.length }));
        } else {
            message.error("Failed to load ToDo Labels.");
        }
    };

    // filter + search + sort locally
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

        if (sortOrder) {
            result.sort((a, b) =>
                sortOrder === "ascend"
                    ? a.key.localeCompare(b.key)
                    : b.key.localeCompare(a.key)
            );
        }

        setPagination((prev) => ({ ...prev, total: result.length }));
        setData(result);
    };

    useEffect(() => {
        fetchLabels();
    }, []);

    useEffect(() => {
        handleSearchAndFilter();
    }, [searchText, filterLabelType, filterToDoListType, sortOrder, allData]);

    const handleTableChange = (newPagination) => {
        setPagination(newPagination); // client-side pagination
    };

    const handleKeySort = () => {
        if (sortOrder === "ascend") setSortOrder("descend");
        else if (sortOrder === "descend") setSortOrder(null);
        else setSortOrder("ascend");
    };

    const columns = [
        {
            title: (
                <span style={{ cursor: "pointer", userSelect: "none" }} onClick={handleKeySort}>
                    Key {sortOrder === "ascend" ? "↑" : sortOrder === "descend" ? "↓" : ""}
                </span>
            ),
            dataIndex: "key",
            key: "key",
        },
        { title: "Label Name", dataIndex: "labelName", key: "labelName" },
        { title: "Label Type", dataIndex: "labelType", key: "labelType" },
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

    // slice data for current page
    const paginatedData = data.slice(
        (pagination.current - 1) * pagination.pageSize,
        pagination.current * pagination.pageSize
    );

    return (
        <div
            style={{
                maxWidth: 1400,
                margin: "40px auto",
                padding: 24,
                background: "#fff",
                borderRadius: 8,
                boxShadow: "0 2px 8px #f0f1f2",
            }}
        >
            <Title level={1} style={{ marginBottom: 48 ,textAlign:'center'}}>
                To-Do Left/Right Labels Collection
            </Title>

            <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
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
                        setSortOrder("ascend");
                        setOperationStatus(null);
                        fetchLabels();
                    }}
                >
                    Reset
                </Button>
                        {/* <Button 
                     type="primary"
                    onClick={() => {
                        setSearchText("");
                        setFilterLabelType("");
                        setFilterToDoListType("");
                        setSortOrder("ascend");
                        setOperationStatus(null);
                        fetchLabels();
                    }}>
                    Refresh
                </Button> */}
        
                <Button
                    type="primary"
                    style={{ marginLeft: "auto" }}
                    onClick={() => showModal()}
                >
                    Add New Label
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
                    showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
                }}
                onChange={handleTableChange}
            />

            <Modal
                title={editingRecord ? "Edit Label" : "Add New Label"}
                open={isModalVisible}
                onCancel={handleCancel}
                onOk={() => form.submit()}
                okText={editingRecord ? "Update" : "Create"}
                 okButtonProps={{ style: { backgroundColor: '#0e8fffff',width:200,fontWeight:'bold'} }}
                cancelButtonProps={{ style: { width: 200,backgroundColor:'#d6d6d6ff', fontWeight:'bolder'} }}
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
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleFinish}
                    initialValues={{
                        labelType: labelTypes[0],
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
        </div>
    );
};

export default TodoLabelList;
