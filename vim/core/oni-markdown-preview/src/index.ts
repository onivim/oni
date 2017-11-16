import { MarkdownPreview } from "./MarkdownPreview"

export class MarkdownPreviewEditor implements Oni.IWindowSplit {

    private _markdownPreview: MarkdownPreview

    constructor(
        private _oni: any
    ) {
        this._markdownPreview = new MarkdownPreview()
    }

    public get mode(): string {
        return "external"
    }

    // onModeChanged: TODO
    public get onModeChanged(): any {
        return null
    }

    public init(filesToOpen: string[]): void {
    }


    public render(): JSX.Element {
        return this._markdownPreview.render()
    }
}

const openPreview = (oni: Oni.Plugin.Api) => {
    oni.windows.split(/*SplitDirection.Horizontal*/1, new MarkdownPreviewEditor(oni))
}

export const activate = (oni: Oni.Plugin.Api) => {
    //oni.commands.registerCommand("markdown.preview", openPreview)
    openPreview(oni)
};

