"use client"

import { Commit } from "../fileHelpers"
import copy from "./copy"

export interface NestedObject {
    [x : string] : any
}

const ignoreKeys = ["_value"]

export function excludeIngoneKeys (obj : Object) {
    return Object.keys(obj).filter(k => !ignoreKeys.includes(k))
}

export function includesIgnoreKey (obj : Object) {
    return Object.keys(obj).some(k => ignoreKeys.includes(k))
}

export default function makeCommit (initialTree : NestedObject, changedTree : NestedObject) {
    const commits : Commit[] = []

  function recursive (tree1 : NestedObject, tree2 : NestedObject, path : string[] = []) {
    if (!tree1 || !tree2) {
      return
    }

    let tree1Keys = tree1 ? Object.keys(tree1) : []
    let tree2Keys = Object.keys(tree2)
    const ignore : string[] = []


    if (tree1Keys) {
      for (let key of tree2Keys) {
        if (!tree1Keys.includes(key)) {
          let commit : Commit = {path : [...path, key], type : "new", content : null}
          

          console.log(tree2[key])
          if (tree2[key] && excludeIngoneKeys(tree2[key]).length) {
            // commit.content = null
            recursive(tree1[key] || [], tree2[key], [...path, key])
          } else if (includesIgnoreKey(tree2[key])) {
            commit.content = tree2[key]?._value || {}
          }
            
          console.log(commit.path)
          commits.push(commit)

        } else {
          ignore.push(key)
        }
        if (tree2[key] && !includesIgnoreKey(tree2[key])) {
          recursive(tree1[key]!,tree2[key]!,[...path,key])
        }
        
      }
    } else {
      return
    }
    
    let deleted = tree1Keys.filter(k => !ignore.includes(k))
    deleted.forEach((d) => {
      let commit : Commit = {path : [...path,d], type : "delete"}
      commits.push(commit)
    })
  }

  let initialTreeCopy = copy(initialTree)
  let changedTreeCopy = copy(changedTree)

  console.log(initialTreeCopy,changedTreeCopy)

  recursive(initialTreeCopy,changedTreeCopy)

  console.log(commits)
  return commits
}