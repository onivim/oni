/**
 * Arrow.tsx
 *
 * Simple 'up' or 'down' arrow component
 */

require("./Arrow.less") // tslint:disable-line no-var-requires

import * as React from "react"

export enum ArrowDirection {
    Up = 0,
    Down,
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

    const isUp = props.direction === ArrowDirection.Up
    const style = isUp ? upArrowStyle : downArrowStyle
    const className = isUp ? "arrow up" : "arrow down"

    return <div className={className} style={style}></div>
}
