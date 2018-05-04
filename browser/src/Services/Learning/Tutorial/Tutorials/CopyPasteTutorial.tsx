/**
 * CopyPasteTutorial.tsx
 *
 * Tutorial for learning how to copy and paste text.
 */

import * as React from "react"

import { ITutorial, ITutorialMetadata, ITutorialStage } from "./../ITutorial"
import * as Notes from "./../Notes"
import * as Stages from "./../Stages"

const Line1 = "Like the 'd' operator, 'y' can be used to yank (copy) text"
const Line2 = "Any deleted text or yanked can then be pasted with 'p'"
const Line2YankMarker = "Any deleted ".length
const Line2PasteMarker = "Any deleted text or yanked".length
const Line2PostPaste1 = "Any deleted text or yanked text can then be pasted with 'p'"
const Line2PostPaste2 = "text Any deleted text or yanked text can then be pasted with 'p'"
const Line1PostTranspose = "iLke the 'd' operator, 'y' can be used to yank (copy) text"

export class CopyPasteTutorial implements ITutorial {
    private _stages: ITutorialStage[]

    constructor() {
        this._stages = [
            new Stages.SetBufferStage([Line1, Line2]),
            new Stages.MoveToGoalStage("Move to the word 'text'", 1, Line2YankMarker),
            new Stages.WaitForRegisterStage("Yank this word with 'yw'", "text "),
            new Stages.MoveToGoalStage("Move after the word 'yanked'", 1, Line2PasteMarker),
            new Stages.WaitForStateStage("Paste after the cursor with 'p'", [
                Line1,
                Line2PostPaste1,
            ]),
            new Stages.MoveToGoalStage("Move to the beginning of the line", 1, 0),
            new Stages.WaitForStateStage("Paste before the cursor with 'P'", [
                Line1,
                Line2PostPaste2,
            ]),
            new Stages.WaitForRegisterStage(
                "Yank the entire line with 'yy'",
                Line2PostPaste2 + "\n",
            ),
            new Stages.WaitForStateStage("Paste the yanked line below the cursor with 'p'", [
                Line1,
                Line2PostPaste2,
                Line2PostPaste2,
            ]),
            new Stages.MoveToGoalStage("Move to the top of the file", 0, 0),
            new Stages.WaitForStateStage("Paste _above_ the cursor with 'P'", [
                Line2PostPaste2,
                Line1,
                Line2PostPaste2,
                Line2PostPaste2,
            ]),
            new Stages.MoveToGoalStage("Move to the next line", 1, 0),
            new Stages.WaitForStateStage("Deleting also copies text. Delete a line with 'dd'", [
                Line2PostPaste2,
                Line2PostPaste2,
                Line2PostPaste2,
            ]),
            new Stages.WaitForStateStage("Again, paste with 'p'", [
                Line2PostPaste2,
                Line2PostPaste2,
                Line1,
                Line2PostPaste2,
            ]),
            new Stages.WaitForStateStage(
                "Since deleted text is also copied, transposing characters is simple.  Try 'xp'",
                [Line2PostPaste2, Line2PostPaste2, Line1PostTranspose, Line2PostPaste2],
            ),
        ]
    }

    public get metadata(): ITutorialMetadata {
        return {
            id: "oni.tutorials.copy_paste",
            name: "Copy & Paste: y, p",
            description:
                "Now that you know the delete and change operators, let's learn vim's final operator: `y`.  The `y` operator can be used to copy (\"yank\") text which can then be pasted with `p`.  Using `p` pastes _after_ the cursor, and `P` pastes _before_ the cursor.  The `y` operator behaves just like the `d` and `c` operators and can be paired with any motion.",
            level: 220,
        }
    }

    public get stages(): ITutorialStage[] {
        return this._stages
    }

    public get notes(): JSX.Element[] {
        return [
            <Notes.YankOperatorKey />,
            <Notes.YankWordKey />,
            <Notes.YankLineKey />,
            <Notes.DeleteOperatorKey />,
            <Notes.DeleteWordKey />,
            <Notes.DeleteLineKey />,
            <Notes.pasteKey />,
            <Notes.PasteKey />,
        ]
    }
}
