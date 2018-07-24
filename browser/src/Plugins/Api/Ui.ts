import { getFileIcon } from "../../Services/FileIcon"
import { getInstance } from "../../Services/IconThemes"
import { Icon, IconProps, IconSize } from "../../UI/Icon"

export class Ui {
    constructor(private _react: any) {}

    public createIcon(props: IconProps): any {
        return this._react.createElement(Icon, props)
    }

    public getIconClassForFile(filename: string, language?: string): string {
        const Icons = getInstance()
        return Icons.getIconClassForFile(filename, language)
    }

    public getFileIcon(fileName: string): any {
        return getFileIcon(fileName)
    }

    public get iconSize(): any {
        return IconSize
    }
}
