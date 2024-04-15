"use client";

import TableCell from "@/components/TableCell/TableCell";
import TableRow from "@/components/TableRow/TableRow";
import IconFolder from "@/components/svg/Folder";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  createFolderInRoot,
  readFolder,
} from "@/shared/fileHelpers";
import TableCreateItemInput from "@/components/TableCreateItemInput/TableCreateItemInput";
import Table from "@/components/Table/Table";
import TableCaption from "@/components/TableCaption/TableCaption";
import TableHead from "@/components/TableHead/TableHead";
import TableBody from "@/components/TableBody/TableBody";
import Link from "next/link";
import Button, { ButtonTypes } from "@/components/ui/Button/Button";
import IconFolderAdd from "@/components/svg/AddFolder";
import IconClose from "@/components/svg/Close";
import { usePathname, useSearchParams } from "next/navigation";
export type FileTypes = "file" | "folder" | null;

const tableNames = [
  {
    name: "Folder Name",
    width: "30%",
  },
  {
    name: "Info",
  },
];

export default function Page() {
  const [dirs, setDirs] = useState<string[]>([]);
  const [searchedDirs, setSearchedDirs] = useState<string[]>([]);
  const [showInput, setShowInput] = useState<boolean>(false);

  const pathname = usePathname();
  const query = useSearchParams();
  const search = query.get("search");

  const createFolder = (name: string) => {
    createFolderInRoot(name);
    setDirs((d) => [...d, name]);
    setShowInput(false);
  };

  useEffect(() => {
    readFolder("").then((res) => setDirs(res));
  }, []);

  useEffect(() => {
    if (search) {
      setSearchedDirs(dirs.filter((dir) => dir.match(search)));
    } else {
      setSearchedDirs(dirs);
    }
  }, [search, dirs]);

  return (
    <div className="bg-white p-3">
      <Table>
        <TableCaption>
          {search ? (
            <div className="flex gap-2 items-center">{search}</div>
          ) : (
            "Test"
          )}

          <div className="flex gap-2 my-2">
            {search ? (
              <Button
                onClick={() => window.history.replaceState(null, "", pathname)}
              >
                Back
              </Button>
            ) : (
              <>
                <Button onClick={() => setShowInput(true)}>
                  <IconFolderAdd width={22} />
                </Button>
                {showInput && (
                  <Button
                    type={ButtonTypes.Outlined}
                    onClick={() => setShowInput(false)}
                  >
                    <IconClose width={22} />
                  </Button>
                )}
              </>
            )}
          </div>
        </TableCaption>
        <TableHead names={tableNames} />
        <TableBody>
          {searchedDirs.map((dir) => (
            <TableRow key={dir}>
              <TableCell>
                <div className="flex gap-2">
                  <IconFolder width={14} />
                  <Link href={`/files/${dir}`}>{dir}</Link>
                </div>
              </TableCell>
              <TableCell>Test2</TableCell>
            </TableRow>
          ))}

          {showInput && (
            <TableRow>
              <TableCell>
                <TableCreateItemInput
                  fileType={"folder"}
                  onCreate={createFolder}
                  names={dirs}
                />
              </TableCell>
              <TableCell>Enter new folder name</TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
