/**
 * Vertical Movement Tutorial
 */
import * as React from "react"

import { ITutorial, ITutorialMetadata, ITutorialStage } from "./../ITutorial"
import * as Notes from "./../Notes"
import * as Stages from "./../Stages"

export class VerticalMovementTutorial implements ITutorial {
    private _stages: ITutorialStage[]

    constructor() {
        const lines = []
        for (let i = 1; i < 151; i++) {
            lines.push(`This is line ${i} of a large file!`)
        }

        this._stages = [
            new Stages.SetBufferStage(lines),
            new Stages.MoveToGoalStage("Use 'G' to move to the BOTTOM of the file.", 149, 0),
            new Stages.MoveToGoalStage("Use 'gg' to move to the TOP of the file", 0, 0),
            new Stages.MoveToGoalStage("Use 50G to move line 50", 49, 0),
            new Stages.MoveToGoalStage("Use 100G to move line 100", 99, 0),
            new Stages.MoveToGoalStage("Move to the bottom of the file", 149, 0),
            new Stages.MoveToGoalStage("Move to the top of the file", 0, 0),
            new Stages.MoveToGoalStage("Move to line 125", 124, 0),
            new Stages.MoveToGoalStage("Move back to the top of the file", 0, 0),
        ]
    }

    public get metadata(): ITutorialMetadata {
        return {
            id: "oni.tutorials.vertical_movement",
            name: "File Motion: gg, G",
            description:
                "When working with large files, it's very helpful to able to quickly move to the top or bottom of the file, as well as to a particular line number. `gg`, `G`, and `<n>G` can help us here!",
            level: 150,
        }
    }

    public get stages(): ITutorialStage[] {
        return this._stages
    }

    public get notes(): JSX.Element[] {
        return [<Notes.GKey />, <Notes.GGKey />, <Notes.XGKey />]
    }
}
