"use client";

import ProgressBar from "@/components/ProgressBar/ProgressBar";
import TableCell from "@/components/TableCell/TableCell";
import TableRow from "@/components/TableRow/TableRow";
import IconFile from "@/components/svg/File";
import IconFolder from "@/components/svg/Folder";
import IconSearch from "@/components/svg/Search";
import Input, { InputType } from "@/components/ui/Input/Input";
import Tree, { TreeNode } from "@/shared/Tree/Tree";
import { useCallback, useEffect, useRef, useState } from "react";
import { createFile, createFolder, createTree, readFolder } from "@/shared/fileHelpers";
import TableCaptionHistory from "@/components/TableCaptionHistory/TableCaptionHistory";
import Controls from "@/components/Controls/Controls";
import TableCreateItemInput from "@/components/TableCreateItemInput/TableCreateItemInput";
import Table from "@/components/Table/Table";
import TableCaption from "@/components/TableCaption/TableCaption";
import TableHead from "@/components/TableHead/TableHead";
import TableBody from "@/components/TableBody/TableBody";
import Link from "next/link";
export type FileTypes = "file" | "folder" | null;

function getPercents(val: number, max: number) {
  return (val / max) * 100;
}

const tableNames = [{
      name : "Folder Name",
      width : "30%"
    },
    {
      name : "Info"
    }]

export default function Page() {

  const [dirs, setDirs] = useState<string[]>([])

  // const searchValue = (value: string) => {
  //   if (treeRef.current) {
  //     let searched = treeRef.current.search(value);
  //     setSearched(
  //       searched.map((s) => ({
  //         path: treeRef.current!.getPath(s.node),
  //         matched: s.matched,
  //       }))
  //     );
  //   }
  // };

  useEffect(() => {
    readFolder("")
    .then(res => setDirs(res))
  },[])
 

  return (



          <div className="bg-white p-3">
          <Table>
            <TableCaption>
              Test
            </TableCaption>
            <TableHead names={tableNames}/>
            <TableBody>
              {
                dirs.map(dir => <TableRow
                key={dir}
                >
                <TableCell
                
                >
                  <div className="flex gap-2">
                    <IconFolder width={14}/>
                    <Link href={`/files/${dir}`}>
                    {dir}
                    </Link>
                    
                  </div>
                </TableCell>
                <TableCell>
                  Test2
                </TableCell>
              </TableRow>)
              }
              
            </TableBody>
          </Table>
          </div>

  );
}
