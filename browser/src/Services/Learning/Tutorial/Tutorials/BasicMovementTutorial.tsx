/**
 * TutorialManager
 */

import * as React from "react"

import { ITutorial, ITutorialMetadata, ITutorialStage } from "./../ITutorial"
// import { InitializeBufferStage, MoveToGoalStage } from "./../Stages"

import * as Stages from "./../Stages"
import * as Notes from "./../Notes"

const Line1 = "In NORMAL mode, the 'l' key moves one character to the RIGHT..."
const Line2 = "...and 'h' moves one character to the LEFT."
const Line3 = "'j' moves DOWN one line."
const Line4 = "And 'k' moves UP one line."
const Line5 = "Nice, you're a pro! Let's put it all together now."

export class BasicMovementTutorial implements ITutorial {
    private _stages: ITutorialStage[]

    constructor() {
        this._stages = [
            new Stages.SetBufferStage([Line1]),
            new Stages.MoveToGoalStage("Use 'l' to move RIGHT to the goal", 0, 10),
            new Stages.SetBufferStage([Line1, Line2]),
            new Stages.MoveToGoalStage("Use 'h' to move LEFT to the goal", 0, 0),
            new Stages.SetBufferStage([Line1, Line2, Line3]),
            new Stages.MoveToGoalStage("Use 'j' to move DOWN to the goal", 2, 0),
            new Stages.SetBufferStage([Line1, Line2, Line3, Line4]),
            new Stages.MoveToGoalStage("Use 'k' to move UP to the goal", 0, 0),
            new Stages.SetBufferStage([Line1, Line2, Line3, Line4, Line5]),
            new Stages.MoveToGoalStage("Use h/j/k/l to move to the goal", 4, 8),
            new Stages.MoveToGoalStage("Use h/j/k/l to move to the goal", 2, 1),
            new Stages.MoveToGoalStage("Use h/j/k/l to move to the goal", 0, 10),
        ]
    }

    public get metadata(): ITutorialMetadata {
        return {
            id: "oni.tutorials.basic_movement",
            name: "Motion: h/j/k/l",
            description:
                "To use Oni effectively in normal mode, you'll need to learn to move the cursor around! There are many ways to move the cursor, but the most basic is to use `h`, `j`, `k`, and `l`. These keys might seem strange at first, but they allow you to move the cursor without your fingers leaving the home row.",
            level: 110,
        }
    }

    public get notes(): JSX.Element[] {
        return [<Notes.HJKLKeys />]
    }

    public get stages(): ITutorialStage[] {
        return this._stages
    }
}
