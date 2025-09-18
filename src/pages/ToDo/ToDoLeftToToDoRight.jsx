import React, { useState, useEffect } from "react";
import {
  Select,
  InputNumber,
  Button,
  Form,
  Card,
  message,
  Table,
  Space,
} from "antd";

const { Option } = Select;

export default function DietAlgorithmMapping() {
  const [form] = Form.useForm();
  const [dietNodes, setDietNodes] = useState([]);
  const [leftNodes, setLeftNodes] = useState([]);
  const [rightNodes, setRightNodes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [mappings, setMappings] = useState([]);

  // ✅ Fetch dropdown data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await fetch(
          "https://u5w4o3jcorm74cmr6dcc4k3t740mauug.lambda-url.ap-south-1.on.aws/getToDoLabels"
        );
        const data = await res.json();
        setDietNodes(data.dietNodes || []);
        setLeftNodes(data.leftNodes || []);
        setRightNodes(data.rightNodes || []);
      } catch (err) {
        console.error("Error fetching data:", err);
        message.error("Failed to load dropdown data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // ✅ Add mapping row
  const handleAdd = (values) => {
    const leftObj = leftNodes.find((l) => l.Label_Id === values.leftLabel);
    const rightObj = rightNodes.find((r) => r.Label_Id === values.rightLabel);

    const newMapping = {
      dietAlgorithm: values.dietAlgorithm,
      day: values.day,
      leftLabelId: leftObj?.Label_Id,
      leftLabelName: leftObj?.Label_Name,
      rightLabelId: rightObj?.Label_Id,
      rightLabelName: rightObj?.Label_Name,
    };

    setMappings((prev) => [...prev, newMapping]);

    // ❌ Do not reset form automatically
    message.success("Mapping added!");
  };

  // ✅ Reset form manually
  const handleReset = () => {
    form.resetFields();
  };

  // ✅ Save all mappings
  const handleSaveAll = async () => {
    if (mappings.length === 0) {
      message.warning("No mappings to save!");
      return;
    }

    try {
      const res = await fetch("/saveAllMappings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(mappings),
      });

      if (!res.ok) throw new Error("API request failed");

      message.success("All mappings saved successfully!");
      setMappings([]);
    } catch (err) {
      console.error(err);
      message.error("Failed to save mappings");
    }
  };

  // ✅ Table columns
  const columns = [
    { title: "Diet Algorithm", dataIndex: "dietAlgorithm", key: "dietAlgorithm" },
    { title: "Day", dataIndex: "day", key: "day" },
    { title: "Left Label ID", dataIndex: "leftLabelId", key: "leftLabelId" },
    { title: "Left Label Name", dataIndex: "leftLabelName", key: "leftLabelName" },
    { title: "Right Label ID", dataIndex: "rightLabelId", key: "rightLabelId" },
    { title: "Right Label Name", dataIndex: "rightLabelName", key: "rightLabelName" },
  ];

  return (
    <Card
      title="Diet Algorithm Mapping"
      style={{ maxWidth: 1200, margin: "20px auto" }}
      className="shadow-md rounded-xl"
    >
      {/* Inline Form Row */}
      <Form
        form={form}
        layout="inline"
        onFinish={handleAdd}
        style={{ marginBottom: 20, flexWrap: "nowrap" ,backgroundColor:'#ffffffff',padding:20,borderRadius:10,boxShadow:'0 2px 8px #f0f1f2'}}
      >
        {/* Diet Algorithm */}
        <Form.Item
          name="dietAlgorithm"
          rules={[{ required: true, message: "Select Diet Algorithm" }]}
        >
          <Select
            showSearch
            placeholder="Diet Algorithm"
            loading={loading}
            optionFilterProp="children"
            style={{ width: 200 }}
          >
            {dietNodes.map((item) => (
              <Option key={item} value={item}>
                {item}
              </Option>
            ))}
          </Select>
        </Form.Item>

        {/* Day */}
        <Form.Item
          name="day"
          rules={[
            { required: true, message: "Enter Day" },
            {
              type: "number",
              min: 1,
              max: 999,
              message: "Day must be between 1 and 999",
            },
          ]}
        >
          <InputNumber
            min={1}
            max={999}
            placeholder="Day"
            style={{ width: 100 }}
          />
        </Form.Item>

        {/* Left Label */}
        <Form.Item
          name="leftLabel"
          rules={[{ required: true, message: "Select Left Label" }]}
        >
          <Select
            showSearch
            placeholder="Left Label"
            loading={loading}
            optionFilterProp="children"
            style={{ width: 200 }}
          >
            {leftNodes.map((item) => (
              <Option key={item.Label_Id} value={item.Label_Id}>
                {item.Label_Id} - {item.Label_Name}
              </Option>
            ))}
          </Select>
        </Form.Item>

        {/* Right Label */}
        <Form.Item
          name="rightLabel"
          rules={[{ required: true, message: "Select Right Label" }]}
        >
          <Select
            showSearch
            placeholder="Right Label"
            loading={loading}
            optionFilterProp="children"
            style={{ width: 200 }}
          >
            {rightNodes.map((item) => (
              <Option key={item.Label_Id} value={item.Label_Id}>
                {item.Label_Id} - {item.Label_Name}
              </Option>
            ))}
          </Select>
        </Form.Item>

        {/* Buttons - stay in same row */}
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

      {/* Table */}
      <Table
        columns={columns}
        dataSource={mappings.map((m, i) => ({ key: i, ...m }))}
        pagination={false}
        bordered
      />

      {/* Save All Button */}
      <div style={{ marginTop: 20, textAlign: "right" }}>
        <Button type="primary" onClick={handleSaveAll}>
          Save All
        </Button>
      </div>
    </Card>
  );
}
