"use server"
import fs from "fs"
import path from "path"
import Tree, { TreeNode } from "./Tree/Tree"

export const createFolder = async (name : string) => {
    fs.mkdir(path.join(process.cwd(), "structures", name), {}, () => {
        console.log("ok")
    })
}

export const readFolder = async (fpath : string|string[]) : Promise<string[]> => {
    return new Promise((resolve, reject) => {
        let p = fpath as string[]
        if (!Array.isArray(fpath)) {
            p = [fpath]
        }
        fs.readdir(path.join(process.cwd(), "structures", ...p), {}, (err, files) => {
            // console.log(files)
            resolve(files as any)
        })
    })
    
}

const readRecursive = async (name : string|null, node : any = {}, p : string[] = []) => {
    if (Object.keys(node).length === 0 && !p.length && name) {
        p = [...p, name]
    }


    
    console.log("p",p)
    let files = await readFolder(p)
    console.log(files)
    for (let i of files) {
        node[i] = {}
        let stat = fs.lstatSync(path.join(process.cwd(), "structures", ...p, i))
        if (stat.isFile()) {
            node[i] = null
        } else {
            await readRecursive(null, node[i],[...p,i])
        }
        
    }

    console.log(node)
    return node
}

const readRecursive1 = async ( tree : Tree, p : string[] = []) => {
    let files = await readFolder(p)
    tree.setCurrent(p)
    // console.log(tree.current.key, files)
    for (let i of files) {
        
        let stat = fs.lstatSync(path.join(process.cwd(), "structures", ...p, i))
        if (stat.isFile()) {
        tree.addNode(i,0,true)
            // tree.goToRoot()
        } else {
            tree.setCurrent([...p,i])
            tree.addNode(i)
            // await readRecursive(null,tree,[...p,i])
        }
    }

    let keys = Object.keys(tree.current.children)
    
    if (keys.length) {
        for (let key of keys) {
            if (tree.current.children![key]?.children) {
                await readRecursive(tree, [...p, key])
            }
            // if (tree.current.children && tree.current.children[key]) {
            //     await readRecursive(tree, [...p, key])
            // }
        }
    }

    // console.log(p)
    // console.log(tree.getJson())
    return tree.getJson()
}

export const createTree = async (name : string) => {
    // const tree = new Tree(name)
    // const files = await readFolder(name)
    // for (let i of files) {
    //     console.log(i)
    // }
    const tree = new Tree(name)
    tree.addNode("dir")
    return await readRecursive(name, {}, ["dir"])
}