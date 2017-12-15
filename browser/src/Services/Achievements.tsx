/**
 * SidebarView.tsx
 *
 * View component for the sidebar
 */

import * as React from "react"

import * as Oni from "oni-api"

export const openAchievementsPane = (windowManager: Oni.IWindowManager): void => {
    windowManager.split(2, new AchievementsSplit())
}

export class AchievementsSplit {
    public render(): JSX.Element {

        const style: React.CSSProperties = {
            width: "250px",
            height: "100%",
            display: "flex",
            flexDirection: "row",
        }

        return <div style={style} className="enable-mouse">
            <div className="split-spacer vertical" />
            <AchievementsPaneView />
            </div>
    }
}

export interface IContainerViewProps {
    isContainer: boolean
    expanded: boolean
    name: string
    isSelected: boolean
}

export class ContainerView extends React.PureComponent<IContainerViewProps, {}> {
    public render(): JSX.Element {
        const headerStyle: React.CSSProperties = {
            backgroundColor: this.props.isContainer ? "#1e2127" : this.props.isSelected ? "rgba(97, 175, 239, 0.1)" : "transparent",
            borderLeft: this.props.isSelected ? "4px solid rgb(97, 175, 239)" : "4px solid transparent",
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
        }

        const iconStyle = this.props.expanded ? { transform: "rotateZ(45deg)" }: null

        return <div className="item" style={headerStyle}>
            <div className="icon" style={{margin: "6px"}}>
                <i style={iconStyle} className="fa fa-caret-right" />
            </div>
            <div className="name">
                {this.props.name}
            </div>
        </div>
    }
}

export class AchievementsPaneView extends React.PureComponent<{}, {}> {
    public render(): JSX.Element {
        const containerStyle: React.CSSProperties = {
            width: "100%",
            height: "100%",
            flex: "1 1 auto",
            backgroundColor: "rgb(40, 44, 52)",
            color: "rgb(171, 179, 191)",
        }

        const headerStyle: React.CSSProperties = {
            height: "2.5em",
            lineHeight: "2.5em",
            textAlign: "center",
            borderTop: "2px solid transparent",
        }

        return <div style={containerStyle}>
                <div style={headerStyle}><i className="fa fa-trophy" style={{paddingLeft: "8px", paddingRight: "8px"}}/>Goals</div>
                <ContainerView name={"Basic Motions"} expanded={true} isContainer={true} isSelected={false}/>
                <AchievementView {...h_goal} />
                <AchievementView {...j_goal} />
                <AchievementView {...k_goal} />
                <AchievementView {...l_goal} />
                <ContainerView name={"Word Motions"} expanded={false} isContainer={true} isSelected={false}/>
                <ContainerView name={"Operators"} expanded={false} isContainer={true} isSelected={false}/>
                <ContainerView name={"Insertion"} expanded={false} isContainer={true} isSelected={false}/>
                <ContainerView name={"Deletion"} expanded={false} isContainer={true} isSelected={false}/>
                <ContainerView name={"Split Navigation"} expanded={true} isContainer={true} isSelected={false}/>
                <ContainerView name={"Oni"} expanded={true} isContainer={true} isSelected={false}/>
                <AchievementView {...renameGoal} />
            </div>
    }
}

const renameGoal = {
    keys: [{character: "F2"}],

    description: "Rename a variable",
    goalCount: 10,
    count: 9,
}

// const quickOpenGoal = {
//     keys: [{character: "ctrl+p}],
//     description: "Open fuzzy finder",

//     goalCount: 10,
//     count: 1,
// }

// const commandPaletteGoal = {
//     keys: [{character: "c"}, {character: "p}],
//     description: "Open command palette",

//     goalCount: 10,
//     count: 0,
// }

const h_goal = {
    keys: [{character: "h"}],
    description: "Move one character left",

    goalCount: 50,
    count: 25,
}

const j_goal = {
    keys: [{character: "j"}],
    description: "Move one character down",

    goalCount: 50,
    count: 15,
}

const k_goal = {
    keys: [{character: "k"}],
    description: "Move one character down",

    goalCount: 50,
    count: 10,
}

const l_goal = {
    keys: [{character: "l"}],
    description: "Move one character right",

    goalCount: 50,
    count: 1,
}

export interface IKey {
    character: string
}

export interface IGoal {
    keys: IKey[]
    description: string

    count: number
    goalCount: number
}

export class AchievementView extends React.PureComponent<IGoal, {}> {
    public render(): JSX.Element {
        const containerStyle = {
            backgroundColor: "rgba(0, 0, 0, 0.1)",
            width: "220px",
            height: "50px",
            marginLeft: "auto",
            marginRight: "auto",
            marginTop: "8px",
            marginBottom: "8px",
        }

        const keys = this.props.keys.map((k) => {
            const keyStyle = {
                border: "1px solid rgb(97, 175, 239)",
                width: "25px",
                height: "25px",
                lineHeight: "25px",
                textAlign: "center",
                marginLeft: "8px",
            }

            return <div style={keyStyle}>{k.character}</div>
        })

        const horizontalContainerStyle: React.CSSProperties = {
            alignItems: "center",
        }

        return <div style={containerStyle}>
                <div className="container vertical full">
                    <div className="container horizontal full" style={horizontalContainerStyle}>
                    <div style={{flex: "0 0 auto"}}>
                        {keys}
                    </div>
                    <div style={{flex: "1 1 auto", textAlign: "center", justifyContent:"center", alignItems: "center"}}>
                        <div>{this.props.description}</div>
                        <div style={{opacity:0.75, fontSize: "0.8em"} as React.CSSProperties}>
                            {this.props.count}/{this.props.goalCount}
                        </div>
                    </div>
                    </div>
                    <div className="container fixed">
                        <GoalBar {...this.props} />
                    </div>
                </div>
            </div>
    }
}

export class GoalBar extends React.PureComponent<IGoal, {}> {
    public render(): JSX.Element {
        const height = "4px"
        const innerBarWidthPercent = this.props.count / this.props.goalCount

        const outerBarStyle = {
            height,
            width: "100%",
            backgroundColor: "rgba(0, 0, 0, 0.2)",
        }

        const innerBarStyle = {
            backgroundColor: "rgb(97, 175, 239)",
            height: "100%",
            width: (innerBarWidthPercent * 100) + "%",
        }

        return <div style={outerBarStyle}>
                <div style={innerBarStyle}></div>
            </div>
    }
}
