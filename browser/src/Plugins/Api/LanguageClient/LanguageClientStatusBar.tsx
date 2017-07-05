/**
 * LanguageClientStatusBar.tsx
 *
 * Implements status bar for Oni
 */

import * as React from "react"

import { Oni } from "./../Oni"

export class LanguageClientStatusBar {

    constructor(private _oni: Oni) {
        const item = this._oni.statusBar.createItem(0, 0)
        item.setContents(<h1>Hello</h1>)
        item.show()
    }

    // show(fileType: string): void {

    // }

    // hide(): void {

    // }

    // setStatus(): void {

    // }
}
