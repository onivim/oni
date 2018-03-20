/**
 * FlipCard.tsx
 *
 * Component that flips between a 'front' and a 'back'
 */

import * as React from "react"

import styled from "styled-components"

export interface IFlipCardProps {
    front: JSX.Element
    back: JSX.Element

    isFlipped: boolean
}

const FlipCardWrapper = styled.div`
    position: relative;
    transform-style: preserve-3d;
    width: 100%;
    height: 100%;

    & .front,
    & .back {
        margin: 0;
        display: block;
        position: absolute;
        width: 100%;
        height: 100%;
        backface-visibility: hidden;
    }

    & .back {
        transform: rotateY(180deg);
    }

    transition-duration: 1s;
    transition-property: transform;
`

export const FlipCard = (props: IFlipCardProps): JSX.Element => {
    const style: React.CSSProperties = {
        transform: props.isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
    }

    return (
        <FlipCardWrapper style={style}>
            <div className="front">{props.front}</div>
            <div className="back">{props.back}</div>
        </FlipCardWrapper>
    )
}
