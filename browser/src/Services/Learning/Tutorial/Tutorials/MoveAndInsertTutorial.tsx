/**
 * MoveAndInsertTutorial.tsx
 *
 * Tutorial that brings together moving and inserting
 */

import * as React from "react"

import { ITutorial, ITutorialMetadata, ITutorialStage } from "./../ITutorial"
import * as Stages from "./../Stages"
import * as Notes from "./../Notes"

const TutorialLine1Original = "There is text msng this ."
const TutorialLine1Correct = "There is some text missing from this line."

export class MoveAndInsertTutorial implements ITutorial {
    private _stages: ITutorialStage[]

    constructor() {
        this._stages = [
            new Stages.SetBufferStage([TutorialLine1Original, TutorialLine1Correct]),
            new Stages.MoveToGoalStage("Move to the letter 't'", 0, 9),
            new Stages.WaitForModeStage("Press 'i' to enter insert mode", "insert"),
            new Stages.CorrectLineStage(
                "Add the missing word 'some'",
                0,
                TutorialLine1Correct,
                "green",
                "There is some",
            ),
            new Stages.WaitForModeStage("Press '<esc>' to exit insert mode", "normal"),
            new Stages.MoveToGoalStage("Move to the letter 's'", 0, 20),
            new Stages.CorrectLineStage(
                "Correct the word: `msng` should be `missing`",
                0,
                TutorialLine1Correct,
                "green",
                "There is some text missing",
            ),
            new Stages.CorrectLineStage(
                "Add the missing word 'from'",
                0,
                TutorialLine1Correct,
                "green",
                "There is some text missing from",
            ),
            new Stages.CorrectLineStage(
                "Add the missing word 'line'",
                0,
                TutorialLine1Correct,
                "green",
                "There is some text missing from this line.",
            ),
        ]
    }

    public get metadata(): ITutorialMetadata {
        return {
            id: "oni.tutorial.move_and_insert",
            name: "Moving and Inserting",
            description:
                "It's important to be able to switch between normal and insert mode, in order to edit text! Let's put together the cursor motion and insert mode from the previous tutorials.",
            level: 130,
        }
    }

    public get stages(): ITutorialStage[] {
        return this._stages
    }

    public get notes(): JSX.Element[] {
        return [<Notes.HJKLKeys />, <Notes.IKey />, <Notes.EscKey />]
    }
}
