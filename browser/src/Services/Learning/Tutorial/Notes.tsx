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

import { withProps, Bold } from "./../../../UI/components/common"
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
export const DeleteOperatorKey = (): JSX.Element => {
    return (
        <KeyWithDescription
            keyCharacter="d"
            description={
                <span>
                    <Bold>+ motion</Bold>: Deletes text covered by the `motion`. Examples:
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
