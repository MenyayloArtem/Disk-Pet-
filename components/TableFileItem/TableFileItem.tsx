import React from "react";
import TableRow from "../TableRow/TableRow";
import TableCell from "../TableCell/TableCell";
import Button from "../ui/Button/Button";
import { TreeNode } from "@/shared/Tree/Tree";
import { FileNodeValue } from "@/shared/fileHelpers";
import dateToFormat from "@/shared/functions/dateToFormat";
import IconFolder from "../svg/Folder";
import IconFile from "../svg/File";

interface Props {
  node: TreeNode<FileNodeValue>;
  onExpand: (key: string) => void;
  onDelete: (ket: string) => void;
}

export const checkFileIcon = (node: TreeNode<any>) => {
  let isFolder = node.children;
  return isFolder ? <IconFolder width={14} /> : <IconFile width={14} />;
};

function TableFileItem({ node, onExpand, onDelete }: Props) {
  let now = Date.now();
  let created = dateToFormat(node.value._meta?.created || now);
  let updated = dateToFormat(node.value._meta?.updated || now);

  if (node.value._meta?.created == node.value._meta?.updated) {
    updated = "-";
  }

  return (
    <TableRow>
      <TableCell>
        <div
          className="flex items-center gap-2"
          onClick={() => onExpand(node.key)}
        >
          {checkFileIcon(node)}
          {node.key}
        </div>
      </TableCell>

      <TableCell>{created}</TableCell>
      <TableCell>{updated}</TableCell>
      <TableCell>
        <Button onClick={() => onDelete(node.key)}>DELETE</Button>
      </TableCell>
    </TableRow>
  );
}

export default TableFileItem;
