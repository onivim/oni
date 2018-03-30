/**
 * TutorialManager
 */

import * as React from "react"

import { ITutorial, ITutorialMetadata, ITutorialStage } from "./../ITutorial"
import * as Notes from "./../Notes"
import * as Stages from "./../Stages"

const Line1 = "Use the `$` key to move to the end of a line."
const Line2 = "`0` moves to the beginning of the line."
const Line3 = "    ...and `_` moves to the first character."

export class BeginningsAndEndingsTutorial implements ITutorial {
    private _stages: ITutorialStage[]

    constructor() {
        this._stages = [
            new Stages.SetBufferStage([Line1]),
            new Stages.MoveToGoalStage(
                "Use '$' to move to the END of the line",
                0,
                Line1.length - 1,
            ),
            new Stages.SetBufferStage([Line1, Line2]),
            new Stages.MoveToGoalStage("Use `j` to move down to the next line", 1),
            new Stages.MoveToGoalStage("Use '0' to move to the BEGINNING of the line", 1, 0),
            new Stages.MoveToGoalStage(
                "Use '$' to move to the END of the line",
                1,
                Line2.length - 1,
            ),
            new Stages.SetBufferStage([Line1, Line2, Line3]),
            new Stages.MoveToGoalStage("Use `j` to move down to the next line", 2),
            new Stages.MoveToGoalStage("Use '_' to move to the FIRST CHARACTER", 2, 4),
            new Stages.MoveToGoalStage(
                "Use '$' to move to the END of the line",
                2,
                Line3.length - 1,
            ),
            new Stages.MoveToGoalStage("Use '0' to move to the BEGINNING of the line", 2, 0),
            new Stages.MoveToGoalStage("Use '_' to move to the FIRST CHARACTER", 2, 4),
            new Stages.MoveToGoalStage(
                "Use '$' to move to the END of the line",
                2,
                Line3.length - 1,
            ),
        ]
    }

    public get metadata(): ITutorialMetadata {
        return {
            id: "oni.tutorials.beginnings_and_endings",
            name: "Motion: _, 0, $",
            description:
                "Using `h` and `l` isn't always the most efficient way to get around a line. You can use the `0` key to move to the very beginning a line, and `$` to move to the end. `_` moves to the first character in the line, which is often more convenient than `0`.",
            level: 160,
        }
    }

    public get stages(): ITutorialStage[] {
        return this._stages
    }

    public get notes(): JSX.Element[] {
        return [<Notes.HJKLKeys />, <Notes.ZeroKey />, <Notes.UnderscoreKey />, <Notes.DollarKey />]
    }
}
