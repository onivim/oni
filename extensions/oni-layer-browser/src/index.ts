/**
 * oni-layer-browser/index.ts
 *
 * Entry point for browser integration plugin
 */

import * as Oni from "oni-api"

import { shell } from "electron"

export const activate = (oni: Oni.Plugin.Api) => {

    const openUrl = (url: string) => {
        // TODO: Use embedded browser if configuration option is set
        shell.openExternal(url)
    }

    oni.commands.registerCommand({
        command: "browser.openUrl",
        execute: openUrl,
        name: null,
        detail: null,
    })
}
