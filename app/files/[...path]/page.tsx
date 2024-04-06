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
import { Commit, createFile, createFolder, createTree, p, readFolder } from "@/shared/fileHelpers";
import TableCaptionHistory from "@/components/TableCaptionHistory/TableCaptionHistory";
import Controls from "@/components/Controls/Controls";
import TableCreateItemInput from "@/components/TableCreateItemInput/TableCreateItemInput";
import { useRouter } from "next/navigation";
import { Router } from "next/router";
import Table from "@/components/Table/Table";
import TableCaption from "@/components/TableCaption/TableCaption";
import TableHead from "@/components/TableHead/TableHead";
import TableBody from "@/components/TableBody/TableBody";
import Button from "@/components/ui/Button/Button";
export type FileTypes = "file" | "folder" | null;

function getPercents(val: number, max: number) {
  return (val / max) * 100;
}

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

export default function Page(props : Props) {
  const maxSize = 1024;
  const router = useRouter()
  const [currentNode, setCurrentNode] = useState<TreeNode | null>(null);
  const [history, setHistory] = useState<string[]>([]);
  const treeRef = useRef<Tree>();
  const [newFileType, setNewFileType] = useState<FileTypes | null>(null);
  const [expanded, setExpanded] = useState<string[]>([]);
  const [initialTree, setInitialTree] = useState<any>(null)

  const [search, setSearch] = useState<string>("");
  const [commits, setCommits] = useState<Commit[]>([])
  const [searched, setSearched] = useState<
    {
      matched: string;
      path: string[];
    }[]
  >([]);

  useEffect(() => {
    let path = props.params.path
    let n = path[0]
    createTree(n)
      .then((res: any) => {
        let tree = Tree.createFromJson(n || "root", res)
        treeRef.current = tree;
        treeRef.current.setCurrent(path.slice(1))
        let d = treeRef.current.getJson();
        setInitialTree(d)
        update();
      })

  }, []);

  const update = () => {
    if (treeRef.current) {
  
      setCurrentNode(treeRef.current.current);
      setHistory(treeRef.current.history.names);
      setExpanded(treeRef.current.current.expand());
    }
  };

  function recursiveNest (tree : any, pathes : string[][] = [], currPath : string[] = []) {
    for (let key of Object.keys(tree)) {
      
      let p = [...currPath, key]
    
      pathes.push(p)
    }

    for (let key of Object.keys(tree)) {
      
      if (tree[key]) {
        recursiveNest(tree[key], pathes, [...currPath, key])
      }
      // pathes.push(currPath)
    }

    return pathes
  }

  function recursive (tree1 : {[x : string] : any}, tree2 : {[x : string] : any}, path : string[] = []) {

    // console.log("res")
    if (!tree1 || !tree2) {
      return
    }

    let tree1Keys = Object.keys(tree1)
    let tree2Keys = Object.keys(tree2)
    const ignore : string[] = []

    if (tree1Keys.length) {
      for (let key of tree2Keys) {
        if (!tree1Keys.includes(key)) {
          let commit : Commit = {path : [...path, key], type : "new"}
          setCommits(c => [...c, commit])


          let nested = tree2[key]

          if (nested) {
            let pathes = recursiveNest(nested)
            pathes.forEach(p => {
              setCommits(c => [...c, {
                path : [...path, key,...p],
                type : "new"
              }])
            })
          }

        } else {
          ignore.push(key)
        }
        // @ts-ignore
        recursive(tree1[key]!,tree2[key]!,[...path,key])
      }
    } else {
      return
    }
    

    let deleted = tree1Keys.filter(k => !ignore.includes(k))
    deleted.forEach((d) => {
      setCommits(c => [...c, {path : [...path,d], type : "delete"}])
    })
  }

  const save = () => {
    // console.log(props.params.path[0], treeRef.current)
    console.log("save")
    if (treeRef.current) {
      // console.log(initialTree, treeRef.current.getJson())

      

      recursive(JSON.parse(JSON.stringify(initialTree)), treeRef.current.getJson())
    }
  }

  useEffect(() => {
    console.log(commits)
  }, [commits])

  useEffect(() => {
    if (history.length) {
      window.history.pushState(null,"title", `/files/${history.join("/")}`)
    }
  }, [history])

  const expand = (key: string) => {
    if (treeRef.current) {
      if (treeRef.current.current?.children![key].children) {
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
                  <Controls
                    onChangeFileType={setNewFileType}
                    fileType={newFileType}
                  />
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
