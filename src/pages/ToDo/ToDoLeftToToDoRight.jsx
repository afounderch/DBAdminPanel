import React, { useState } from "react";

const initialState = {
    medicine_name: "",
    dosage: "",
    associated_blood_tests: "",
    dosage_and_instructions: [
        {
            title_name: "",
            sub_title: [],
            points: [""],
        },
    ],
    key_warnings: [
        {
            title_with_points: [
                {
                    title: "",
                    title_points: [""],
                },
            ],
            points: [],
        },
    ],
    possible_side_effects: [
        {
            title_with_points: [
                {
                    title: "",
                    title_points: [""],
                },
            ],
            points: [],
        },
    ],
    special_precautions: [
        {
            title_with_points: [
                {
                    title: "",
                    title_points: [""],
                },
            ],
            points: [],
        },
    ],
    storage_guideLines: [""],
    note: [""],
};

export default function MedicineForm() {
    const [form, setForm] = useState(initialState);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    // Helper for nested array fields
    const handleArrayChange = (section, idx, key, value) => {
        setForm((prev) => {
            const updated = [...prev[section]];
            updated[idx][key] = value;
            return { ...prev, [section]: updated };
        });
    };

    // Helper for title_with_points
    const handleTitleWithPointsChange = (section, idx, tIdx, key, value) => {
        setForm((prev) => {
            const updated = [...prev[section]];
            updated[idx].title_with_points[tIdx][key] = value;
            return { ...prev, [section]: updated };
        });
    };

    // Helper for points arrays
    const handlePointsChange = (section, idx, pointsKey, pIdx, value) => {
        setForm((prev) => {
            const updated = [...prev[section]];
            const pointsArr = [...updated[idx][pointsKey]];
            pointsArr[pIdx] = value;
            updated[idx][pointsKey] = pointsArr;
            return { ...prev, [section]: updated };
        });
    };

    // Helper for simple array fields
    const handleSimpleArrayChange = (key, idx, value) => {
        setForm((prev) => {
            const arr = [...prev[key]];
            arr[idx] = value;
            return { ...prev, [key]: arr };
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Submit logic here
        alert(JSON.stringify(form, null, 2));
    };

    return (
        <form onSubmit={handleSubmit} style={{ maxWidth: 700, margin: "auto" }}>
            <h2>Medicine Form</h2>
            <label>
                Medicine Name:
                <input
                    name="medicine_name"
                    value={form.medicine_name}
                    onChange={handleChange}
                />
            </label>
            <br />
            <label>
                Dosage:
                <input
                    name="dosage"
                    value={form.dosage}
                    onChange={handleChange}
                />
            </label>
            <br />
            <label>
                Associated Blood Tests:
                <input
                    name="associated_blood_tests"
                    value={form.associated_blood_tests || ""}
                    onChange={handleChange}
                />
            </label>
            <hr />

            <h3>Dosage and Instructions</h3>
            {form.dosage_and_instructions.map((item, idx) => (
                <div key={idx} style={{ border: "1px solid #ccc", padding: 10, marginBottom: 10 }}>
                    <label>
                        Title Name:
                        <input
                            value={item.title_name}
                            onChange={e =>
                                handleArrayChange("dosage_and_instructions", idx, "title_name", e.target.value)
                            }
                        />
                    </label>
                    <br />
                    <label>
                        Points:
                        {item.points.map((pt, pIdx) => (
                            <div key={pIdx}>
                                <input
                                    value={pt}
                                    onChange={e =>
                                        handlePointsChange("dosage_and_instructions", idx, "points", pIdx, e.target.value)
                                    }
                                />
                            </div>
                        ))}
                    </label>
                </div>
            ))}

            <h3>Key Warnings</h3>
            {form.key_warnings.map((item, idx) => (
                <div key={idx} style={{ border: "1px solid #ccc", padding: 10, marginBottom: 10 }}>
                    {item.title_with_points.map((tw, tIdx) => (
                        <div key={tIdx}>
                            <label>
                                Title:
                                <input
                                    value={tw.title}
                                    onChange={e =>
                                        handleTitleWithPointsChange("key_warnings", idx, tIdx, "title", e.target.value)
                                    }
                                />
                            </label>
                            <br />
                            <label>
                                Title Points:
                                {tw.title_points.map((tp, tpIdx) => (
                                    <div key={tpIdx}>
                                        <input
                                            value={tp}
                                            onChange={e =>
                                                setForm(prev => {
                                                    const updated = [...prev.key_warnings];
                                                    updated[idx].title_with_points[tIdx].title_points[tpIdx] = e.target.value;
                                                    return { ...prev, key_warnings: updated };
                                                })
                                            }
                                        />
                                    </div>
                                ))}
                            </label>
                        </div>
                    ))}
                </div>
            ))}

            <h3>Possible Side Effects</h3>
            {form.possible_side_effects.map((item, idx) => (
                <div key={idx} style={{ border: "1px solid #ccc", padding: 10, marginBottom: 10 }}>
                    {item.title_with_points.map((tw, tIdx) => (
                        <div key={tIdx}>
                            <label>
                                Title:
                                <input
                                    value={tw.title}
                                    onChange={e =>
                                        handleTitleWithPointsChange("possible_side_effects", idx, tIdx, "title", e.target.value)
                                    }
                                />
                            </label>
                            <br />
                            <label>
                                Title Points:
                                {tw.title_points.map((tp, tpIdx) => (
                                    <div key={tpIdx}>
                                        <input
                                            value={tp}
                                            onChange={e =>
                                                setForm(prev => {
                                                    const updated = [...prev.possible_side_effects];
                                                    updated[idx].title_with_points[tIdx].title_points[tpIdx] = e.target.value;
                                                    return { ...prev, possible_side_effects: updated };
                                                })
                                            }
                                        />
                                    </div>
                                ))}
                            </label>
                        </div>
                    ))}
                </div>
            ))}

            <h3>Special Precautions</h3>
            {form.special_precautions.map((item, idx) => (
                <div key={idx} style={{ border: "1px solid #ccc", padding: 10, marginBottom: 10 }}>
                    {item.title_with_points.map((tw, tIdx) => (
                        <div key={tIdx}>
                            <label>
                                Title:
                                <input
                                    value={tw.title}
                                    onChange={e =>
                                        handleTitleWithPointsChange("special_precautions", idx, tIdx, "title", e.target.value)
                                    }
                                />
                            </label>
                            <br />
                            <label>
                                Title Points:
                                {tw.title_points.map((tp, tpIdx) => (
                                    <div key={tpIdx}>
                                        <input
                                            value={tp}
                                            onChange={e =>
                                                setForm(prev => {
                                                    const updated = [...prev.special_precautions];
                                                    updated[idx].title_with_points[tIdx].title_points[tpIdx] = e.target.value;
                                                    return { ...prev, special_precautions: updated };
                                                })
                                            }
                                        />
                                    </div>
                                ))}
                            </label>
                        </div>
                    ))}
                </div>
            ))}

            <h3>Storage Guidelines</h3>
            {form.storage_guideLines.map((sg, idx) => (
                <div key={idx}>
                    <input
                        value={sg}
                        onChange={e => handleSimpleArrayChange("storage_guideLines", idx, e.target.value)}
                    />
                </div>
            ))}

            <h3>Note</h3>
            {form.note.map((n, idx) => (
                <div key={idx}>
                    <input
                        value={n}
                        onChange={e => handleSimpleArrayChange("note", idx, e.target.value)}
                    />
                </div>
            ))}

            <br />
            <button type="submit">Submit</button>
        </form>
    );
}