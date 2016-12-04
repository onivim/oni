import * as Q from "q"

export interface IWindow {
    isValid(): Q.Promise<boolean>
}

export class Window implements IWindow {
    private _windowInstance: any

    constructor(windowInstance: any) {
        this._windowInstance = windowInstance
    }

    public isValid(): Q.Promise<boolean> {
        return Q.ninvoke<boolean>(this._windowInstance, "isValid")
    }
}
