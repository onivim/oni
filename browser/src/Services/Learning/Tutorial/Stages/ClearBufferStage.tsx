/**
 * TutorialManager
 */

import * as Oni from "oni-api"
import * as React from "react"

import * as types from "vscode-languageserver-types"

import styled, { keyframes } from "styled-components"

import { ITutorialContext, ITutorialStage } from "./../ITutorial"

export class ClearBufferStage implements ITutorialStage {
    public get goalName(): string {
        return null
    }

    public async tickFunction(context: ITutorialContext): Promise<boolean> {
        const allLines = context.buffer.lineCount
        await context.buffer.setLines(0, allLines, [])
        return true
    }

    public render(): JSX.Element {
        return null
    }
}
