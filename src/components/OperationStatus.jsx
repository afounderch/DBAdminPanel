// components/OperationStatus.js
import React from "react";
import { Alert } from "antd";

export default function OperationStatus({ status }) {
  if (!status) return null;

  let type = "info";
  let message = "";

  if (status === "inserted") {
    type = "success";
    message = "✅ Successfully Inserted!";
  } else if (status === "updated") {
    type = "success";
    message = "✅ Successfully Updated!";
  } else if (status === "deleted") {
    type = "warning";
    message = "🗑️ Successfully Deleted!";
  } else if (status === "error") {
    type = "error";
    message = "Something went wrong!";
  }else if (status === "fileError") {
    type = "error";
    message = "Make sure the CSV file is in the required format";
  }else{
     type = "success";
     message=status
  }

  return (
    <Alert
      message={message}
      type={type}
      showIcon
      closable
      style={{ marginBottom: 16 }}
    />
  );
}


/* <OperationStatus status={operationStatus} />
where operationStatus is one of "inserted" | "updated" | "deleted" | "error" | null. */