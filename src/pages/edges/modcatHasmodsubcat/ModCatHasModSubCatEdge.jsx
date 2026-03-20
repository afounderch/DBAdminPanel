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
  Typography,
  Row,
  Col,
} from "antd";

const { Title } = Typography;
const { Option } = Select;

import {
   getEdgeData,
  getCollectionData,
  insertData,
  updateData,
  removeData,
} from "./modcatHasModsubcatApi";
import Loader from "../../../components/Loader";
import OperationStatus from "../../../components/OperationStatus";

const ModCatHasModSubCatEdgeComponent = () => {
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
  const [sortByKey, setSortByKey] = useState("asc");
  const [filterByFromId, setfilterByFromId] = useState("");
  const [groupByModSubCat,setGroupByModSubCat] = useState("")

  const [editForm] = Form.useForm();
  const [addForm] = Form.useForm();

 const [fromNodes,setFromNodes]= useState([])
  const [toNodes,setToNodes]= useState([])

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [data, result] = await Promise.all([
                getEdgeData(),
                getCollectionData()
      ])
      setFromNodes(result?.fromNodes || [])
      setToNodes(result?.toNodes || [])

      if (data?.length > 0) {
        const mapped = data.map((element) => ({
          _key: element._key,
          _from: element._from,
          _to: element._to,
         // ModCatOrder: element.ModCatOrder,
          ModSubCatOrder: element.ModSubCatOrder,
        }));
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
    setSortByKey((prev) => (prev === "asc" ? "desc" : "asc"));
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
      message.success("deleted");
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
          const { _from, modcat } = values
          const payload = modcat.map(modcat => ({
            _from,
            _to: modcat._to,
            //ModCatOrder: Number(modcat.ModCatOrder),
            ModSubCatOrder: Number(modcat.ModSubCatOrder)
          }))

          try{
          const res=await insertData(payload)
          if(res){
          await fetchData()
          message.success("added successfully")
          setOperationMessage("inserted")
          setIsModalActive("")
          addForm.resetFields()
          addForm.setFieldsValue({ modcat: [] })
          }
        }catch(error){
          console.error(error)
          setOperationMessage("error")
          message.error("Failed to add modcat")
        }
    }catch(error){
    console.log(error)
    }
    finally{
    setIsLoading(false)
    }

  }

  const handleAddModsubcat = (add) => {
    const modcat = addForm.getFieldValue("modcat") || [];
   
    add({
      ModSubCatOrder: modcat[modcat.length-1]?.ModSubCatOrder + 1 || 1
    });
  };
  
const handleRemoveModsubcat = (remove, name) => {
  remove(name);
  const modcat = addForm.getFieldValue("modcat") || [];
  const reordered = reorderModSubCat(modcat);
  addForm.setFieldsValue({ modcat: reordered });
};

  const reorderModSubCat = (data) => {
    const grouped = {};

    data.forEach((item) => {
      const cat = item.ModSubCatOrder;

      if (!grouped[cat]) {
        grouped[cat] = [];
      }

      grouped[cat].push(item);
    });

    const result = [];

    Object.keys(grouped).forEach((cat) => {
      grouped[cat]
        .sort((a, b) => a.ModSubCatOrder - b.ModSubCatOrder)
        .forEach((item, index) => {
          result.push({
            ...item,
            ModSubCatOrder: index + 1,
          });
        });
    });

    return result;
  };


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
      ModSubCatOrder: Number(values.ModSubCatOrder),
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
    //       Edge Id (Auto Generated) {sortByKey === "asc" ? "↑" : "↓"}
    //     </span>
    //   ),
    //   dataIndex: "_key",
    // },
    { title: "Mod-Cat  (From)", dataIndex: "_from",width:"20%" , ellipsis: true },
    { title: "Mod-SubCat (To)", dataIndex: "_to", width:"40%" , ellipsis: true},
    { title: "Mod-SubCat Order", dataIndex: "ModSubCatOrder",width:"15%" , ellipsis: true },
    {
      title: "Actions",
      width:"15%" , ellipsis: true ,
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
      //  if (groupByModSubCat) {
      //   result = result.filter((ele) => ele.ModCatOrder == groupByModSubCat);
      // }

      result.sort((a, b) => {
        const modCatOrderCompare = a._from - b._from;

        if (modCatOrderCompare !== 0) {
          return modCatOrderCompare; 
        }

        return a.ModSubCatOrder - b.ModSubCatOrder
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
        Edge: ModCat ➡️ ModSubCat
      </Title>

      <div
        style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}
      >
        <Input
          placeholder="Search by Mod-Cat or Mod-SubCat"
          value={searchByID}
          onChange={(e) => setSearchByID(e.target.value)}
          style={{ width: 260, padding: 4, marginTop: 0 }}
        />
        <Select
          showSearch
          allowClear
          placeholder="Group by Mod-Cat"
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
              {alg.replace("ModCat/", "")}
            </Option>
          ))}
        </Select>
        {/* <Select
          showSearch
          allowClear
          placeholder="Group by Mod-Cat Order"
          value={groupByModSubCat || undefined}
          onChange={(val) => setGroupByModSubCat(val || "")}
          style={{ width: 200 }}
        >
          {[
            ...new Set(
              [...allData]
                .sort((a, b) => a._from.localeCompare(b._from))
                .map((i) => i.ModCatOrder),
            ),
          ].map((alg) => (
            <Option key={alg} value={alg}>
              {alg}
            </Option>
          ))}
          </Select> */}
        <Button
          type="primary"
          onClick={() => {
            setSearchByID("");
            setSortByKey("asc");
            setOperationMessage(null);
            setfilterByFromId("");
            setGroupByModSubCat("");
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
        pagination={{
          ...pagination,
          showSizeChanger: true
        }}
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
        label="ModCat (From)"
        name="_from"
        rules={[{ required: true, message:"ModCat required" }]}
      >
        <Select showSearch placeholder="Select ModCat">
            {[...new Set(
              [...fromNodes]
                .sort((a, b) => a._key.localeCompare(b._key))
                .map(i => i._id)
            )].map((i) => (
            <Option key={i} value={i}>
              {i.replace("ModCat/", "")}
            </Option>
            ))}
        </Select>
      </Form.Item>
     
      <Form.List
          name="modcat"
          rules={[
            {
              validator: async (_, modcat) => {
                if (!modcat || modcat.length < 1) {
                  return Promise.reject(new Error("Add at least one modcat"));
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
                     label="Mod-SubCat (To)"
                      {...restField}
                      name={[name, "_to"]}
                      rules={[{ required: true, message: "ModSubCat required" }]}
                      >
                      <Select showSearch placeholder="ModSubCat">
                        {[...new Set(
                            [...toNodes]
                              .sort((a, b) => a._key.localeCompare(b._key))
                              .map(i => i._id)
                          )].map((i) => (
                        <Option key={i} value={i}>
                          {i.replace("ModSubCat/", "")}
                        </Option>
                        ))}
                      </Select>
                    </Form.Item>
                </Col>

                <Col span={6}>
                    <Form.Item
                    label="Mod-SubCat Order"
                    {...restField}
                    name={[name, "ModSubCatOrder"]}
                    rules={[{ required: true ,message:"Order required"}]}
                    >
                   <InputNumber min={1} placeholder="Mod-SubCat Order" style={{ width:"100%"}}/>
                    </Form.Item>
                </Col>


               <Col span={4}>
                  <Form.Item label=" ">
                  <Button danger onClick={() => handleRemoveModsubcat(remove, name)}>Remove</Button>
                  </Form.Item>
                </Col>
              </Row>
          ))}

           <Form.ErrorList errors={errors} />

            <Button type="dashed" onClick={() => handleAddModsubcat(add)} block>
              + Add Mod-SubCat
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
          label="ModCat (From)"
          name="_from"
          rules={[{ required: true, message: "DiseaseKit required" }]}
        >
          <Select showSearch optionFilterProp="children" placeholder="Select ModCat">
            {[...new Set(
              [...fromNodes]
                .sort((a, b) => a._key.localeCompare(b._key))
                .map(i => i._id)
            )].map(i => (
              <Option key={i} value={i}>
                {i.replace("ModCat/", "")}
              </Option>
            ))}
          </Select>
        </Form.Item>
      </Col>

      <Col span={24}>
        <Form.Item
          label="Mod-SubCat (To)"
          name="_to"
          rules={[{ required: true, message: "ModSubCat required" }]}
        >
          <Select showSearch optionFilterProp="children" placeholder="Select ModSubCat">
            {[...new Set(
              [...toNodes]
                .sort((a, b) => a._key.localeCompare(b._key))
                .map(i => i._id)
            )].map(i => (
              <Option key={i} value={i}>
                {i.replace("ModSubCat/", "")}
              </Option>
            ))}
          </Select>
        </Form.Item>
      </Col>


      <Col span={12}>
        <Form.Item
          label="Mod-SubCat Order"
          name="ModSubCatOrder"
          rules={[{ required: true, message: "Order required" }]}
        >
          <InputNumber min={1} style={{ width: "100%" }} />
        </Form.Item>
      </Col>

    </Row>
  </Form>
</Modal>
    </div>
  );
};
export default ModCatHasModSubCatEdgeComponent;
