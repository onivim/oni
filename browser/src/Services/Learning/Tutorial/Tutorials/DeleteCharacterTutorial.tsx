/**
 * DeleteCharacterTutorial.tsx
 *
 * Tutorial that runs through deleting a character.
 */

import * as React from "react"

import { ITutorial, ITutorialMetadata, ITutorialStage } from "./../ITutorial"
import * as Notes from "./../Notes"
import * as Stages from "./../Stages"

import { Bold } from "./../../../../UI/components/common"

const TutorialLine1Original = "The coww jumped over the mmoon"
const TutorialLine1CorrectA = "The cow jumped over the mmoon"
const TutorialLine1Correct = "The cow jumped over the moon"

const TutorialLine2FirstMarker = "The b".length - 1
const TutorialLine2Original = "The bboy bougght the baskketball"
const TutorialLine2SecondMarker = "The boy boug".length - 1
const TutorialLine2CorrectA = "The boy bougght the baskketball"

const TutorialLine2ThirdMarker = "The boy bought the bask".length - 1
const TutorialLine2CorrectB = "The boy bought the baskketball"

const TutorialLine2Correct = "The boy bought the basketball"

const TutorialLine3Original = "Modal edditing is the ccats pajamas"

const TutorialLine3FirstMarker = "Modal ed".length - 1
const TutorialLine3CorrectA = "Modal editing is the ccats pajamas"

const TutorialLine3SecondMarker = "Modal editing is the c".length - 1
const TutorialLine3Correct = "Modal editing is the cats pajamas"

export class DeleteCharacterTutorial implements ITutorial {
    private _stages: ITutorialStage[]

    constructor() {
        this._stages = [
            new Stages.SetBufferStage([TutorialLine1Original]),
            new Stages.MoveToGoalStage("Move to the first duplicated 'w' character", 0, 6),
            Stages.combine(
                "Delete the duplicated 'w' character by pressing `x`",
                new Stages.DeleteCharactersStage(null, 0, 6, "w"),
                new Stages.WaitForStateStage(null, [TutorialLine1CorrectA]),
            ),
            new Stages.MoveToGoalStage(
                "Move to the first duplicated 'm' character",
                0,
                TutorialLine1CorrectA.length - 5,
            ),
            Stages.combine(
                "Remove the duplicated 'm' character by pressing `x`",
                new Stages.DeleteCharactersStage(null, 0, TutorialLine1CorrectA.length - 5, "m"),
                new Stages.WaitForStateStage(null, [TutorialLine1Correct]),
            ),
            new Stages.SetBufferStage([TutorialLine1Correct, TutorialLine2Original]),
            new Stages.MoveToGoalStage(
                "Move to the first duplicated 'b' character",
                1,
                TutorialLine2FirstMarker,
            ),
            Stages.combine(
                "Remove the duplicated 'b' character by pressing `x`",
                new Stages.DeleteCharactersStage(null, 1, TutorialLine2FirstMarker, "b"),
                new Stages.WaitForStateStage(null, [TutorialLine1Correct, TutorialLine2CorrectA]),
            ),
            new Stages.MoveToGoalStage(
                "Move to the first duplicated 'g' character",
                1,
                TutorialLine2SecondMarker,
            ),
            Stages.combine(
                "Remove the duplicated 'g' character by pressing `x`",
                new Stages.DeleteCharactersStage(null, 1, TutorialLine2SecondMarker, "g"),
                new Stages.WaitForStateStage(null, [TutorialLine1Correct, TutorialLine2CorrectB]),
            ),
            new Stages.MoveToGoalStage(
                "Move to the first duplicated 'k' character",
                1,
                TutorialLine2ThirdMarker,
            ),
            Stages.combine(
                "Remove the duplicated 'k' character by pressing `x`",
                new Stages.DeleteCharactersStage(null, 1, TutorialLine2ThirdMarker, "g"),
                new Stages.WaitForStateStage(null, [TutorialLine1Correct, TutorialLine2Correct]),
            ),
            new Stages.SetBufferStage([
                TutorialLine1Correct,
                TutorialLine2Correct,
                TutorialLine3Original,
            ]),

            new Stages.MoveToGoalStage(
                "Move to the first duplicated 'd' character",
                2,
                TutorialLine3FirstMarker,
            ),
            Stages.combine(
                "Remove the duplicated 'd' character by pressing `x`",
                new Stages.DeleteCharactersStage(null, 2, TutorialLine3FirstMarker, "d"),
                new Stages.WaitForStateStage(null, [
                    TutorialLine1Correct,
                    TutorialLine2Correct,
                    TutorialLine3CorrectA,
                ]),
            ),

            new Stages.MoveToGoalStage(
                "Move to the first duplicated 'c' character",
                2,
                TutorialLine3SecondMarker,
            ),
            Stages.combine(
                "Remove the duplicated 'c' character by pressing `x`",
                new Stages.DeleteCharactersStage(null, 2, TutorialLine3SecondMarker, "c"),
                new Stages.WaitForStateStage(null, [
                    TutorialLine1Correct,
                    TutorialLine2Correct,
                    TutorialLine3Correct,
                ]),
            ),
        ]
    }

    public get metadata(): ITutorialMetadata {
        return {
            id: "oni.tutorial.delete_character",
            name: "Deleting a Character",
            description:
                "In normal mode, you can quickly delete characters. Move to the character (using h/j/k/l) and press `x` to delete. Correct the above lines without going to insert mode.",
            level: 120,
        }
    }

    public get notes(): JSX.Element[] {
        return [
            <Notes.HJKLKeys />,
            <Notes.KeyWithDescription
                keyCharacter={"x"}
                description={
                    <span>
                        In normal mode, <Bold>deletes the character</Bold> at the cursor position.
                    </span>
                }
            />,
        ]
    }

    public get stages(): ITutorialStage[] {
        return this._stages
    }
}
