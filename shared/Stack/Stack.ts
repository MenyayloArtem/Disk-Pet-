export default class Stack<T> {
    protected body : T[] = []
    constructor () {}

    public push (item : T) {
        this.body.push(item)
        return item
    }

    public pop (steps? : number) {
        if (this.body.length) {
            if (steps) {
                this.body.splice(-steps,steps)
            } else {
                this.body.pop()
            }
            return this.body.at(-1)
        }
        return null
    }

    clear () {
        this.body = []
    }
}