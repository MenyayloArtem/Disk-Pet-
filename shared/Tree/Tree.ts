import { TreeNodeValue } from "@/app/files/[...path]/page";
import NamedStack from "../Stack/NamedStack";
import { excludeIngoneKeys } from "../functions/makeCommit";

export type TreeSearchItem<T> = { node: TreeNode<T>, matched: string }

export class TreeNode<T> {
  key: string;
  value: T;
  parent: TreeNode<T> | null;
  children: {
    [x: string]: TreeNode<T>;
  } | null;

  constructor(
    key: string,
    value: any,
    parent: TreeNode<T> | null = null,
    children: {} | null = {}
  ) {
    this.key = key;
    this.value = value;
    this.parent = parent;
    this.children = children;
  }

  public expand() {
    if (this.children) {
      return Object.keys(this.children);
    } else {
      return [];
    }
  }
}

export default class Tree<T extends TreeNodeValue> {
  root: TreeNode<T>;
  current: TreeNode<T>;
  history = new NamedStack<TreeNode<T>>();
  initialJson : Object

  constructor(rootName: string) {
    this.root = new TreeNode(rootName, {});
    this.current = this.root;
    this.history.push(this.current, rootName);
    this.initialJson = this.getJson()
  }

  public addNode(key: string, value: any = {}, isLeaf = false) {
    let node = new TreeNode(key, value, this.current, isLeaf ? null : {});
    if (this.current.children) {
      this.current.children[key] = node;
    } else {
      throw new Error("Trying append child to the leaf");
    }
  }

  public setCurrent(key: string | string[]) {
    if (Array.isArray(key)) {
      this.goToRoot()
      key.forEach(k => this.setCurrent(k))
    } else {
      if (this.current.children) {
        let next = this.current.children[key];

        if (next) {
          this.current = next;
          this.history.push(this.current, key);
        }
      }
    }
  }

  public goToRoot() {
    this.current = this.root;
    this.history.clear();
    this.history.push(this.current, this.current.key);
  }

  public back(steps?: number) {
    let prev = this.history.pop(steps);

    if (prev) {
      this.current = prev.data;
    }
  }

  public getJson(node?: TreeNode<T>, data: {
    [x : string] : any
  } = {}) {
    if (!node) {
      node = this.root;
    }

    for (let i in node.children) {
      let item = node.children[i];
      if (item.children) {
        data[item.key] = {};
      } else {
        if (Object.keys(item.value as any).length) {
          data[item.key] = {_value : item.value}
        } else {
          data[item.key] = {_value : {data : ""}}
        }
        data[item.key] = null
      }

        // console.log(data[item.value])
      


      
      this.getJson(item, data[item.key]);
    }

    return data;
  }

  public search(
    name: string,
    node = this.root,
    result: TreeSearchItem<T>[] = []
  ) {
    for (let i in node.children) {
      let item = node.children[i];
      let matched = item.key.match(name)
      if (matched) {
        result.push({
          node: item, matched: matched.input!
        });
      }
      this.search(name, item, result);
    }

    return result;
  }

  public getPath(node: TreeNode<T>) {
    let item = node;
    let res = [];

    while (item.parent) {
      res.push(item.key);
      item = item.parent;
    }

    return res.reverse();
  }

  public static createFromJson<T extends TreeNodeValue>(name: string, json: any) {
    const tree = new Tree<T>(name)

    function parseJson(js = json) {

      if (js) {
        let keys = Object.keys(js)
        for (let key of excludeIngoneKeys(js)) {
          if ((js[key])) {
            tree.addNode(key)
            tree.setCurrent(key)
            parseJson(js[key])
            tree.back()
          } else {
            tree.addNode(key, {data : ""}, true)
          }

        }
      }
    }


    parseJson()

    return tree
  }
}
