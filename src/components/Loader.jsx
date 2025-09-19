// components/Loader.js
import React from "react";
import { Spin } from "antd";

export default function Loader({ loading, text = "Loading..." }) {
  if (!loading) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        backgroundColor: "rgba(255,255,255,0.7)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 2000,
      }}
    >
      <Spin size="large" tip={text} />
    </div>
  );
}

// <Loader loading={modalLoading} text="Saving..." />