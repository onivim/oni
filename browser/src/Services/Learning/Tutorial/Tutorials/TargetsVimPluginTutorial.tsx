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
const Line1c1 = "Targets.vim adds text objects for additional (operations)."
const Line1c2 = "Targets.vim adds text objects for additional (foo)."

const Line2a1 = "'cin(' changes inside the next pair of (parenthesis)."
const Line2a2 = "'cin(' changes inside the next pair of ()."
const Line2a3 = "'cin(' changes inside the next pair of (foo)."
const Line2b1 = "'can(' changes the next pair of (parenthesis)."
const Line2b2 = "'can(' changes the next pair of bar."
const Line2c = "Replacing 'n' with 'l' will change the previous pair."
const Line2d1 = "Omitting either will change the (current pair) or the (next)."
const Line2d2 = "Omitting either will change the  or the (next)."
const Line2d3 = "Omitting either will change the  or the again."

const Line3a1 = "Quote objects can 'also' be used."
const Line3a2 = "Quote objects can '' be used."
const Line3b1 = '\'cIn"\' changes the first characters inside of " quotes ".'
const Line3b2 = '\'cIn"\' changes the first characters inside of " test ".'
const Line3c = '\'cAn"\' changes around the "quotes" .'

const Line4a1 = "'din,' will delete inside the next list, with, commas."
const Line4a2 = "'din,' will delete inside the next list,, commas."
const Line4b = "Many different seperators are possible."
const Line4c1 = "Some applications you might consider not_a_list."
const Line4c2 = "Some applications you might consider not__list."

const Line5a = "Replacing the text character with 'a' will find the next programming argument."
const Line5b1 = "'cina' will change inside the (next, argument)."
const Line5b2 = "'cina' will change inside the (fixed, argument)."
const Line5c1 = "'dana' deletes the (next, argument)"
const Line5c2 = "'dana' deletes the (argument)"

const Line6a = "These are only a brief overview of Targets.vim."
const Line6b = "More advanced features can be found on its github repository."
const Line6c = "https://github.com/wellle/targets.vim"

export class TargetsVimPluginTutorial implements ITutorial {
    private _stages: ITutorialStage[]

    constructor() {
        this._stages = [
            new Stages.SetBufferStage([Line1a, Line1b, Line1c1]),
            new Stages.SetCursorPositionStage(0, 0),
            new Stages.MoveToGoalStage("Use 'cin(' to change inside the next parenthesis", 2, 46),
            new Stages.WaitForStateStage("Type 'foo'", [Line1a, Line1b, Line1c2]),
            new Stages.WaitForModeStage("Press ESC to go back to normal mode", "normal"),
            Stages.combine(
                null,
                new Stages.FadeInLineStage(null, 1, Line2a1),
                new Stages.FadeInLineStage(null, 2, Line2b1),
                new Stages.FadeInLineStage(null, 3, Line2c),
                new Stages.SetBufferStage([Line2a1, Line2b1, Line2c, Line2d1]),
            ),
            new Stages.SetCursorPositionStage(0, 7),
            Stages.combine(
                "Use 'din(' to delete inside the next parenthesis",
                new Stages.DeleteCharactersStage(null, 0, 40, "parenthesis"),
                new Stages.WaitForStateStage(null, [Line2a2, Line2b1, Line2c, Line2d1]),
            ),
            new Stages.SetCursorPositionStage(1, 7),
            new Stages.MoveToGoalStage("Use 'can(' to change the next parenthesis", 1, 32),
            new Stages.WaitForStateStage("Type 'bar'", [Line2a2, Line2b2, Line2c, Line2d1]),
            new Stages.WaitForModeStage("Press ESC to go back to normal mode", "normal"),
            new Stages.MoveToGoalStage("Use 'cil(' to change inside the last parenthesis", 0, 40),
            new Stages.WaitForStateStage("Type 'foo'", [Line2a3, Line2b2, Line2c, Line2d1]),
            new Stages.WaitForModeStage("Press ESC to go back to normal mode", "normal"),
            new Stages.SetCursorPositionStage(3, 34),
            Stages.combine(
                "Use 'da(' to delete the current parenthesis",
                new Stages.DeleteCharactersStage(null, 3, 32, "(current pair)"),
                new Stages.WaitForStateStage(null, [Line2a3, Line2b2, Line2c, Line2d2]),
            ),
            new Stages.MoveToGoalStage("Use 'ca(' to change the next parenthesis", 3, 40),
            new Stages.WaitForStateStage("Type 'again'", [Line2a3, Line2b2, Line2c, Line2d3]),
            new Stages.WaitForModeStage("Press ESC to go back to normal mode", "normal"),
            Stages.combine(
                null,
                new Stages.FadeInLineStage(null, 1, Line3a1),
                new Stages.FadeInLineStage(null, 2, Line3b1),
                new Stages.SetBufferStage([Line3a1, Line3b1, Line3c]),
            ),
            new Stages.SetCursorPositionStage(0, 0),
            Stages.combine(
                "Use din' to delete inside the next single quotes",
                new Stages.DeleteCharactersStage(null, 0, 19, "also"),
                new Stages.WaitForStateStage(null, [Line3a2, Line3b1, Line3c]),
            ),
            new Stages.SetCursorPositionStage(1, 7),
            new Stages.MoveToGoalStage(
                'Use cIn" to change the first non-whitespace characters inside the next double quotes',
                1,
                48,
            ),
            new Stages.WaitForStateStage("Type 'test'", [Line3a2, Line3b2, Line3c]),
            new Stages.WaitForModeStage("Press ESC to go back to normal mode", "normal"),
            new Stages.SetCursorPositionStage(2, 7),
            new Stages.MoveToGoalStage('Use cAn" to change the next double quotes', 2, 26),
            new Stages.WaitForModeStage("Press ESC to go back to normal mode", "normal"),
            Stages.combine(
                null,
                new Stages.FadeInLineStage(null, 1, Line4a1),
                new Stages.FadeInLineStage(null, 2, Line4b),
                new Stages.SetBufferStage([Line4a1, Line4b, Line4c1]),
            ),
            new Stages.SetCursorPositionStage(0, 7),
            Stages.combine(
                "Use 'din,' to delete the next item in the list",
                new Stages.DeleteCharactersStage(null, 0, 40, " with"),
                new Stages.WaitForStateStage(null, [Line4a2, Line4b, Line4c1]),
            ),
            Stages.combine(
                "Use 'din_' to delete inside the next underline in the variable",
                new Stages.DeleteCharactersStage(null, 2, 41, "a"),
                new Stages.WaitForStateStage(null, [Line4a2, Line4b, Line4c2]),
            ),
            new Stages.MoveToGoalStage("Type gg to go to the beginning.", 0, 0),
            Stages.combine(
                null,
                new Stages.FadeInLineStage(null, 1, Line5a),
                new Stages.FadeInLineStage(null, 2, Line5b1),
                new Stages.SetBufferStage([Line5a, Line5b1, Line5c1]),
            ),
            new Stages.SetCursorPositionStage(0, 0),
            new Stages.MoveToGoalStage("Use 'cina' to change the next programming argument", 1, 31),
            new Stages.WaitForStateStage("Type 'fixed'", [Line5a, Line5b2, Line5c1]),
            new Stages.WaitForModeStage("Press ESC to go back to normal mode", "normal"),
            new Stages.MoveToGoalStage("Move to the next line", 2, 7),
            Stages.combine(
                "Use 'dana' to delete the next argument",
                new Stages.DeleteCharactersStage(null, 2, 20, "next, "),
                new Stages.WaitForStateStage(null, [Line5a, Line5b2, Line5c2]),
            ),
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
            name: "Targets.vim plugin",
            description:
                'Targets.vim is a plugin installed by default to help move between pairs of characters such as (), {}, or "".  It does this by adding various text objects to operate on and expand simple commands like \'di"\'.',
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
