"use client";

import TableCell from "@/components/TableCell/TableCell";
import TableRow from "@/components/TableRow/TableRow";
import Tree, { TreeNode, TreeSearchItem } from "@/shared/Tree/Tree";
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
import { usePathname, useSearchParams } from "next/navigation";
import TableFileItem, {
  checkFileIcon,
} from "@/components/TableFileItem/TableFileItem";
import splitPathname from "@/shared/functions/splitPathname";
import IconSave from "@/components/svg/Save";
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
    name: "Updated",
  },
  {
    name: "",
    width: "100px",
  },
];

type FileTree = Tree<FileNodeValue>;
type FileTreeNode = TreeNode<FileNodeValue>;

export default function Page(props: Props) {
  const [currentNode, setCurrentNode] = useState<FileTreeNode | null>(null);
  const [history, setHistory] = useState<string[]>([]);
  const treeRef = useRef<FileTree>();
  const [newFileType, setNewFileType] = useState<FileTypes | null>(null);
  const [expanded, setExpanded] = useState<FileTreeNode[]>([]);
  const [initialTree, setInitialTree] = useState<any>(null);
  const [search, setSearch] = useState<TreeSearchItem<FileNodeValue>[]>([]);
  const [text, setText] = useState<string>("");
  const [currentNodeIsFile, setCurrentNodeIsFile] = useState<boolean>(false);
  const [searched, setSearched] = useState<
    {
      matched: string;
      path: string[];
    }[]
  >([]);

  const pathname = usePathname();
  const query = useSearchParams();
  const searchQuery = query.get("search");

  const update = (history?: string[]) => {
    if (treeRef.current) {
      setCurrentNode(
        history ? treeRef.current.setCurrent(history) : treeRef.current.current
      );
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
      makeCommit(initialTree, treeRef.current.getJson())
        .then((commits) => {
          return saveByCommits(props.params.path[0], commits);
        })
        .then((res) => {
          console.log(res);
        })
        .catch((err) => {
          console.warn(err);
          alert("Ошибка: Недостаточно места для сохранения");
        });
    }
  };

  const expand = (key: string) => {
    if (treeRef.current) {
      treeRef.current.setCurrent(key);
      window.history.pushState(
        null,
        "",
        `/files/${treeRef.current.history.names.filter((n) => n).join("/")}`
      );
      update();
    }
  };

  const back = (steps: number = 1) => {
    if (
      treeRef.current &&
      steps !== 0 &&
      treeRef.current.history.names.length > 1
    ) {
      treeRef.current.back(steps);
      window.history.replaceState(
        null,
        "",
        `/files/${treeRef.current.history.names.filter((n) => n).join("/")}`
      );
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
    window.history.replaceState(
      null,
      "",
      `/files/${props.params.path[0]}/${path.join("/")}`
    );
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
    setText("");
    if (currentNodeIsFile) {
      readFile(splitPathname(pathname))
        .then((res: any) => {
          setText(res);
        })
        .catch((e) => {
          console.warn(e);
        });
    }
  }, [currentNodeIsFile]);

  useEffect(() => {
    setHistory(splitPathname(pathname));
  }, [pathname]);

  useEffect(() => {
    update(history);
  }, [history]);

  useEffect(() => {
    if (searchQuery && treeRef.current) {
      setSearch(treeRef.current.search(searchQuery));
    }
  }, [searchQuery, treeRef.current]);

  return (
    <div className="bg-white p-3">
      {currentNode && !searchQuery && (
        <Table>
          <TableCaption>
            <TableCaptionHistory
              history={history}
              onChange={(i) =>
                back(i + 1 !== history.length ? history.length - (i + 1) : 0)
              }
            />
            {currentNodeIsFile ? (
              <div className="mt-4">
                <Button onClick={() => saveText()}>
                  <IconSave width={24} />
                </Button>
              </div>
            ) : (
              <Controls
                onBack={() => back()}
                onChangeFileType={setNewFileType}
                fileType={newFileType}
              />
            )}
          </TableCaption>

          {!currentNodeIsFile && <TableHead names={tableNames} />}

          <TableBody>
            {(!searched.length || (searched.length && !search)) &&
              expanded.map((item) => {
                return (
                  <TableFileItem
                    key={item.key}
                    node={item}
                    onDelete={deleteNode}
                    onExpand={expand}
                  />
                );
              })}
            {newFileType && (
              <tr>
                <TableCell>
                  <TableCreateItemInput
                    fileType={newFileType}
                    onCreate={addNewElement}
                    names={expanded.map((item) => item.key)}
                  />
                </TableCell>
                <TableCell>Enter file or folder name</TableCell>
              </tr>
            )}
          </TableBody>
        </Table>
      )}

      {!!search.length && searchQuery && (
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
            {search.map((item) => {
              let path = treeRef.current!.getPath(item.node);
              return (
                <TableRow key={item.node.key}>
                  <TableCell onClick={() => goToPath(path)}>
                    <div className="flex items-center gap-2">
                      {checkFileIcon(item.node)}
                      {item.node.key}
                    </div>
                  </TableCell>
                  <TableCell onClick={() => goToPath(path)}>
                    {path.join(" > ")}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}

      {searchQuery && !search.length && (
        <div className="flex gap-2 items-center text-lg">
          <div className="text-lg">No result found</div>
          <Button
            onClick={() => window.history.replaceState(null, "", pathname)}
          >
            Back
          </Button>
        </div>
      )}

      {currentNodeIsFile && (
        <textarea
          className="w-full mt-2 border border-slate-200"
          name=""
          id=""
          rows={20}
          value={text}
          onInput={(e: any) => setText(e.target.value)}
        ></textarea>
      )}
      {!searchQuery && (
        <div className="py-4">
          <Button onClick={() => save()}>Save</Button>
        </div>
      )}
    </div>
  );
}
