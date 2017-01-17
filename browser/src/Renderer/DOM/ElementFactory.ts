export interface IElementFactory {
    getElement(): HTMLSpanElement
    recycle(element: HTMLSpanElement): void
}

export class DocumentElementFactory {
    private _rootElement: HTMLElement

    constructor(rootElement: HTMLElement) {
        this._rootElement = rootElement
    }

    public getElement(): HTMLSpanElement {
        const elem = document.createElement("span")
        this._rootElement.appendChild(elem)
        return elem
    }

    public recycle(element: HTMLSpanElement): void {
        element.remove()
    }
}

export class RecycleElementFactory {
    private _recycledElements: HTMLSpanElement[] = []
    private _rootElement: HTMLElement

    constructor(rootElement: HTMLElement) {
        this._rootElement = rootElement
    }

    public getElement(): HTMLSpanElement {

        if (this._recycledElements.length > 0) {
            let val = this._recycledElements.pop()
            if (val) {
                return val
            }
        }

        const elem = document.createElement("span")
        this._rootElement.appendChild(elem)
        return elem
    }

    public recycle(element: HTMLSpanElement): void {
        element.className = ""
        element.textContent = ""
        element.style.left = "-1000px"
        element.style.top = "-1000px"
        element.style.backgroundColor = ""
        element.style.color = ""
        this._recycledElements.push(element)
    }
}
