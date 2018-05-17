/**
 * TutorialBufferLayer.tsx
 *
 * Layer that handles the top-level rendering of the tutorial UI,
 * including the nested `NeovimEditor`, description, goals, etc.
 */

import * as React from "react"

// import * as Oni from "oni-api"
// import { Event, IEvent } from "oni-types"

import styled from "styled-components"

import { Bold, withProps } from "./../../../UI/components/common"
import { Icon, IconSize } from "./../../../UI/Icon"

const NoteWrapper = styled.div`
    display: flex;
    flex-direction: row;
    align-items: center;
`

const KeyWrapper = withProps<{}>(styled.div)`
    background-color: ${props => props.theme.background};
    color: ${props => props.theme.foreground};
    border: 1px solid ${props => props.theme.foreground};

    width: 40px;
    height: 40px;

    flex: 0 0 auto;

    display: flex;
    justify-content: center;
    align-items: center;

    margin: 1em;
`

const DescriptionWrapper = styled.div``

export const KeyWithDescription = (props: {
    keyCharacter: string
    description: JSX.Element
}): JSX.Element => {
    return (
        <NoteWrapper>
            <KeyWrapper>{props.keyCharacter}</KeyWrapper>
            <DescriptionWrapper>{props.description}</DescriptionWrapper>
        </NoteWrapper>
    )
}

const VerticalStackWrapper = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
`

const IconWrapper = styled.div``

export const KeyWithIconAbove = (props: {
    keyCharacter: string
    icon: JSX.Element
}): JSX.Element => {
    return (
        <VerticalStackWrapper>
            <IconWrapper>{props.icon}</IconWrapper>
            <KeyWrapper>{props.keyCharacter}</KeyWrapper>
        </VerticalStackWrapper>
    )
}

export const IKey = (): JSX.Element => {
    return (
        <KeyWithDescription
            keyCharacter="i"
            description={
                <span>
                    Enters <Bold>insert</Bold> mode at the cursor position
                </span>
            }
        />
    )
}

export const EscKey = (): JSX.Element => {
    return (
        <KeyWithDescription
            keyCharacter="esc"
            description={
                <span>
                    Goes back to <Bold>normal</Bold> mode
                </span>
            }
        />
    )
}

export const OKey = (): JSX.Element => {
    return (
        <KeyWithDescription
            keyCharacter="o"
            description={
                <span>
                    Enters <Bold>insert</Bold> mode, on a new line
                </span>
            }
        />
    )
}

export const UKey = (): JSX.Element => {
    return <KeyWithDescription keyCharacter="u" description={<span>Undo a single change</span>} />
}

export const GGKey = (): JSX.Element => {
    return (
        <KeyWithDescription
            keyCharacter="gg"
            description={<span>Moves the cursor to the TOP of the file.</span>}
        />
    )
}

export const GKey = (): JSX.Element => {
    return (
        <KeyWithDescription
            keyCharacter="G"
            description={<span>Moves the cursor to the BOTTOM of the file.</span>}
        />
    )
}

export const XGKey = (): JSX.Element => {
    return (
        <KeyWithDescription
            keyCharacter="#+G"
            description={
                <span>Moves the cursor to line `#`. For example, `10G` moves to line 10.</span>
            }
        />
    )
}

export const ZeroKey = (): JSX.Element => {
    return (
        <KeyWithDescription
            keyCharacter="0"
            description={<span>Moves the cursor to the BEGINNING of the line.</span>}
        />
    )
}
export const UnderscoreKey = (): JSX.Element => {
    return (
        <KeyWithDescription
            keyCharacter="_"
            description={<span>Moves the cursor to the FIRST CHARACTER of the line.</span>}
        />
    )
}
export const DollarKey = (): JSX.Element => {
    return (
        <KeyWithDescription
            keyCharacter="$"
            description={<span>Moves the cursor to the END of the line.</span>}
        />
    )
}
export const WordKey = (): JSX.Element => {
    return (
        <KeyWithDescription
            keyCharacter="w"
            description={<span>Moves the cursor to the BEGINNING of the NEXT word.</span>}
        />
    )
}
export const BeginningKey = (): JSX.Element => {
    return (
        <KeyWithDescription
            keyCharacter="b"
            description={<span>Moves the cursor to the BEGINNING of the PREVIOUS word.</span>}
        />
    )
}
export const EndKey = (): JSX.Element => {
    return (
        <KeyWithDescription
            keyCharacter="e"
            description={<span>Moves the cursor to the END of the NEXT word.</span>}
        />
    )
}
export const SlashKey = (): JSX.Element => {
    return (
        <KeyWithDescription
            keyCharacter="/"
            description={<span>Search for the given string</span>}
        />
    )
}
export const QuestionKey = (): JSX.Element => {
    return (
        <KeyWithDescription
            keyCharacter="?"
            description={<span>Search backwards for the given string</span>}
        />
    )
}
export const nKey = (): JSX.Element => {
    return (
        <KeyWithDescription
            keyCharacter="n"
            description={<span>Move the cursor to the next instance of the matched string</span>}
        />
    )
}
export const NKey = (): JSX.Element => {
    return (
        <KeyWithDescription
            keyCharacter="N"
            description={
                <span>Move the cursor to the previous instance of the matched string</span>
            }
        />
    )
}
export const DeleteOperatorKey = (): JSX.Element => {
    return (
        <KeyWithDescription
            keyCharacter="d"
            description={
                <span>
                    <Bold>+ motion</Bold>: Deletes text specified by a `motion`. Examples:
                </span>
            }
        />
    )
}
export const DeleteLineKey = (): JSX.Element => {
    return (
        <KeyWithDescription
            keyCharacter="dd"
            description={<span>Deletes the CURRENT line.</span>}
        />
    )
}
export const DeleteLineBelowKey = (): JSX.Element => {
    return (
        <KeyWithDescription
            keyCharacter="dj"
            description={<span>Deletes the CURRENT line and the one BELOW.</span>}
        />
    )
}
export const DeleteLineAboveKey = (): JSX.Element => {
    return (
        <KeyWithDescription
            keyCharacter="dk"
            description={<span>Deletes the CURRENT line and the one ABOVE.</span>}
        />
    )
}
export const DeleteWordKey = (): JSX.Element => {
    return (
        <KeyWithDescription
            keyCharacter="dw"
            description={<span>Delete to the end of the current word.</span>}
        />
    )
}

export const ChangeOperatorKey = (): JSX.Element => {
    return (
        <KeyWithDescription
            keyCharacter="c"
            description={
                <span>
                    <Bold>+ motion</Bold>: Change text specified by a `motion`. Examples:
                </span>
            }
        />
    )
}
export const ChangeWordKey = (): JSX.Element => {
    return (
        <KeyWithDescription
            keyCharacter="cw"
            description={<span>Delete to the end of the current word and enter Insert mode.</span>}
        />
    )
}

export const HJKLKeys = (): JSX.Element => {
    return (
        <NoteWrapper style={{ margin: "2em 0em" }}>
            <KeyWithIconAbove
                keyCharacter={"h"}
                icon={<Icon name="arrow-left" size={IconSize.Large} />}
            />
            <KeyWithIconAbove
                keyCharacter={"j"}
                icon={<Icon name="arrow-down" size={IconSize.Large} />}
            />
            <KeyWithIconAbove
                keyCharacter={"k"}
                icon={<Icon name="arrow-up" size={IconSize.Large} />}
            />
            <KeyWithIconAbove
                keyCharacter={"l"}
                icon={<Icon name="arrow-right" size={IconSize.Large} />}
            />
        </NoteWrapper>
    )
}

export const YankOperatorKey = (): JSX.Element => {
    return (
        <KeyWithDescription
            keyCharacter="y"
            description={
                <span>
                    <Bold>+ motion</Bold>: Yanks (copies) text specified by a `motion`
                </span>
            }
        />
    )
}
export const YankWordKey = (): JSX.Element => {
    return (
        <KeyWithDescription
            keyCharacter="yw"
            description={<span>Yank to the end of the current word.</span>}
        />
    )
}
export const YankLineKey = (): JSX.Element => {
    return (
        <KeyWithDescription keyCharacter="yy" description={<span>Yanks the CURRENT line.</span>} />
    )
}
export const pasteKey = (): JSX.Element => {
    return <KeyWithDescription keyCharacter="p" description={<span>Paste AFTER the cursor</span>} />
}
export const PasteKey = (): JSX.Element => {
    return (
        <KeyWithDescription keyCharacter="P" description={<span>Paste BEFORE the cursor</span>} />
    )
}

export const VisualModeKey = (): JSX.Element => {
    return (
        <KeyWithDescription
            keyCharacter="v"
            description={<span>Move into Visual mode for selecting text</span>}
        />
    )
}
export const VisualLineModeKey = (): JSX.Element => {
    return (
        <KeyWithDescription
            keyCharacter="V"
            description={<span>Move into line-wise Visual mode for selecting lines</span>}
        />
    )
}

export const Targetckey = (): JSX.Element => {
    return (
        <KeyWithDescription
            keyCharacter="c"
            description={<span>Delete AND INSERT between next pair characters</span>}
        />
    )
}

export const Targetdkey = (): JSX.Element => {
    return (
        <KeyWithDescription
            keyCharacter="d"
            description={<span>Delete between next pair characters</span>}
        />
    )
}

export const Targetikey = (): JSX.Element => {
    return (
        <KeyWithDescription
            keyCharacter="i"
            description={<span>Select first character inside of pair characters</span>}
        />
    )
}

export const Targetakey = (): JSX.Element => {
    return (
        <KeyWithDescription
            keyCharacter="a"
            description={<span>Select next pair including the pair characters</span>}
        />
    )
}

export const TargetIkey = (): JSX.Element => {
    return (
        <KeyWithDescription
            keyCharacter="I"
            description={<span>Select contents of pair characters</span>}
        />
    )
}

export const TargetAkey = (): JSX.Element => {
    return (
        <KeyWithDescription
            keyCharacter="A"
            description={<span>Select around the pair characters</span>}
        />
    )
}

export const Targetnkey = (): JSX.Element => {
    return (
        <KeyWithDescription
            keyCharacter="n"
            description={<span>Select the next pair characters</span>}
        />
    )
}

export const Targetlkey = (): JSX.Element => {
    return (
        <KeyWithDescription
            keyCharacter="l"
            description={<span>Select the previous pair characters</span>}
        />
    )
}
