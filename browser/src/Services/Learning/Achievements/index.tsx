/**
 * Achievements.ts
 */

// import { Event, IEvent } from "oni-types"

// import { Configuration } from "./../Configuration"
// import { EditorManager } from "./../EditorManager"
// import { SidebarManager } from "./../Sidebar"

// import { LearningPane } from "./LearningPane"

import { OverlayManager } from "./../../Overlay"

import * as React from "react"
import styled, { keyframes } from "styled-components"
import { CSSTransition, TransitionGroup } from "react-transition-group"

import { withProps, boxShadow } from "./../../../UI/components/common"

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

    background-color: ${props => props.theme["background"]};
    color: ${props => props.theme["foreground"]};

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
}

export interface IAchievementsState {
    achievements: IAchievement[]
}

export class Achievements extends React.PureComponent<{}, IAchievementsState> {
    constructor(props: any) {
        super(props)

        this.state = {
            achievements: [],
        }

        // SUPER HACKY: Just for prototyping...
        window["addAchievement"] = (derp: string) => {
            this.setState({
                achievements: [{ title: derp }, ...this.state.achievements],
            })

            // window.setTimeout(() => {
            //     this.setState({
            //         achievements: this.state.achievements.filter(a => a.title !== derp),
            //     })
            // }, 5000)
        }
    }

    public render(): null | JSX.Element {
        const achievements = this.state.achievements.map(a => <Achievement key={a.title} {...a} />)
        return (
            <AchievementsWrapper className={"stack layer"}>
                <TransitionGroup className="achievements">{achievements}</TransitionGroup>
            </AchievementsWrapper>
        )
    }
}

export class Achievement extends React.PureComponent<IAchievement, {}> {
    public render(): JSX.Element {
        return (
            <CSSTransition {...this.props} timeout={1000} classNames="animate">
                <AchievementWrapper className="achievement" key={this.props.title}>
                    <AchievementImageWrapper src={"images/256x256.png"} />
                    <div className="container vertical full">
                        <div style={{ fontWeight: "bold" }}>ACHIEVEMENT UNLOCKED:</div>
                        <div>{this.props.title}</div>
                    </div>
                </AchievementWrapper>
            </CSSTransition>
        )
    }
}

export const activate = (
    // configuration: Configuration,
    // editorManager: EditorManager,
    // sidebarManager: SidebarManager,
    overlays: OverlayManager,
) => {
    // const learningEnabled = configuration.getValue("experimental.learning.enabled")

    // if (!learningEnabled) {
    //     return
    // }

    const overlay = overlays.createItem()
    overlay.setContents(<Achievements />)
    overlay.show()

    // sidebarManager.add("trophy", new LearningPane())
    console.log("ACHIEVEMENTS ACTIVATED")
}
