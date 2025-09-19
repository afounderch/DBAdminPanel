import React, { useState } from "react";

const radioOptions = {
    dosage_and_instructions: [
        { label: "Title & Subtitle", value: "title_and_subtitle" },
        { label: "Points", value: "points" },
        { label: "Both", value: "both" },
    ],
    title_with_points: [
        { label: "Title with Points", value: "title_with_points" },
        { label: "Points", value: "points" },
        { label: "Both", value: "both" },
    ],
};

function PointsInput({ points, setPoints, placeholder = "Enter points, Click on plus icon to add more points" }) {
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


// For dosage_and_instructions: title_and_subtitle
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
                            <div key={subIdx} style={{ marginBottom: 8, marginLeft: 12 }}>
                                <b>Enter Subtitle Name</b>
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
                                <PointsInput
                                    points={sub.sub_title_with_points || [""]}
                                    setPoints={(pts) =>
                                        handleSubtitlePointsChange(idx, subIdx, pts)
                                    }
                                    placeholder="Enter points, Click on plus icon to add more points under subtitle"
                                />
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
 const supplementsDBOperations = async (values, type) => {
  try {
    let url = "";
    let method = "POST";

    if (type === "update") {
      url =
        "https:https://rzurm3fftdp74hrqljesoikys40wzxbc.lambda-url.ap-south-1.on.aws/updateSupplements/" + values.medicine_id;
      method = "PUT";
    } else if (type === "insert") {
      url =
        "https://rzurm3fftdp74hrqljesoikys40wzxbc.lambda-url.ap-south-1.on.aws/insertSupplements";
      method = "POST";
    } else if (type === "delete") {
      url =
        "https://rzurm3fftdp74hrqljesoikys40wzxbc.lambda-url.ap-south-1.on.aws/deleteSupplements/" + values.medicine_id;
      method = "DELETE";
    } else if (type === "get") {
      url =
        "https://rzurm3fftdp74hrqljesoikys40wzxbc.lambda-url.ap-south-1.on.aws/getSupplementsList";
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

export default function AddSupplements() {
    // Basic fields
    const [medicineName, setMedicineName] = useState("");
    const [medicineId, setMedicineId] = useState("");
    const [dosage, setDosage] = useState("");
    const [associatedBloodTests, setAssociatedBloodTests] = useState();
    // const [associatedBloodTests, setAssociatedBloodTests] = useState([""]);

    // Dosage and Instructions
    const [dosageType, setDosageType] = useState("title_and_subtitle");
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

  const handleSubmit = async (e) => {
  e.preventDefault();

  // Dosage and Instructions
  let dosage_and_instructions = {
    points: [],
    title_and_subtitle: [],
  };
  if (dosageType === "title_and_subtitle" || dosageType === "both") {
    dosage_and_instructions.title_and_subtitle = JSON.parse(
      JSON.stringify(dosageTitleAndSubtitle || [])
    );
  }
  if (dosageType === "points" || dosageType === "both") {
    dosage_and_instructions.points = (dosagePoints || []).filter(
      (pt) => pt && pt.trim()
    );
  }

  // Key Warnings
  let key_warnings = {
    points: [],
    title_with_points: [],
  };
  if (warningsType === "title_with_points" || warningsType === "both") {
    key_warnings.title_with_points = JSON.parse(
      JSON.stringify(warningsTitleWithPoints || [])
    );
  }
  if (warningsType === "points" || warningsType === "both") {
    key_warnings.points = (warningsPoints || []).filter(
      (pt) => pt && pt.trim()
    );
  }

  // Possible Side Effects
  let possible_side_effects = {
    points: [],
    title_with_points: [],
  };
  if (sideEffectsType === "title_with_points" || sideEffectsType === "both") {
    possible_side_effects.title_with_points = JSON.parse(
      JSON.stringify(sideEffectsTitleWithPoints || [])
    );
  }
  if (sideEffectsType === "points" || sideEffectsType === "both") {
    possible_side_effects.points = (sideEffectsPoints || []).filter(
      (pt) => pt && pt.trim()
    );
  }

  // Special Precautions
  let special_precautions = {
    points: [],
    title_with_points: [],
  };
  if (precautionsType === "title_with_points" || precautionsType === "both") {
    special_precautions.title_with_points = JSON.parse(
      JSON.stringify(precautionsTitleWithPoints || [])
    );
  }
  if (precautionsType === "points" || precautionsType === "both") {
    special_precautions.points = (precautionsPoints || []).filter(
      (pt) => pt && pt.trim()
    );
  }

  const data = {
    medicine_id: medicineId,
    medicine_name: medicineName,
    dosage,
    associated_blood_tests: (associatedBloodTests || "null"),
    //   .toString()
    //   .split(",")
    //   .map((pt) => pt.trim())
    //   .filter((pt) => pt),
    dosage_and_instructions,
    key_warnings,
    possible_side_effects,
    special_precautions,
    storage_guidelines: (storageGuidelines || []).filter(
      (pt) => pt && pt.trim()
    ),
    note: (note || []).filter((pt) => pt && pt.trim()),
  };

  alert("Form Data:\n" + JSON.stringify(data, null, 2));
  const result = await supplementsDBOperations(data, "insert");

if (result.operationStatus) {
  alert("Supplement inserted successfully!");
} else {
  alert("Failed to insert supplement.");
}
  console.log(data);
};


    return (
        <form onSubmit={handleSubmit} style={{ maxWidth: 1600, margin: "0 auto", padding: 24 }}>
            <h2 style={{textAlign:'center',marginBottom:48}}>Add Supplements</h2>
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
                    {(dosageType === "title_and_subtitle" || dosageType === "both") && (
                        <div style={{ marginBottom: 12 }}>
                            <TitleAndSubtitleInput value={dosageTitleAndSubtitle} setValue={setDosageTitleAndSubtitle} />
                        </div>
                    )}
                    {(dosageType === "points" || dosageType === "both") && (
                        <div style={{ marginBottom: 12 }}>
                            <br></br>
                            <b>Points</b>
                            <PointsInput points={dosagePoints} setPoints={setDosagePoints} placeholder="Enter points, Click on plus icon to add more points" />
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

            <button type="submit" style={{ padding: "8px 24px", fontWeight: "bold" }}>
                Create
            </button>
        </form>
    );
}
