/**
 * VisualModeTutorial.tsx
 *
 * Tutorial for learning how to select text in visual mode.
 */

import * as React from "react"

import { ITutorial, ITutorialMetadata, ITutorialStage } from "./../ITutorial"
import * as Notes from "./../Notes"
import * as Stages from "./../Stages"

const Line1 = "Text can be selectedselected with 'v'."
const Line2 = "Selected text can then be (y)anked, (c)hanged, or (d)eleted with a single keypress"
const Line3 = "To select entire lines, use 'V' to include line-ending characters."
const Line4 = "Selected lines can also be  with a single keypress"
const Line1Marker = "Text can be ".length
const Line1Marker2 = "Text can be selecte".length
const Line1Change = "Text can be selected with 'v'."
const Line2Marker = "Selected text can then be ".length
const Line2Marker2 = "Selected text can then be (y)anked, (c)hanged, or (d)elete".length
const Line4Marker = "Selected lines can also be".length
const Line4PostPaste =
    "Selected lines can also be (y)anked, (c)hanged, or (d)eleted with a single keypress"
const Line3Marker = "To select entire lines, use 'V' to include ".length
const Line3Marker2 = "To select entire lines, use 'V' to include line-endin".length
const Line3Pending = "To select entire lines, use 'V' to include  characters."
const Line3Change = "To select entire lines, use 'V' to include newline characters."
const Line3Marker3 = "To select entire lines, use 'V' to include newlin".length

export class VisualModeTutorial implements ITutorial {
    private _stages: ITutorialStage[]

    constructor() {
        this._stages = [
            new Stages.SetBufferStage([Line1, Line2, Line3, Line4]),
            new Stages.MoveToGoalStage("Move to the goal marker", 0, Line1Marker),
            new Stages.WaitForModeStage("Change to Visual mode with 'v'", "visual"),
            new Stages.MoveToGoalStage("Move to the goal marker", 0, Line1Marker2),
            new Stages.WaitForStateStage("Hit 'd' to delete the selected text", [
                Line1Change,
                Line2,
                Line3,
                Line4,
            ]),
            new Stages.MoveToGoalStage("Move to the goal marker", 1, Line2Marker),
            new Stages.WaitForModeStage("Change to Visual mode with 'v'", "visual"),
            new Stages.MoveToGoalStage("Move to the goal marker", 1, Line2Marker2),
            new Stages.WaitForRegisterStage(
                "Yank the selection with 'y'",
                "(y)anked, (c)hanged, or (d)eleted",
            ),
            new Stages.MoveToGoalStage("Move to the goal marker", 3, Line4Marker),
            new Stages.WaitForStateStage("Paste the yanked text with 'p'", [
                Line1Change,
                Line2,
                Line3,
                Line4PostPaste,
            ]),
            new Stages.MoveToGoalStage("Move to the goal marker", 2, Line3Marker),
            new Stages.WaitForModeStage("Change to Visual mode with 'v'", "visual"),
            new Stages.MoveToGoalStage("Move to the goal marker", 2, Line3Marker2),
            new Stages.WaitForStateStage("Change the selected text with 'c'", [
                Line1Change,
                Line2,
                Line3Pending,
                Line4PostPaste,
            ]),
            new Stages.WaitForStateStage("Enter the word 'newline'", [
                Line1Change,
                Line2,
                Line3Change,
                Line4PostPaste,
            ]),
            new Stages.WaitForModeStage("Exit Insert mode by hitting <esc>", "normal"),
            new Stages.WaitForModeStage("Move into Visual Line mode with 'V'", "visual"),
            new Stages.MoveToGoalStage("Move to the next line", 3, Line3Marker3),
            new Stages.WaitForStateStage("Delete the selected lines with 'd'", [
                Line1Change,
                Line2,
            ]),
        ]
    }

    public get metadata(): ITutorialMetadata {
        return {
            id: "oni.tutorials.visual_mode",
            name: "Visual Select: v, V",
            description:
                "Sometimes the text you want to modify isn't on a simple word boundary.  We often need to change, yank, or delete any arbitrary text.  Rather than performing a cursor movement and hoping you affected the correct characters, you can visually select text.  Using 'v' will select characters as you move, and 'V' will select lines",
            level: 230,
        }
    }

    public get stages(): ITutorialStage[] {
        return this._stages
    }

    public get notes(): JSX.Element[] {
        return [<Notes.HJKLKeys />, <Notes.WordKey />, <Notes.BeginningKey />, <Notes.EndKey />]
    }
}
