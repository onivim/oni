const path = require("path")
const os = require("os")

import * as React from "react" 

import { MarkdownPreview } from "./MarkdownPreview"

export class MarkdownPreviewEditor implements Oni.Editor {

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

    public render(): JSX.Element {
        return <MarkdownPreview />
    }

    public init(filesToOpen: string[]): void {
        
    }
}

export const activate = (oni) => {

    oni.commands.registerCommand("markdown.preview", (args) => {
        oni.windows.split(1, new MarkdownPreviewEditor(oni))
    })

}
