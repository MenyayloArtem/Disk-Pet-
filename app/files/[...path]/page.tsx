"use client";

import TableCell from "@/components/TableCell/TableCell";
import TableRow from "@/components/TableRow/TableRow";
import Tree, { TreeNode } from "@/shared/Tree/Tree";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  FileNodeValue,
  createTree,
  readFile,
  saveByCommits,
} from "@/shared/fileHelpers";
import TableCaptionHistory from "@/components/TableCaptionHistory/TableCaptionHistory";
import Controls from "@/components/Controls/Controls";
import TableCreateItemInput from "@/components/TableCreateItemInput/TableCreateItemInput";
import Table from "@/components/Table/Table";
import TableCaption from "@/components/TableCaption/TableCaption";
import TableHead from "@/components/TableHead/TableHead";
import TableBody from "@/components/TableBody/TableBody";
import Button from "@/components/ui/Button/Button";
import makeCommit from "@/shared/functions/makeCommit";
import { usePathname } from "next/navigation";
import TableFileItem from "@/components/TableFileItem/TableFileItem";
import splitPathname from "@/shared/functions/splitPathname";
export type FileTypes = "file" | "folder" | null;

interface Props {
  params: {
    path: string[];
  };
}

const tableNames = [
  {
    name: "Folder Name",
    width: "30%",
  },
  {
    name: "Created",
  },
  {
    name : "Updated"
  },
  {
    name: "",
    width: "100px",
  },
];

type FileTree = Tree<FileNodeValue>
export type FileNode = TreeNode<FileNodeValue>

export default function Page(props: Props) {
  const [currentNode, setCurrentNode] =
    useState<TreeNode<FileNodeValue> | null>(null);
  const [history, setHistory] = useState<string[]>([]);
  const treeRef = useRef<Tree<FileNodeValue>>();
  const [newFileType, setNewFileType] = useState<FileTypes | null>(null);
  const [expanded, setExpanded] = useState<FileNode[]>([]);
  const [initialTree, setInitialTree] = useState<any>(null);
  const [search, setSearch] = useState<string>("");
  const [text, setText] = useState<string>("");
  const [currentNodeIsFile, setCurrentNodeIsFile] = useState<boolean>(false);
  const [searched, setSearched] = useState<
    {
      matched: string;
      path: string[];
    }[]
  >([]);

  const pathname = usePathname()

  const update = (history? : string[]) => {
    if (treeRef.current) {
      setCurrentNode(history ? treeRef.current.setCurrent(history) : treeRef.current.current);
      if (!history) {
        window.history.pushState(null, "", `/files/${treeRef.current.history.names.filter(n => n).join("/")}`);
      } else {
        console.log(history)
        window.history.back();
      }
      
      setExpanded([...treeRef.current.current.expand()]);
    }
  };

  const saveText = () => {
    if (currentNodeIsFile && treeRef.current) {
      treeRef.current.current.value = {
        data: text,
        _meta: {
          ...treeRef.current.current.value._meta,
          updated: new Date(Date.now()).getTime(),
        },
      };
    }
  };

  const save = () => {
    if (treeRef.current) {
      makeCommit(initialTree, treeRef.current.getJson()).then((commits) => {
        saveByCommits(props.params.path[0], commits);
      });
    }
  };

  const expand = (key: string) => {
    if (treeRef.current) {
      if (true) {
        treeRef.current.setCurrent(key);
        update();
      }
    }
  };

  const back = (steps: number = 1) => {
    if (treeRef.current && steps !== 0 && treeRef.current.history.names.length > 1) {
      treeRef.current.back(steps);
      // window.history.back()
      update();
    }
  };

  const addNewElement = useCallback(
    (name: string) => {
      if (treeRef.current) {
        if (name) {
          if (newFileType == "file") {
            treeRef.current.addNode(name, {}, true);
          } else {
            treeRef.current.addNode(name);
          }

          update();
          setNewFileType(null);
        }
      }
    },
    [newFileType, history]
  );

  const deleteNode = (key: string) => {
    if (treeRef.current) {
      treeRef.current.current.deleteChildKey(key);
      update();
    }
  };

  const goToPath = (path: string[]) => {
    setSearched([]);
    treeRef.current?.setCurrent(path);
    update();
  };

  useEffect(() => {
    if (treeRef.current) {
      setCurrentNodeIsFile(!treeRef.current.current.children);
    }
  }, [treeRef.current?.current]);

  useEffect(() => {
    let path = props.params.path;
    let n = path[0];
    createTree(n).then((res) => {
      if (res) {
        let tree = Tree.createFromJson<FileNodeValue>(n || "root", res);
        treeRef.current = tree;
        treeRef.current.setCurrent(path.slice(1));
        let json = JSON.parse(JSON.stringify(treeRef.current.getJson()));
        setInitialTree(json);
        update();
      }
    });
  }, []);

  useEffect(() => {
    if (currentNodeIsFile) {
      setText("");
      readFile(splitPathname(pathname)).then((res: any) => {
        setText(res);
      });
    }
  }, [currentNodeIsFile]);

  useEffect(() => {
    setHistory(h => {
      let path = splitPathname(pathname)
      if (h.length > path.length) {
        back()
      }
      return path
    })
  }, [pathname]);

  return (
    <div className="bg-white p-3">
      {currentNode && (
        <Table>
          <TableCaption>
            <TableCaptionHistory
              history={history}
              onChange={(i) =>
                back(i + 1 !== history.length ? history.length - (i + 1) : 0)
              }
            />
            {currentNodeIsFile ? (
              <div className="my-2">
                <Button onClick={() => saveText()}>Save</Button>
              </div>
            ) : (
              <Controls
              onBack={() => back()}
                onChangeFileType={setNewFileType}
                fileType={newFileType}
              />
            )}
          </TableCaption>

          <TableHead names={tableNames} />

          <TableBody>
            {(!searched.length || (searched.length && !search)) &&
              expanded.map((item) => {
                return (
                  <TableFileItem key={item.key} node={item} onDelete={deleteNode} onExpand={expand}/>
                );
              })}

            {!!searched.length &&
              search &&
              searched.map((item, i) => {
                return (
                  <TableRow key={i}>
                    <TableCell>{item.matched}</TableCell>
                    <TableCell onClick={() => goToPath(item.path)}>
                      {[treeRef.current?.root.key, ...item.path].join(" > ")}
                    </TableCell>
                  </TableRow>
                );
              })}

            {newFileType && (
              <tr>
                <TableCell>
                  <TableCreateItemInput
                    fileType={newFileType}
                    onCreate={addNewElement}
                  />
                </TableCell>
                <TableCell>Enter file or folder name</TableCell>
              </tr>
            )}
          </TableBody>
        </Table>
      )}
      {currentNodeIsFile && (
        <textarea
          className="w-full mt-2 border border-slate-200"
          name=""
          id=""
          value={text}
          onInput={(e: any) => setText(e.target.value)}
        ></textarea>
      )}
      <div className="py-4">
        <Button onClick={() => save()}>Save</Button>
      </div>
    </div>
  );
}
