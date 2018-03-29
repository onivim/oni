/**
 * WordMotionTutorial.tsx
 *
 * Tutorial that exercises basic word motion - `w`, `b`, `e`
 */

import { ITutorial, ITutorialMetadata, ITutorialStage } from "./../ITutorial"
import * as Stages from "./../Stages"

const Line1 = "Use the w key to move to the BEGINNING of the NEXT word."
const Line2 = "Use the e key to move to the END of the NEXT word."
const Line3 = "Use the b key to move to the BEGINNING of the PREVIOUS word."

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
            new Stages.MoveToGoalStage("Use the 'j' key to move down a line", 1, 10 /* todo */),
            new Stages.MoveToGoalStage(
                "Use the '0' key to move to the beginning of the line",
                1,
                0,
            ),
            new Stages.MoveToGoalStage(
                "Use the 'e' key to move to the end of the first word",
                1,
                2,
            ),
            new Stages.MoveToGoalStage(
                "Use the 'e' key to move to the end of the second word",
                1,
                6,
            ),
            new Stages.MoveToGoalStage(
                "Use the 'e' key to move to the end of the third word",
                1,
                8,
            ),
            new Stages.SetBufferStage([Line1, Line2, Line3]),
            new Stages.MoveToGoalStage("Use the 'j' key to move down a line", 2, 8 /* todo */),
            new Stages.MoveToGoalStage(
                "Use the '$' key to move to the end of the line",
                2,
                Line3.length - 1,
            ),
            new Stages.MoveToGoalStage(
                "Use the 'b' key to move to the beginning of the last word",
                2,
                Line3.length - "word.".length,
            ),
            new Stages.MoveToGoalStage(
                "Use the 'b' key to move to the beginning of the second-to-last word",
                2,
                Line3.length - "PREVIOUS word.".length,
            ),
            new Stages.MoveToGoalStage(
                "Use the 'b' key to move to the beginning of the third-to-last word",
                2,
                Line3.length - "the PREVIOUS word.".length,
            ),
        ]
    }

    public get metadata(): ITutorialMetadata {
        return {
            id: "oni.tutorials.word_motion",
            name: "Word Motion: w, e, b",
            description:
                "Often, `h` and `l` aren't the fastest way to move in a line. Word motions can be useful here - and even more useful when coupled with operators (we'll explore those later)! The `w` key moves to the first letter of the next word, the `b` key moves to the beginning letter of the previous word, and the `e` key moves to the end of the next word.",
            level: 170,
        }
    }

    public get stages(): ITutorialStage[] {
        return this._stages
    }
}
