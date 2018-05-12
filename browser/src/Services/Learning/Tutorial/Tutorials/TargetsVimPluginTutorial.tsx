/**
 *
 * Tutorial that exercises the targets.vim plugin
 */

import * as React from "react"

import { ITutorial, ITutorialMetadata, ITutorialStage } from "./../ITutorial"
import * as Notes from "./../Notes"
import * as Stages from "./../Stages"

const Line1a = "The Targets.vim plugin is very useful!"
const Line1b = "It was created by Christian Wellenbrock."
const Line1c = "Targets.vim adds text objects for additional (operations)."

const Line2a = "'cin(' selects inside the next pair of (parenthesis)."
const Line2b = "'can(' selects around the next pair of (parenthesis)."
const Line2c = "Replacing 'n' with 'l' will move to the previous pair."
const Line2d = "Omitting either will select the (current pair) or the (next)."

const Line3a = "Quote objects can 'also' be used."
const Line3b = '\'cIn"\' selects the first characters inside of " quotes ".'
const Line3c = '\'cAn"\' selects around the "quotes" .'

const Line4a = "'din,' will delete inside the next list, with, commas."
const Line4b = "Many different seperators are possible."
const Line4c = "Some applications you might consider not_a_list."

const Line5a = "Replacing the text character with 'a' will find the next programming argument."
const Line5b = "'dina' will select inside the (next, argument)."
const Line5c = "'dana' selects around the (next, argument)"

const Line6a = "These are only a brief overview of Targets.vim."
const Line6b = "More advanced features can be found on its github repository."
const Line6c = "https://github.com/wellle/targets.vim"

export class TargetsVimPluginTutorial implements ITutorial {
    private _stages: ITutorialStage[]

    constructor() {
        this._stages = [
            new Stages.SetBufferStage([Line1a, Line1b, Line1c]),
            new Stages.SetCursorPositionStage(0, 0),
            new Stages.MoveToGoalStage("Use 'cin(' to move inside the paranthesis", 2, 46),
            new Stages.MoveToGoalStage("Type 'foo'", 2, 49),
            new Stages.WaitForModeStage("Press ESC to go back to normal mode", "normal"),
            Stages.combine(
                null,
                new Stages.FadeInLineStage(null, 1, Line2a),
                new Stages.FadeInLineStage(null, 2, Line2b),
                new Stages.FadeInLineStage(null, 3, Line2c),
                new Stages.SetBufferStage([Line2a, Line2b, Line2c, Line2d]),
            ),
            new Stages.SetCursorPositionStage(0, 7),
            new Stages.MoveToGoalStage("Use 'cin(' to move inside the paranthesis", 0, 40),
            new Stages.WaitForModeStage("Press ESC to go back to normal mode", "normal"),
            new Stages.SetCursorPositionStage(1, 7),
            new Stages.MoveToGoalStage("Use 'can(' to move around the paranthesis", 1, 39),
            new Stages.MoveToGoalStage("Type 'bar'", 1, 42),
            new Stages.WaitForModeStage("Press ESC to go back to normal mode", "normal"),
            new Stages.MoveToGoalStage(
                "Use 'cil(' to move back inside the last paranthesis",
                0,
                40,
            ),
            new Stages.WaitForModeStage("Press ESC to go back to normal mode", "normal"),
            new Stages.SetCursorPositionStage(3, 34),
            new Stages.MoveToGoalStage("Use 'ca(' to select inside the current paranthesis", 3, 32),
            new Stages.WaitForModeStage("Press ESC to go back to normal mode", "normal"),
            new Stages.MoveToGoalStage("Use 'ca(' to select the next paranthesis", 3, 40),
            new Stages.WaitForModeStage("Press ESC to go back to normal mode", "normal"),
            Stages.combine(
                null,
                new Stages.FadeInLineStage(null, 1, Line3a),
                new Stages.FadeInLineStage(null, 2, Line3b),
                new Stages.SetBufferStage([Line3a, Line3b, Line3c]),
            ),
            new Stages.SetCursorPositionStage(0, 0),
            new Stages.MoveToGoalStage("Use 'cin'' to move inside the single quotes", 0, 19),
            new Stages.WaitForModeStage("Press ESC to go back to normal mode", "normal"),
            new Stages.SetCursorPositionStage(1, 7),
            new Stages.MoveToGoalStage(
                "Use 'cIn\"' to move to first character inside double quotes",
                1,
                48,
            ),
            new Stages.WaitForModeStage("Press ESC to go back to normal mode", "normal"),
            new Stages.SetCursorPositionStage(2, 7),
            new Stages.MoveToGoalStage("Use 'cAn\"' to select around the double quotes", 2, 26),
            new Stages.WaitForModeStage("Press ESC to go back to normal mode", "normal"),
            Stages.combine(
                null,
                new Stages.FadeInLineStage(null, 1, Line4a),
                new Stages.FadeInLineStage(null, 2, Line4b),
                new Stages.SetBufferStage([Line4a, Line4b, Line4c]),
            ),
            new Stages.SetCursorPositionStage(0, 7),
            new Stages.MoveToGoalStage("Use 'din,' to delete the next item in the list", 0, 40),
            new Stages.MoveToGoalStage(
                "Use 'din_' to delete from the middle of the variable",
                2,
                41,
            ),
            new Stages.WaitForModeStage("Press ESC to go back to normal mode", "normal"),
            new Stages.MoveToGoalStage("Type gg to go to the beginning.", 0, 0),
            Stages.combine(
                null,
                new Stages.FadeInLineStage(null, 1, Line5a),
                new Stages.FadeInLineStage(null, 2, Line5b),
                new Stages.SetBufferStage([Line5a, Line5b, Line5c]),
            ),
            new Stages.SetCursorPositionStage(0, 0),
            new Stages.MoveToGoalStage("Use 'dina' to delete the next programming argument", 1, 31),
            new Stages.MoveToGoalStage("Use 'dana' to delete around the next argument", 2, 27),
            new Stages.MoveToGoalStage("Type gg to go to the beginning.", 0, 0),
            Stages.combine(
                null,
                new Stages.FadeInLineStage(null, 1, Line6a),
                new Stages.FadeInLineStage(null, 2, Line6b),
                new Stages.SetBufferStage([Line6a, Line6b, Line6c]),
            ),
            new Stages.SetCursorPositionStage(2, 0),
            new Stages.MoveToGoalStage("Type gg to go to the beginning.", 0, 0),
        ]
    }

    public get metadata(): ITutorialMetadata {
        return {
            id: "oni.tutorials.targets_plugin",
            name: "Target.vim plugin",
            description:
                'Target.vim is a plugin installed by default to help move between pairs of characters such as (), {}, or "".  It does this by adding various text objects to operate on and expand simple commands like \'di"\'.',
            level: 300,
        }
    }

    public get stages(): ITutorialStage[] {
        return this._stages
    }

    public get notes(): JSX.Element[] {
        return [
            <Notes.Targetckey />,
            <Notes.Targetdkey />,
            <Notes.Targetikey />,
            <Notes.Targetakey />,
            <Notes.TargetIkey />,
            <Notes.TargetAkey />,
            <Notes.Targetnkey />,
            <Notes.Targetlkey />,
        ]
    }
}
