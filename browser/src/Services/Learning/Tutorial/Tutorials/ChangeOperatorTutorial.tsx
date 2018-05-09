/**
 * ChangeOperatorTutorial.tsx
 *
 * Tutorial that exercises the change operator
 */

import * as React from "react"

import { ITutorial, ITutorialMetadata, ITutorialStage } from "./../ITutorial"
import * as Notes from "./../Notes"
import * as Stages from "./../Stages"

const Line1 = "The change operator can be used for quikcly fixing typos"
const Line1Marker = "The change operator can be used for ".length
const Line1Pending = "The change operator can be used for  fixing typos"
const Line1Fixed = "The change operator can be used for quickly fixing typos"

export class ChangeOperatorTutorial implements ITutorial {
    private _stages: ITutorialStage[]

    constructor() {
        this._stages = [
            new Stages.SetBufferStage([Line1]),
            new Stages.MoveToGoalStage("Move to the goal marker", 0, Line1Marker),
            new Stages.WaitForStateStage("Fix the typo by hitting 'cw'", [Line1Pending]),
            new Stages.WaitForStateStage("Enter the word 'quickly'", [Line1Fixed]),
            new Stages.WaitForModeStage("Exit Insert mode by hitting <esc>", "normal"),
        ]
    }

    public get metadata(): ITutorialMetadata {
        return {
            id: "oni.tutorials.change_operator",
            name: "Change Operator: c",
            description:
                "Now that you know about operators and motions pairing like a noun and a verb, we can start learning more operators.  The `c` operator allows you to _change_ text.  It deletes the selected text and immediately enters Insert mode so you can enter new text.  The text to be changed is defined by any motion just like the delete operator.  It might not seem very impressive right now but `c` will become more useful as you learn more motions.",
            level: 210,
        }
    }

    public get stages(): ITutorialStage[] {
        return this._stages
    }

    public get notes(): JSX.Element[] {
        return [<Notes.HJKLKeys />, <Notes.ChangeOperatorKey />, <Notes.ChangeWordKey />]
    }
}
