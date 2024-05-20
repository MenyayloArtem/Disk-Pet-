import Stack from "./Stack";

interface NamedStackItem<T> {
  data: T;
  name: string;
}

export default class NamedStack<T> extends Stack<NamedStackItem<T>> {
  constructor() {
    super();
  }

  // @ts-ignore
  public override push(item: T, name: string) {
    this.body.push({
      name: name,
      data: item,
    });
  }

  get names() {
    return this.body.map((i) => i.name);
  }
}
