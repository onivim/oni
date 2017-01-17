export interface IElementFactory {
    getElement(): HTMLSpanElement
    recycle(element: HTMLSpanElement): void
}

/**
 * Recycle implementation for IElementFactory
 *
 * This class puts 'recycled' spans off-screen, so they can be used later.
 * This helps with garbage collection and keeps us from having to create 
 * new elements all the time, which is an expensive operation
 */
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
        element.style.left = "-10000px"
        element.style.backgroundColor = ""
        element.style.color = ""
        this._recycledElements.push(element)
    }
}

/**
 * Reference implementation for IElementFactory
 */
export class DocumentElementFactory implements IElementFactory {
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
