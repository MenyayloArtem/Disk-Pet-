import React, { MutableRefObject, useEffect, useState } from "react";
import Table from "../Table/Table";
import TableCaption from "../TableCaption/TableCaption";
import Button from "../ui/Button/Button";
import TableHead from "../TableHead/TableHead";
import TableBody from "../TableBody/TableBody";
import TableRow from "../TableRow/TableRow";
import TableCell from "../TableCell/TableCell";
import { usePathname, useSearchParams } from "next/navigation";
import { FileTree } from "@/app/files/[...path]/page";
import { TreeSearchItem } from "@/shared/Tree/Tree";
import { FileNodeValue } from "@/shared/fileHelpers";
import { checkFileIcon } from "../TableFileItem/TableFileItem";

interface Props {
  treeRef: MutableRefObject<FileTree | undefined>;
  onClick: (path: string[]) => void;
}

function SearchTable({ treeRef, onClick }: Props) {
  const pathname = usePathname();
  const query = useSearchParams();
  const searchQuery = query.get("search");
  const [searchNodes, setSearchNodes] = useState<
    TreeSearchItem<FileNodeValue>[]
  >([]);

  useEffect(() => {
    if (searchQuery && treeRef.current) {
      setSearchNodes(treeRef.current.search(searchQuery));
    }
  }, [searchQuery, treeRef.current]);

  if (searchQuery && !searchNodes.length) {
    return (
      <div className="flex gap-2 items-center text-lg">
        <div className="text-lg">No result found</div>
        <Button onClick={() => window.history.replaceState(null, "", pathname)}>
          Back
        </Button>
      </div>
    );
  }

  return (
    <Table>
      <TableCaption>
        <div className="flex gap-2 items-center">
          <Button
            onClick={() => window.history.replaceState(null, "", pathname)}
          >
            Back
          </Button>
          {searchQuery}
        </div>
      </TableCaption>
      <TableHead names={[{ name: "Name" }, { name: "Path" }]} />
      <TableBody>
        {searchNodes.map((item) => {
          let path = treeRef.current!.getPath(item.node);
          return (
            <TableRow key={item.node.key}>
              <TableCell onClick={() => onClick(path)}>
                <div className="flex items-center gap-2">
                  {checkFileIcon(item.node)}
                  {item.node.key}
                </div>
              </TableCell>
              <TableCell onClick={() => onClick(path)}>
                {path.join(" > ")}
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}

export default SearchTable;
