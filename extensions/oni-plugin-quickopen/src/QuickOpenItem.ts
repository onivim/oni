import * as path from "path"
import * as Oni from "oni-api"

export enum QuickOpenType {
    bookmark,
    bookmarkHelp,
    file,
    folder,
    folderHelp,
    bufferLine,
}

export function getTypeFromMenuItem(item: Oni.Menu.MenuOption): QuickOpenType {
    return QuickOpenType[item.metadata["qo-type"]]
}

export type IToMenuItem = (qo: QuickOpenItem) => Oni.Menu.MenuOption

// Wrapper around quick open items, this not only allows us to show multiple icons
// It also allows us to distinguish between types of items
export class QuickOpenItem {
    constructor(
        private _label: string,
        private _detail: string,
        private _type: QuickOpenType,
        private _path: string = "N/A",
        private _line: number = 0,
        private _column: number = 0,
    ) {
        this._label = _label.trim()
        this._detail = _detail.trim()
    }

    public toMenuItem(oni: Oni.Plugin.Api, pinned: boolean): Oni.Menu.MenuOption {
        return {
            icon: this.getIcon(oni),
            label: this._label,
            detail: this._detail,
            metadata: {
                "qo-type": QuickOpenType[this._type],
                hash: this.hash,
                path: this._path,
                line: this._line.toString(),
                column: this._column.toString(),
            },
            pinned,
        }
    }

    // TODO: Uncomment ret val, requires exposing in oni-api
    public toQuickFixItem() /*: Oni.QuickFixEntry*/ {
        return {
            filename: this._path,
            lnum: this._line,
            col: this._column,
            text: (this._label + " " + this._detail).trim(),
        }
    }

    public get hash(): string {
        return [
            this._label,
            this._detail,
            QuickOpenType[this._type],
            this._path,
            String(this._line),
            String(this._column),
        ].join("|")
    }

    private getIcon(oni: Oni.Plugin.Api): any {
        // Return a fa icon by type
        switch (this._type) {
            case QuickOpenType.bookmark:
                return "star-o"
            case QuickOpenType.bookmarkHelp:
                return "info"
            case QuickOpenType.file:
                return (oni as any).ui.getFileIcon(this._label)
            case QuickOpenType.folder:
                return "folder-o"
            case QuickOpenType.folderHelp:
                return "folder-open-o"
            case QuickOpenType.bufferLine:
                return "angle-right"
            default:
                return "question-circle-o"
        }
    }
}
