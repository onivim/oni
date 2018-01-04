/**
 * oni-layer-browser/index.ts
 *
 * Entry point for browser integration plugin
 */
import * as React from "react"

import * as Oni from "oni-api"

import styled from "styled-components"

// import { shell } from "electron"

const Column = styled.div`
`



export class BrowserLayer implements Oni.EditorLayer {

    public get id(): string {
        return "oni.browser"
    }

    public render(): JSX.Element {
        return null
        // return <Column>
        // <div style={{width: "100%", height: "100%", backgroundColor: "red"}}></div>
        //         </Column>
    }
}

export const activate = (oni: Oni.Plugin.Api) => {

    const openUrl = async (url: string) => {
        // TODO: Use embedded browser if configuration option is set
        // shell.openExternal(url)

        const buffer: Oni.Buffer = await (oni.editors.activeEditor as any).newFile(null)

        buffer.addLayer(new BrowserLayer())
    }

    oni.commands.registerCommand({
        command: "browser.openUrl",
        execute: openUrl,
        name: null,
        detail: null,
    })
}
