/**
 * Arrow.tsx
 *
 * Simple 'up' or 'down' arrow component
 */
import * as React from "react"

import styled from "styled-components"
import { withProps } from "./common"

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

const transparentBorder = (props: IArrowProps) => `${props.size * 0.8}px solid transparent`
const solidBorder = (props: IArrowProps) => `${props.size}px solid ${props.color}`

function arrowCSS(props: IArrowProps): string {
    switch (props.direction) {
        case ArrowDirection.Up:
            return `
        width: 0px;
        height: 0px;
        border-left: ${transparentBorder(props)};
        border-right: ${transparentBorder(props)};
        border-bottom: ${solidBorder(props)};
        `
        case ArrowDirection.Down:
            return `
        width: 0px;
        height: 0px;
        border-left: ${transparentBorder(props)};
        border-right: ${transparentBorder(props)};
        border-top: ${solidBorder(props)};
        `
        case ArrowDirection.Left:
            return `
        width: 0px;
        height: 0px;
        border-top: ${transparentBorder(props)};
        border-right: ${solidBorder(props)};
        border-bottom: ${transparentBorder(props)};
        `
        case ArrowDirection.Right:
            return `
        width: 0px;
        height: 0px;
        border-top: ${transparentBorder(props)};
        border-left: ${solidBorder(props)};
        border-bottom: ${transparentBorder(props)};
        `
        default:
            return ``
    }
}

export const Arrow = withProps<IArrowProps>(styled.div)`
    ${props => arrowCSS(props)}
    `

export const derp = () => {}
export const derp2 = () => {}

export const preview = () => {
    return <Arrow size={100} color="yellow" direction={ArrowDirection.Left} />
}
