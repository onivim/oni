/**
 * AchievementsBufferLayer.tsx
 *
 * This is an implementation of a buffer layer to show the
 * achievements in a 'trophy-case' style view
 */

import * as React from "react"

import styled from "styled-components"

// import { inputManager, InputManager } from "./../../Services/InputManager"

import { boxShadow, withProps } from "./../../../UI/components/common"

import * as Oni from "oni-api"

import { AchievementsManager, AchievementWithProgressInfo } from "./AchievementsManager"

export interface ITrophyCaseViewProps {
    achievements: AchievementsManager
}

export interface ITrophyCaseViewState {
    progressInfo: AchievementWithProgressInfo[]
}

export interface ContainerProps {
    direction: "horizontal" | "vertical"
}

export const Fixed = styled.div`
    flex: 0 0 auto;
`

export const Full = styled.div`
    flex: 1 1 auto;
`

export const Container = withProps<ContainerProps>(styled.div)`
    display: flex;
    flex-direction: ${p => (p.direction === "vertical" ? "column" : "row")};
`

export const TrophyCaseViewWrapper = withProps<{}>(styled.div)`
    background-color: ${p => p.theme["background"]};
    width: 100%;
    height: 100%;

    display: flex;
    flex-direction: column;

    justify-content: center;
`

export const TrophyCaseItemViewWrapper = withProps<{}>(styled.div)`
    ${boxShadow}
    background-color: ${p => p.theme["editor.background"]};
    margin: 1em;
    padding: 1em;


    display: flex;
    flex-direction: horizontal;
`

export const TrophyCaseItemView = (props: { achievementInfo: AchievementWithProgressInfo }) => {
    return (
        <TrophyCaseItemViewWrapper>
            <Fixed>
                <div>HI</div>
            </Fixed>
            <Full>
                <div>{props.achievementInfo.achievement.name}</div>
                <div>{props.achievementInfo.achievement.description}</div>
            </Full>
        </TrophyCaseItemViewWrapper>
    )
}

export class TrophyCaseView extends React.PureComponent<
    ITrophyCaseViewProps,
    ITrophyCaseViewState
> {
    constructor(props: ITrophyCaseViewProps) {
        super(props)

        this.state = {
            progressInfo: props.achievements.getAchievements(),
        }
    }

    public render(): JSX.Element {
        const items = this.state.progressInfo.map(item => (
            <TrophyCaseItemView achievementInfo={item} />
        ))
        return <TrophyCaseViewWrapper>{items}</TrophyCaseViewWrapper>
    }
}

export class AchievementsBufferLayer implements Oni.BufferLayer {
    public get id(): string {
        return "oni.layer.achievements"
    }

    public get friendlyName(): string {
        return "Achievements"
    }

    constructor(private _achievements: AchievementsManager) {}

    public render(context: Oni.BufferLayerRenderContext): JSX.Element {
        return <TrophyCaseView achievements={this._achievements} />
    }
}
