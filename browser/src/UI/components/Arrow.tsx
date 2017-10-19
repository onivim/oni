/**
 * Arrow.tsx
 *
 * Simple 'up' or 'down' arrow component
 */

require("./Arrow.less") // tslint:disable-line no-var-requires

import * as React from "react"

export enum ArrowDirection {
    Up = 0,
    Down = 1,
    Left = 2,
    Right = 3,
}

export interface IArrowProps {
    size: number
    color: string
    direction: ArrowDirection
}

export const Arrow = (props: IArrowProps): JSX.Element => {

    const transparentBorder = `${props.size * 0.8}px solid transparent`
    const solidBorder = `${props.size}px solid ${props.color}`

    const upArrowStyle = {
        width: "0px",
        height: "0px",
        borderLeft: transparentBorder,
        borderRight: transparentBorder,
        borderBottom: solidBorder,
    }

    const downArrowStyle = {
        width: "0px",
        height: "0px",
        borderLeft: transparentBorder,
        borderRight: transparentBorder,
        borderTop: solidBorder,
    }

    const leftArrowStyle = {
        width: "0px",
        height: "0px",
        borderTop: transparentBorder,
        borderRight: solidBorder,
        borderBottom: transparentBorder,
    }

    const rightArrowStyle = {
        width: "0px",
        height: "0px",
        borderTop: transparentBorder,
        borderLeft: solidBorder,
        borderBottom: transparentBorder,
    }

    let style: any = upArrowStyle
    let className = "arrow"

    if (props.direction === ArrowDirection.Down) {
        style = downArrowStyle
        className = "arrow down"
    } else if (props.direction === ArrowDirection.Up) {
        style = upArrowStyle
        className = "arrow up"
    } else if (props.direction === ArrowDirection.Left) {
        style = leftArrowStyle
        className = "arrow left"
    } else if (props.direction === ArrowDirection.Right) {
        style = rightArrowStyle
        className = "arrow right"
    }

    return <div className={className} style={style}></div>
}
