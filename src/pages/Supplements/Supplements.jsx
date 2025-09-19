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

const { Title } = Typography;

const radioOptions = {
    dosage_and_instructions: [
        { label: "Title & Subtitle", value: "title_with_subtitles" },
        { label: "Points", value: "points" },
        { label: "Both", value: "both" },
    ],
    title_with_points: [
        { label: "Title with Points", value: "title_with_points" },
        { label: "Points", value: "points" },
        { label: "Both", value: "both" },
    ],
};

function PointsInput({ points, setPoints,placeholder = "Enter points, Click on plus icon to add more points" }) {
    const handleChange = (i, val) => {
        const arr = [...points];
        arr[i] = val;
        setPoints(arr);
    };
    const addPoint = () => setPoints([...(points || []), ""]);
    const removePoint = (i) => {
        if ((points || []).length > 1) {
            setPoints((points || []).filter((_, idx) => idx !== i));
        }
    };
    return (
        <>
            <div>
                {(points || []).map((pt, i) => (

                    <div
                        key={i}
                        style={{
                            display: "flex",
                            alignItems: "center",

                            marginBottom: 4,
                            gap: "8px",
                        }}
                    >

                        <input
                            type="text"
                            value={pt}
                            placeholder={placeholder}
                            onChange={(e) => handleChange(i, e.target.value)}
                            style={{ flex: 1 }}
                        />
                        <button type="button" style={{ backgroundColor: '#ffffffff', padding: 0, color: 'black', fontSize: 30, fontWeight: "bolder", marginRight: 8 }} onClick={addPoint}>
                            +
                        </button>
                        <button type="button" style={{ backgroundColor: '#ffffffff', padding: 0, color: 'black', fontSize: 16, fontWeight: "bolder" }} onClick={() => removePoint(i)}>
                            ❌
                        </button>
                    </div>
                ))}
            </div>
        </>
    );
}

// For title_with_points sections
function TitleWithPointsInput({ value = [], setValue }) {
    // Always show at least one Title with Points
    if (!value || value.length === 0) {
        value = [{ title: "", title_points: [""] }];
    }

    const addTitle = () =>
        setValue([...(value || []), { title: "", title_points: [""] }]);

    const removeTitle = (idx) =>
        setValue((value || []).filter((_, i) => i !== idx));

    const handleTitleChange = (idx, val) => {
        const arr = [...(value || [])];
        arr[idx] = { ...(arr[idx] || {}), title: val };
        setValue(arr);
    };

    const handlePointsChange = (idx, pts) => {
        const arr = [...(value || [])];
        arr[idx] = { ...(arr[idx] || {}), title_points: pts };
        setValue(arr);
    };

    return (
        <div>
            {(value || []).map((item, idx) => (
                <div
                    key={idx}
                    style={{
                        border: "2px solid #000000ff",
                        borderRadius: 16,
                        padding: 16,
                        marginBottom: 8,
                    }}
                >
                    {/* Title row */}
                    <b>Enter Title</b>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <input
                            type="text"
                            placeholder="Title"
                            value={item.title}
                            onChange={(e) => handleTitleChange(idx, e.target.value)}
                            style={{ flex: 1 }}
                        />
                        <button
                            type="button"
                            onClick={() => removeTitle(idx)}
                            style={{
                                backgroundColor: "#fff",
                                padding: 0,
                                color: "black",
                                fontSize: 16,
                                fontWeight: "bolder",
                            }}
                        >
                            ❌
                        </button>
                    </div>

                    {/* Points under title */}
                    <div style={{ marginTop: 8 }}>
                        <b>Points under Title</b>
                        <PointsInput
                            points={item.title_points || [""]}
                            setPoints={(pts) => handlePointsChange(idx, pts)}
                            placeholder="Enter points, Click on plus icon to add more points"
                        />
                    </div>
                </div>
            ))}

            {/* Add new title with points */}
            <button
                type="button"
                onClick={addTitle}
                style={{
                    marginLeft: 12,
                    marginTop: 4,
                    backgroundColor: "#fff",
                    color: "black",
                    fontSize: 16,
                    padding: "8px 12px",
                    fontWeight: "bolder",
                    borderRadius: 4,
                    border: "1px solid black",
                }}
            >
                ➕ Add New Title with Points
            </button>
        </div>
    );
}

// For dosage_and_instructions: title_with_subtitles
function TitleAndSubtitleInput({ value = [], setValue }) {
    // Always show at least one Title with one Subtitle at the start
    if (!value || value.length === 0) {
        value = [
            {
                title_name: "",
                sub_title: [{ sub_title: "", sub_title_with_points: [""] }],
            },
        ];
    }

    const addTitle = () =>
        setValue([
            ...(value || []),
            {
                title_name: "",
                sub_title: [{ sub_title: "", sub_title_with_points: [""] }],
            },
        ]);

    const removeTitle = (idx) =>
        setValue((value || []).filter((_, i) => i !== idx));

    const handleTitleNameChange = (idx, val) => {
        const arr = [...(value || [])];
        arr[idx] = { ...(arr[idx] || {}), title_name: val };
        setValue(arr);
    };

    const handleTitlePointsChange = (idx, pts) => {
        const arr = [...(value || [])];
        arr[idx] = { ...(arr[idx] || {}), points: pts };
        setValue(arr);
    };

    // Subtitle handlers
    const addSubtitle = (titleIdx) => {
        const arr = [...(value || [])];
        arr[titleIdx] = {
            ...(arr[titleIdx] || {}),
            sub_title: [
                ...((arr[titleIdx] && arr[titleIdx].sub_title) || []),
                { sub_title: "", sub_title_with_points: [""] },
            ],
        };
        setValue(arr);
    };

    const removeSubtitle = (titleIdx, subIdx) => {
        const arr = [...(value || [])];
        arr[titleIdx] = {
            ...(arr[titleIdx] || {}),
            sub_title: (arr[titleIdx].sub_title || []).filter((_, i) => i !== subIdx),
        };
        setValue(arr);
    };

    const handleSubtitleChange = (titleIdx, subIdx, val) => {
        const arr = [...(value || [])];
        const subtitleList = (arr[titleIdx].sub_title || []).map((s, i) =>
            i === subIdx ? { ...s, sub_title: val } : s
        );
        arr[titleIdx] = { ...(arr[titleIdx] || {}), sub_title: subtitleList };
        setValue(arr);
    };

    const handleSubtitlePointsChange = (titleIdx, subIdx, pts) => {
        const arr = [...(value || [])];
        const subtitleList = (arr[titleIdx].sub_title || []).map((s, i) =>
            i === subIdx ? { ...s, sub_title_with_points: pts } : s
        );
        arr[titleIdx] = { ...(arr[titleIdx] || {}), sub_title: subtitleList };
        setValue(arr);
    };

    return (
        <div>
            {(value || []).map((item, idx) => (
                <div
                    key={idx}
                    style={{ border: "2px solid #000000ff", borderRadius: 16, padding: 16, marginBottom: 24, marginTop: 16 }}
                >
                    {/* Title */}
                    <b>Enter Title Name</b>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <input
                            type="text"
                            placeholder="Title Name"
                            value={item.title_name}
                            onChange={(e) => handleTitleNameChange(idx, e.target.value)}
                            style={{ flex: 1 }}
                        />
                        <button
                            type="button"
                            onClick={() => removeTitle(idx)}
                            style={{
                                backgroundColor: "#fff",
                                padding: 0,
                                color: "black",
                                fontSize: 16,
                                fontWeight: "bolder",
                            }}
                        >
                            ❌
                        </button>
                    </div>

                    {/* Subtitles */}
                    <div style={{ marginTop: 8 }}>

                        {(item.sub_title || []).map((sub, subIdx) => (
                            <div key={subIdx} style={{ marginBottom: 8, marginLeft: 12 ,border: "1px solid #00000022", padding: 8, borderRadius: 8 }}>
                                <b>Enter Subtitle Name and its Points</b>
                                <div
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "8px",
                                        marginBottom: 4,
                                    }}
                                >
                                    <input
                                        type="text"
                                        placeholder="Subtitle"
                                        value={sub.sub_title}
                                        onChange={(e) =>
                                            handleSubtitleChange(idx, subIdx, e.target.value)
                                        }
                                        style={{ flex: 1 }}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => removeSubtitle(idx, subIdx)}
                                        style={{
                                            backgroundColor: "#fff",
                                            padding: 0,
                                            color: "black",
                                            fontSize: 16,
                                            fontWeight: "bolder",
                                        }}
                                    >
                                        ❌
                                    </button>
                                </div>
                                <div style={{ marginLeft: 16 }}>
                                        <PointsInput
                                    points={sub.sub_title_with_points || [""]}
                                    setPoints={(pts) =>
                                        handleSubtitlePointsChange(idx, subIdx, pts)
                                    }
                                    placeholder="Enter points, Click on plus icon to add more points under subtitle"
                                />
                                </div>
                            
                            </div>
                        ))}
                        <button type="button" onClick={() => addSubtitle(idx)} style={{ marginLeft: 12, marginTop: 4, backgroundColor: '#efefef', padding: 0, color: 'black', fontSize: 16, paddingLeft: 8, paddingRight: 8, paddingTop: 8, paddingBottom: 8, fontWeight: "bolder", borderRadius: 4, border: "1px solid black" }}>
                            ➕ Add Subtitle
                        </button>
                    </div>
                </div>
            ))}

            {/* Always available add button */}
            <button type="button" onClick={addTitle} style={{ marginLeft: 8, marginTop: 4, backgroundColor: '#efefef', padding: 0, color: 'black', fontSize: 16, paddingLeft: 8, paddingRight: 8, paddingTop: 8, paddingBottom: 8, fontWeight: "bolder", borderRadius: 4, border: "1px solid black" }}>
                ➕ Add New Title with Subtitle
            </button>
        </div>
    );
}
// For Associated Blood Tests, Storage Guidelines, Note
function SimpleArrayInput({ value = [""], setValue, placeholder = "Enter value" }) {
    return <PointsInput points={value} setPoints={setValue} placeholder={placeholder} />;
}

function SectionWithRadio({ label, radioName, radioOptions, radioValue, setRadioValue, children }) {
    return (
        <div style={{ marginBottom: 24 }}>
            <label style={{ fontWeight: "bold" }}>{label}</label>
            <div style={{ margin: "8px 0" }}>
                {radioOptions.map((opt) => (
                    <label key={opt.value} style={{ marginRight: 16 }}>
                        <input
                            type="radio"
                            name={radioName}
                            value={opt.value}
                            checked={radioValue === opt.value}
                            onChange={(e) => setRadioValue(e.target.value)}
                        />{" "}
                        {opt.label}
                    </label>
                ))}
            </div>
            {children}
        </div>
    );
}

const Supplements = () => {
     // Basic fields
        const [medicineName, setMedicineName] = useState("");
        const [medicineId, setMedicineId] = useState("");
        const [dosage, setDosage] = useState("");
        const [associatedBloodTests, setAssociatedBloodTests] = useState();
        // const [associatedBloodTests, setAssociatedBloodTests] = useState([""]);
    
        // Dosage and Instructions
        const [dosageType, setDosageType] = useState("title_with_subtitles");
        const [dosageTitleAndSubtitle, setDosageTitleAndSubtitle] = useState([]);
        const [dosagePoints, setDosagePoints] = useState([""]);
    
        // Key Warnings
        const [warningsType, setWarningsType] = useState("title_with_points");
        const [warningsTitleWithPoints, setWarningsTitleWithPoints] = useState([]);
        const [warningsPoints, setWarningsPoints] = useState([""]);
    
        // Possible Side Effects
        const [sideEffectsType, setSideEffectsType] = useState("title_with_points");
        const [sideEffectsTitleWithPoints, setSideEffectsTitleWithPoints] = useState([]);
        const [sideEffectsPoints, setSideEffectsPoints] = useState([""]);
    
        // Special Precautions
        const [precautionsType, setPrecautionsType] = useState("title_with_points");
        const [precautionsTitleWithPoints, setPrecautionsTitleWithPoints] = useState([]);
        const [precautionsPoints, setPrecautionsPoints] = useState([""]);
    
        // Storage Guidelines & Note
        const [storageGuidelines, setStorageGuidelines] = useState([""]);
        const [note, setNote] = useState([""]);
    // Table and Modal states
    const [allData, setAllData] = useState([]); // keep everything here
    const [data, setData] = useState([]); // filtered + paginated data

    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingRecord, setEditingRecord] = useState(null);
   

    const [searchText, setSearchText] = useState("");
    const [sortOrder, setSortOrder] = useState("ascend");

    const [modalLoading, setModalLoading] = useState(false);
    const [modalError, setModalError] = useState("");

    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 15,
        total: 0,
    });

    const [operationStatus, setOperationStatus] = useState(null);


// Generic builder for sections like key_warnings, side_effects, precautions
const buildSection = (type, points, titles) => ([
  {
    points:
      type === "points" || type === "both"
        ? (points || []).filter((pt) => pt && pt.trim())
        : [],
    title_with_points:
      type === "title_with_points" || type === "both"
        ? JSON.parse(JSON.stringify(titles || []))
        : [],
  },
]);

// Special builder for dosage_and_instructions
const buildDosageSection = (type, points, subtitles) => ([
  {
    points:
      type === "points" || type === "both"
        ? (points || []).filter((pt) => pt && pt.trim())
        : [],
    title_with_subtitles:
      type === "title_with_subtitles" || type === "both"
        ? JSON.parse(JSON.stringify(subtitles || []))
        : [],
  },
]);


const showModal = (record = null) => {
  setEditingRecord(record);
  setIsModalVisible(true);
  setModalError("");

  if (record) {
    console.log("Editing record:", record);
    // Basic fields
    setMedicineId(record.medicine_id || record.key || "");
    setMedicineName(record.medicine_name || "");
    setDosage(record.dosage || "");
    setAssociatedBloodTests(record.associated_blood_tests || "");

    // --- Dosage & Instructions ---
    if (Array.isArray(record.dosage_and_instructions) && record.dosage_and_instructions.length > 0) {
      const data = record.dosage_and_instructions[0];
      const hasTitleAndSubtitle = (data.title_with_subtitles || []).length > 0;
      const hasPoints = (data.points || []).length > 0;

      if (hasTitleAndSubtitle && hasPoints) setDosageType("both");
      else if (hasTitleAndSubtitle) setDosageType("title_with_subtitles");
      else if (hasPoints) setDosageType("points");
      else setDosageType("title_with_subtitles");

      setDosageTitleAndSubtitle(data.title_with_subtitles || []);
      setDosagePoints(data.points || [""]);
    } else {
      setDosageType("title_with_subtitles");
      setDosageTitleAndSubtitle([]);
      setDosagePoints([""]);
    }

    // --- Key Warnings ---
    if (Array.isArray(record.key_warnings) && record.key_warnings.length > 0) {
      const data = record.key_warnings[0];
      const hasTitleWithPoints = (data.title_with_points || []).length > 0;
      const hasPoints = (data.points || []).length > 0;

      if (hasTitleWithPoints && hasPoints) setWarningsType("both");
      else if (hasTitleWithPoints) setWarningsType("title_with_points");
      else if (hasPoints) setWarningsType("points");
      else setWarningsType("title_with_points");

      setWarningsTitleWithPoints(data.title_with_points || []);
      setWarningsPoints(data.points || [""]);
    } else {
      setWarningsType("title_with_points");
      setWarningsTitleWithPoints([]);
      setWarningsPoints([""]);
    }

    // --- Side Effects ---
    if (Array.isArray(record.possible_side_effects) && record.possible_side_effects.length > 0) {
      const data = record.possible_side_effects[0];
      const hasTitleWithPoints = (data.title_with_points || []).length > 0;
      const hasPoints = (data.points || []).length > 0;

      if (hasTitleWithPoints && hasPoints) setSideEffectsType("both");
      else if (hasTitleWithPoints) setSideEffectsType("title_with_points");
      else if (hasPoints) setSideEffectsType("points");
      else setSideEffectsType("title_with_points");

      setSideEffectsTitleWithPoints(data.title_with_points || []);
      setSideEffectsPoints(data.points || [""]);
    } else {
      setSideEffectsType("title_with_points");
      setSideEffectsTitleWithPoints([]);
      setSideEffectsPoints([""]);
    }

    // --- Precautions ---
    if (Array.isArray(record.special_precautions) && record.special_precautions.length > 0) {
      const data = record.special_precautions[0];
      const hasTitleWithPoints = (data.title_with_points || []).length > 0;
      const hasPoints = (data.points || []).length > 0;

      if (hasTitleWithPoints && hasPoints) setPrecautionsType("both");
      else if (hasTitleWithPoints) setPrecautionsType("title_with_points");
      else if (hasPoints) setPrecautionsType("points");
      else setPrecautionsType("title_with_points");

      setPrecautionsTitleWithPoints(data.title_with_points || []);
      setPrecautionsPoints(data.points || [""]);
    } else {
      setPrecautionsType("title_with_points");
      setPrecautionsTitleWithPoints([]);
      setPrecautionsPoints([""]);
    }

    // --- Storage & Note ---
// --- Storage & Note ---
// Always default to at least one empty input [""] instead of []
setStorageGuidelines(
  Array.isArray(record.storage_guidelines) && record.storage_guidelines.length > 0
    ? record.storage_guidelines
    : [""]
);

setNote(
  Array.isArray(record.note) && record.note.length > 0
    ? record.note
    : [""]
);


  } else {
    // Reset for NEW record
    setMedicineId("");
    setMedicineName("");
    setDosage("");
    setAssociatedBloodTests("");

    setDosageType("title_with_subtitles");
    setDosageTitleAndSubtitle([]);
    setDosagePoints([""]);

    setWarningsType("title_with_points");
    setWarningsTitleWithPoints([]);
    setWarningsPoints([""]);

    setSideEffectsType("title_with_points");
    setSideEffectsTitleWithPoints([]);
    setSideEffectsPoints([""]);

    setPrecautionsType("title_with_points");
    setPrecautionsTitleWithPoints([]);
    setPrecautionsPoints([""]);

    setStorageGuidelines([""]);
    setNote([""]);
  }
};


    const handleCancel = () => {
        setIsModalVisible(false);
        setEditingRecord(null);
        setModalError("");
    };

   const supplementsDBOperations = async (values, type) => {
  try {
    let url = "";
    const link="https://u5w4o3jcorm74cmr6dcc4k3t740mauug.lambda-url.ap-south-1.on.aws/"
    let method = "POST";

    if (type === "update") {
      url =
        link+"updateSupplements/" + values.key;
      method = "PUT";
    } else if (type === "insert") {

      url = link+"insertSupplements";
      method = "POST";
    } else if (type === "delete") {
      url =
        link+"deleteSupplements/" + values.key;
      method = "DELETE";
    } else if (type === "get") {
      url =
         link+"getSupplementsList";
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
    console.error("Supplements DB Operation failed:", error);
    return { operationStatus: false };
  }
};

const handleFinish = async () => {
  setModalLoading(true);
  setModalError("");

  // Use helpers instead of repeating logic
  const dosage_and_instructions = buildDosageSection(
    dosageType,
    dosagePoints,
    dosageTitleAndSubtitle
  );

  const key_warnings = buildSection(
    warningsType,
    warningsPoints,
    warningsTitleWithPoints
  );

  const possible_side_effects = buildSection(
    sideEffectsType,
    sideEffectsPoints,
    sideEffectsTitleWithPoints
  );

  const special_precautions = buildSection(
    precautionsType,
    precautionsPoints,
    precautionsTitleWithPoints
  );

  // --- Final Payload ---
  const data = {
    key: editingRecord ? editingRecord.key : medicineId, // Use existing key for edits
    medicine_id: medicineId,
    medicine_name: medicineName,
    dosage,
    associated_blood_tests: associatedBloodTests || "null",
    dosage_and_instructions,
    key_warnings,
    possible_side_effects,
    special_precautions,
    storage_guidelines: (storageGuidelines || []).filter((pt) => pt && pt.trim()),
    note: (note || []).filter((pt) => pt && pt.trim()),
  };

  const isEdit = !!editingRecord;

  try {
    const type = isEdit ? "update" : "insert";
    const ok = await supplementsDBOperations(data, type);
    
    if (!ok.operationStatus) {
     setOperationStatus("error");
     
      //setModalError("Failed to save. Key might already exist. Check and try again.");
      setModalLoading(false);
      return;
    }
     handleCancel();
    fetchLabels();
    setOperationStatus(type === "insert" ? "inserted" : "updated"); 
   
  } catch (e) {
    setModalError("An error occurred. Please try again.");
  } finally {
    
    setModalLoading(false);
  }
};





    const handleDelete = async (key) => {
   
    try {
        const ok = await supplementsDBOperations({ key }, "delete");
        if (ok.operationStatus) {
             setOperationStatus("deleted");
            fetchLabels();
        } else {
           setOperationStatus("error");
    }
  } catch (e) {
    setOperationStatus("error");
  } finally {
   
  }
    };

    // fetch ALL once
    const fetchLabels = async () => {
       
        const result = await supplementsDBOperations({}, "get");
        if (result.operationStatus) {
         const mapped = result.data.map((item) => ({
    key: item._key,
    medicine_id: item.medicine_id,
    medicine_name: item.medicine_name,
    dosage: item.dosage,
    associated_blood_tests: item.associated_blood_tests,
    dosage_and_instructions: item.dosage_and_instructions,
    key_warnings: item.key_warnings,
    possible_side_effects: item.possible_side_effects,
    special_precautions: item.special_precautions,
    storage_guidelines: item.storage_guidelines,
    note: item.note,
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
                    item.medicine_name.toLowerCase().includes(lower) ||
                    item.key.toLowerCase().includes(lower)
            );
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
    }, [searchText, sortOrder, allData]);

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
                    Medicine Id {sortOrder === "ascend" ? "↑" : sortOrder === "descend" ? "↓" : ""}
                </span>
            ),
            dataIndex: "key",
            key: "key",
        },
        { title: "Medicine Name", dataIndex: "medicine_name", key: "medicine_name" },
        { title: "Dosage", dataIndex: "dosage", key: "dosage" },
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
                maxWidth: 1800,
                margin: "40px auto",
                padding: 24,
                background: "#fff",
                borderRadius: 8,
                boxShadow: "0 2px 8px #f0f1f2",
            }}
        >
            <Title level={1} style={{ marginBottom: 24,textAlign: "center" }}>
                Vitamins & Supplements Collection
            </Title>

            <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
                <Input
                    placeholder="Search by Label Name or Key"
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    style={{ width: "30%", padding: 4, marginTop: 0 }}
                />
                <Button
                    type="primary"
                    onClick={() => {
                        setSearchText("");
                        setSortOrder("ascend");
                        setOperationStatus(null);
                        fetchLabels();
                    }}
                >
                    Reset
                </Button>
                {/* <button 
                    style={{ backgroundColor: "#fff", padding: 0, color: 'black', fontSize: 20, paddingLeft: 8, paddingRight: 8, paddingTop: 4, paddingBottom: 4, fontWeight: "bolder"}}
                     title="Refresh Data"
                   onClick={() => fetchLabels()}>
                    🔃
                </button> */}
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
                 onOk={handleFinish}
                onCancel={handleCancel}
                okButtonProps={{ style: { backgroundColor: '#0e8fffff',width:400 ,marginLeft:20,fontWeight:'bold'} }}
                cancelButtonProps={{ style: { width: 400,backgroundColor:'#d6d6d6ff', fontWeight:'bolder'} }}
                okText={editingRecord ? "Update" : "Create"}
                confirmLoading={modalLoading}
                centered
                width={1400}
            > 
        <form  style={{ maxWidth: 1600, margin: "0 auto", padding: 24 }}>
            <div style={{ display: "flex", gap: "16px", marginBottom: 16}}>
                <div style={{ flex: 1 }}>
                    <label >
                        <strong>Medicine ID</strong>
                        <input
                            type="text"
                            value={medicineId}
                            onChange={(e) => setMedicineId(e.target.value)}
                            style={{ width: "100%", marginTop: 4 }}
                            placeholder="Enter medicine ID"
                            required
                            disabled={!!editingRecord} // disable if editing
                        />
                    </label>
                </div>

                <div style={{ flex: 1 }}>
                    <label >
                        <strong>Medicine Name</strong>
                        <input
                            type="text"
                            value={medicineName}
                            onChange={(e) => setMedicineName(e.target.value)}
                            style={{ width: "100%", marginTop: 4 }}
                            placeholder="Enter medicine name"
                            
                        />
                    </label>
                </div>

            </div>
            <div style={{ marginBottom: 16 }}>
                <label>
                    <strong>Dosage</strong>
                    <input
                        type="text"
                        value={dosage}
                        onChange={(e) => setDosage(e.target.value)}
                        style={{ width: "100%", marginTop: 4 }}
                        placeholder="Enter dosage"
                    />
                </label>
            </div>
            <div style={{ marginBottom: 24 }}>
                <label>
                    <strong>Associated Blood Tests</strong>
                    
                    <input
                        type="text"
                        value={associatedBloodTests}
                        onChange={(e) => setAssociatedBloodTests(e.target.value)}
                        style={{ width: "100%", marginTop: 4 }}
                        placeholder="Enter associated blood tests"
                    />
                    {/* <SimpleArrayInput value={associatedBloodTests} setValue={setAssociatedBloodTests} placeholder="Enter blood test" /> */}
                </label>
            </div>

            {/* Dosage and Instructions */}
            <div style={{ border: "2px solid #000000ff", backgroundColor: "white", borderRadius: 16, padding: 20, marginBottom: 24, marginTop: 16 }}>
                <SectionWithRadio
                    label="Dosage and Instructions"
                    radioName="dosage_and_instructions"
                    radioOptions={radioOptions.dosage_and_instructions}
                    radioValue={dosageType}
                    setRadioValue={setDosageType}
                >
                    {(dosageType === "title_with_subtitles" || dosageType === "both") && (
                        <div style={{ marginBottom: 12 }}>
                            <TitleAndSubtitleInput value={dosageTitleAndSubtitle} setValue={setDosageTitleAndSubtitle} />
                        </div>
                    )}
                    {(dosageType === "points" || dosageType === "both") && (
                        <div style={{ marginBottom: 12 }}>
                            <br></br>
                            <b>Points</b>
                           
                            <PointsInput points={dosagePoints} setPoints={setDosagePoints} type="edit" placeholder="Enter points, Click on plus icon to add more points" />
                        </div>
                    )}
                </SectionWithRadio>
            </div>


            {/* Key Warnings */}
            <div style={{ border: "2px solid #000000ff", backgroundColor: "white", borderRadius: 16, padding: 20, marginBottom: 24, marginTop: 16 }}>
                <SectionWithRadio
                    label="Key Warnings"
                    radioName="key_warnings"
                    radioOptions={radioOptions.title_with_points}
                    radioValue={warningsType}
                    setRadioValue={setWarningsType}
                >
                    {(warningsType === "title_with_points" || warningsType === "both") && (
                        <div style={{ marginBottom: 12 }}>
                            <TitleWithPointsInput value={warningsTitleWithPoints} setValue={setWarningsTitleWithPoints} />
                        </div>
                    )}
                    {(warningsType === "points" || warningsType === "both") && (
                        <div style={{ marginBottom: 12 }}>
                            <br></br>
                            <b>Points</b>
                            <PointsInput points={warningsPoints} setPoints={setWarningsPoints} placeholder="Enter points, Click on plus icon to add more points" />
                        </div>
                    )}
                </SectionWithRadio>
            </div>

            {/* Possible Side Effects */}
            <div style={{ border: "2px solid #000000ff", backgroundColor: "white", borderRadius: 16, padding: 20, marginBottom: 24, marginTop: 16 }}>

                <SectionWithRadio
                    label="Possible Side Effects"
                    radioName="possible_side_effects"
                    radioOptions={radioOptions.title_with_points}
                    radioValue={sideEffectsType}
                    setRadioValue={setSideEffectsType}
                >
                    {(sideEffectsType === "title_with_points" || sideEffectsType === "both") && (
                        <div style={{ marginBottom: 12 }}>
                            <TitleWithPointsInput value={sideEffectsTitleWithPoints} setValue={setSideEffectsTitleWithPoints} />
                        </div>
                    )}
                    {(sideEffectsType === "points" || sideEffectsType === "both") && (
                        <div style={{ marginBottom: 12 }}>
                            <br></br>
                            <b>Points</b>
                            <PointsInput points={sideEffectsPoints} setPoints={setSideEffectsPoints} placeholder="Enter points, Click on plus icon to add more points" />
                        </div>
                    )}
                </SectionWithRadio>
            </div>



            {/* Special Precautions */}
            <div style={{ border: "2px solid #000000ff", backgroundColor: "white", borderRadius: 16, padding: 20, marginBottom: 24, marginTop: 16 }}>

                <SectionWithRadio
                    label="Special Precautions"
                    radioName="special_precautions"
                    radioOptions={radioOptions.title_with_points}
                    radioValue={precautionsType}
                    setRadioValue={setPrecautionsType}
                >
                    {(precautionsType === "title_with_points" || precautionsType === "both") && (
                        <div style={{ marginBottom: 12 }}>
                            <TitleWithPointsInput value={precautionsTitleWithPoints} setValue={setPrecautionsTitleWithPoints} />
                        </div>
                    )}
                    {(precautionsType === "points" || precautionsType === "both") && (
                        <div style={{ marginBottom: 12 }}>
                            <br></br>
                            <b>Points</b>
                            <PointsInput points={precautionsPoints} setPoints={setPrecautionsPoints} placeholder="Enter points, Click on plus icon to add more points" />
                        </div>
                    )}
                </SectionWithRadio>
            </div>
            

            {/* Storage Guidelines */}
            <div style={{ border: "2px solid #000000ff", backgroundColor: "white", borderRadius: 16, padding: 20, marginBottom: 24, marginTop: 16 }}>

                <label>
                    Storage Guidelines
                    <SimpleArrayInput value={storageGuidelines} setValue={setStorageGuidelines} placeholder="Enter guideline" />
                </label>
            </div>

            {/* Note */}
               <div style={{ border: "2px solid #000000ff", backgroundColor: "white", borderRadius: 16, padding: 20, marginBottom: 24, marginTop: 16 }}>

                <label>
                    Note
                    <SimpleArrayInput value={note} setValue={setNote} placeholder="Enter note" />
                </label>
            </div>
   
        </form>
       
                {modalError && (
                    <Alert
                        message={modalError}
                        type="error"
                        showIcon
                        style={{ marginBottom: 16 }}
                    />
                )}
            </Modal>
        </div>
    );
};

export default Supplements;



