

// import * as Oni from "oni-api"

import { shell } from "electron"

export const activate = (oni: any) => {

    const openUrl = (url: string) => {
        shell.openExternal(url)
    }

    oni.commands.registerCommand({
        command: "browser.openUrl",
        execute: openUrl,
    })
}
