/**
 * Arrow.tsx
 *
 * Simple 'up' or 'down' arrow component
 */

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

    const style = props.direction === ArrowDirection.Up ? upArrowStyle : downArrowStyle

    return <div style={style}></div>
}
