/**
 * AchievementNotificationRenderer.tsx
 *
 * This renders the achievement 'pop-up' when an achievement goal is met.
 */

import { Overlay, OverlayManager } from "./../../Overlay"

import * as React from "react"
import { CSSTransition, TransitionGroup } from "react-transition-group"
import styled, { keyframes } from "styled-components"

import { boxShadow, withProps } from "./../../../UI/components/common"

export class AchievementNotificationRenderer {
    private _overlay: Overlay

    constructor(private _overlayManager: OverlayManager) {
        this._overlay = this._overlayManager.createItem()
    }

    public showAchievement(achievement: IAchievement): void {
        this._overlay.show()
        this._overlay.setContents(<AchievementsView achievements={[achievement]} />)

        // TODO: Better handle multiple achievements here
        window.setTimeout(() => {
            this._overlay.hide()
        }, 5000)
    }
}

const AchievementsWrapper = styled.div`
    & .achievements {
        width: 100%;
        height: 100%;

        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: flex-end;
    }
`

const EnterKeyframes = keyframes`
    0% { opacity: 0; transform: translateY(32px) rotateX(-30deg);  }
    100% { opacity: 1; transform: translateY(0px) rotateX(0deg)); }
`

const ExitKeyframes = keyframes`
    0% { opacity: 1; transform: translateY(0px) rotateX(0deg); }
    100% { opacity: 0; transform: translateY(-32px) rotateX(30deg); }
`

const EnterIconKeyFrames = keyframes`
    0% { opacity: 0; transform: scale(0.9) rotateY(-90deg); }
    100% { opacity: 1.0; transform: scale(1) rotateY(0deg); }
`

const AnimationDuration = "0.25s"

const AchievementWrapper = withProps<{}>(styled.div)`
    ${boxShadow}
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;

    background-color: ${props => props.theme.background};
    color: ${props => props.theme.foreground};

    border-radius: 3em;
    padding: 2em;

    max-width: 1000px;

    &.animate-enter {
        animation: ${EnterKeyframes};
        animation-duration: ${AnimationDuration};
        animation-timing-function: ease-in;
        animation-fill-mode: forwards;
    }

    &.animate-exit {
        animation: ${ExitKeyframes};
        animation-duration: ${AnimationDuration};
        animation-timing-function: ease-out;
        animation-fill-mode: forwards;
    }
`

const AchievementImageWrapper = styled.img`
    width: 32px;
    height: 32px;
    padding: 8px;

    .animate-enter & {
        animation: ${EnterIconKeyFrames};
        animation-duration: 0.5s;
        animation-timing-function: ease-in;
        animation-fill-mode: forwards;
    }
`

export interface IAchievement {
    title: string
    description: string
}

export interface IAchievementsViewProps {
    achievements: IAchievement[]
}

export class AchievementsView extends React.PureComponent<IAchievementsViewProps, {}> {
    public render(): null | JSX.Element {
        const achievements = this.props.achievements.map(a => (
            <AchievementView key={a.title} {...a} />
        ))
        return (
            <AchievementsWrapper className={"stack layer"}>
                <TransitionGroup className="achievements">{achievements}</TransitionGroup>
            </AchievementsWrapper>
        )
    }
}

export class AchievementView extends React.PureComponent<IAchievement, {}> {
    public render(): JSX.Element {
        return (
            <CSSTransition {...this.props} timeout={1000} classNames="animate">
                <AchievementWrapper className="achievement" key={this.props.title}>
                    <AchievementImageWrapper src={"images/256x256.png"} />
                    <div className="container vertical full">
                        <div style={{ fontWeight: "bold" }}>
                            ACHIEVEMENT UNLOCKED: {this.props.title}
                        </div>
                        <div>{this.props.description}</div>
                    </div>
                </AchievementWrapper>
            </CSSTransition>
        )
    }
}
