//import { MarkdownPreview } from "./MarkdownPreview"
/*
export class MarkdownPreviewEditor implements Oni.IWindowSplit {

    constructor(
        private _oni: any
    ) {}

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
        return null
        //return new MarkdownPreview().render()
    }
}
*/

//const openPreview = (oni: Oni.Plugin.Api) => {
//    oni.windows.split(/*SplitDirection.Horizontal*/0, null/*new MarkdownPreviewEditor(oni)*/)
//}

export const activate = (oni: Oni.Plugin.Api) => {
    //oni.commands.registerCommand("markdown.preview", openPreview)
    //openPreview(oni)
    console.warn("YYY")
};

