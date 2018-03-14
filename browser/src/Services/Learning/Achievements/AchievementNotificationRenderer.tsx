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
import { Icon, IconSize } from "./../../../UI/Icon"

export class AchievementNotificationRenderer {
    private _overlay: Overlay

    constructor(private _overlayManager: OverlayManager) {
        this._overlay = this._overlayManager.createItem()
        this._overlay.show()
        this._overlay.setContents(<AchievementsView achievements={[]} />)
    }

    public showAchievement(achievement: IAchievement): void {
        window.setTimeout(() => {
            this._overlay.setContents(<AchievementsView achievements={[achievement]} />)
        }, 10)

        // TODO: Better handle multiple achievements here
        window.setTimeout(() => {
            this._overlay.setContents(<AchievementsView achievements={[]} />)
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

// const EnterIconKeyFrames = keyframes`
//     0% { opacity: 0; transform: rotateY(0deg); }
//     100% { opacity: 1.0; transform: rotateY(180deg); }
// `

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
    padding: 1em 2em;
    margin: 2em;

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

const AchievementImageWrapper = styled.div`
    width: 48px;
    height: 48px;
    margin: 8px;
    position: relative;
    flex: 0 0 auto;
    transform-style: preserve-3d;

    & .front,
    & .back {
        margin: 0;
        display: block;
        position: absolute;
        width: 100%;
        height: 100%;
        backface-visibility: hidden;
    }

    & .back {
        transform: rotateY(180deg);
    }

    transition-duration: 1s;
    transition-property: transform;
`

const AchievementIconWrapper = withProps<{}>(styled.div)`
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: ${props => props.theme["highlight.mode.normal.background"]};
    border-radius: 8em;
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
                <TransitionGroup className="achievements" appear={true}>
                    {achievements}
                </TransitionGroup>
            </AchievementsWrapper>
        )
    }
}

export interface AchievementViewState {
    flipCard: boolean
}

export class AchievementView extends React.PureComponent<IAchievement, AchievementViewState> {
    constructor(props: IAchievement) {
        super(props)

        this.state = {
            flipCard: false,
        }
    }

    public componentDidMount(): void {
        window.setTimeout(() => {
            this.setState({ flipCard: true })
        }, 1000)
    }

    public render(): JSX.Element {
        return (
            <CSSTransition {...this.props} timeout={2500} classNames="animate" appear={true}>
                <AchievementWrapper className="achievement" key={this.props.title}>
                    <AchievementImageWrapper
                        style={{
                            transform: this.state.flipCard ? "rotateY(180deg)" : "rotateY(0deg)",
                        }}
                    >
                        <div className="front">
                            <img
                                src="images/256x256.png"
                                style={{ width: "100%", height: "100%" }}
                            />
                        </div>
                        <div className="back">
                            <AchievementIconWrapper>
                                <Icon name="trophy" size={IconSize.TwoX} />
                            </AchievementIconWrapper>
                        </div>
                    </AchievementImageWrapper>
                    <div className="container vertical full" style={{ padding: "0em 1em" }}>
                        <div style={{ fontWeight: "bold", paddingBottom: "0.25em" }}>
                            Achievement Unlocked
                        </div>
                        <div>{this.props.title}</div>
                    </div>
                </AchievementWrapper>
            </CSSTransition>
        )
    }
}
