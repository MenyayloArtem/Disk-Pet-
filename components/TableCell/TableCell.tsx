import React from "react";
import "./TableCell.scss";

interface Props {
  children?: React.ReactNode;
  onClick?: Function;
}

function TableCell(props: Props) {
  const onClick = () => {
    if (props.onClick) {
      props.onClick();
    }
  };
  return (
    <td
      className="border border-slate-200 dark:border-slate-600 p-4 pl-8 text-slate-500 dark:text-slate-400"
      onClick={() => onClick()}
    >
      {props.children}
    </td>
  );
}

export default TableCell;
