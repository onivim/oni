/**
 * CompletionView.tsx
 *
 * 'Goal' item for the tutorial
 */

import * as React from "react"

import styled, { keyframes } from "styled-components"

import { Container, Fixed, withProps } from "./../../../UI/components/common"
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

const AppearKeyFrames = keyframes`
    0% { opacity: 0; }
    100% { opacity: 1; }
`

export interface AppearWithDelayProps {
    delay: number
}

const AppearWithDelay = withProps<AppearWithDelayProps>(styled.div)`
    animation: ${AppearKeyFrames} 1s linear ${p => p.delay}s forwards;
    opacity: 0;
`

const TrophyIconWrapper = withProps<{}>(styled.div)`
    background-color: rgb(97, 175, 239);
    color: white;
    opacity: 0.1;

    width: 144px;
    height: 144px;
    border-radius: 72px;

    animation: ${RotatingKeyFrames} 2s linear infinite;

    display: flex;
    justify-content: center;
    align-items: center;
`

const ResultsWrapper = styled.div`
    color: white;
    font-size: 2em;

    height: 100%;
    flex: 1 1 auto;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
`

const Bold = styled.span`
    font-weight: bold;
`

const FooterWrapper = styled.div`
    padding: 1em;
`

const Layer = styled.div`
    position: absolute;
    top: 0px;
    left: 0px;
    right: 0px;
    bottom: 0px;

    display: flex;
    justify-content: center;
    align-items: center;
`

export const CompletionView = (props: ICompletionViewProps): JSX.Element => {
    return (
        <Container
            fullHeight={true}
            fullWidth={true}
            direction="horizontal"
            style={{
                backgroundColor: "black",
                color: "white",
                justifyContent: "center",
                alignItems: "center",
                overflow: "hidden",
            }}
        >
            <Layer>
                <TrophyIconWrapper>
                    <Icon name="trophy" size={IconSize.FiveX} />
                </TrophyIconWrapper>
            </Layer>
            <Container
                fullHeight={true}
                fullWidth={true}
                direction="vertical"
                style={{ justifyContent: "center", alignItems: "center" }}
            >
                <Fixed>
                    <h1>Level Complete!</h1>
                </Fixed>
                <ResultsWrapper>
                    <AppearWithDelay delay={0.5}>
                        <Bold>Time:</Bold> {(props.time / 1000).toFixed(2)}s
                    </AppearWithDelay>
                    <AppearWithDelay delay={1}>
                        <Bold>Keystrokes:</Bold> {props.keyStrokes}
                    </AppearWithDelay>
                </ResultsWrapper>
                <Fixed>
                    <FooterWrapper>
                        <AppearWithDelay delay={1.5}>Press any key to continue...</AppearWithDelay>
                    </FooterWrapper>
                </Fixed>
            </Container>
        </Container>
    )
}
