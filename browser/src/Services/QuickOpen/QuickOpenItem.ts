// We use basename/dirname for label/detail
// So let's say you want the label YO with detail a greeting
// you would make file = "a greeting/YO"
export enum QuickOpenType {
    bookmark,
    bookmarkHelp,
    file,
    folder,
    folderHelp,
    bufferLine,
    unknown,
}

// Wrapper around quick open items, this not only allows us to show multiple icons
// It also allows us to distinguish what happens once we know their icon
export class QuickOpenItem {
    // We take a type, and then give an fa icon
    public static convertTypeToIcon(type: QuickOpenType): string {
        switch (type) {
            case QuickOpenType.bookmark:
                return "star-o"
            case QuickOpenType.bookmarkHelp:
                return "info"
            case QuickOpenType.file:
                return "file-text-o"
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

    public static convertIconToType(icon: string): QuickOpenType {
        switch (icon) {
            case "star-o":
                return QuickOpenType.bookmark
            case "info":
                return QuickOpenType.bookmarkHelp
            case "file-text-o":
                return QuickOpenType.file
            case "folder-o":
                return QuickOpenType.folder
            case "folder-open-o":
                return QuickOpenType.folderHelp
            case "angle-right":
                return QuickOpenType.bufferLine
            default:
                return QuickOpenType.unknown
        }
    }

    // Each has an item, and an icon
    private _item: string
    private _icon: string
    private _lineNu: number

    public get item(): string {
        return this._item
    }

    public get icon(): string {
        return this._icon
    }

    public get lineNu(): number {
        return this._lineNu
    }

    constructor(item: string, type: QuickOpenType, num?: number) {
        this._item = item
        this._icon = QuickOpenItem.convertTypeToIcon(type)
        this._lineNu = num
    }
}
