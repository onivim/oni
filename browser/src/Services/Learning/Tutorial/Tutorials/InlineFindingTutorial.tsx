/**
 * TutorialManager
 */

import * as React from "react"

import { ITutorial, ITutorialMetadata, ITutorialStage } from "./../ITutorial"
// import { InitializeBufferStage, MoveToGoalStage } from "./../Stages"

import * as Notes from "./../Notes"
import * as Stages from "./../Stages"

const Line1 = "Use 'f' to move to the next occurrence of a character within the same line."
const Line2 = "And use 'F' to move to the previous occurrence of a character."
const Line3 = "'t' is like 'f' except it moves to one spot before the character."
const Line4 = "And 'T' is like 'F' except it moves one spot after."
const Line5 = "Awesome! You can also use ';' to repeat the last f, t, F, or T."
const Line6 = "Now use ',' to repeat the last f, t, F, or T in the opposite direction."

export class InlineFindingTutorial implements ITutorial {
    private _stages: ITutorialStage[]

    constructor() {
        this._stages = [
            new Stages.SetBufferStage([Line1]),
            new Stages.MoveToGoalStage("Move to the 'n' in 'next' using 'fn'", 0, 23),
            new Stages.SetBufferStage([Line1, Line2]),
            new Stages.MoveToGoalStage("Use 'j' to move down a line", 1, 23),
            new Stages.MoveToGoalStage("Use 'F' to move LEFT to the goal", 1, 15),
            new Stages.SetBufferStage([Line1, Line2, Line3]),
            new Stages.MoveToGoalStage("Use 'j' to move down a line", 2, 15),
            new Stages.MoveToGoalStage("Move to the character before 'b' using 'tb'", 2, 43),
            new Stages.SetBufferStage([Line1, Line2, Line3, Line4]),
            new Stages.MoveToGoalStage("Use 'j' to move down a line", 3, 43),
            new Stages.MoveToGoalStage("Use 'T' to move to the goal", 3, 12),
            new Stages.SetBufferStage([Line1, Line2, Line3, Line4, Line5]),
            new Stages.MoveToGoalStage("Use 'j' to move down a line", 4, 12),
            new Stages.MoveToGoalStage("Use 'f' to move to the goal", 4, 24),
            new Stages.MoveToGoalStage("Use ';' to move to the goal", 4, 34),
            new Stages.MoveToGoalStage("Use ';' to move to the goal", 4, 36),
            new Stages.MoveToGoalStage("Use ';' to move to the goal", 4, 42),
            new Stages.SetBufferStage([Line1, Line2, Line3, Line4, Line5, Line6]),
            new Stages.MoveToGoalStage("Use 'j' to move down a line", 5, 42),
            new Stages.MoveToGoalStage("Use ',' to move to the goal", 5, 24),
            new Stages.MoveToGoalStage("Use ',' to move to the goal", 5, 18),
            new Stages.MoveToGoalStage("Use ',' to move to the goal", 5, 16),
            new Stages.MoveToGoalStage("Use ',' to move to the goal", 5, 6),
        ]
    }

    public get metadata(): ITutorialMetadata {
        return {
            id: "oni.tutorials.inline_finding",
            name: "Motion: f, F, t, T",
            description:
                "Sometimes you need to move faster than 'h' and 'l' allow you to but need more control than 'w', 'e', and 'b', especially when using different operators. 'f' moves to a specific character to the right of the cursor, 'F' moves to a specific character to the left, and ';' and ',' allow you to repeat these motions in different directions.",
            level: 145,
        }
    }

    public get notes(): JSX.Element[] {
        return [
            <Notes.fKey />,
            <Notes.FKey />,
            <Notes.tKey />,
            <Notes.TKey />,
            <Notes.RepeatKey />,
            <Notes.RepeatOppositeKey />,
        ]
    }

    public get stages(): ITutorialStage[] {
        return this._stages
    }
}
