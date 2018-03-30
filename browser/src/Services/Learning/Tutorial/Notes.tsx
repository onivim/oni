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

import { withProps } from "./../../../UI/components/common"
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
