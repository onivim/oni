/**
 * TextObjectsTutorial.tsx
 *
 * Tutorial to teach text objects
 */

import * as React from "react"

import { ITutorial, ITutorialMetadata, ITutorialStage } from "./../ITutorial"
import * as Notes from "./../Notes"
import * as Stages from "./../Stages"

const stage1line1 = "Text objects typically have delimiters like ( ) and { }"
const stage1line2 = "This sentence has a phrase (within some parentheses) for testing"
const stage1line2a = "This sentence has a phrase () for testing"
const stage1line2b = "This sentence has a phrase  for testing"
const stage1line2c =
    "This sentence has a phrase (within some parentheses) for testingwithin some parentheses"
const stage1line2d = "This sentence has a phrase (this is a test) for testing"

const stage2line1 = "Text objects can also span multiple lines"
const stage2line2 = "{"
const stage2line3 = "   these are mostly useful"
const stage2line4 = "   when editing code"
const stage2line5 = "}"

const stage3line1 =
    "Text Objects aren't limited to single character delimiters; they also work with HTML!"
const stage3line2 = "<html>"
const stage3line3 = "   <p>"
const stage3line4 = "      <span>here is some text</span>"
const stage3line4a = "      <span></span>"
const stage3line4b = "      "
const stage3line5 = "   </p>"
const stage3line5a = "   "
const stage3line6 = "</html>"

const stage4line1 = "There are many other Text Objects we can manipulate"
const stage4line2 = "[ there ] ( are ) { many } < text > objects to try"
const stage4line2a = "[] ( are ) { many } < text > objects to try"
const stage4line2b = "[] () { many } < text > objects to try"
const stage4line2c = "[] () {} < text > objects to try"
const stage4line2d = "[] () {} <> objects to try"
const stage4line2e = "[] () {} <>  to try"

export class TextObjectsTutorial implements ITutorial {
    private _stages: ITutorialStage[]

    constructor() {
        this._stages = [
            new Stages.SetBufferStage([stage1line1, stage1line2]),
            new Stages.MoveToGoalStage("Move inside the parentheses", 1, 41),
            Stages.combine(
                "Use 'di(' to delete everything within the parentheses",
                new Stages.DeleteCharactersStage(null, 1, 28, "within some parentheses"),
                new Stages.WaitForStateStage(null, [stage1line1, stage1line2a]),
            ),
            new Stages.WaitForStateStage("Notice it left the parentheses.  Hit 'u' to undo", [
                stage1line1,
                stage1line2,
            ]),
            new Stages.MoveToGoalStage("Move inside the parentheses", 1, 41),
            Stages.combine(
                "Use 'da(' to delete the parentheses and everything within",
                new Stages.DeleteCharactersStage(null, 1, 27, "(within some parentheses)"),
                new Stages.WaitForStateStage(null, [stage1line1, stage1line2b]),
            ),
            new Stages.WaitForStateStage("Hit 'u' to undo", [stage1line1, stage1line2]),
            new Stages.MoveToGoalStage("Move inside the parentheses", 1, 41),
            new Stages.WaitForRegisterStage(
                "Use 'yi(' to yank everything with the parentheses",
                "within some parentheses",
            ),
            new Stages.MoveToGoalStage("Move to the end of the line", 1, 63),
            new Stages.WaitForStateStage("Paste from the clipboard with 'p'", [
                stage1line1,
                stage1line2c,
            ]),
            new Stages.WaitForStateStage("Hit 'u' to undo", [stage1line1, stage1line2]),
            new Stages.MoveToGoalStage("Move inside the parentheses", 1, 41),
            Stages.combine(
                "Use 'ci(' to change everything within the parentheses",
                new Stages.WaitForModeStage(null, "insert"),
                new Stages.WaitForStateStage(null, [stage1line1, stage1line2a]),
            ),
            new Stages.WaitForStateStage("Type 'this is a test'", [stage1line1, stage1line2d]),
            new Stages.WaitForModeStage("Hit <esc> to exit insert mode", "normal"),

            new Stages.SetBufferStage([
                stage2line1,
                stage2line2,
                stage2line3,
                stage2line4,
                stage2line5,
            ]),
            new Stages.MoveToGoalStage("Move inside the curly brackets", 2, 14),
            Stages.combine(
                "Use 'vi{' to select everything within the curly brackets",
                new Stages.MoveToGoalStage(null, 3, 19),
                new Stages.WaitForModeStage(null, "visual"),
            ),
            new Stages.WaitForModeStage("Hit <esc> to exit visual mode", "normal"),
            Stages.combine(
                "Use 'va{' to select everything including the curly brackets",
                new Stages.MoveToGoalStage(null, 4, 0),
                new Stages.WaitForModeStage(null, "visual"),
            ),
            new Stages.WaitForModeStage("Hit <esc> to exit visual mode", "normal"),

            new Stages.SetBufferStage([
                stage3line1,
                stage3line2,
                stage3line3,
                stage3line4,
                stage3line5,
                stage3line6,
            ]),
            new Stages.MoveToGoalStage("Move inside the HTML tag", 3, 20),
            Stages.combine(
                "Use 'dit' to delete everything within the <span> tag",
                new Stages.DeleteCharactersStage(null, 3, 12, "here is some text"),
                new Stages.WaitForStateStage(null, [
                    stage3line1,
                    stage3line2,
                    stage3line3,
                    stage3line4a,
                    stage3line5,
                    stage3line6,
                ]),
            ),
            new Stages.WaitForStateStage("Hit 'u' to undo", [
                stage3line1,
                stage3line2,
                stage3line3,
                stage3line4,
                stage3line5,
                stage3line6,
            ]),
            Stages.combine(
                "Use 'dat' to delete the <span> tag and its contents",
                new Stages.DeleteCharactersStage(null, 3, 6, "<span>here is some text</span>"),
                new Stages.WaitForStateStage(null, [
                    stage3line1,
                    stage3line2,
                    stage3line3,
                    stage3line4b,
                    stage3line5,
                    stage3line6,
                ]),
            ),
            Stages.combine(
                "Use 'dat' to delete the <p> tag and its contents",
                new Stages.DeleteCharactersStage(null, 2, 3, "<p>"),
                new Stages.DeleteCharactersStage(null, 3, 0, "      "),
                new Stages.DeleteCharactersStage(null, 4, 0, "   </p>"),
                new Stages.WaitForStateStage(null, [
                    stage3line1,
                    stage3line2,
                    stage3line5a,
                    stage3line6,
                ]),
            ),

            new Stages.SetBufferStage([stage4line1, stage4line2]),
            new Stages.MoveToGoalStage("Move to the next line", 1, 0),
            Stages.combine(
                "Try 'di['",
                new Stages.DeleteCharactersStage(null, 1, 1, " there "),
                new Stages.WaitForStateStage(null, [stage4line1, stage4line2a]),
            ),
            Stages.combine(
                "Try 'di('",
                new Stages.DeleteCharactersStage(null, 1, 4, " are "),
                new Stages.WaitForStateStage(null, [stage4line1, stage4line2b]),
            ),
            Stages.combine(
                "Try 'di{'",
                new Stages.DeleteCharactersStage(null, 1, 7, " many "),
                new Stages.WaitForStateStage(null, [stage4line1, stage4line2c]),
            ),
            Stages.combine(
                "Try 'di<'",
                new Stages.DeleteCharactersStage(null, 1, 10, " text "),
                new Stages.WaitForStateStage(null, [stage4line1, stage4line2d]),
            ),
            new Stages.MoveToGoalStage("Move inside the word 'objects'", 1, 15),
            Stages.combine(
                "Try 'diw'",
                new Stages.DeleteCharactersStage(null, 1, 12, "objects"),
                new Stages.WaitForStateStage(null, [stage4line1, stage4line2e]),
            ),
        ]
    }

    public get metadata(): ITutorialMetadata {
        return {
            id: "oni.tutorial.text_objects",
            name: "Text Objects: i, a",
            description:
                'Everything you\'ve learned so far has involved motions from the current cursor position to a destination of some kind.  Now it\'s time to learn about Text Objects, blocks of text with their own starting and ending characters.  Text Objects can be manipulated with the operators you\'ve already learned such as `y`, `c`, `d`, and `v`.  In general, defining a text obect with `i` will be the "inner" object, ignoring the text object boundary characters.  Defining a text object with `a` will be "an" object, including the text object boundaries.',
            level: 240,
        }
    }

    public get stages(): ITutorialStage[] {
        return this._stages
    }

    public get notes(): JSX.Element[] {
        return [
            <Notes.ChangeOperatorKey />,
            <Notes.DeleteOperatorKey />,
            <Notes.YankOperatorKey />,
            <Notes.VisualModeKey />,
            <Notes.innerTextObjectKey />,
            <Notes.aTextObjectKey />,
        ]
    }
}
