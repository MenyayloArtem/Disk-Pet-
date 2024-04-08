"use server"
import fs from "fs"
import {readdir, stat} from "fs/promises"
import path from "path"
import Tree, { TreeNode } from "./Tree/Tree"
import getFolderSize from 'get-folder-size';

export const dirSize = async () => {
    let size = await getFolderSize.loose(path.join(process.cwd(), "structures"))
    return size
  }


export const createFolder = async (p : string[],name : string) => {
    fs.mkdir(path.join(process.cwd(), "structures", ...p, name), {}, (err) => {
        if (err) {
            throw new Error(err.message)
        }
    })
}

export const createFile = async (p : string[],name : string,value : string) => {
    fs.writeFile(path.join(process.cwd(), "structures", ...p, name), value, (err) => {
        if (err) {
            throw new Error(err.message)
        }
    })
}

export const readFolder = async (fpath : string|string[]) : Promise<string[]> => {
    return new Promise((resolve, reject) => {
        let p = fpath as string[]
        if (!Array.isArray(fpath)) {
            p = [fpath]
        }
        fs.readdir(path.join(process.cwd(), "structures", ...p), {}, (err, files) => {
            resolve(files as any)
            if (err) reject(err)
        })
    })
    
}

const readRecursive = async (name : string|null, node : any = {}, p : string[] = []) => {
    if (Object.keys(node).length === 0 && !p.length && name) {
        p = [...p, name]
    }

    try {
         let files = await readFolder(p)
        for (let i of files) {
            node[i] = {}
            let stat = fs.lstatSync(path.join(process.cwd(), "structures", ...p, i))
            if (stat.isFile()) {
                node[i] = null
            } else {
                await readRecursive(null, node[i],[...p,i])
            }
        }
    } catch (e) {
        console.error(e)
        return false
    }
    

    return node
}

export interface Commit {
    path : string[],
    type : "new"|"update"|"delete",
    content? : any
}

export const createTree = async (name : string) => {
    const tree = new Tree(name)
    tree.addNode(name)
    return await readRecursive(name, {}, [name])
}

export const p = async () => {
    // const json1 = await readRecursive(dir)
    // const json2 = tree.getJson()
    // const commits : Commit[] = []

    // console.log(json1, json2)
    console.log("gg")

    // function recursiveCommit () {

    // }
}

export const saveByCommits = (root : string ,commits : Commit[]) => {
    let sorted = commits.sort((a,b) => a.path.length - b.path.length)
    // console.log(sorted)
    sorted.forEach(commit => {
        let itemPath = commit.path.slice(0,-1)
        let itemName = commit.path.at(-1)
        if (commit.content) {
            console.log(itemPath, itemName, "file", commit.content)
            createFile([root,...itemPath], itemName!, commit.content?.data || "")
        } else {
            console.log(itemPath, itemName, "folder")
            createFolder([root,...itemPath], itemName!)
        }
    })
}