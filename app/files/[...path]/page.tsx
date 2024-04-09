"use client";

import TableCell from "@/components/TableCell/TableCell";
import TableRow from "@/components/TableRow/TableRow";
import IconFile from "@/components/svg/File";
import IconFolder from "@/components/svg/Folder";
import Tree, { TreeNode } from "@/shared/Tree/Tree";
import { useCallback, useEffect, useRef, useState } from "react";
import { Commit, createFile, createFolder, createTree, readFile, readFolder, saveByCommits } from "@/shared/fileHelpers";
import TableCaptionHistory from "@/components/TableCaptionHistory/TableCaptionHistory";
import Controls from "@/components/Controls/Controls";
import TableCreateItemInput from "@/components/TableCreateItemInput/TableCreateItemInput";
import Table from "@/components/Table/Table";
import TableCaption from "@/components/TableCaption/TableCaption";
import TableHead from "@/components/TableHead/TableHead";
import TableBody from "@/components/TableBody/TableBody";
import Button from "@/components/ui/Button/Button";
import makeCommit from "@/shared/functions/makeCommit";
import { Router } from "next/router";
import { useParams, useRouter, useSearchParams } from "next/navigation";
export type FileTypes = "file" | "folder" | null;

interface Props {
    params : {
        path : string[]
    }
}

const tableNames = [{
  name : "Folder Name",
  width : "30%"
},
{
  name : "Info"
}]

export interface TreeNodeValue {
  data : string
}

export default function Page(props : Props) {
  const [currentNode, setCurrentNode] = useState<TreeNode<TreeNodeValue> | null>(null);
  const [history, setHistory] = useState<string[]>([]);
  const treeRef = useRef<Tree<TreeNodeValue>>();
  const [newFileType, setNewFileType] = useState<FileTypes | null>(null);
  const [expanded, setExpanded] = useState<string[]>([]);
  const [initialTree, setInitialTree] = useState<any>(null)
  const params = useParams()
  const router = useRouter()

  const [search, setSearch] = useState<string>("");
  const [searched, setSearched] = useState<
    {
      matched: string;
      path: string[];
    }[]
  >([]);

  Router.events.on("hashChangeStart", () => {
    console.log("change")
  })

  const [text, setText] = useState<string>("")

  const [currentNodeIsFile, setCurrentNodeIsFile] = useState<boolean>(false)

  useEffect(() => {
    if (treeRef.current) {
      setCurrentNodeIsFile(!treeRef.current.current.children)
    }
  }, [treeRef.current?.current])

  useEffect(() => {
    let path = props.params.path
    let n = path[0]
    createTree(n)
      .then((res: any) => {
        let tree = Tree.createFromJson<TreeNodeValue>(n || "root", res)
        treeRef.current = tree;
        treeRef.current.setCurrent(path.slice(1))
        // treeRef.current.initialJson = treeRef.current.getJson()
        let json = JSON.parse(JSON.stringify(treeRef.current.getJson()));
        setInitialTree(json)
        update();
        let tree1 = Tree.createFromJson(n || "root",json)
        let json1 = tree1.getJson()
        let str1 = JSON.stringify(json)
        let str2 = JSON.stringify(json1)
        console.log(res)
        console.log(json)
        console.log(json1)
        console.log(str1 == str2)
      })

  }, []);

  const update = () => {
    if (treeRef.current) {
      setCurrentNode(treeRef.current.current);
      setHistory(treeRef.current.history.names);
      setExpanded(treeRef.current.current.expand());
    }
  };

  const saveText = () => {
    if (currentNodeIsFile && treeRef.current) {
      treeRef.current.current.value = {
        data : text
      }
    }
  }

  useEffect(() => {
    console.log(params)
  },[ params])

  useEffect(() => {
    if (currentNodeIsFile) {
      setText("")
      readFile(props.params.path)
      .then((res : any) => {
        setText(res)
      })
    }
  }, [currentNodeIsFile])

  useEffect(() => {
    console.log(treeRef.current?.current)
  },[ treeRef?.current])

  const save = () => {
    console.log("save")
    if (treeRef.current) {
      let commits = makeCommit(initialTree, treeRef.current.getJson())
      saveByCommits(props.params.path[0],commits)
    }
  }

  useEffect(() => {
    if (history.length) {
      // window.history.pushState(null,"title", `/files/${history.join("/")}`)
      router.push(`/files/${history.join("/")}`)
    }
  }, [history])

  const expand = (key: string) => {
    if (treeRef.current) {
      if (true) {
        console.log(key)
        treeRef.current.setCurrent(key);

        update();
      }
    }
  };

  const back = (steps?: number) => {
    if (treeRef.current && steps !== 0) {
      treeRef.current.back(steps);
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

  const goToPath = (path: string[]) => {
    setSearched([]);
    treeRef.current?.setCurrent(path);
    update();
  };

  const checkFileIcon = (key : string) => {
    let isFolder = treeRef.current?.current.children![key].children;
    return isFolder ? (
      <IconFolder width={14} />
    ) : (
      <IconFile width={14} />
    )
  }

  return (
          <div className="bg-white p-3">
            {currentNode && (
              <Table>
                <TableCaption>
                  <TableCaptionHistory
                    history={history}
                    onChange={(i) =>
                      back(
                        i + 1 !== history.length ? history.length - (i + 1) : 0
                      )
                    }
                  />
                  {currentNodeIsFile ?
                  <div className="my-2">
                    <Button
                    onClick={() => saveText()}
                    >Save</Button>
                  </div> :
                  <Controls
                    onChangeFileType={setNewFileType}
                    fileType={newFileType}
                  />}
                </TableCaption>

                <TableHead names={tableNames}/>

                <TableBody>
                  {(!searched.length || (searched.length && !search)) &&
                    expanded.map((item) => {
                      return (
                        <TableRow key={item}>
                          <TableCell>
                            <div className="flex items-center gap-2"
                              onClick={() => expand(item)}
                            >
                              {checkFileIcon(item)}
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
                        <TableRow key={i}>
                          <TableCell>
                            {item.matched}
                          </TableCell>
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
            {
              currentNodeIsFile && <textarea className="w-full mt-2 border border-slate-200" name="" id=""
              value={text}
              onInput={(e : any) => setText(e.target.value)}
              >


              </textarea>
            }
            <div className="py-4">
              <Button
              onClick={() => save()}
              >
                Save
              </Button>
            </div>
          </div>
  );
}
