/**
 * NeovimEditor.ts
 *
 * IEditor implementation for Neovim
 */

import * as React from "react"

import styled from "styled-components"

import * as Oni from "oni-api"

import { withProps } from "./../../UI/components/common"

const WelcomeWrapper = withProps<{}>(styled.div)`
    background-color: ${p => p.theme["editor.background"]};
    color: ${p => p.theme["editor.foreground"]};

    width: 100%;
    height: 100%;
`

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
    opacity: 0.25;
`

const SectionHeader = styled.div`
    font-size: 1.1em;
    font-weight: bold;
    text-align: left;
    width:100%;
`


export class WelcomeBufferLayer implements Oni.EditorLayer {

    public get id(): string {
        return "oni.welcome"
    }

    public get friendlyName(): string {
        return "Welcome"
    }

    public render(context: Oni.EditorLayerRenderContext): JSX.Element {
        return <WelcomeWrapper className="enable-mouse">
                <Column>
                    <Row style={{width: "100%"}}>
                        <Column />
                        <Column style={{alignItems: "flex-end"}}>
                            <TitleText>Oni</TitleText>
                            <SubtitleText>Modern Modal Editing</SubtitleText>
                        </Column>
                        <Column style={{alignItems: "flex-start"}}>
                            <HeroImage src="images/oni-icon-no-border.svg" />
                        </Column>
                        <Column />
                        <Column />
                    </Row>
                    <Row style={{width: "100%", marginTop: "64px"}}>
                        <Column />
                        <Column>
                            <SectionHeader>Recent</SectionHeader>
                            <SectionHeader>Quick Commands</SectionHeader>
                        </Column>
                        <Column />
                        <Column>
                            <SectionHeader>Learn</SectionHeader>
                            <SectionHeader>Customize</SectionHeader>
                        </Column>
                        <Column />
                    </Row>
                </Column>
            </WelcomeWrapper>
    }
}
