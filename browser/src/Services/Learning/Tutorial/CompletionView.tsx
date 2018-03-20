/**
 * CompletionView.tsx
 *
 * 'Goal' item for the tutorial
 */

import * as React from "react"

import styled, { keyframes } from "styled-components"

import { Container, Fixed, Full, withProps } from "./../../../UI/components/common"
// import { FlipCard } from "./../../../UI/components/FlipCard"
import { Icon, IconSize } from "./../../../UI/Icon"

export interface ICompletionViewProps {
    time: number
    keyStrokes: number
}

const RotatingKeyFrames = keyframes`
    0% { transform: rotateY(0deg); }
    100% { transform: rotateY(360deg); }
`

const TrophyIconWrapper = withProps<{}>(styled.div)`
    background-color: rgb(97, 175, 239);
    color: white;

    width: 72px;
    height: 72px;
    border-radius: 36px;

    animation: ${RotatingKeyFrames} 2s linear infinite;

    display: flex;
    justify-content: center;
    align-items: center;
`

const ResultsWrapper = styled.div`
    color: white;
    font-size: 2em;
    padding: 2em;
`

const Bold = styled.span`
    font-weight: bold;
`

const FooterWrapper = styled.div`
    padding: 1em;
`

export const CompletionView = (props: ICompletionViewProps): JSX.Element => {
    return (
        <Container
            fullHeight={true}
            fullWidth={true}
            direction="vertical"
            style={{
                backgroundColor: "black",
                color: "white",
                justifyContent: "center",
                alignItems: "center",
            }}
        >
            <Fixed>
                <h1>Level Complete!</h1>
            </Fixed>
            <Full style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                <TrophyIconWrapper>
                    <Icon name="trophy" size={IconSize.ThreeX} />
                </TrophyIconWrapper>
            </Full>
            <Fixed>
                <ResultsWrapper>
                    <div>
                        <Bold>Time:</Bold> {props.time}s
                    </div>
                    <div>
                        <Bold>Keystrokes:</Bold> {props.keyStrokes}
                    </div>
                </ResultsWrapper>
            </Fixed>
            <Fixed>
                <FooterWrapper>Press any key to continue...</FooterWrapper>
            </Fixed>
        </Container>
    )
}
