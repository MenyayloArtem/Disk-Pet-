"use server"
import fs from "fs"
import { readdir, stat } from "fs/promises"
import path, { resolve } from "path"
import Tree, { TreeNode } from "./Tree/Tree"
import getFolderSize from 'get-folder-size';

const mainFolder = "structures"

export const dirSize = async () => {
    let size = await getFolderSize.loose(path.join(process.cwd(), mainFolder))
    return size
}


export const createFolder = async (p: string[], name: string) => {
    fs.mkdir(path.join(process.cwd(), mainFolder, ...p, name), {}, (err) => {
        if (err) {
            throw new Error(err.message)
        }
    })
}

export const createFile = async (p: string[], name: string, value: string) => {
    fs.writeFile(path.join(process.cwd(), mainFolder, ...p, name), value, (err) => {
        if (err) {
            throw new Error(err.message)
        }
    })
}

export const removeFile = async (p: string[]) => {
    fs.unlink(path.join(process.cwd(), mainFolder, ...p,), (err) => {
        if (err) {
            throw new Error(err.message)
        }
    })
}

export const readFolder = async (fpath: string | string[]): Promise<string[]> => {
    return new Promise((resolve, reject) => {
        let p = fpath as string[]
        if (!Array.isArray(fpath)) {
            p = [fpath]
        }
        fs.readdir(path.join(process.cwd(), mainFolder, ...p), {}, (err, files) => {
            resolve(files as any)
            if (err) reject(err)
        })
    })
}

const joinPath = (p: string[]) => {
    return path.join(process.cwd(), mainFolder, ...p)
}

export const readFile = async (p: string[]) => {
    return new Promise((resolve, reject) => {
        fs.readFile(joinPath(p), {
            encoding: "utf-8"
        }, (err, data) => {
            if (err) {
                reject(err)
            }
            resolve(data)
        })
    })
}

// readFile(["dir", "gdfgdf", "nest2", "nest3","file.txt"])

export interface INode<T>{
    children : INode<T>[]|null,
    name : string,
    values? : T 
}

export interface FileNodeValue {
    _meta : {
        created : number,
        updated : number
    },
    data? : string
}

export type FileNodeJson = INode<FileNodeValue>

const readRecursive = async (name: string | null, p: string[] = []) => {
    let node : FileNodeJson = {
        children : [],
        name : name || ""
    }
    if (name) {
        p = [...p, name]
    }

    try {
        let files = await readFolder(p)
        for (let filename of files) {
            let stat = fs.lstatSync(path.join(process.cwd(), mainFolder, ...p, filename))
            let newNode : FileNodeJson = {
                values : {
                    _meta: {
                        created: new Date(stat.birthtime).getTime(),
                        updated: new Date(stat.atime).getTime()
                    }
                },
                name: filename,
                children : []
            }
            
            if (stat.isFile()) {
                newNode.children = null
                node.children?.push(newNode)
            } else {
                let rf = await readRecursive(filename,p)
                // newNode.name = filename

                node.children?.push({...newNode,...rf})
            }
        }
    }
    catch (e) {
        console.error(e)
        return null
    }


    return node
}

export interface Commit<T> {
    path: string[],
    type: "new" | "update" | "delete",
    content?: T
}

export type FileCommit = Commit<FileNodeValue>

export const createTree = async (name: string) : Promise<FileNodeJson|null>=> {
    const tree = new Tree(name)
    tree.addNode(name)
    return await readRecursive(name)
}

export const saveByCommits = (root: string, commits: FileCommit[]) => {
    let sorted = commits.sort((a, b) => a.path.length - b.path.length)
    sorted.forEach(commit => {
        let itemPath = commit.path.slice(0, -1)
        let itemName = commit.path.at(-1)
        if (commit.type == "new") {
            if (commit.content) {
                createFile([root, ...itemPath], itemName!, commit.content?.data || "")
            } else {
                createFolder([root, ...itemPath], itemName!)
            }
        } else if (commit.type == "delete") {
            removeFile([root, ...itemPath, itemName!])
        } else if (commit.type == "update") {
            createFile([root, ...itemPath], itemName!, String(commit.content?.data))
        }
        
    })
}