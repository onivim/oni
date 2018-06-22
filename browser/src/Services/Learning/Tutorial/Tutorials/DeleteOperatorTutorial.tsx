/**
 * DeleteOperatorTutorial.tsx
 *
 * Tutorial that exercises the delete operator
 */

import * as React from "react"

import { ITutorial, ITutorialMetadata, ITutorialStage } from "./../ITutorial"
import * as Notes from "./../Notes"
import * as Stages from "./../Stages"

const Line1 = "The delete operator is very useful!"
const Line2a = "--> Delete this line"

const Line2b = "--> You can delete the current line AND the one BELOW it,"
const Line3b = "--> using the `dj` command."

const Line2c = "--> You can delete the current line AND the one ABOVE it,"
const Line3c = "--> using the `dk` command."

const Line2d = "--> The delete operator works with other motions, too."
const Line3d = "--> Let's try out `dw` - delete word. Delete the duplicate words below:"
const Line4d = "--> Help delete the duplicate duplicate words."
const Line4dCorrecta = "--> Help delete the duplicate words."
const Line4dCorrectb = "--> Help delete the words."

const Line2e = "--> `d` followed by any motion will delete to that destination"
const Line3e = "--> This can allow for more precision when there aren't simple boundaries"
const Line4e = "--> public void somethingsomething(arg1, arg2, extra1, extra2)"
const Line4eCorrecta = "--> public void something(arg1, arg2, extra1, extra2)"
const Line4eCorrectb = "--> public void something(arg1, arg2)"

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
            Stages.combine(
                null,
                new Stages.FadeInLineStage(null, 1, Line2b),
                new Stages.FadeInLineStage(null, 2, Line3b),
            ),
            new Stages.SetBufferStage([Line1, Line2b, Line3b]),
            new Stages.MoveToGoalStage("Move to the goal marker", 1, 0),
            Stages.combine(
                "Delete the current line, and the one below it, with 'dj'",
                new Stages.DeleteCharactersStage(null, 1, 0, Line2b),
                new Stages.DeleteCharactersStage(null, 2, 0, Line3b),
                new Stages.WaitForStateStage(null, [Line1]),
            ),
            Stages.combine(
                null,
                new Stages.FadeInLineStage(null, 1, Line2c),
                new Stages.FadeInLineStage(null, 2, Line3c),
                new Stages.SetBufferStage([Line1, Line2c, Line3c]),
            ),
            new Stages.MoveToGoalStage("Move to the goal marker", 2, 0),
            Stages.combine(
                "Delete the current line, and the one above it, with 'dk'",
                new Stages.DeleteCharactersStage(null, 1, 0, Line2c),
                new Stages.DeleteCharactersStage(null, 2, 0, Line3c),
                new Stages.WaitForStateStage(null, [Line1]),
            ),
            Stages.combine(
                null,
                new Stages.FadeInLineStage(null, 1, Line2d),
                new Stages.FadeInLineStage(null, 2, Line3d),
                new Stages.FadeInLineStage(null, 3, Line4d),
                new Stages.SetBufferStage([Line1, Line2d, Line3d, Line4d]),
            ),
            new Stages.MoveToGoalStage("Move to the goal marker", 3, 20),
            Stages.combine(
                "Delete the duplicate word with 'dw'",
                new Stages.DeleteCharactersStage(null, 3, 20, "duplicate"),
                new Stages.WaitForStateStage(null, [Line1, Line2d, Line3d, Line4dCorrecta]),
            ),
            Stages.combine(
                "Delete the word again with 'dw'",
                new Stages.DeleteCharactersStage(null, 3, 20, "duplicate"),
                new Stages.WaitForStateStage(null, [Line1, Line2d, Line3d, Line4dCorrectb]),
            ),
            Stages.combine(
                null,
                new Stages.FadeInLineStage(null, 1, Line2e),
                new Stages.FadeInLineStage(null, 2, Line3e),
                new Stages.FadeInLineStage(null, 3, Line4e),
                new Stages.SetBufferStage([Line1, Line2e, Line3e, Line4e]),
            ),
            new Stages.MoveToGoalStage("Move to the goal marker", 3, 16),
            Stages.combine(
                "Use 'dts' to delete to the next 's'",
                new Stages.DeleteCharactersStage(null, 3, 16, "something"),
                new Stages.WaitForStateStage(null, [Line1, Line2e, Line3e, Line4eCorrecta]),
            ),
            new Stages.MoveToGoalStage("Move to the goal marker", 3, 36),
            Stages.combine(
                "Use 'dt)' to delete to the ')'",
                new Stages.DeleteCharactersStage(null, 3, 36, ", extra1, extra2"),
                new Stages.WaitForStateStage(null, [Line1, Line2e, Line3e, Line4eCorrectb]),
            ),
        ]
    }

    public get metadata(): ITutorialMetadata {
        return {
            id: "oni.tutorials.delete_operator",
            name: "Delete Operator: d",
            description:
                "We've stuck mostly with motions, but now we're going to learn about our first operator - delete (`d`). Operators are like _verbs_ in the vim world, and motions are like _nouns_. An operator can be paired with a motion - which means we can pair the `d` key with all sorts of motions - `dj` to delete the line and the line below, `dw` to delete a word, etc.",
            level: 200,
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
