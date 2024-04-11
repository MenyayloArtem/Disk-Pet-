"use client"

import { Commit, FileCommit, FileNode, readFile } from "../fileHelpers"
import copy from "./copy"

export interface NestedObject {
    [x : string] : any
}

const ignoreKeys = ["_value","_meta"]

export default async function makeCommit (initialTree : FileNode, changedTree : FileNode) {
    const commits : FileCommit[] = []
    const ignore = []

  async function recursive (tree1 : FileNode, tree2 : FileNode, path : string[] = []) {

    if (!tree1 || !tree2) {
      return
    }

    if (tree1.children) {
      for (let node of tree2.children!) {
        let node1 = tree1.children.find(n => n.name == node.name)
        if (!node1) {
          let commit : FileCommit = {path : [...path, node.name], type : "new", content : undefined}

          if (node.children) {
              await recursive({
                name : '',
                children : []
              }, node, [...path, node.name])
          } else {
            commit.content = node.values


          }
          commits.push(commit)
          
        } else {
        ignore.push(node)

          if (node.values?._meta.updated != node1.values?._meta.updated) {
            let fileContent = await readFile([initialTree.name,...path, node.name])
            if (node.values?.data != fileContent) {
              let commit : FileCommit = {path : [...path, node.name], type : "update", content : node.values!}
              commits.push(commit)
            }
            
          }
        }
        
        await recursive(node1!, node, [...path, node.name])
      } 

      let deleted = tree1.children!.filter(node => {
        return !tree2.children!.find(c => c.name === node.name)
      })

      deleted.forEach(item => {
        commits.push({path : [...path, item.name], type : "delete"})
      })
    } 
  }

  let initialTreeCopy = copy(initialTree)
  let changedTreeCopy = copy(changedTree)

  await recursive(initialTreeCopy,changedTreeCopy)

  console.log(commits)
  return commits
}