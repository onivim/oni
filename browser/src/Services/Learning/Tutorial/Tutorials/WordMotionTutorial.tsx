/**
 * WordMotionTutorial.tsx
 *
 * Tutorial that exercises basic word motion - `w`, `b`, `e`
 */

import * as React from "react"

import { ITutorial, ITutorialMetadata, ITutorialStage } from "./../ITutorial"
import * as Notes from "./../Notes"
import * as Stages from "./../Stages"

const Line1 = "Use the w key to move to the BEGINNING of the NEXT word."
const Line2 = "Use the e key to move to the END of the NEXT word."
const Line3 = "Use the b key to move to the BEGINNING of the PREVIOUS word."
const Empty = ""
const Line4 = "Word boundaries are defined by characters like '\"[]().:"
const Line5 = "Use the W, E, B keys to use WHITESPACE as the only word boundary"
const Line6 = "Try moving over an IP address like 192.168.100.252 to see the behavior"
const Line7 = "Move past this timestamp [1970-01-01_00:00:00,000] with a single key press"

export class WordMotionTutorial implements ITutorial {
    private _stages: ITutorialStage[]

    constructor() {
        this._stages = [
            new Stages.SetBufferStage([Line1]),
            new Stages.SetCursorPositionStage(0, 0),
            new Stages.MoveToGoalStage("Use the `w` key to move to the 't' character", 0, 4),
            new Stages.MoveToGoalStage("Use the `w` key to move to the next word", 0, 8),
            new Stages.MoveToGoalStage("Use the `w` key to move to the 'key' word", 0, 10),
            new Stages.SetBufferStage([Line1, Line2]),
            new Stages.MoveToGoalStage("Use the 'j' key to move down a line", 1, 10),
            new Stages.MoveToGoalStage(
                "Use the 'e' key to move to the end of the current word",
                1,
                12,
            ),
            new Stages.MoveToGoalStage(
                "Use the 'e' key to move to the end of the next word",
                1,
                15,
            ),
            new Stages.MoveToGoalStage(
                "Use the 'e' key to move to the end of the next word",
                1,
                20,
            ),
            new Stages.SetBufferStage([Line1, Line2, Line3]),
            new Stages.MoveToGoalStage("Use the 'j' key to move down a line", 2, 20),
            new Stages.MoveToGoalStage(
                "Use the 'b' key to move to the beginning of the current word",
                2,
                17,
            ),
            new Stages.MoveToGoalStage(
                "Use the 'b' key to move to the beginning of the previous word",
                2,
                14,
            ),
            new Stages.MoveToGoalStage(
                "Use the 'b' key to move to the beginning of the previous word",
                2,
                10,
            ),
            new Stages.SetBufferStage([Line1, Line2, Line3, Empty, Line4, Line5, Line6]),
            new Stages.MoveToGoalStage("Move to the goal marker", 6, 35),
            new Stages.MoveToGoalStage(
                "Keep hitting 'w' until you move past the IP address",
                6,
                51,
            ),
            new Stages.MoveToGoalStage(
                "Well that was annoying.  Now use 'B' to jump backwards by whitespace",
                6,
                35,
            ),
            new Stages.MoveToGoalStage(
                "Use 'W' to jump to the next word by whitespace.  Much faster!",
                6,
                51,
            ),
            new Stages.SetBufferStage([Line1, Line2, Line3, Empty, Line4, Line5, Line6, Line7]),
            new Stages.MoveToGoalStage("Move to the goal marker", 7, 25),
            new Stages.MoveToGoalStage("Use 'W' to move to the word after the timestamp", 7, 51),
            new Stages.MoveToGoalStage("Use 'B' to move to the beginning of the timestamp", 7, 25),
            new Stages.MoveToGoalStage("Use 'E' to move to the end of the timestamp", 7, 49),
        ]
    }

    public get metadata(): ITutorialMetadata {
        return {
            id: "oni.tutorials.word_motion",
            name: "Word Motion: w, e, b",
            description:
                "Often, `h` and `l` aren't the fastest way to move in a line. Word motions can be useful here - and even more useful when coupled with operators (we'll explore those later)! The `w` key moves to the first letter of the next word, the `e` key moves to the end of the next word, and the `b` key moves to the beginning letter of the previous word.",
            level: 130,
        }
    }

    public get stages(): ITutorialStage[] {
        return this._stages
    }

    public get notes(): JSX.Element[] {
        return [
            <Notes.HJKLKeys />,
            <Notes.WordKey />,
            <Notes.EndKey />,
            <Notes.BeginningKey />,
            <Notes.BigWordKey />,
            <Notes.BigEndKey />,
            <Notes.BigBeginningKey />,
        ]
    }
}
