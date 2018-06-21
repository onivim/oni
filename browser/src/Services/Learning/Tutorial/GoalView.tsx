/**
 * GoalView.tsx
 *
 * 'Goal' item for the tutorial
 */

import * as React from "react"

import styled from "styled-components"

import { boxShadow, withProps } from "./../../../UI/components/common"
import { FlipCard } from "./../../../UI/components/FlipCard"
import { Icon } from "./../../../UI/Icon"

export interface IGoalViewProps {
    active: boolean
    completed: boolean
    description: string
    visible: boolean
}

const GoalWrapper = withProps<IGoalViewProps>(styled.div)`
    ${p => (p.active ? boxShadow : "")};
    display: ${p => (p.visible ? "flex" : "none")};
    background-color: ${p => p.theme.background};
    transition: all 0.5s linear;

    justify-content: center;
    align-items: center;
    flex-direction: row;

    margin: 1em 0em;
`

const IconWrapper = withProps<IGoalViewProps>(styled.div)`
    display: flex;
    width: 100%;
    height: 100%;
    justify-content: center;
    align-items: center;
    background-color: rgba(0, 0, 0, 0.2);

    color: ${p => (p.completed ? p.theme["highlight.mode.insert.background"] : p.theme.foreground)};
`

export const GoalView = (props: IGoalViewProps): JSX.Element => {
    return (
        <GoalWrapper {...props} key={props.description}>
            <div style={{ width: "48px", height: "48px", flex: "0 0 auto" }}>
                <FlipCard
                    isFlipped={props.completed}
                    front={
                        <IconWrapper {...props}>
                            <Icon name="circle" />
                        </IconWrapper>
                    }
                    back={
                        <IconWrapper {...props}>
                            <Icon name="check" />
                        </IconWrapper>
                    }
                />
            </div>
            <div style={{ width: "100%", flex: "1 1 auto", padding: "1em" }}>
                {props.description}
            </div>
        </GoalWrapper>
    )
}
