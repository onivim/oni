import * as Q from "q"

import { SessionWrapper } from "./SessionWrapper"

export interface IWindow {
    isValid(): Q.Promise<boolean>
    getDimensions(): Q.Promise<IWindowDimensions>
}

export interface IWindowPosition {
    row: number
    col: number
}

export interface IWindowDimensions extends IWindowPosition {
    width: number
    height: number
}

export class Window implements IWindow {
    private _windowInstance: any
    private _sessionWrapper: SessionWrapper

    constructor(windowInstance: any) {
        this._windowInstance = windowInstance
        this._sessionWrapper = new SessionWrapper(this._windowInstance._session)
    }

    public isValid(): Q.Promise<boolean> {
        return this._sessionWrapper.invoke<boolean>("nvim_win_is_valid", [this._windowInstance])
    }

    public getPosition(): Q.Promise<IWindowPosition> {
        return this._sessionWrapper.invoke<number[]>("nvim_win_get_position", [this._windowInstance])
            .then((pos: number[]) => ({
                row: pos[0],
                col: pos[1],
            }))
    }

    public getWidth(): Q.Promise<number> {
        return this._sessionWrapper.invoke<number>("nvim_win_get_width", [this._windowInstance])
    }

    public getHeight(): Q.Promise<number> {
        return this._sessionWrapper.invoke<number>("nvim_win_get_height", [this._windowInstance])
    }

    public getDimensions(): Q.Promise<IWindowDimensions> {
        return Q.all([this.getPosition(), this.getWidth(), this.getHeight()])
            .then((val: any) => {
                return {
                    row: val[0].row,
                    col: val[0].col,
                    width: val[1],
                    height: val[2],
                }
            })
    }
}
