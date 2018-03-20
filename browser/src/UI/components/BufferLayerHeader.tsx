/**
 * BufferLayerHeader.tsx
 *
 * Common header used by several buffer layers
 */

import * as React from "react"

import styled from "styled-components"

const HeaderWrapper = styled.div`
    padding: 1em;
`

const PrimaryHeader = styled.div`
    font-size: 2em;
    font-weight: bold;
`

const SubHeader = styled.div`
    font-size: 1.2em;
`

export interface BufferLayerHeaderProps {
    title: string
    description: string
}

export const BufferLayerHeader = (props: BufferLayerHeaderProps) => {
    return (
        <HeaderWrapper>
            <PrimaryHeader>{props.title}</PrimaryHeader>
            <SubHeader>{props.description}</SubHeader>
        </HeaderWrapper>
    )
}
