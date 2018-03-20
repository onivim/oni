/**
 * oni-layer-browser/index.ts
 *
 * Entry point for browser integration plugin
 */

import * as React from "react"
import styled from "styled-components"

import { Icon, IconSize } from "./../../UI/Icon"

import { Sneakable } from "./../../UI/components/Sneakable"

const BrowserButtonWrapper = styled.div`
    width: 2.5em;
    height: 2.5em;
    flex: 0 0 auto;
    opacity: 0.9;

    display: flex;
    justify-content: center;
    align-items: center;

    &:hover {
        opacity: 1;
        box-shadow: 0 -8px 20px 0 rgba(0, 0, 0, 0.2);
    }
`

export interface IBrowserButtonViewProps {
    onClick: () => void
    icon: string
}

export const BrowserButtonView = (props: IBrowserButtonViewProps): JSX.Element => {
    return (
        <Sneakable callback={props.onClick}>
            <BrowserButtonWrapper onClick={props.onClick}>
                <Icon name={props.icon} size={IconSize.Large} />
            </BrowserButtonWrapper>
        </Sneakable>
    )
}
