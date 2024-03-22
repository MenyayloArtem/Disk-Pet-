"use client";

import ProgressBar from "@/components/ProgressBar/ProgressBar";
import TableCell from "@/components/TableCell/TableCell";
import TableRow from "@/components/TableRow/TableRow";
import AddFile from "@/components/svg/AddFile";
import IconFolderAdd from "@/components/svg/AddFolder";
import IconClose from "@/components/svg/Close";
import IconFile from "@/components/svg/File";
import IconFolder from "@/components/svg/Folder";
import IconSearch from "@/components/svg/Search";
import Button, { ButtonTypes } from "@/components/ui/Button/Button";
import Input, { InputType } from "@/components/ui/Input/Input";
import Tree, { TreeNode } from "@/shared/Tree/Tree";
import { useCallback, useEffect, useRef, useState } from "react";

type FileTypes = "file" | "folder";

function getPercents(val: number, max: number) {
  return (val / max) * 100;
}

export default function page() {
  const maxSize = 1024;
  const [currentNode, setCurrentNode] = useState<TreeNode | null>(null);
  const [history, setHistory] = useState<string[]>([]);
  const treeRef = useRef<Tree>();
  const [treeSize, setTreeSize] = useState<number>(0);
  const [newFileType, setNewFileType] = useState<FileTypes | null>(null);
  const [expanded, setExpanded] = useState<string[]>([]);
  const [newElName, setNewElName] = useState<string>("");
  const [search, setSearch] = useState<string>("");
  const [searched, setSearched] = useState<
    {
      matched: string;
      path: string[];
    }[]
  >([]);

  const [fileWarn, setFileWarn] = useState<string>("");

  useEffect(() => {
    let filenameSplit = newElName.split(".").filter((item) => item);
    if (newFileType == "file" && filenameSplit.length < 2 && newElName.length) {
      setFileWarn("Необходимо указать расширение файла");
    } else {
      setFileWarn("");
    }
  }, [newElName, newFileType]);

  useEffect(() => {
    let tree = new Tree("app");
    tree.addNode("signup");
    tree.addNode("test");
    tree.setCurrent("signup");
    tree.addNode("refresh");
    tree.setCurrent("refresh");
    tree.addNode("signup");
    tree.addNode("test");
    tree.setCurrent("signup");
    tree.addNode("refresh");
    tree.setCurrent("refresh");
    tree.addNode("signup");
    tree.goToRoot();
    tree.addNode("file.js",{text: "Lorem ipsum dolor sit amet consectetur adipisicing elit!",},true);
    tree.setCurrent("test");
    tree.addNode("signup");
    tree.addNode("test");
    tree.setCurrent("signup");
    tree.addNode("refresh");
    tree.goToRoot();
    treeRef.current = tree;
    let res = treeRef.current.getJson();
    setTreeSize(JSON.stringify(res).length);
    update();
  }, []);

  const update = () => {
    if (treeRef.current) {
      setCurrentNode(treeRef.current.current);
      setHistory(treeRef.current.history.names);
      setExpanded(treeRef.current.current.expand());
    }
  };

  const expand = (key: string) => {
    treeRef.current?.setCurrent(key);
    update();
  };

  const back = (steps?: number) => {
    if (treeRef.current && steps !== 0) {
      treeRef.current.back(steps);
      update();
    }
  };

  const addNewElement = useCallback(
    (name: string) => {
      if (treeRef.current && !fileWarn) {
        if (name) {
          if (newFileType == "file") {
            treeRef.current.addNode(name, {}, true);
          } else {
            treeRef.current.addNode(name);
          }

          update();
          setNewFileType(null);
        } else {
          setFileWarn("Укажите название файла")
        }
      }
    },
    [fileWarn, newFileType]
  );

  const searchValue = (value: string) => {
    if (treeRef.current) {
      let searched = treeRef.current.search(value);
      setSearched(
        searched.map((s) => ({
          path: treeRef.current!.getPath(s.node),
          matched: s.matched,
        }))
      );
    }
  };

  const goToPath = (path: string[]) => {
    setSearched([]);
    treeRef.current?.setCurrent(path);
    update();
  };

  return (
    <div className="box-border bg-gray-100 p-2 h-[100vh]">
      <div className="grid gap-2 grid-cols-[300px_auto] h-[calc(100vh-1rem)]">
        <aside className="grid grid-subgrid grid-rows-[70px_auto] gap-2">

          <div className="bg-white flex justify-center items-center">
            <div className="text-xl">Мой диск</div>
          </div>

          <div className="bg-white p-3">
            <div className="text-lg">Использовано</div>
            <ProgressBar progress={getPercents(treeSize, maxSize)} />
            <div className="text-sm text-gray-500 mt-1">
              {treeSize}B из {maxSize}B
            </div>
          </div>
        </aside>
        <main className="grid grid-subgrid grid-rows-[70px_auto] gap-2">

          <div className="bg-white flex items-center p-3">
            <Input
              before={<IconSearch width={16} />}
              placeholder="Search"
              width={"300px"}
              onInput={(e: any) => setSearch(e.target.value)}
              onEnterPress={() => searchValue(search)}
            />
          </div>

          <div className="bg-white p-3">
            {currentNode && (
              <table className="border-collapse table-auto w-full text-sm bg-gray-100">
                <caption className="text-slate-500 dark:text-slate-400 py-2 caption-top text-left text-xl">
                  <div className="flex gap-1">
                    {history.map((item, i) => {
                      return (
                        <button className="flex gap-1"
                          onClick={() =>back(i + 1 !== history.length ? history.length - (i + 1) : 0)}
                          key={i}
                        >
                          {item}
                          {i + 1 !== history.length && history.length > 1 && (
                            <span>&gt;</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                  <div className="flex gap-2 my-2">
                    <Button onClick={() => setNewFileType("file")}>
                      <AddFile width={22} />
                    </Button>
                    <Button onClick={() => setNewFileType("folder")}>
                      <IconFolderAdd width={22} />
                    </Button>
                    <Button
                      type={ButtonTypes.Outlined}
                      onClick={() => setNewFileType(null)}
                    >
                      <IconClose width={22} />
                    </Button>
                  </div>
                </caption>

                <thead>
                  <tr>
                    <th className="border dark:border-slate-600 font-medium p-4 pl-8 pt-3 pb-3 text-slate-400 dark:text-slate-200 text-left"
                      style={{ width: "30%" }}>
                      Name
                    </th>
                    <th className="border dark:border-slate-600 font-medium p-4 pr-8 pt-3 pb-3 text-slate-400 dark:text-slate-200 text-left">
                      Info
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-slate-800">
                  {(!searched.length || (searched.length && !search)) &&
                    expanded.map((item) => {
                      let isFolder =
                        treeRef.current?.current.children![item].children;
                      return (
                        <TableRow key={item}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {isFolder ? (
                                <IconFolder
                                  width={14}
                                  onClick={() => expand(item)}
                                />
                              ) : (
                                <IconFile
                                  width={14}
                                  onClick={() => expand(item)}
                                />
                              )}
                              {item}
                            </div>
                          </TableCell>
                          <TableCell>Info</TableCell>
                        </TableRow>
                      );
                    })}

                  {!!searched.length &&
                    search &&
                    searched.map((item, i) => {
                      return (
                        <tr key={i}>
                          <td className="border border-slate-200 dark:border-slate-600 p-4 pl-8 text-slate-500 dark:text-slate-400">
                            {item.matched}
                          </td>
                          <td
                            className="border border-slate-200 dark:border-slate-600 p-4 pr-8 text-slate-500 dark:text-slate-400"
                            onClick={() => goToPath(item.path)}>
                            {[treeRef.current?.root.key, ...item.path].join(" > ")}
                          </td>
                        </tr>
                      );
                    })}

                  {newFileType && (
                    <tr>
                      <TableCell>
                        {
                          <div className="flex">
                            <Input
                              placeholder={
                                newFileType === "file"
                                  ? "File Name"
                                  : "Folder Name"
                              }
                              type={fileWarn ? InputType.Warn : undefined}
                              before={<>
                                  {newFileType == "file" ? (
                                    <IconFile width={16} />
                                  ) : (
                                    <IconFolder width={18} />
                                  )}
                              </>}
                              onInput={(e: any) => setNewElName(e.target.value)}
                              onEnterPress={() => addNewElement(newElName)}
                              after={<Button onClick={() => addNewElement(newElName)}>
                                  OK
                                </Button>
                              }
                              bottom={fileWarn && (<div className="text-red-400 text-xs">
                                {fileWarn}
                              </div>)}
                            />
                          </div>
                        }
                      </TableCell>
                      <TableCell>
                        Enter file or folder name
                      </TableCell>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
