import React from "react";
import "./TableRow.scss";

interface Props {
  children: React.ReactNode;
}

function TableRow(props: Props) {
  return <tr>{props.children}</tr>;
}

export default TableRow;
