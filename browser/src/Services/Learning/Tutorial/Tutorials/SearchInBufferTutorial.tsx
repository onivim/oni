/**
 * TutorialManager
 */

import * as React from "react"

import { ITutorial, ITutorialMetadata, ITutorialStage } from "./../ITutorial"
// import { InitializeBufferStage, MoveToGoalStage } from "./../Stages"

import * as Notes from "./../Notes"
import * as Stages from "./../Stages"

const EmptyLine = ""

// Forward search lines
const Line1 = "In NORMAL mode, the '/' key lets you search for a string."
const Line2 = "It's a very powerful way to move you way inside a buffer quickly"
const Line3 = "The 'n' key lets you move to the next instance of the matched string."
const Line4 = "Even if the match is way down, move here!"
const Line5 = "If you want to go the opposite way,"
const Line6 = "The 'N' key lets you move to the previous match."

// Backward search lines
const Line7 = "The '?' key will let you search backwards instead!"
const Line8 = "'?' searches backward, the 'n' and 'N' keys operate backward as well!"
const Line9 = "'N' will move you to the next instance going down"
const Line10 = "'n' will move you to the next instance going up"

export class SearchInBufferTutorial implements ITutorial {
    private _stages: ITutorialStage[]

    constructor() {
        this._stages = [
            // Forward search
            new Stages.SetBufferStage([Line1, Line2]),
            new Stages.MoveToGoalStage("Use '/' to search for the word 'move'", 1, 28),
            new Stages.SetBufferStage([Line1, Line2, Line3]),
            new Stages.MoveToGoalStage("Use 'n' to go to the next instance of 'move'", 2, 21),
            new Stages.SetBufferStage([Line1, Line2, Line3, EmptyLine, EmptyLine, Line4]),
            new Stages.MoveToGoalStage("Use 'n' to go to the next instance of 'move'", 5, 31),
            new Stages.SetBufferStage([
                Line1,
                Line2,
                Line3,
                EmptyLine,
                EmptyLine,
                Line4,
                Line5,
                Line6,
            ]),
            new Stages.MoveToGoalStage("Use 'N' to go to the previous instance of 'move'", 2, 21),
            new Stages.MoveToGoalStage("Use 'N' to go to the previous instance of 'move'", 1, 28),
            // Backward search
            new Stages.SetBufferStage([Line7]),
            new Stages.SetCursorPositionStage(0, 48),
            new Stages.MoveToGoalStage("Use '?' to search for the word 'you'", 0, 21),
            new Stages.SetBufferStage([Line7, Line8, Line9]),
            new Stages.MoveToGoalStage("Use 'N' to go to the previous instance of 'you'", 2, 14),
            new Stages.SetBufferStage([Line7, Line8, Line9, Line10]),
            new Stages.MoveToGoalStage("Use 'n' to go to the next instance of 'move'", 0, 21),
        ]
    }

    public get metadata(): ITutorialMetadata {
        return {
            id: "oni.tutorials.find_across_buffer",
            name: "Motion: /, ?, n, N",
            description:
                "To navigate a buffer efficiently, Oni lets you search for strings with `/` and `?`. `n` and `N` let you navigate quickly between the matches!",
            level: 190,
        }
    }

    public get notes(): JSX.Element[] {
        return [<Notes.SlashKey />, <Notes.QuestionKey />, <Notes.nKey />, <Notes.NKey />]
    }

    public get stages(): ITutorialStage[] {
        return this._stages
    }
}
