/**
 * InitializeBufferStage
 *
 * Shows some whitespace on the 'grid'
 */

import * as Oni from "oni-api"
import * as React from "react"

import * as types from "vscode-languageserver-types"

import { ITutorialContext, ITutorialStage } from "./../ITutorial"

export class InitializeBufferStage implements ITutorialStage {
    public get goalName(): string {
        return null
    }

    public async tickFunction(context: ITutorialContext): Promise<boolean> {
        await context.editor.neovim.command(":set listchars=space:·,precedes:·,trail:·")
        await context.editor.neovim.command(":set list!")
        await context.buffer.setLines(0, 9, [
            "                    ",
            "                    ",
            "                    ",
            "                    ",
            "                    ",
            "                    ",
            "                    ",
            "                    ",
            "                    ",
            "                    ",
        ])

        await context.buffer.setCursorPosition(0, 0)

        return true
    }

    public render(context: Oni.BufferLayerRenderContext): JSX.Element {
        return null
    }
}
