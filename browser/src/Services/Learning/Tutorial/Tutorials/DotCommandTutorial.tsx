/**
 * DotCommandTutorial.tsx
 *
 * Tutorial that teaches the dot (.) command
 */

import * as React from "react"

import { ITutorial, ITutorialMetadata, ITutorialStage } from "./../ITutorial"
import * as Notes from "./../Notes"
import * as Stages from "./../Stages"

const stage1Line1 = "The dot (.) command can be used to repeat any single change."
const stage1Line2 = "This line contains duplicate duplicate words"
const stage1Line2a = "This line contains duplicate words"

const stage2Line1 =
    "A change can be anything that happens between leaving Normal Mode and returning to Normal Mode"
const stage2Line2 = "This line contains (an invalid) statement"
const stage2Line2pending = "This line contains () statement"
const stage2Line2diff = "This line contains (a different) statement"
const stage2Line2a = "This line contains (the fixed) statement"

export class DotCommandTutorial implements ITutorial {
    private _stages: ITutorialStage[]

    constructor() {
        this._stages = [
            new Stages.SetBufferStage([
                stage1Line1,
                stage1Line2,
                stage1Line2,
                stage1Line2,
                stage1Line2,
            ]),
            new Stages.MoveToGoalStage("Move to the goal marker", 1, 19),
            Stages.combine(
                "Remove the duplicate word using 'dw'",
                new Stages.DeleteCharactersStage(null, 1, 19, "duplicate"),
                new Stages.WaitForStateStage(null, [
                    stage1Line1,
                    stage1Line2a,
                    stage1Line2,
                    stage1Line2,
                    stage1Line2,
                ]),
            ),
            new Stages.MoveToGoalStage("Move to the goal marker", 2, 19),
            Stages.combine(
                "Repeat the 'dw' operation by just hitting '.'",
                new Stages.DeleteCharactersStage(null, 2, 19, "duplicate"),
                new Stages.WaitForStateStage(null, [
                    stage1Line1,
                    stage1Line2a,
                    stage1Line2a,
                    stage1Line2,
                    stage1Line2,
                ]),
            ),
            new Stages.MoveToGoalStage("Move to the goal marker", 3, 19),
            Stages.combine(
                "Again, hit '.'",
                new Stages.DeleteCharactersStage(null, 3, 19, "duplicate"),
                new Stages.WaitForStateStage(null, [
                    stage1Line1,
                    stage1Line2a,
                    stage1Line2a,
                    stage1Line2a,
                    stage1Line2,
                ]),
            ),
            new Stages.MoveToGoalStage("Move to the goal marker", 4, 19),
            Stages.combine(
                "Again, hit '.'",
                new Stages.DeleteCharactersStage(null, 4, 19, "duplicate"),
                new Stages.WaitForStateStage(null, [
                    stage1Line1,
                    stage1Line2a,
                    stage1Line2a,
                    stage1Line2a,
                    stage1Line2a,
                ]),
            ),
            new Stages.SetBufferStage([
                stage2Line1,
                stage2Line2,
                stage2Line2,
                stage2Line2diff,
                stage2Line2,
            ]),
            new Stages.MoveToGoalStage("Move to the goal marker", 1, 23),
            Stages.combine(
                "Change the text within parentheses with 'ci('",
                new Stages.DeleteCharactersStage(null, 1, 20, "an invalid"),
                new Stages.WaitForStateStage(null, [
                    stage2Line1,
                    stage2Line2pending,
                    stage2Line2,
                    stage2Line2diff,
                    stage2Line2,
                ]),
            ),
            new Stages.WaitForStateStage("Enter the text 'the fixed'", [
                stage2Line1,
                stage2Line2a,
                stage2Line2,
                stage2Line2diff,
                stage2Line2,
            ]),
            new Stages.WaitForModeStage("Hit <esc> to exit insert mode", "normal"),
            new Stages.MoveToGoalStage("Move to the goal marker", 2, 20),
            Stages.combine(
                "Repeat the entire change with '.'",
                new Stages.DeleteCharactersStage(null, 2, 20, "an invalid"),
                new Stages.WaitForStateStage(null, [
                    stage2Line1,
                    stage2Line2a,
                    stage2Line2a,
                    stage2Line2diff,
                    stage2Line2,
                ]),
            ),
            new Stages.MoveToGoalStage("Move to the goal marker", 3, 20),
            Stages.combine(
                "Repeat the entire change with '.'",
                new Stages.DeleteCharactersStage(null, 3, 20, "a different"),
                new Stages.WaitForStateStage(null, [
                    stage2Line1,
                    stage2Line2a,
                    stage2Line2a,
                    stage2Line2a,
                    stage2Line2,
                ]),
            ),
            new Stages.MoveToGoalStage("Move to the goal marker", 4, 20),
            Stages.combine(
                "Repeat the entire change with '.'",
                new Stages.DeleteCharactersStage(null, 4, 20, "an invalid"),
                new Stages.WaitForStateStage(null, [
                    stage2Line1,
                    stage2Line2a,
                    stage2Line2a,
                    stage2Line2a,
                    stage2Line2a,
                ]),
            ),
            new Stages.WaitForStateStage("Hit 'dd' to delete this line", [
                stage2Line1,
                stage2Line2a,
                stage2Line2a,
                stage2Line2a,
            ]),
            new Stages.WaitForStateStage("Hit '.' to repeat the delete", [
                stage2Line1,
                stage2Line2a,
                stage2Line2a,
            ]),
            new Stages.WaitForStateStage("Hit '.' to repeat the delete", [
                stage2Line1,
                stage2Line2a,
            ]),
            new Stages.MoveToGoalStage("Move to the top of the file", 0, 0),
            new Stages.WaitForStateStage("Hit '.' to repeat the delete", [stage2Line2a]),
        ]
    }

    public get metadata(): ITutorialMetadata {
        return {
            id: "oni.tutorials.dot_command",
            name: "Repeat Command: .",
            description:
                "One of Vim's most powerful commands is performed by simply pressing period ('.').  The '.' command will repeat whatever operation you just performed.  Basically, it will repeat whatever keys you most recently hit to change the file.",
            level: 250,
        }
    }

    public get stages(): ITutorialStage[] {
        return this._stages
    }

    public get notes(): JSX.Element[] {
        return [<Notes.DotKey />]
    }
}
