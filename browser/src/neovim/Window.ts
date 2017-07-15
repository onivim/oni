import * as msgpack from "./MsgPack"
import { Session } from "./Session"

export interface IWindow {
    isValid(): Promise<boolean>
    getDimensions(): Promise<IWindowDimensions>
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

    constructor(
        private _windowReference: msgpack.NeovimWindowReference,
        private _session: Session,
    ) { }

    public isValid(): Promise<boolean> {
        return this._session.request<boolean>("nvim_win_is_valid", [this._windowReference])
    }

    public getPosition(): Promise<IWindowPosition> {
        return this._session.request<number[]>("nvim_win_get_position", [this._windowReference])
            .then((pos: number[]) => ({
                row: pos[0],
                col: pos[1],
            }))
    }

    public getWidth(): Promise<number> {
        return this._session.request<number>("nvim_win_get_width", [this._windowReference])
    }

    public getHeight(): Promise<number> {
        return this._session.request<number>("nvim_win_get_height", [this._windowReference])
    }

    public getDimensions(): Promise<IWindowDimensions> {
        return Promise.all([this.getPosition(), this.getWidth(), this.getHeight()])
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
