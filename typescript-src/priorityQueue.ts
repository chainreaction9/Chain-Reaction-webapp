export interface QueueElement {
    element: any,
    priority: number
}
export class PriorityQueue {
    //************************* Private members *******************/
    private _container: Array<QueueElement> = [];

    //************************* Public members *******************/
    public clear(): void {
        this._container.length = 0;
    }
    constructor(listOfElements?: Array<QueueElement>) {
        this._container = [];
        if (listOfElements && listOfElements.length > 0) {
            listOfElements.forEach(element => { this.enqueue(element) });
        }
    }
    public dequeue(): QueueElement {
        if (!this.isEmpty) return this._container.shift();
        else return null;
    }
    public get end(): QueueElement {
        if (!this.isEmpty) return this._container[this.size - 1];
        else return null;
    }
    public enqueue(element: QueueElement): void {
        let isElementAdded: boolean = false;
        for (let i = 0; i < this.size; i++) {
            let previousElement = this._container[i];
            if (element.priority < previousElement.priority) {
                this._container.splice(i, 0, element);
                if (!isElementAdded) isElementAdded = true;
            }
        }
        if (!isElementAdded) this._container.push(element);
    }
    public get front(): QueueElement {
        if (!this.isEmpty) return this._container[0];
        else return null;
    }
    public get isEmpty(): boolean {
        return this._container.length > 0 ? false : true;
    }
    public get size(): number {
        return this._container.length;
    }
}