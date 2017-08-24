const path = require("path")
const os = require("os")

import * as React from "react" 

import { MarkdownPreview } from "./MarkdownPreview"

export class MarkdownPreviewEditor implements Oni.Editor {

    public get mode(): string {
        return "external"
    }

    // onModeChanged: TODO
    public get onModeChanged(): any {
        return null
    }

    public render(): JSX.Element {
        return <MarkdownPreview />
    }

    public init(filesToOpen: string[]): void {
        
    }
}

export const activate = (Oni) => {

    Oni.commands.registerCommand("markdown.preview", (args) => {
        Oni.windows.split(1, new MarkdownPreviewEditor())
    })

}
