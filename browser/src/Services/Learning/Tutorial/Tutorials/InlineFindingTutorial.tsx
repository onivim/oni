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
            new Stages.MoveToGoalStage("Move to the nearest 'n' using 'fn'", 0, 23),
            new Stages.MoveToGoalStage("Move to the nearest 'a' using 'fa'", 0, 42),
            new Stages.SetBufferStage([Line1, Line2]),
            new Stages.MoveToGoalStage("Move down a line", 1, 42),
            new Stages.MoveToGoalStage("Use 'Fm' to move BACKWARDS to the nearest 'm'", 1, 15),
            new Stages.MoveToGoalStage("Use 'Fs' to move BACKWARDS to the nearest 's'", 1, 5),
            new Stages.SetBufferStage([Line1, Line2, Line3]),
            new Stages.MoveToGoalStage("Move down a line", 2, 5),
            new Stages.MoveToGoalStage("Use 'tx' to move to the character before 'x'", 2, 16),
            new Stages.MoveToGoalStage("Use 'tb' to move to the character before 'b'", 2, 43),
            new Stages.SetBufferStage([Line1, Line2, Line3, Line4]),
            new Stages.MoveToGoalStage("Move down a line", 3, 43),
            new Stages.MoveToGoalStage(
                "Use 'Tx' to move BACKWARDS to the character before 'x'",
                3,
                22,
            ),
            new Stages.MoveToGoalStage(
                "Use 'Tl' to move BACKWARDS to the character before 'l'",
                3,
                12,
            ),
            new Stages.SetBufferStage([Line1, Line2, Line3, Line4, Line5]),
            new Stages.MoveToGoalStage("Move down a line", 4, 12),
            new Stages.MoveToGoalStage("Use 'fe' to move to the nearest 'e'", 4, 24),
            new Stages.MoveToGoalStage("Use ';' to move to the next instance of 'e'", 4, 34),
            new Stages.MoveToGoalStage("Use ';' to move to the next instance of 'e'", 4, 36),
            new Stages.MoveToGoalStage("Use ';' to move to the next instance of 'e'", 4, 42),
            new Stages.SetBufferStage([Line1, Line2, Line3, Line4, Line5, Line6]),
            new Stages.MoveToGoalStage("Move down a line", 5, 42),
            new Stages.MoveToGoalStage("Use ',' to move to the previous instance of 'e'", 5, 24),
            new Stages.MoveToGoalStage("Use ',' to move to the previous instance of 'e'", 5, 18),
            new Stages.MoveToGoalStage("Use ',' to move to the previous instance of 'e'", 5, 16),
            new Stages.MoveToGoalStage("Use ',' to move to the previous instance of 'e'", 5, 6),
            new Stages.MoveToGoalStage("Move up a line", 4, 6),
            new Stages.MoveToGoalStage("Use 'te' to move before the nearest 'e'", 4, 23),
            new Stages.MoveToGoalStage("Use ';' to move before the next instance of 'e'", 4, 33),
            new Stages.MoveToGoalStage("Use ';' to move before the next instance of 'e'", 4, 35),
            new Stages.MoveToGoalStage("Use ';' to move before the next instance of 'e'", 4, 41),
            new Stages.SetBufferStage([Line1, Line2, Line3, Line4, Line5, Line6]),
            new Stages.MoveToGoalStage("Move down a line", 5, 41),
            new Stages.MoveToGoalStage(
                "Use ',' to move before the previous instance of 'e'",
                5,
                25,
            ),
            new Stages.MoveToGoalStage(
                "Use ',' to move before the previous instance of 'e'",
                5,
                19,
            ),
            new Stages.MoveToGoalStage(
                "Use ',' to move before the previous instance of 'e'",
                5,
                17,
            ),
            new Stages.MoveToGoalStage("Use ',' to move before the previous instance of 'e'", 5, 7),
        ]
    }

    public get metadata(): ITutorialMetadata {
        return {
            id: "oni.tutorials.inline_finding",
            name: "Character Find Motion: f, F, t, T",
            description:
                "Sometimes you need to move faster than 'h' and 'l' allow but need more control than 'w', 'e', and 'b', especially when using the operators you'll learn later. 'f' followed by any character moves to the next instance of that character, 'F' followed by any character moves backwards to the next instance of that character. Similarly, 't' and 'T' move forwards and backwards up to (but not on) the specified character. After performing a 'f', 'F', 't', or 'T' operation ';' and ',' allow you to repeat those motions in different directions.",
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
