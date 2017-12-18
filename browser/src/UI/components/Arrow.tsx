/**
 * Arrow.tsx
 *
 * Simple 'up' or 'down' arrow component
 */

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
        width: "0px",
        height: "0px",
        borderLeft: ${transparentBorder},
        borderRight: ${transparentBorder},
        borderTop: ${solidBorder},
        animation-name: appear-up;
        `
  case ArrowDirection.Down:
      return `
        width: "0px",
        height: "0px",
        borderLeft: ${transparentBorder},
        borderRight: ${transparentBorder},
        borderTop: ${solidBorder},
        animation-name: appear-down;
        `
  case ArrowDirection.Left:
      return `
        width: "0px",
        height: "0px",
        borderTop: ${transparentBorder},
        borderRight: ${solidBorder},
        borderBottom: ${transparentBorder},
        animation-name: appear-left;
        `
  case ArrowDirection.Right:
      return `
        width: "0px",
        height: "0px",
        border-top: ${transparentBorder},
        border-left: ${solidBorder},
        border-bottom: ${transparentBorder},
        animtation-name: appear-right
        `
  default:
      return ``
  }
}

export const Arrow = withProps<IArrowProps>(styled.div)`
    animation-duration: 0.3s;
    animation-delay: 0.2s;
    opacity: 0;
    animation-fill-mode: forwards;
    ${ arrowCSS }
    @keyframes appear-down {
        from {transform: translateY(-4px); opacity: 0;}
        to {transform: translateY(0px);opacity: 1;}
    }
    @keyframes appear-up {
        from {transform: translateY(4px); opacity: 0;}
        to {transform: translateY(0px);opacity: 1;}
    }
    @keyframes appear-left {
        from {transform: translateX(4px); opacity: 0;}
        to {transform: translateX(0px);opacity: 1;}
    }
    @keyframes appear-right {
        from {transform: translateX(-4px); opacity: 0;}
        to {transform: translateX(0px);opacity: 1;}
    }
    `
