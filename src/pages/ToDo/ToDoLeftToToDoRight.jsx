import React, { useState, useEffect } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  Space,
  Popconfirm,
  Typography,
  message,
} from "antd";
import OperationStatus from "../../components/OperationStatus";

const { Option } = Select;
const { Title } = Typography;

export default function DietAlgorithmMappingPage() {
  const [allData, setAllData] = useState([]);
  const [data, setData] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [filterDietAlgorithm, setFilterDietAlgorithm] = useState("");
  const [filterByDay, setFilterByDay] = useState("");
  const [filterLeftLabel, setFilterLeftLabel] = useState("");
  const [sortOrderByDietId, setSortOrderByDietId] = useState("ascend");
  const [sortOrderByDay, setSortOrderByDay] = useState("ascend");
  const [pagination, setPagination] = useState({ current: 1, pageSize: 15, total: 0 });
  const [operationStatus, setOperationStatus] = useState(null);

  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);

  const [dietNodes, setDietNodes] = useState([]);
  const [leftNodes, setLeftNodes] = useState([]);
  const [rightNodes, setRightNodes] = useState([]);
  const [editForm] = Form.useForm();
  const [modalLoading, setModalLoading] = useState(false);

  const urlBase = "https://u5w4o3jcorm74cmr6dcc4k3t740mauug.lambda-url.ap-south-1.on.aws/";

  // DB operation helper
  const dietMappingsDBOperations = async (values, type) => {
    try {
      let url = "";
      let method = "POST";

      if (type === "update") {
        console.log(values);
        url = urlBase + "updateDietToDoLabelEdges/";
        method = "PUT";
      } else if (type === "insert") {
        url = urlBase + "saveDietToDoLabelEdges";
        method = "POST";
      } else if (type === "delete") {
        url = urlBase + "deleteDietToDoLabelEdges/";
        method = "DELETE";
      } else if (type === "get") {
        url = urlBase + "getDietToDoLabelEdges";
        method = "POST";
      }

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: type === "get" || (method !== "GET") ? JSON.stringify(values) : null,
      });
      const result = await response.json();
      return result;
    } catch (error) {
      console.error("DB Operation failed:", error);
      return { operationStatus: false };
    }
  };

  // fetch all mappings
  const fetchMappings = async () => {
    const result = await dietMappingsDBOperations({}, "get");
    if (result.operationStatus) {
      const mapped = result.data.map((item) => ({
        DietTOLeftLabelEdgeId: item.DietTOLeftLabelEdgeId,
        LeftTORightLabelEdgeId: item.LeftTORightLabelEdgeId,
        dietAlgorithmId: item.dietAlgorithmId,
        dietAlgorithmKey: item.dietAlgorithmKey,
        day: item.day,
        leftLabelId: item?.leftLabelId,
        leftLabelKey: item?.leftLabelKey,
        leftLabelName: item?.leftLabelName,
        rightLabelId: item?.rightLabelId,
        rightLabelKey: item?.rightLabelKey,
        rightLabelName: item?.rightLabelName
      }));
      setAllData(mapped);
      setPagination((prev) => ({ ...prev, total: mapped.length }));
    } else {
      message.error("Failed to load Diet Mappings.");
    }
  };

  useEffect(() => {
    fetchMappings();
    fetchDropdownData();
  }, []);

  // fetch dropdowns for Add/Edit
  const fetchDropdownData = async () => {
    try {
      const res = await fetch(urlBase + "getToDoLabelsForEdge");
      const data = await res.json();
      setDietNodes(data.dietNodes || []);
      setLeftNodes(data.leftNodes || []);
      setRightNodes(data.rightNodes || []);
    } catch (err) {
      console.error("Error fetching dropdowns:", err);
      message.error("Failed to load dropdown data");
    }
  };

  // Search + filter + sort
  const handleSearchAndFilter = () => {
    let result = [...allData];
    if (searchText) {
      const lower = searchText.toLowerCase();
      result = result.filter(
        (item) =>
          item.leftLabelKey.toLowerCase().includes(lower) ||
          item.rightLabelKey.toLowerCase().includes(lower) ||
          item.leftLabelName.toLowerCase().includes(lower) ||
          item.rightLabelName.toLowerCase().includes(lower)
      );
    }
    if (filterDietAlgorithm) {
      result = result.filter((item) => item.dietAlgorithmKey === filterDietAlgorithm);
    }
    if (filterByDay) {
      result = result.filter((item) => item.day === parseInt(filterByDay));
    }

    if (filterLeftLabel) {
      result = result.filter((item) => item.leftLabelId === filterLeftLabel);
    }
    if (sortOrderByDietId) {
      result.sort((a, b) =>
        sortOrderByDietId === "ascend"
          ? a.dietAlgorithmKey.localeCompare(b.dietAlgorithmKey)
          : b.dietAlgorithmKey.localeCompare(a.dietAlgorithmKey)
      );
    }
    if (sortOrderByDay) {
      result.sort((a, b) =>
        sortOrderByDay === "ascend" ? a.day - b.day : b.day - a.day
      );
    }

    setPagination((prev) => ({ ...prev, total: result.length }));
    setData(result);
  };

  useEffect(() => {
    handleSearchAndFilter();
  }, [searchText, filterDietAlgorithm, filterByDay, filterLeftLabel, sortOrderByDietId, sortOrderByDay, allData]);

  const handleTableChange = (newPagination) => setPagination(newPagination);

  const handleKeySort = () => {
    let sortType = null;
    if (sortOrderByDay) sortType = "day";
    else if (sortOrderByDietId) sortType = "dietAlgorithm";
    if (sortType === "day") {
      if (sortOrderByDay === "ascend") setSortOrderByDay("descend");
      else if (sortOrderByDay === "descend") setSortOrderByDay("ascend");
      return;
    }
    else if (sortType === "dietAlgorithm") {
      if (sortOrderByDietId === "ascend") setSortOrderByDietId("descend");
      else if (sortOrderByDietId === "descend") setSortOrderByDietId("ascend");
    };
  }
  // Edit modal
  const showEditModal = (record) => {
    //console.log(record);
    setEditingRecord(record);
    setIsEditModalVisible(true);
    editForm.setFieldsValue({
      dietAlgorithm: record.dietAlgorithmKey,
      day: record.day,
      leftLabel: record.leftLabelName,
      rightLabel: record.rightLabelName
    });
  };

  const handleFinishEdit = async (values) => {
    setModalLoading(true);

    // find selected objects for mapping
    const dietAlgorithmObj = dietNodes.find((d) => d.Diet_Key === values.dietAlgorithm);
    const leftObj = leftNodes.find((l) => l.Label_Name === values.leftLabel);
    const rightObj = rightNodes.find((r) => r.Label_Name === values.rightLabel);

    const updatedRow = {
      edge1Id: editingRecord.DietTOLeftLabelEdgeId,
      edge2Id: editingRecord.LeftTORightLabelEdgeId,

      dietAlgorithmId: dietAlgorithmObj?.Diet_Id,
      dietAlgorithmKey: dietAlgorithmObj?.Diet_Key,
      day: values.day,

      leftLabelId: leftObj?.Label_Id,
      leftLabelKey: leftObj?.Label_Key,
      leftLabelName: leftObj?.Label_Name,

      rightLabelId: rightObj?.Label_Id,
      rightLabelKey: rightObj?.Label_Key,
      rightLabelName: rightObj?.Label_Name,
    };

    const ok = await dietMappingsDBOperations(updatedRow, "update");

    if (!ok.operationStatus) {
      message.error("Failed to save mapping");
      setModalLoading(false);
      return;
    }

    setOperationStatus("updated");
    setIsEditModalVisible(false);
    setEditingRecord(null);
    fetchMappings();
    setModalLoading(false);
  };


  // Delete
  const handleDelete = async (edge1Id, edge2Id) => {
    const ok = await dietMappingsDBOperations({ edge1Id, edge2Id }, "delete");
    if (ok.operationStatus) {
      setOperationStatus("deleted");
      message.success("Deleted successfully");
      fetchMappings();
    } else {
      message.error("Failed to delete. Try again.");
    }
  };



  const columns = [
    {
      title: (
        <span style={{ cursor: "pointer" }} onClick={handleKeySort}>
          Diet Algorithm {sortOrderByDietId === "ascend" ? "↑" : sortOrderByDietId === "descend" ? "↓" : ""}
        </span>
      ),
      dataIndex: "dietAlgorithmKey",
      key: "dietAlgorithmKey",
      render: (text) => text.replace(/^.*\//, ""),
    },
    {
      title: (
        <span style={{ cursor: "pointer" }} onClick={handleKeySort}>
          Day {sortOrderByDay === "ascend" ? "↑" : sortOrderByDay === "descend" ? "↓" : ""}
        </span>
      ), dataIndex: "day", key: "day"
    },
    { title: "To-Do Left Label Name", dataIndex: "leftLabelName", key: "leftLabelName", render: (text) => text.replace(/^.*\//, ""), },

    { title: "To-Do Right Label Name", dataIndex: "rightLabelName", key: "rightLabelName", render: (text) => text.replace(/^.*\//, ""), },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Button type="link" onClick={() => showEditModal(record)}>
            Edit
          </Button>
          <Popconfirm title="Are you sure?" onConfirm={() => handleDelete(record.DietTOLeftLabelEdgeId, record.LeftTORightLabelEdgeId)}>
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

  /*** ---------------- ADD MODAL LOGIC ---------------- ***/
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [addForm] = Form.useForm();
  const [addedMappings, setAddedMappings] = useState([]);

  const handleAddMapping = (values) => {
    const leftObj = leftNodes.find((l) => l.Label_Name === values.leftLabel);
    const rightObj = rightNodes.find((r) => r.Label_Name === values.rightLabel);
    const dietAlgorithmObj = dietNodes.find((d) => d.Diet_Key === values.dietAlgorithm);

    const newRow = {
      dietAlgorithmId: dietAlgorithmObj.Diet_Id,
      dietAlgorithmKey: dietAlgorithmObj.Diet_Key,
      day: values.day,
      leftLabelId: leftObj?.Label_Id,
      leftLabelKey: leftObj?.Label_Key,
      leftLabelName: leftObj?.Label_Name,
      rightLabelId: rightObj?.Label_Id,
      rightLabelKey: rightObj?.Label_Key,
      rightLabelName: rightObj?.Label_Name
    };
    //console.log(newRow);
    setAddedMappings((prev) => [...prev, newRow]);
    //console.log(addedMappings);

  };

  const handleDeleteAdded = (key) => {
    setAddedMappings((prev) => prev.filter((r) => r.key !== key));
  };
  //reset
  const handleReset = () => { addForm.resetFields(); }
  const handleSaveAllAdded = async () => {
    if (addedMappings.length === 0) {
      message.warning("No mappings to save!");
      return;
    }
    try {
      const res = await dietMappingsDBOperations(addedMappings, "insert");
      if (!res.operationStatus) throw new Error("Save failed");
      message.success("All mappings saved!");
      setAddedMappings([]);
      setAddModalVisible(false);
      handleReset();
      setOperationStatus("inserted");
      fetchMappings();
    } catch (err) {
      console.error(err);
      message.error("Failed to save mappings");
    }
  };

  const addModalColumns = [
    { title: "Diet Algorithm", dataIndex: "dietAlgorithmKey", key: "dietAlgorithmKey" },
    { title: "Day", dataIndex: "day", key: "day" },

    { title: "To-Do Left Label Name", dataIndex: "leftLabelName", key: "leftLabelName" },

    { title: "To-Do Right Label Name", dataIndex: "rightLabelName", key: "rightLabelName" },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <Button danger onClick={() => handleDeleteAdded(record.key)}>
          Delete
        </Button>
      ),
    },
  ];

  return (
    <div style={{ maxWidth: 1400, margin: "40px auto", padding: 24, background: "#fff", borderRadius: 8, boxShadow: "0 2px 8px #f0f1f2" }}>
      <Title level={1} style={{ textAlign: "center", marginBottom: 48 }}>
        To-Do Left/Right Label Edge Mappings
      </Title>

      <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
        <Input

          placeholder="Search by Label Name/Key"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          style={{ width: 300, padding: 4, marginTop: 0 }}
        />
        <Select
          showSearch
          allowClear
          placeholder="Filter by Diet Algorithm"
          value={filterDietAlgorithm || undefined}
          onChange={(val) => setFilterDietAlgorithm(val || "")}
          style={{ width: 220 }}
        >
          {[...new Set(allData.map((i) => i.dietAlgorithmKey))].map((alg) => (
            <Option key={alg} value={alg}>
              {alg}
            </Option>
          ))}
        </Select>
        <Select
          showSearch
          allowClear
          placeholder="Filter by Day"
          value={filterByDay || undefined}
          onChange={(val) => setFilterByDay(val || "")}
          style={{ width: 120 }}
        >
          {[...new Set(allData.map((i) => i.day))].map((alg) => (
            <Option key={alg} value={alg}>
              {alg}
            </Option>
          ))}
        </Select>
        <Select
          showSearch
          allowClear
          placeholder="Filter by Left Label"
          value={filterLeftLabel || undefined}
          onChange={(val) => setFilterLeftLabel(val || "")}
          style={{ width: 220 }}
        >
          {[
            ...new Map(
              allData.map((i) => [i.leftLabelId, i.leftLabelName, i.leftLabelKey])
            ).entries()
          ].map(([id, name]) => (
            <Option key={id} value={id}>
              {id.replace(/^.*\//, "")} - {name}
            </Option>
          ))}
        </Select>
        <Button
          type="primary"
          onClick={() => {
            setSearchText("");
            setFilterDietAlgorithm("");
            setFilterByDay("");
            setFilterLeftLabel("");
            setSortOrderByDietId("ascend");
            setOperationStatus(null);
            fetchMappings();
          }}
        >
          Reset
        </Button>
        <Button type="primary" onClick={() => setAddModalVisible(true)} style={{ marginLeft: "auto" }}>
          Add Mapping
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

      {/* ---------------- ADD MODAL ---------------- */}
      <Modal
        title="Add Mappings"
        open={addModalVisible}
        onCancel={() => setAddModalVisible(false)}
        footer={null}
        width={1200}
      >
        <Form form={addForm} layout="inline" onFinish={handleAddMapping} style={{ marginBottom: 20, maxWidth: 1200, margin: "40px auto", padding: 24, background: "#fff", borderRadius: 8, boxShadow: "0 2px 8px #f0f1f2", justifyContent: "center" }}>
          <Form.Item name="dietAlgorithm" rules={[{ required: true, message: "Select Diet Algorithm" }]}>
            <Select showSearch placeholder="Diet Algorithm" style={{ width: 200 }}>
              {dietNodes.map((d) => (
                <Option key={d.Diet_Key} value={d.Diet_Key}>
                  {d.Diet_Key}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="day"
            rules={[
              { required: true, message: "Enter Day" },
              { type: "number", min: 1, max: 999, message: "Day must be 1-999" },
            ]}
          >
            <InputNumber placeholder="Day" min={1} max={999} style={{ width: 100 }} />
          </Form.Item>
          <Form.Item name="leftLabel" rules={[{ required: true, message: "Select Left Label" }]}>
            <Select showSearch placeholder="To-Do Left Label" style={{ width: 200 }}>
              {leftNodes.map((l) => (
                <Option key={l.Label_Key} value={l.Label_Name}>
                  {l.Label_Key} - {l.Label_Name}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="rightLabel" rules={[{ required: true, message: "Select Right Label" }]}>
            <Select showSearch placeholder="To-Do Right Label" style={{ width: 200 }}>
              {rightNodes.map((r) => (
                <Option key={r.Label_Key} value={r.Label_Name}>
                  {r.Label_Key} - {r.Label_Name}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                Add
              </Button>
              <Button htmlType="button" onClick={handleReset}>
                Reset
              </Button>
            </Space>
          </Form.Item>
        </Form>

        <Table columns={addModalColumns} dataSource={addedMappings} rowKey="key" pagination={false} />

        <Button
          type="primary"
          onClick={handleSaveAllAdded}
          disabled={addedMappings.length === 0}
          style={{ marginTop: 16, width: 200 }}
        >
          Save All
        </Button>
      </Modal>

      {/* ---------------- EDIT MODAL ---------------- */}
      <Modal
        title="Edit Mapping"
        open={isEditModalVisible}
        onCancel={() => setIsEditModalVisible(false)}
        onOk={() => editForm.submit()}
        okText="Update"
        cancelText="Cancel"
        width={1200}
        okButtonProps={{ style: { backgroundColor: "#0e8fffff", width: 200, fontWeight: "bold" } }}
        cancelButtonProps={{ style: { width: 200, backgroundColor: "#d6d6d6ff", fontWeight: "bolder" } }}
      >
        <Form
          form={editForm}
          layout="inline"
          onFinish={handleFinishEdit}
          style={{
            marginBottom: 20,
            flexWrap: "nowrap",
            backgroundColor: "#fff",
            padding: 20,
            borderRadius: 10,
            boxShadow: "0 2px 8px #f0f1f2",
            justifyContent: "center",
          }}
        >
          <Form.Item name="dietAlgorithm" rules={[{ required: true, message: "Select Diet Algorithm" }]}>
            <Select showSearch placeholder="Diet Algorithm" style={{ width: 200 }}>
              {dietNodes.map((d) => (
                <Option key={d.Diet_Key} value={d.Diet_Key}>
                  {d.Diet_Key}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="day"
            rules={[
              { required: true, message: "Enter Day" },
              { type: "number", min: 1, max: 999, message: "Day must be 1-999" },
            ]}
          >
            <InputNumber placeholder="Day" min={1} max={999} style={{ width: 100 }} />
          </Form.Item>

          <Form.Item name="leftLabel" rules={[{ required: true, message: "Select Left Label" }]}>
            <Select showSearch placeholder="To-Do Left Label" style={{ width: 200 }}>
              {leftNodes.map((l) => (
                <Option key={l.Label_Key} value={l.Label_Name}>
                  {l.Label_Key} - {l.Label_Name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="rightLabel" rules={[{ required: true, message: "Select Right Label" }]}>
            <Select showSearch placeholder="To-Do Right Label" style={{ width: 200 }}>
              {rightNodes.map((r) => (
                <Option key={r.Label_Key} value={r.Label_Name}>
                  {r.Label_Key} - {r.Label_Name}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}



