import { Icon, IconProps, IconSize } from "../../UI/Icon"

export class Ui {
    constructor(private _react: any) {}

    public createIcon(props: IconProps): any {
        return this._react.createElement(Icon, props)
    }

    public get iconSize(): any {
        return IconSize
    }
}
