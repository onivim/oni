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
import { CSSTransition, TransitionGroup } from "react-transition-group"

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

            window.setTimeout(() => {
                this.setState({
                    achievements: this.state.achievements.filter(a => a.title !== derp),
                })
            }, 5000)
        }
    }

    public render(): null | JSX.Element {
        const achievements = this.state.achievements.map(a => <Achievement key={a.title} {...a} />)
        return (
            <div className={"stack layer"}>
                <TransitionGroup className="achievements">{achievements}</TransitionGroup>
            </div>
        )
    }
}

export class Achievement extends React.PureComponent<IAchievement, {}> {
    public render(): JSX.Element {
        return (
            <CSSTransition {...this.props} timeout={1000} classNames="animate">
                <div className="achievement" key={this.props.title}>
                    <img src={"images/256x256.png"} />
                    <div className="container vertical full">
                        <div style={{ fontWeight: "bold" }}>ACHIEVEMENT UNLOCKED:</div>
                        <div>{this.props.title}</div>
                    </div>
                </div>
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
