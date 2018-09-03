/**
 * Arrow.tsx
 *
 * Simple 'up' or 'down' arrow component
 */
import * as React from "react"

import styled from "styled-components"
import { css } from "./common"

export enum ArrowDirection {
    Up = 0,
    Down = 1,
    Left = 2,
    Right = 3,
}

export interface IArrowProps {
    size: number
    direction: ArrowDirection
    color?: string
    isSelected?: boolean
}

const transparentBorder = (props: IArrowProps) => `${props.size * 0.8}px solid transparent`
const solidBorder = (props: IArrowProps) => `${props.size}px solid ${props.color}`

const getArrowColor = (props: { isSelected: boolean; color: string; theme: any }) => {
    return props.isSelected
        ? props.theme["contextMenu.highlight"]
        : props.color
            ? props.color
            : "transparent"
}

const getDirectionStyles = (props: IArrowProps): string => {
    const color = css`
        color: ${getArrowColor};
    `

    switch (props.direction) {
        case ArrowDirection.Up:
            return `
                ${color};
                width: 0px;
                height: 0px;
                border-left: ${transparentBorder(props)};
                border-right: ${transparentBorder(props)};
                border-bottom: ${solidBorder(props)};
            `
        case ArrowDirection.Down:
            return `
                ${color};
                width: 0px;
                height: 0px;
                border-left: ${transparentBorder(props)};
                border-right: ${transparentBorder(props)};
                border-top: ${solidBorder(props)};
            `
        case ArrowDirection.Left:
            return `
                ${color};
                width: 0px;
                height: 0px;
                border-top: ${transparentBorder(props)};
                border-right: ${solidBorder(props)};
                border-bottom: ${transparentBorder(props)};
            `
        case ArrowDirection.Right:
            return `
                ${color};
                width: 0px;
                height: 0px;
                border-top: ${transparentBorder(props)};
                border-left: ${solidBorder(props)};
                border-bottom: ${transparentBorder(props)};
            `
        default:
            return `${color};`
    }
}
export const Arrow = styled<IArrowProps, "div">("div")`
    ${getDirectionStyles};
`

export const preview = () => {
    return <Arrow size={100} color="yellow" direction={ArrowDirection.Left} />
}
