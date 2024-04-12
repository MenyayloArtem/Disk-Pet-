// import { TreeNodeValue } from "@/app/files/[...path]/page";
import NamedStack from "../Stack/NamedStack";
import { FileNodeJson } from "../fileHelpers";

export type TreeSearchItem<T> = { node: TreeNode<T>; matched: string };

export class TreeNode<T> {
  key: string;
  value: T;
  parent: TreeNode<T> | null;
  children: TreeNode<T>[] | null = [];

  constructor(
    key: string,
    value: any,
    parent: TreeNode<T> | null = null,
    children: TreeNode<T>[] | null = []
  ) {
    this.key = key;
    this.value = value;
    this.parent = parent;
    this.children = children;
  }

  public expand() {
    if (this.children) {
      return this.children
    } else {
      return [];
    }
  }

  public getNode(key: string) {
    if (this.children) {
      return this.children.find((node) => node.key == key);
    }
  }

  public setNode(key: string, newNode: TreeNode<T>) {
    let node = this.getNode(key);
    if (node) {
      node = newNode;
    }
  }

  public deleteChildKey (key : string) {
    let indexToDelete = this.children?.findIndex(node => node.key == key)
    if (Number(indexToDelete) >= 0) {
      this.children?.splice(Number(indexToDelete),1)
    }
  }
}

export default class Tree<T> {
  root: TreeNode<T>;
  current: TreeNode<T>;
  history = new NamedStack<TreeNode<T>>();
  initialJson: Object;

  constructor(rootName: string) {
    this.root = new TreeNode(rootName, {});
    this.current = this.root;
    this.history.push(this.current, rootName);
    this.initialJson = this.getJson();
  }

  public getNode(key: string) {
    if (this.current.children) {
      return this.current.getNode(key);
    }
  }

  public setNode(key: string, newNode: TreeNode<T>) {
    this.current.setNode(key, newNode);
  }

  public addNode(key: string, value: any = {}, isLeaf = false) {
    let node = new TreeNode(key, value, this.current, isLeaf ? null : []);
    if (this.current.children) {
      this.current.children.push(node);
    } else {
      throw new Error("Trying append child to the leaf");
    }
  }

  public setCurrent(key: string | string[]) {
    if (Array.isArray(key)) {
      this.goToRoot();
      key.forEach((k) => this.setCurrent(k));
    } else {
      if (this.current.children) {
        let next = this.current.getNode(key);

        if (next) {
          this.current = next;
          this.history.push(this.current, key);
        }
      }
    }

    return this.current
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

  public getJson(
    node?: TreeNode<T>,
    data: FileNodeJson = {
      name : this.root.key,
      children : []
    }
  ) {
    if (!node) {
      node = this.root;
    }

    if (node.children) {
      for (let item of node.children) {
        let newNode : FileNodeJson = {
          name : item.key,
          children : [],
          values : item.value as any
        }
        if (item.children) {
          data.children?.push(newNode)
            this.getJson(item,data.children?.at(-1))
        } else {
          newNode.children = null
          data.children?.push(newNode)
        }
      }
    }

    return data;
  }

  public search(
    name: string,
    node = this.root,
    result: TreeSearchItem<T>[] = []
  ) {
    if (node.children) {
      for (let item of node.children) {
        let matched = item.key.match(name);
        if (matched) {
          result.push({
            node: item,
            matched: matched.input!,
          });
        }
        this.search(name, item, result);
      }
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

  public static createFromJson<T>(
    name: string,
    json: FileNodeJson
  ) {
    const tree = new Tree<T>(name);

    function parseJson(js = json) {
      if (js.children) {
        for (let node of js.children) {
          if (node.children) {
            tree.addNode(node.name,node.values);
            tree.setCurrent(node.name);
            parseJson(node);
            tree.back();
          } else {
            tree.addNode(node.name, node.values, true);
          }
        }
      }
    }

    parseJson();

    return tree;
  }
}
