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


export class WelcomeBufferLayer implements Oni.EditorLayer {

    public get id(): string {
        return "oni.welcome"
    }

    public get friendlyName(): string {
        return "Welcome"
    }

    public render(context: Oni.EditorLayerRenderContext): JSX.Element {
        return <WelcomeWrapper>
                <Column>
                    <Row>
                        <Column>
                            <TitleText>Oni</TitleText>
                            <SubtitleText>Modern Modal Editing</SubtitleText>
                        </Column>
                        <Column>
                            <HeroImage src="images/oni-icon-no-border.svg" />
                        </Column>
                    </Row>
                    <Row>
                        <Column>
                            <div>Recent</div>
                            <div>Quick Commands</div>
                        </Column>
                        <Column>
                            <div>Learn</div>
                            <div>Customize</div>
                        </Column>
                    </Row>
                </Column>
            </WelcomeWrapper>
    }
}
