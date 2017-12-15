/**
 * WindowTitle.tsx
 *
 * Renders the title bar (OSX only)
 */

import * as React from "react"

import { CSSTransition, TransitionGroup } from "react-transition-group"

export interface IAchievement {
    title: string
}

export interface IAchievementsState {
    achievements: IAchievement[]
}

require("./Achievements.less")

export class Achievements extends React.PureComponent<{}, IAchievementsState> {

    constructor(props: any) {
        super(props)

        this.state = {
            achievements: [],
        }

        // SUPER HACKY: Just for prototyping...
        window["addAchievement"] = (derp: string) => {
            this.setState({
                achievements: [{title: derp}, ...this.state.achievements]
            })

            window.setTimeout(() => {
                this.setState({
                    achievements: this.state.achievements.filter((a) => a.title !== derp)
                })
            }, 5000)
        }
    }

    public render(): null | JSX.Element {

        const achievements = this.state.achievements.map((a) => <Achievement key={a.title} {...a} />)
        return <div className={"stack layer"}>
            <TransitionGroup className="achievements">
                {achievements}
            </TransitionGroup>
            </div>

    }
}

export class Achievement extends React.PureComponent<IAchievement, {}> {
    public render(): JSX.Element {
        return <CSSTransition
                {...this.props}
                timeout={1000}
                classNames="animate"
                >
                <div className="achievement" key={this.props.title}>
                    <img src={"images/256x256.png"} />
                    <div className="container vertical full">
                        <div style={{fontWeight:"bold"}}>ACHIEVEMENT UNLOCKED:</div>
                        <div>{this.props.title}</div></div>
                    </div>
                </CSSTransition>
    }
}
