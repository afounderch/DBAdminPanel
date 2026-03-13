/* eslint-disable no-unused-vars */
import { useEffect, useState } from "react";
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
  Tooltip
} from "antd";
import { InfoCircleOutlined } from "@ant-design/icons";

const { Title } = Typography;
const { Option } = Select;

import {
  getData,
  insertData,
  updateData,
  removeData,
} from "./modsubcatStepApi";

import Loader from "../../../components/Loader";
import OperationStatus from "../../../components/OperationStatus";

const ModSubCatHasStepsEdgeComponent = () => {
  const [allData, setAllData] = useState([]);
  const [edgeData, setEdgeData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [operationMessage, setOperationMessage] = useState("");
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 30,
    total: 0,
  });
  const [isModalActive, setIsModalActive] = useState("");
  const [editingRecord, setEditingRecord] = useState(null);

  const [searchByID, setSearchByID] = useState("");
  const [sortByKey, setSortByKey] = useState("");
  const [filterByFromId, setfilterByFromId] = useState("");

  const [editForm] = Form.useForm();
  const [addForm] = Form.useForm();

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const data = await getData();
      if (data?.length > 0) {
        const mapped = data.map((element) => ({
          _key: element._key,
          _from: element._from,
          _to: element._to,
          StepInModSubCatInOrder: element.StepInModSubCatInOrder,
          DayOffSet: element.DayOffSet,
        })).sort((a,b)=>a._from.localeCompare(b._from));
        setEdgeData(mapped);
        setAllData(mapped);
        setPagination((prev) => ({
          ...prev,
          total: mapped.length,
          showTotal: (total, range) =>
            `${range[0]}-${range[1]} of ${total} items`,
        }));
      } else {
        setEdgeData([]);
        setAllData([]);
      }
      setIsLoading(false);
    } catch (error) {
      console.log("Error getting the data", error);
      setIsLoading(false);
    }
  };

  const handleKeySort = () => {
    setSortByKey((prev) => (prev === "" ? "asc": prev === "asc" ? "desc" : prev === "desc" ? "" : ""));
  };

  const handleTableChange = (newPagination) => {
    setPagination(newPagination);
  };

  const handleDelete = async (id) => {
    let res = await removeData(id);
    if (res) {
      const updated = allData.filter((ele) => ele._key !== id);
      setAllData(updated);
      setOperationMessage("deleted");
      message.success("Step deleted");
    } else {
      setOperationMessage("error");
      message.error("Failed to delete. Try again.");
    }
  };


  const handleAdd = () => {
    addForm.resetFields();
    setIsModalActive("add");
  }

  const handleAddOperation = async (values) => {

    try{

          setIsLoading(true)
          const { _from, steps } = values
          const payload = steps.map(step => ({
            _from,
            _to: step._to,
            StepInModSubCatInOrder: Number(step.StepInModSubCatInOrder),
            DayOffSet: Number(step.DayOffSet)
          }))

          try{
          const res=await insertData(payload)
          if(res){
          await fetchData()
          message.success("Steps added successfully")
          setOperationMessage("inserted")
          setIsModalActive("")
          addForm.resetFields()
          addForm.setFieldsValue({ steps: [] })
          }
        }catch(error){
          console.error(error)
          setOperationMessage("error")
          message.error("Failed to add steps")
        }
    }catch(error){
    console.log(error)
    }
    finally{
    setIsLoading(false)
    }

  }

  const handleAddStep = (add) => {
    const steps = addForm.getFieldValue("steps") || [];
    const nextOrder = steps.length + 1;
    const offset = steps.length === 0 ? 1 : 0
    
    add({
      StepInModSubCatInOrder: nextOrder,
      DayOffSet: offset
    });
  };
  
  const handleRemoveStep = (remove, name) => {
  remove(name)

  setTimeout(() => {
    const steps = addForm.getFieldValue("steps") || []

    const reordered = steps.map((step, index) => ({
      ...step,
      StepInModSubCatInOrder: index + 1
    }))

    addForm.setFieldsValue({ steps: reordered })
  }, 0)
}




  const handleEdit = (record) => {
    setEditingRecord(record);
    editForm.setFieldsValue(record);
    setIsModalActive("edit");
  };

  const handleEditOperation = async () => {
    const values = await editForm.validateFields();

    const dataToUpdate = {
      _key: editingRecord._key,
      _from: values._from,
      _to: values._to,
      StepInModSubCatInOrder: Number(values.StepInModSubCatInOrder),
      DayOffSet: Number(values.DayOffSet),
    };

    const hasChanges = Object.keys(dataToUpdate).some(
        (key) => dataToUpdate[key] !== editingRecord[key]
      );

      if (!hasChanges) {
        message.info("No changes detected");
        setIsModalActive("");
        return;
      }

    setIsLoading(true);
    try {
      const response = await updateData(editingRecord._key, dataToUpdate);

      if (response) {
        const updated = allData.map((item) =>
          item._key === editingRecord._key ? { ...item, ...dataToUpdate } : item
        );

        setAllData(updated);
        setIsModalActive("");
        setOperationMessage("updated")
        message.success("Updated successfully");
        
      }
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  }

  const tableCol = [
    // {
    //   title: (
    //     <span
    //       style={{ cursor: "pointer", userSelect: "none" }}
    //       onClick={handleKeySort}
    //     >
    //       Edge Id (Auto Generated) {sortByKey === "" ? "" : sortByKey === "asc" ? "↑" : "↓"}
    //     </span>
    //   ),
    //   dataIndex: "_key",
    // },
    { title: "Mod-SubCat Id (From)", dataIndex: "_from" },
    { title: "Step Id (To)", dataIndex: "_to" },
    { title: "Step Order", dataIndex: "StepInModSubCatInOrder" },
    { title: "Day Offset", dataIndex: "DayOffSet" },
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
      ),
    },
  ];

  useEffect(() => {
    fetchData();
  }, []);

  const handleSearchAndFilterSort = () => {
    try {
      let result = [...allData];

      if (searchByID) {
        const lower = searchByID.toLowerCase();

        result = result.filter(
          (item) =>
            item?._from?.toLowerCase()?.includes(lower) ||
            item?._to?.toLowerCase()?.includes(lower),
        );
      }
      if (filterByFromId) {
        result = result.filter((ele) => ele._from == filterByFromId);
      }

      result.sort((a, b) => {
        const fromCompare = a._from.localeCompare(b._from);

        if (fromCompare !== 0) {
          return fromCompare; // sort by _from first
        }

        return a.StepInModSubCatInOrder - b.StepInModSubCatInOrder; // then by order
      });
      setPagination((prev) => ({
        ...prev,
        total: result.length,
        showTotal: (total, range) =>
          `${range[0]}-${range[1]} of ${total} items`,
      }));

      setEdgeData(result);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    handleSearchAndFilterSort();
  }, [searchByID, sortByKey, filterByFromId, allData]);

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
      <Loader loading={isLoading} />
      <Title level={1} style={{ marginBottom: 48, textAlign: "center" }}>
        Edge: ModSubCat ➡️ Steps
      </Title>

      <div
        style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}
      >
        <Input
          placeholder="Search by Mod-SubCat or Step"
          value={searchByID}
          onChange={(e) => setSearchByID(e.target.value)}
          style={{ width: 260, padding: 4, marginTop: 0 }}
        />
        <Select
          showSearch
          allowClear
          placeholder="Filter by Mod-SubCategory"
          value={filterByFromId || undefined}
          onChange={(val) => setfilterByFromId(val || "")}
          style={{ width: 340 }}
        >
          {[
            ...new Set(
              [...allData]
                .sort((a, b) => a._from.localeCompare(b._from))
                .map((i) => i._from),
            ),
          ].map((alg) => (
            <Option key={alg} value={alg}>
              {alg.replace("ModSubCat/", "")}
            </Option>
          ))}
        </Select>
        <Button
          type="primary"
          onClick={() => {
            setSearchByID("");
            setSortByKey("asc");
            setOperationMessage(null);
            setfilterByFromId("");
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
      </div>
      <OperationStatus status={operationMessage} />
      <Table
        columns={tableCol}
        dataSource={edgeData}
        rowKey="_key"
        bordered
        pagination={pagination}
        onChange={handleTableChange}
      />

    <Modal
      title="Add Mappings"
      open={isModalActive === "add"}
      onOk={()=> addForm.submit() }
      okText="Insert"
      onCancel={() => setIsModalActive("")}
      centered
      width={1000}
        okButtonProps={{ style: { backgroundColor: "#0e8fffff", width: 200, fontWeight: "bold" } }}
        cancelButtonProps={{ style: { width: 200, backgroundColor: "#d6d6d6ff", fontWeight: "bolder" } }}
      >

      <Loader loading={isLoading} />

      <Form
      form={addForm}
      layout="vertical"
      onFinish={handleAddOperation}
       style={{
            marginBottom: 20,
            padding: "20px 40px",
            gap:20
          }}
      
      >

      <Form.Item
        label="Mod-SubCat (From)"
        name="_from"
        rules={[{ required: true, message:"Mod-SubCat required" }]}
      >
        <Select showSearch placeholder="Select Mod-SubCat">
            {[...new Set(allData.map((i) => i._from))].map((i) => (
            <Option key={i} value={i}>
              {i.replace("ModSubCat/", "")}
            </Option>
            ))}
        </Select>
      </Form.Item>
     
      <Form.List
          name="steps"
          rules={[
            {
              validator: async (_, steps) => {
                if (!steps || steps.length < 1) {
                  return Promise.reject(new Error("Add at least one step"));
                }
              },
            },
          ]}
      >
           {(fields, { add, remove }, { errors }) => (
            <>
            {fields.map(({ key, name, ...restField }) => (
              <Row gutter={16} key={key} style={{ marginBottom: 10 }}>
                <Col span={8}>
                    <Form.Item
                     label="Step (To)"
                      {...restField}
                      name={[name, "_to"]}
                      rules={[{ required: true, message: "Step required" }]}
                      >
                      <Select showSearch placeholder="Step">
                        {[...new Set(allData.map((i) => i._to))].map((i) => (
                        <Option key={i} value={i}>
                          {i.replace("Steps/", "")}
                        </Option>
                        ))}
                      </Select>
                    </Form.Item>
                </Col>

                <Col span={6}>
                    <Form.Item
                    label="Order of Step"
                    {...restField}
                    name={[name, "StepInModSubCatInOrder"]}
                    rules={[{ required: true ,message:"Order required"}]}
                    >
                   <InputNumber min={1} placeholder="Step Order" style={{ width:"100%"}}/>
                    </Form.Item>
                </Col>

                <Col span={4}>
                 <Form.Item
                    label={
                      <span>
                        Day Offset{" "}
                       <Tooltip
                          title={
                            <>
                              First step should usually be 1. <br />
                              A new day starts whenever the value is 1. <br />
                              1 = Start of a new day <br />
                              0 = Continue within the same day.
                            </>
                          }
                        >
                        <InfoCircleOutlined />
                      </Tooltip>
                      </span>
                    }
                    {...restField}
                    name={[name, "DayOffSet"]}
                    rules={[{ required: true, message:"Offset required" }]}
                     >
                    <Select placeholder="Offset">
                        <Option value={1}>1 - New Day</Option>
                        <Option value={0}>0 - Same Day</Option>
                    </Select>
                  </Form.Item>
                </Col>

               <Col span={4}>
                  <Form.Item label=" ">
                  <Button danger onClick={() => handleRemoveStep(remove, name)}>Remove</Button>
                  </Form.Item>
                </Col>
              </Row>
          ))}

           <Form.ErrorList errors={errors} />

            <Button type="dashed" onClick={() => handleAddStep(add)} block>
              + Add Step
            </Button>
          </>
          )}
    </Form.List>
      <Row justify="end" style={{ marginTop: 20 }}>
      <Space>
      <Button
      onClick={()=>{
      addForm.resetFields()
      }}
      >Reset</Button>
      </Space>
      </Row>
      </Form>
      </Modal>

      <Modal
        title="Edit Mapping"
        open={isModalActive === "edit"}
        onOk={() => editForm.submit()}
        onCancel={() => setIsModalActive("")}
        centered
        okText="Update"
        cancelText="Cancel"
        width={700}
        okButtonProps={{
          style: { backgroundColor: "#1677ff", fontWeight: "bold", width: 120 }
        }}
        cancelButtonProps={{
          style: { width: 120 }
        }}
      >
  <Loader loading={isLoading} />

  <Form
    form={editForm}
    layout="vertical"
    onFinish={handleEditOperation}
    style={{padding:16}}
  >
    <Row gutter={16}>

      <Col span={24}>
        <Form.Item
          label="Mod-SubCat (From)"
          name="_from"
          rules={[{ required: true, message: "ModSubCat required" }]}
        >
          <Select showSearch optionFilterProp="children" placeholder="Select ModSubCat">
            {[...new Set(
              [...allData]
                .sort((a, b) => a._from.localeCompare(b._from))
                .map(i => i._from)
            )].map(i => (
              <Option key={i} value={i}>
                {i.replace("ModSubCat/", "")}
              </Option>
            ))}
          </Select>
        </Form.Item>
      </Col>

      <Col span={24}>
        <Form.Item
          label="Step (To)"
          name="_to"
          rules={[{ required: true, message: "Step required" }]}
        >
          <Select showSearch optionFilterProp="children" placeholder="Select Step">
            {[...new Set(
              [...allData]
                .sort((a, b) => a._to.localeCompare(b._to))
                .map(i => i._to)
            )].map(i => (
              <Option key={i} value={i}>
                {i.replace("Steps/", "")}
              </Option>
            ))}
          </Select>
        </Form.Item>
      </Col>

      <Col span={12}>
        <Form.Item
          label="Step Order"
          name="StepInModSubCatInOrder"
          rules={[{ required: true, message: "Step order required" }]}
        >
          <InputNumber min={1} style={{ width: "100%" }} />
        </Form.Item>
      </Col>

      <Col span={12}>
        <Form.Item
          label={ <span>
                        Day Offset{" "}
                       <Tooltip
                          title={
                            <>
                              First step should usually be 1. <br />
                              A new day starts whenever the value is 1. <br />
                              1 = Start of a new day <br />
                              0 = Continue within the same day.
                            </>
                          }
                        >
                        <InfoCircleOutlined />
                      </Tooltip>
                      </span>}
          name="DayOffSet"
          rules={[{ required: true, message: "Offset required" }]}
        >
          <Select placeholder="Select Offset">
            <Option value={1}>1 - New Day</Option>
            <Option value={0}>0 - Same Day</Option>
          </Select>
        </Form.Item>
      </Col>

    </Row>
  </Form>
</Modal>
    </div>
  );
};
export default ModSubCatHasStepsEdgeComponent;
