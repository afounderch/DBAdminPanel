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
  message
} from "antd";
import OperationStatus from "../../components/OperationStatus";
import Loader from "../../components/Loader"; 
import { title } from "framer-motion/client";

const { Option } = Select;
const { Title } = Typography;

export default function supplementsToDoMappingPage() {
  const [allData, setAllData] = useState([]);
  const [data, setData] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [filterCondition, setFilterByCondition] = useState("");
  const [filterByDay, setFilterByDay] = useState("");
  const [filterByTherapyOrder, setFilterByTherapyOrder] = useState("");
  const [filterLeftLabel, setFilterLeftLabel] = useState("");
  const [sortOrderByConditionId, setSortOrderByConditionId] = useState("");
  const [sortOrderByDay, setSortOrderByDay] = useState("");
  const [sortOrderByLabel, setSortOrderByLabel] = useState("");
  const [sortOrderByTherapyOrder, setSortOrderByTherapyOrder] = useState("");
  const [pagination, setPagination] = useState({ current: 1, pageSize: 15, total: 0 });
  const [operationStatus, setOperationStatus] = useState(null);

  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);

  const [conditionNodes, setConditionNodes] = useState([]);
  const [leftNodes, setLeftNodes] = useState([]);
  const [rightNodes, setRightNodes] = useState([]);
  const [respectiveLinkedNodes, setRespectiveLinkedNodes] = useState([]);

  const [editForm] = Form.useForm();
  const [modalLoading, setModalLoading] = useState(false);

  // NEW: overlay state to show saving indicator
  const [isLoading, setLoading] = useState(false);

  const urlBase = "https://u5w4o3jcorm74cmr6dcc4k3t740mauug.lambda-url.ap-south-1.on.aws/";

  // DB operation helper
  const supplementToDoDBOperations = async (values, type) => {
    try {
      let url = "";
      let method = "POST";

      if (type === "update") {
        //console.log(values);
        url = urlBase + "updateSupplementToDoLabelEdges/";
        method = "PUT";
      } else if (type === "insert") {
        url = urlBase + "saveSupplementToDoLabelEdges";
        method = "POST";
      } else if (type === "delete") {
        url = urlBase + "deleteSupplementToDoLabelEdges/";
        method = "DELETE";
      } else if (type === "get") {
        url = urlBase + "getSupplementToDoLabelEdges";
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
    setAllData([]);
    const result = await supplementToDoDBOperations({}, "get");
    //console.log(result.data);
    if (result.operationStatus) {
      const mapped = result.data.map((item) => ({
        key: `${item.conditionId}-${item.day}-${item.todoLabelOrder}-${item.leftLabelId}-${item.rightLabelId}-${item.respectiveNodeId}-${Date.now()}-${Math.random()}`,
        ConditionTOLeftLabelEdgeId: item.ConditionTOLeftLabelEdgeId,
        LeftTORightLabelEdgeId: item.LeftTORightLabelEdgeId,
        RightToNodeEdgeId: item.RightToNodeEdgeId,
        conditionId: item.conditionId,
        conditionKey: item.conditionKey,
        day: item.day,
        todoLabelOrder: item.todoLabelOrder,
        therapyOrder: item.therapyOrder,
        leftLabelId: item?.leftLabelId,
        leftLabelKey: item?.leftLabelKey,
        leftLabelName: item?.leftLabelName,
        rightLabelId: item?.rightLabelId,
        rightLabelKey: item?.rightLabelKey,
        rightLabelName: item?.rightLabelName,
        respectiveNodeId: item?.respectiveNodeId,
        respectiveNodeKey: item?.respectiveNodeKey,
        respectiveNodeName: item?.respectiveNodeName,

      }));
      setAllData(mapped);
      // console.log(mapped);
      setPagination((prev) => ({ ...prev, total: mapped.length }));
    } else {
      message.error("Failed to load Condition Mappings.");
    }
  };

  useEffect(() => {
    fetchMappings();
    fetchDropdownData();
  }, []);

  // fetch dropdowns for Add/Edit
  const fetchDropdownData = async () => {
    try {
      const res = await fetch(urlBase + "getSupplementsToDoLabelsForEdge");
      const data = await res.json();
      //console.log(data);
      data.conditionNodes.sort((a, b) => a.Condition_Key.localeCompare(b.Condition_Key));
      data.leftNodes.sort((a, b) => a.Label_Key.localeCompare(b.Label_Key));
      data.rightNodes.sort((a, b) => a.Label_Key.localeCompare(b.Label_Key));
      data.respectiveLinkedNodes.sort((a, b) => a.Node_Key.localeCompare(b.Node_Key));
      setConditionNodes(data.conditionNodes || []);
      setLeftNodes(data.leftNodes || []);
      setRightNodes(data.rightNodes || []);
      setRespectiveLinkedNodes(data.respectiveLinkedNodes || []);

    } catch (err) {
      console.error("Error fetching dropdowns:", err);
      message.error("Failed to load dropdown data");
    }
  };

  // Search + filter + sort
  const handleSearchAndFilter = () => {
    let result = [...allData];
    //console.log(result);
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
    if (filterCondition) {
      result = result.filter((item) => item.conditionKey === filterCondition);
    }
    if (filterByDay) {
      result = result.filter((item) => item.day === parseInt(filterByDay));

    }
    if (filterByTherapyOrder) {
        result = result.filter((item) => item.therapyOrder === parseInt(filterByTherapyOrder));
        }

    if (filterLeftLabel) {
      result = result.filter((item) => item.leftLabelId === filterLeftLabel);
    }
    if (sortOrderByConditionId) {
      result.sort((a, b) =>
        sortOrderByConditionId === "ascend"
          ? a.conditionKey.localeCompare(b.conditionKey)
          : b.conditionKey.localeCompare(a.conditionKey)
      );
    }
    if (sortOrderByDay) {
      result.sort((a, b) =>
        sortOrderByDay === "ascend" ? a.day - b.day : b.day - a.day
      );
    }
    if(sortOrderByTherapyOrder){
        result.sort((a, b) =>
        sortOrderByTherapyOrder === "ascend" ? a.therapyOrder - b.therapyOrder : b.therapyOrder - a.therapyOrder
        );
    }
    if (sortOrderByLabel) {
      result.sort((a, b) =>
        sortOrderByLabel === "ascend"
          ? a.todoLabelOrder - b.todoLabelOrder
          : b.todoLabelOrder - a.todoLabelOrder
      );
    }

    setPagination((prev) => ({ ...prev, total: result.length }));
    setData(result);
  };

  useEffect(() => {
    handleSearchAndFilter();
  }, [searchText, filterCondition, filterByDay,filterByTherapyOrder, filterLeftLabel, sortOrderByConditionId, sortOrderByDay, sortOrderByTherapyOrder, sortOrderByLabel, allData]);

  const handleTableChange = (newPagination) => setPagination(newPagination);




  const handleOrderByDaySort = () => {
    if (sortOrderByDay === "ascend") setSortOrderByDay("descend"); else if (sortOrderByDay === "descend") setSortOrderByDay(null); else setSortOrderByDay("ascend");
  }
  
  const handleOrderByTherapyOrderSort = () => {
    if (sortOrderByTherapyOrder === "ascend") setSortOrderByTherapyOrder("descend"); else if (sortOrderByTherapyOrder === "descend") setSortOrderByTherapyOrder(null); else setSortOrderByTherapyOrder("ascend");
    }

  const handleOrderByConditionIdSort = () => {
    if (sortOrderByConditionId === "ascend") setSortOrderByConditionId("descend"); else if (sortOrderByConditionId === "descend") setSortOrderByConditionId(null); else setSortOrderByConditionId("ascend");
  }

  const handleOrderByLabelOrderIdSort = () => {
    if (sortOrderByLabel === "ascend") setSortOrderByLabel("descend"); else if (sortOrderByLabel === "descend") setSortOrderByLabel(null); else setSortOrderByLabel("ascend");
  }

  // Edit modal
  const showEditModal = (record) => {
    //console.log(record);
    setEditingRecord(record);
    setIsEditModalVisible(true);
    editForm.setFieldsValue({
      conditionNode: record.conditionKey,
      //respectiveLinkedNode: record.respectiveNodeName,
      respectiveLinkedNode: record.respectiveNodeKey,
      day: record.day,
      todoLabelOrder: record.todoLabelOrder,
      leftLabel: record.leftLabelName,
      rightLabel: record.rightLabelName,
        therapyOrder: record.therapyOrder
    });
  };

  const handleFinishEdit = async (values) => {
    setModalLoading(true);
    //console.log(values);
    // find selected objects for mapping
    const conditionNodesObj = conditionNodes.find((d) => d.Condition_Key === values.conditionNode);
    const leftObj = leftNodes.find((l) => l.Label_Name === values.leftLabel);
    const rightObj = rightNodes.find((r) => r.Label_Name === values.rightLabel);
    const respectiveObj = respectiveLinkedNodes.find((n) => n.Node_Key === values.respectiveLinkedNode);

    const updatedRow = {
      edge1Id: editingRecord.ConditionTOLeftLabelEdgeId,
      edge2Id: editingRecord.LeftTORightLabelEdgeId,
      edge3Id: editingRecord.RightToNodeEdgeId,


      conditionId: conditionNodesObj?.Condition_Id,
      conditionKey: conditionNodesObj?.Condition_Key,
      day: values.day,
      todoLabelOrder: leftObj?.Label_Order,
      therapyOrder: values.therapyOrder,

      leftLabelId: leftObj?.Label_Id,
      leftLabelKey: leftObj?.Label_Key,
      leftLabelName: leftObj?.Label_Name,

      rightLabelId: rightObj?.Label_Id,
      rightLabelKey: rightObj?.Label_Key,
      rightLabelName: rightObj?.Label_Name,

      respectiveNodeId: respectiveObj?.Node_Id,
      respectiveNodeKey: respectiveObj?.Node_Key,
      respectiveNodeName: respectiveObj?.Node_Name
    };

    const ok = await supplementToDoDBOperations(updatedRow, "update");

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
  const handleDelete = async (edge1Id, edge2Id,edge3Id) => {
    //console.log(edge1Id, edge2Id,edge3Id);
    const ok = await supplementToDoDBOperations({ edge1Id, edge2Id,edge3Id }, "delete");
    try {
    if (ok.operationStatus) {
      setOperationStatus("deleted");
      message.success("Deleted successfully");
      fetchMappings();
    } else {
      message.error("Failed to delete. Try again.");
    }}
    catch (err) {
      console.error(err);
      setOperationStatus("error");
      message.error("Failed to delete. Try again.");
    }
  };



  const columns = [
    {
      title: (
        <span style={{ cursor: "pointer" }} onClick={handleOrderByConditionIdSort}>
          Condition Node {sortOrderByConditionId === "ascend" ? "↑" : sortOrderByConditionId === "descend" ? "↓" : ""}
        </span>
      ),
      dataIndex: "conditionKey",
      key: "conditionKey",
      //render: (text) => text.replace(/^.*\//, ""),
    },
    {
      title: (
        <span style={{ cursor: "pointer" }} onClick={handleOrderByDaySort}>
         Therapy Day {sortOrderByDay === "ascend" ? "↑" : sortOrderByDay === "descend" ? "↓" : ""}
        </span>
      ), dataIndex: "day", key: "day"
    },
    //  {
    //   title: "Day", dataIndex: "day", key: "day"
    // },
    
     {
      title: (
        <span style={{ cursor: "pointer" }} onClick={handleOrderByTherapyOrderSort}>
        Therapy Order {sortOrderByTherapyOrder === "ascend" ? "↑" : sortOrderByTherapyOrder === "descend" ? "↓" : ""}
        </span>
      ), dataIndex: "therapyOrder", key: "therapyOrder"
    },
    {
      title: (
        <span style={{ cursor: "pointer" }} onClick={handleOrderByLabelOrderIdSort}>
         ToDo Order {sortOrderByLabel === "ascend" ? "↑" : sortOrderByLabel === "descend" ? "↓" : ""}
        </span>
      ), dataIndex: "todoLabelOrder", key: "todoLabelOrder"
    },
    { title: "To-Do Left Label Name", dataIndex: "leftLabelName", key: "leftLabelName", render: (text) => text.replace(/^.*\//, ""), },

    { title: "To-Do Right Label Name", dataIndex: "rightLabelName", key: "rightLabelName", render: (text) => text.replace(/^.*\//, ""), },
    {title:"Linked Supplement", dataIndex: "respectiveNodeName", key: "respectiveNodeName", render: (text) => text ? text.replace(/^.*\//, "") : "",},
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Button type="link" onClick={() => showEditModal(record)}>
            Edit
          </Button>
          <Popconfirm title="Are you sure?" onConfirm={() => handleDelete(record.ConditionTOLeftLabelEdgeId, record.LeftTORightLabelEdgeId,record.RightToNodeEdgeId)}>
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

  const handleAddMapping = async (values) => {


    function generateNumberSequenceArrayFrom(start, end) {
  const length = end - start + 1;
  return Array.from({ length: length }, (_, i) => start + i);
}
    //console.log(values);
    const leftObj = leftNodes.find((l) => l.Label_Name === values.leftLabel);
    const rightObj = rightNodes.find((r) => r.Label_Name === values.rightLabel);
    const respectiveObj = respectiveLinkedNodes.find((n) => n.Node_Key === values.respectiveLinkedNode);
    const conditionNodesObj = conditionNodes.find((d) => d.Condition_Key === values.conditionNode);
    let days=generateNumberSequenceArrayFrom(values.startday,values.endday);
    const newRows = [];
    for (let day of days){
    newRows.push({
      key: `${values.conditionNode}-${values.day}-${values.todoLabelOrder}-${leftObj?.Label_Id}-${rightObj?.Label_Id}-${Date.now()}-${Math.random()}`,
      conditionId: conditionNodesObj.Condition_Id,
      conditionKey: conditionNodesObj.Condition_Key,
      respectiveNodeId: respectiveObj?.Node_Id,
      respectiveNodeKey: respectiveObj?.Node_Key,
      respectiveNodeName: respectiveObj?.Node_Name,
      day: day,
      todoLabelOrder: leftObj.Label_Order,
      therapyOrder: values.therapyOrder,
      leftLabelId: leftObj?.Label_Id,
      leftLabelKey: leftObj?.Label_Key,
      leftLabelName: leftObj?.Label_Name,
      rightLabelId: rightObj?.Label_Id,
      rightLabelKey: rightObj?.Label_Key,
      rightLabelName: rightObj?.Label_Name
    });
   }

    setAddedMappings((prev) => [...prev, ...newRows]);
    // console.log(newRow);
    //console.log(addedMappings);
    message.success("Mapping added to the list. Click 'Save All' to save.");
  };

  const handleDeleteAdded = (key) => {
    setAddedMappings((prev) => prev.filter((r) => r.key !== key));
  };
  //reset
  const handleReset = () => { addForm.resetFields(); }
  const clearAllAdded = () => { setAddedMappings([]); }

  const handleSaveAllAdded = async () => {
    if (addedMappings.length === 0) {
      message.warning("No mappings to save!");
      return;
    }
    // show overlay
    setLoading(true);

    try {
      //console.log(addedMappings);
      const res = await supplementToDoDBOperations(addedMappings, "insert");
      if (!res.operationStatus) throw new Error("Save failed");
      message.success("All mappings saved!");
      setAddedMappings([]);
      setAddModalVisible(false);
      setAllData(addedMappings)
      handleReset();
      setOperationStatus("inserted");
      fetchMappings();
    } catch (err) {
      console.error(err);
      message.error("Failed to save mappings");
      setOperationStatus("error");
    } finally {
      // always hide overlay
      setLoading(false);
    }
  };

  const addModalColumns = [
    { title: "Condition Node", dataIndex: "conditionKey", key: "conditionKey" },
    { title: "Therapy Day", dataIndex: "day", key: "day" },
    {title:"Order of Therapy", dataIndex:"therapyOrder", key:"therapyOrder"},
    { title: "To-Do Order", dataIndex: "todoLabelOrder", key: "todoLabelOrder" },
    { title: "To-Do Left Label Name", dataIndex: "leftLabelName", key: "leftLabelName" },
    { title: "To-Do Right Label Name", dataIndex: "rightLabelName", key: "rightLabelName" },
    { title: "Linked Supplement", dataIndex: "respectiveNodeName", key: "respectiveNodeName" },
   
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
        Supplement To-Do Label Edge Mappings
      </Title>

      <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
        <Input

          placeholder="Search by Label Name/Key"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          style={{ width: 250, padding: 4, marginTop: 0 }}
        />
        <Select
          showSearch
          allowClear
          placeholder="Filter by Condition"
          value={filterCondition || undefined}
          onChange={(val) => setFilterByCondition(val || "")}
          style={{ width: 200 }}
        >
          {[...new Set(allData.map((i) => i.conditionKey))].map((alg) => (
            <Option key={alg} value={alg}>
              {alg}
            </Option>
          ))}
        </Select>
        <Select
          showSearch
          allowClear
          placeholder="Filter by Therapy Day"
          value={filterByDay || undefined}
          onChange={(val) => setFilterByDay(val || "")}
          style={{ width: 180 }}
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
          placeholder="Filter by Therapy Order"
          value={filterByTherapyOrder || undefined}
          onChange={(val) => setFilterByTherapyOrder(val || "")}
          style={{ width: 180 }}
        >
          {[...new Set(allData.map((i) => i.therapyOrder))].map((alg) => (
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
          style={{ width: 240 }}
        >
          {[
            ...new Map(
              allData.map((i) => [i.leftLabelId, i.leftLabelName])
            ).entries()
          ]
            .sort(([idA], [idB]) => idA.localeCompare(idB)) // ✅ sort by id
            .map(([id, name]) => (
              <Option key={id} value={id}>
                {id.replace(/^.*\//, "")} - {name}
              </Option>
            ))}
        </Select>

        <Button
          type="primary"
          onClick={() => {
            setSearchText("");
            setFilterByCondition("");
            setFilterByDay("");
            setFilterByTherapyOrder("");
            setFilterLeftLabel("");
            setSortOrderByConditionId("ascend");
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
        width={1600}
      >

        <Form form={addForm} layout="inline" onFinish={handleAddMapping} style={{
          // changed: make form a flex-wrap container and add rowGap for vertical spacing between wrapped rows
          display: "flex",
          flexWrap: "wrap",
          gap: 12,
          rowGap: 16,
          marginBottom: 12,
          maxWidth: 1600,
          margin: "40px auto",
          padding: 14,
          paddingTop: 24,
          paddingBottom: 24,
          background: "#fff",
          borderRadius: 8,
          boxShadow: "0 2px 8px #f0f1f2",
        }}>
          <Form.Item name="conditionNode" rules={[{ required: true, message: "Select Condition Node" }]} style={{ flex: "1 1 260px", minWidth: 200 }}>
            <Select showSearch placeholder="Condition Node" style={{ width: "100%" }}>
              {conditionNodes.map((d) => (
                <Option key={d.Condition_Key} value={d.Condition_Key}>
                  {d.Condition_Key}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="startday"
            rules={[
              { required: true, message: "Enter Start Day" },
              { type: "number", min: 1, max: 999, message: "Day must be 1-999" },
            ]}
            style={{ flex: "0 0 90px", minWidth: 120 }}
          >
            <InputNumber placeholder="Start Day" min={1} max={999} style={{ width: "100%" }} />
          </Form.Item>
        <Form.Item
            name="endday"
            rules={[
              { required: true, message: "Enter End Day" },
              { type: "number", min: 1, max: 999, message: "Day must be 1-999" },
            ]}
            style={{ flex: "0 0 90px", minWidth: 120 }}
          >
            <InputNumber placeholder="End Day" min={1} max={999} style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item
            name="therapyOrder"
            rules={[
              { required: true, message: "Enter Therapy Order" },
              { type: "number", min: 1, max: 999, message: "Day must be 1-999" },
            ]}
            style={{ flex: "0 0 90px", minWidth: 140 }}
          >
            <InputNumber placeholder="Therapy Order" min={1} max={999} style={{ width: "100%" }} />
          </Form.Item>
          
          {/* <Form.Item
            name="todoLabelOrder"
            rules={[
              { required: true, message: "Enter To-Do Order" },
              { type: "number", min: 1, max: 999, message: "Order must be 1-999" },
            ]}
            style={{ flex: "0 0 90px", minWidth: 120 }}
          >
            <InputNumber placeholder="To-Do Order" min={1} max={999} style={{ width: "100%" }} />
          </Form.Item> */}
          <Form.Item name="leftLabel" rules={[{ required: true, message: "Select Left Label" }]} style={{ flex: "1 1 260px", minWidth: 200 }}>
            <Select showSearch placeholder="To-Do Left Label" style={{ width: "100%" }}>
              {leftNodes.map((l) => (
                <Option key={l.Label_Key} value={l.Label_Name}>
                  {l.Label_Key} - {l.Label_Name}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="rightLabel" rules={[{ required: true, message: "Select Right Label" }]} style={{ flex: "1 1 260px", minWidth: 200 }}>
            <Select showSearch placeholder="To-Do Right Label" style={{ width: "100%" }}>
              {rightNodes.map((r) => (
                <Option key={r.Label_Key} value={r.Label_Name}>
                  {r.Label_Key} - {r.Label_Name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="respectiveLinkedNode" rules={[{ required: true, message: "Select Linked Supplement" }]} style={{ flex: "1 1 260px", minWidth: 200 }}>
            <Select showSearch placeholder="Linked Supplement" style={{ width: "100%" }}>
              {respectiveLinkedNodes.map((r) => (
                <Option key={r.Node_Key} value={r.Node_Key}>
                  {r.Node_Key} - {r.Node_Name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          {/* Responsive buttons row: two buttons side-by-side, each taking half width */}
          <Form.Item style={{ display: "flex", gap: 8, width: "100%", marginTop: 28 ,justifyContent:"center"}}>
            <Button type="primary" htmlType="submit" style={{ flex: 1, width: 150,padding:18 }}>
              Add
            </Button>
            <Button htmlType="button" onClick={handleReset} style={{ flex: 1 , width: 150,padding:18 }}>
              Reset
            </Button>
          </Form.Item>
        </Form>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h4 style={{ margin: 0, flex: "1 1 240px", textAlign: "left" }}>
            New Node Connections to Save: {addedMappings.length}
          </h4>
          
          <div style={{ display: "flex", gap: 12, justifyContent: "flex-end", alignItems: "center", flex: "0 0 auto", marginTop: 8 }}>
            <Button
              type="default"
              onClick={clearAllAdded}
              disabled={addedMappings.length === 0}
              style={{ minWidth: 140, padding: 12, fontWeight: "bold" }}
            >
              Reset
            </Button>
            <Button
              type="primary"
              onClick={handleSaveAllAdded}
              disabled={addedMappings.length === 0}
              style={{ minWidth: 140, padding: 12, fontWeight: "bold" }}
            >
              Save All
            </Button>
          </div>
         </div>

        <Table columns={addModalColumns} dataSource={addedMappings} rowKey="key" pagination={false} />


      </Modal>

      {/* ---------------- EDIT MODAL ---------------- */}
      <Modal
        title="Edit Mapping"
        open={isEditModalVisible}
        onCancel={() => setIsEditModalVisible(false)}
        onOk={() => editForm.submit()}
        okText="Update"
        cancelText="Cancel"
        width={1600}
        okButtonProps={{ style: { backgroundColor: "#0e8fffff", width: 200, fontWeight: "bold" } }}
        cancelButtonProps={{ style: { width: 200, backgroundColor: "#d6d6d6ff", fontWeight: "bolder" } }}
      >
        <Form
          form={editForm}
          layout="inline"
          onFinish={handleFinishEdit}
          style={{
            marginBottom: 20,
            // changed: ensure edit form also uses explicit flex wrap + rowGap for proper spacing between rows
            display: "flex",
            flexWrap: "wrap",
            gap: 12,
            rowGap: 16,
            backgroundColor: "#fff",
            padding: 20,
            borderRadius: 10,
            boxShadow: "0 2px 8px #f0f1f2",
            maxWidth: 1600,
            justifyContent: "center"
          }}
        >
          <Form.Item
            name="conditionNode"
            rules={[{ required: true, message: "Select Condition Node" }]}
            style={{ flex: "1 1 260px", minWidth: 200 }}
          >
            <Select showSearch placeholder="Condition Node" style={{ width: "100%" }}>
              {conditionNodes.map((d) => (
                <Option key={d.Condition_Key} value={d.Condition_Key}>
                  {d.Condition_Key}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="day"
            rules={[
              { required: true, message: "Enter Therapy Day" },
              { type: "number", min: 1, max: 999, message: "Day must be 1-999" },
            ]}
            style={{ flex: "0 0 90px", minWidth: 120 }}
          >
            <InputNumber placeholder="Day" min={1} max={999} style={{ width: "100%" }} />
          </Form.Item>
            <Form.Item
            name="therapyOrder"
            rules={[
              { required: true, message: "Enter Order of Therapy" },
              { type: "number", min: 1, max: 999, message: "Order must be 1-999" },
            ]}
            style={{ flex: "0 0 90px", minWidth: 160 }}
          >
            <InputNumber placeholder="Order of Therapy" min={1} max={999} style={{ width: "100%" }} />
          </Form.Item>
        
          {/* <Form.Item
            name="todoLabelOrder"
            rules={[
              { required: true, message: "Enter To-Do Order" },
              { type: "number", min: 1, max: 999, message: "Order must be 1-999" },
            ]}
            style={{ flex: "0 0 90px", minWidth: 120 }}
          >
            <InputNumber placeholder="Order" min={1} max={999} style={{ width: "100%" }} />
          </Form.Item> */}

          <Form.Item
            name="leftLabel"
            rules={[{ required: true, message: "Select Left Label" }]}
            style={{ flex: "1 1 320px", minWidth: 200 }}
          >
            <Select showSearch placeholder="To-Do Left Label" style={{ width: "100%" }}>
              {leftNodes.map((l) => (
                <Option key={l.Label_Key} value={l.Label_Name}>
                  {l.Label_Key} - {l.Label_Name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="rightLabel"
            rules={[{ required: true, message: "Select Right Label" }]}
            style={{ flex: "1 1 320px", minWidth: 200 }}
          >
            <Select showSearch placeholder="To-Do Right Label" style={{ width: "100%" }}>
              {rightNodes.map((r) => (
                <Option key={r.Label_Key} value={r.Label_Name}>
                  {r.Label_Key} - {r.Label_Name}
                </Option>
              ))}
            </Select>
          </Form.Item>
           <Form.Item
            name="respectiveLinkedNode"
            rules={[{ required: true, message: "Select Linked Supplement" }]}
            style={{ flex: "1 1 320px", minWidth: 200 }}
          >
            <Select showSearch placeholder="Linked Supplement" style={{ width: "100%" }}>
              {respectiveLinkedNodes.map((r) => (
                <Option key={r.Node_Key} value={r.Node_Key}>
                  {r.Node_Key} - {r.Node_Name}
                </Option>
              ))}
            </Select>
          </Form.Item>

        </Form>
      </Modal>

      {/* NEW: Full-screen saving overlay with centered loading indicator */}
    <Loader loading={isLoading}  />
    </div>
  );
}



