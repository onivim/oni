/**
 * PinnedIconView.tsx
 *
 * Shows the pinned icon for recently navigated items in quick open
 */

import * as React from "react"

import { Visible } from "./../../UI/components/Visible"
import { Icon } from "./../../UI/Icon"

export const render = (props: { pinned: boolean }) => {
    return (
        <Visible visible={props.pinned}>
            <Icon name="clock-o" />
        </Visible>
    )
}
