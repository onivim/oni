/**
 * NeovimEditor.ts
 *
 * IEditor implementation for Neovim
 */

import * as React from "react"

import styled, { keyframes } from "styled-components"

import * as Oni from "oni-api"

import { withProps } from "./../../UI/components/common"

const WelcomeWrapper = withProps<{}>(styled.div)`
    background-color: ${p => p.theme["editor.background"]};
    color: ${p => p.theme["editor.foreground"]};

    width: 100%;
    height: 100%;
    opacity: 0;
`

// const entrance = keyframes`
//     0% { opacity: 0; transform: translateY(2px); }
//     100% { opacity: 0.5; transform: translateY(0px); }
// `

const entranceFull = keyframes`
    0% { opacity: 0; transform: translateY(8px); }
    100% { opacity: 1; transform: translateY(0px); }
`

// const enterLeft = keyframes`
//     0% { opacity: 0; transform: translateX(-4px); }
//     100% { opacity: 1; transform: translateX(0px); }
// `

// const enterRight = keyframes`
//     0% { opacity: 0; transform: translateX(4px); }
//     100% { opacity: 1; transform: translateX(0px); }
// `

const Column = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;

    width: 100%;
    flex: 1 1 auto;
`

const Row = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: row;
    opacity: 0;
`

const TitleText = styled.div`
    font-size: 2em;
    text-align: right;
`

const SubtitleText = styled.div`
    font-size: 1.2em;
    text-align: right;
`

const HeroImage = styled.img`
    width: 192px;
    height: 192px;
    opacity: 0.4;
`

const SectionHeader = styled.div`

    margin-top: 1em;
    margin-bottom: 1em;

    font-size: 1.1em;
    font-weight: bold;
    text-align: left;
    width:100%;
`

const WelcomeButtonHoverStyled = `
    transform: translateY(-1px);
    box-shadow: 0 4px 8px 2px rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19);
`
const WelcomeButton = withProps<{}>(styled.div)`
    border: 0px solid ${props => props.theme["foreground"]};
    color: ${props => props.theme["foreground"]};
    background-color: ${props => props.theme["background"]};

    cursor: pointer;

    width: 256px;
    margin: 8px 0px;
    padding: 8px;
    box-shadow: 0 4px 8px 2px rgba(0, 0, 0, 0.1), 0 6px 20px 0 rgba(0, 0, 0, 0.1);

    &:hover {
       ${WelcomeButtonHoverStyled} 
    }

`


export class WelcomeBufferLayer implements Oni.EditorLayer {

    public get id(): string {
        return "oni.welcome"
    }

    public get friendlyName(): string {
        return "Welcome"
    }

    public render(context: Oni.EditorLayerRenderContext): JSX.Element {
        return <WelcomeWrapper className="enable-mouse" style={{animation: `${entranceFull} 0.25s ease-in 0.1s forwards`}}>
                <Column>
                    <Row style={{width: "100%", paddingTop: "128px", animation: `${entranceFull} 0.25s ease-in 0.25s forwards`}}>
                        <Column />
                        <Column style={{alignItems: "flex-end"}}>
                            <TitleText>Oni</TitleText>
                            <SubtitleText>Modern Modal Editing</SubtitleText>
                        </Column>
                        <Column style={{flex: "0 0"}}>
                            <HeroImage src="images/oni-icon-no-border.svg"/>
                        </Column>
                        <Column style={{alignItems: "flex-start"}}>
                            <div>{"https://onivim.io"}</div>
                        </Column>
                        <Column />
                    </Row>
                    <Row style={{width: "100%", marginTop: "64px", animation: `${entranceFull} 0.25s ease-in 0.5s forwards`}}>
                        <Column />
                        <Column>
                            <SectionHeader>Learn</SectionHeader>
                            <WelcomeButton>
                                {"VimTutor"}
                            </WelcomeButton>
                            <WelcomeButton>
                                {"Documentation"}
                            </WelcomeButton>
                            <SectionHeader>Customize</SectionHeader>
                            <WelcomeButton>
                                {"Configure"}
                            </WelcomeButton>
                            <WelcomeButton>
                                {"Choose theme"}
                            </WelcomeButton>
                            <SectionHeader>Quick Commands</SectionHeader>
                        </Column>
                        <Column />
                    </Row>
                </Column>
            </WelcomeWrapper>
    }
}
