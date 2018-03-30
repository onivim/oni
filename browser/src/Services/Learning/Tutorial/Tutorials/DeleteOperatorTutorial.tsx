/**
 * DeleteOperatorTutorial.tsx
 *
 * Tutorial that exercises the delete operator
 */

import * as React from "react"

import { ITutorial, ITutorialMetadata, ITutorialStage } from "./../ITutorial"
import * as Stages from "./../Stages"
import * as Notes from "./../Notes"

const Line1 = "The delete operator is very useful!"
const Line2a = "--> Delete this line"

const Line2b = "--> You can delete the current line AND the one BELOW it,"
const Line3b = "--> using the `dj` command."

const Line2c = "--> You can delete the current line AND the one ABOVE it,"
const Line3c = "--> using the `dk` command."

const Line2d = "--> The delete operator works with other motions, too."
const Line3d = "--> Let's try out `dw` - delete word. Delete the duplicate words below:"
const Line4d = "--> Help delete the duplicate duplicate words."
const Line4dCorrect = "--> Help delete the duplicate words."

export class DeleteOperatorTutorial implements ITutorial {
    private _stages: ITutorialStage[]

    constructor() {
        this._stages = [
            new Stages.SetBufferStage([Line1, Line2a]),
            // new Stages.SetCursorPositionStage(0, 0),
            new Stages.MoveToGoalStage("Move to the goal marker", 1, 0),
            Stages.combine(
                "Delete the current line with 'dd'",
                new Stages.DeleteCharactersStage(null, 1, 0, Line2a),
                new Stages.WaitForStateStage(null, [Line1]),
            ),
            new Stages.SetBufferStage([Line1, Line2b, Line3b]),
            new Stages.MoveToGoalStage("Move to the goal marker", 1, 0),
            Stages.combine(
                "Delete the current line, and the one below it, with 'dj'",
                new Stages.DeleteCharactersStage(null, 1, 0, Line2b),
                new Stages.DeleteCharactersStage(null, 2, 0, Line3b),
                new Stages.WaitForStateStage(null, [Line1]),
            ),
            new Stages.SetBufferStage([Line1, Line2c, Line3c]),
            new Stages.MoveToGoalStage("Move to the goal marker", 2, 0),
            Stages.combine(
                "Delete the current line, and the one above it, with 'dk'",
                new Stages.DeleteCharactersStage(null, 1, 0, Line2c),
                new Stages.DeleteCharactersStage(null, 2, 0, Line3c),
                new Stages.WaitForStateStage(null, [Line1]),
            ),
            new Stages.SetBufferStage([Line1, Line2d, Line3d, Line4d]),
            new Stages.MoveToGoalStage("Move to the goal marker", 3, 20),
            Stages.combine(
                "Delete the duplicate word with 'dw'",
                new Stages.DeleteCharactersStage(null, 3, 20, "duplicate"),
                new Stages.WaitForStateStage(null, [Line1, Line2d, Line3d, Line4dCorrect]),
            ),
        ]
    }

    public get metadata(): ITutorialMetadata {
        return {
            id: "oni.tutorials.delete_operator",
            name: "Operator: Delete",
            description:
                "We've stuck mostly with motions, but now we're going to learn about our first operator - delete (`d`). Operators are like _verbs_ in the vim world, and motions are like _nouns_. An operator can be paired with a motion - which means we can pair the `d` key with all sorts of motions - `dj` to delete the line and the line below, `dw` to delete a word, etc.",
            level: 180,
        }
    }

    public get stages(): ITutorialStage[] {
        return this._stages
    }

    public get notes(): JSX.Element[] {
        return [
            <Notes.HJKLKeys />,
            <Notes.DeleteOperatorKey />,
            <Notes.DeleteLineKey />,
            <Notes.DeleteLineBelowKey />,
            <Notes.DeleteLineAboveKey />,
            <Notes.DeleteWordKey />,
        ]
    }
}
