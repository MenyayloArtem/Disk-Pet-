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
                console.log(this.body)
                this.body.splice(-steps,steps)
                console.log(this.body)
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