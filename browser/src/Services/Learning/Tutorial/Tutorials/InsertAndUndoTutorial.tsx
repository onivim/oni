/**
 * InsertAndUndoTutorial.tsx
 *
 * Tutorial for undo and redo before we learn destructive changes
 */

import * as React from "react"

import { ITutorial, ITutorialMetadata, ITutorialStage } from "./../ITutorial"
import * as Notes from "./../Notes"
import * as Stages from "./../Stages"

const TutorialLine1Original = "There is text msing this ."
const TutorialLine1Correct = "There is some text missing from this line."

export class InsertAndUndoTutorial implements ITutorial {
    private _stages: ITutorialStage[]

    constructor() {
        this._stages = [
            new Stages.SetBufferStage([TutorialLine1Original, TutorialLine1Correct]),
            new Stages.MoveToGoalStage("Move to the letter 't'", 0, 9),
            new Stages.WaitForModeStage("Press 'i' to enter insert mode", "insert"),
            new Stages.CorrectLineStage(
                "Add the missing word 'some '",
                0,
                TutorialLine1Correct,
                "green",
                "There is some ",
            ),
            new Stages.WaitForModeStage("Press '<esc>' to exit insert mode", "normal"),
            new Stages.MoveToGoalStage("Move to the letter 's'", 0, 20),
            new Stages.CorrectLineStage(
                "Correct the word: `msing` should be `missing`",
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
                "There is some text missing from ",
            ),
            new Stages.CorrectLineStage(
                "Add the missing word 'line'",
                0,
                TutorialLine1Correct,
                "green",
                "There is some text missing from this line.",
            ),
            new Stages.WaitForModeStage("Press '<esc>' to exit insert mode", "normal"),
            new Stages.WaitForStateStage("Press 'u' to undo the last change", [
                "There is some text missing from this .",
                TutorialLine1Correct,
            ]),
            new Stages.WaitForStateStage("Press 'u' to undo another change", [
                "There is some text missing this .",
                TutorialLine1Correct,
            ]),
            new Stages.WaitForStateStage("Press 'u' to undo yet another change", [
                "There is some text msing this .",
                TutorialLine1Correct,
            ]),
            new Stages.WaitForStateStage("Press 'u' to undo yet another change", [
                "There is text msing this .",
                TutorialLine1Correct,
            ]),
            new Stages.WaitForStateStage("Press 'Ctrl+r' to redo the last undo", [
                "There is some text msing this .",
                TutorialLine1Correct,
            ]),
            new Stages.WaitForStateStage("Press 'Ctrl+r' to redo the next undo", [
                "There is some text missing this .",
                TutorialLine1Correct,
            ]),
            new Stages.WaitForStateStage("Press 'Ctrl+r' to redo yet another undo", [
                "There is some text missing from this .",
                TutorialLine1Correct,
            ]),
            new Stages.WaitForStateStage("Press 'Ctrl+r' to redo yet another undo", [
                "There is some text missing from this line.",
                TutorialLine1Correct,
            ]),
            new Stages.WaitForStateStage("Press 'u' to undo the last change", [
                "There is some text missing from this .",
                TutorialLine1Correct,
            ]),
        ]
    }

    public get metadata(): ITutorialMetadata {
        return {
            id: "oni.tutorial.undo_and_redo",
            name: "Undo and Redo",
            description:
                "It's important to be able to switch between normal and insert mode, in order to edit text! Let's put together the cursor motion and insert mode from the previous tutorials.  If you make any mistakes, you can undo inserted text with 'u'.  To bring back an undo, hit 'Ctrl+r' to redo.",
            level: 170,
        }
    }

    public get stages(): ITutorialStage[] {
        return this._stages
    }

    public get notes(): JSX.Element[] {
        return [
            <Notes.HJKLKeys />,
            <Notes.IKey />,
            <Notes.EscKey />,
            <Notes.UKey />,
            <Notes.RedoKey />,
        ]
    }
}
