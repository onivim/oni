/**
 * SneakView.tsx
 *
 * UX for the sneak functionality
 */

import * as React from "react"

import { boxShadow, OverlayWrapper } from "./../../UI/components/common"
import { TextInputView } from "./../../UI/components/LightweightText"

import { ISneakInfo, IAugmentedSneakInfo } from "./SneakStore"

export interface ISneakViewProps {
    sneaks: IAugmentedSneakInfo[]
    onComplete: (sneakInfo: ISneakInfo) => void
}

export interface ISneakViewState {
    filterText: string
}

// Render a keyboard input?
// Grab input while 'sneaking'?
export class SneakView extends React.PureComponent<ISneakViewProps, ISneakViewState> {
    constructor(props: ISneakViewProps) {
        super(props)

        this.state = {
            filterText: "",
        }
    }

    public render(): JSX.Element {
        const normalizedFilterText = this.state.filterText.toUpperCase()
        const filteredSneaks = this.props.sneaks.filter(
            sneak => sneak.triggerKeys.indexOf(normalizedFilterText) === 0,
        )
        const sneaks = filteredSneaks.map(si => (
            <SneakItemView sneak={si} filterLength={normalizedFilterText.length} />
        ))

        if (filteredSneaks.length === 1) {
            this.props.onComplete(filteredSneaks[0])
        }

        return (
            <OverlayWrapper style={{ backgroundColor: "rgba(0, 0, 0, 0.1)" }}>
                <div style={{ opacity: 0.01 }}>
                    <TextInputView
                        onChange={evt => {
                            this.setState({ filterText: evt.currentTarget.value })
                        }}
                    />
                </div>
                {sneaks}
            </OverlayWrapper>
        )
    }
}

export interface ISneakItemViewProps {
    sneak: IAugmentedSneakInfo
    filterLength: number
}

import styled from "styled-components"

const SneakItemWrapper = styled.div`
    ${boxShadow} background-color: ${props => props.theme["highlight.mode.visual.background"]};
    color: ${props => props.theme["highlight.mode.visual.foreground"]};
`

const SneakItemViewSize = 20
const px = (num: number): string => num.toString() + "px"
export class SneakItemView extends React.PureComponent<ISneakItemViewProps, {}> {
    public render(): JSX.Element {
        const style: React.CSSProperties = {
            position: "absolute",
            left: px(this.props.sneak.rectangle.x),
            top: px(this.props.sneak.rectangle.y),
            width: px(SneakItemViewSize),
            height: px(SneakItemViewSize),
        }

        return (
            <SneakItemWrapper style={style}>
                <span style={{ fontWeight: "bold" }}>
                    {this.props.sneak.triggerKeys.substring(0, this.props.filterLength)}
                </span>
                <span>
                    {this.props.sneak.triggerKeys.substring(
                        this.props.filterLength,
                        this.props.sneak.triggerKeys.length,
                    )}
                </span>
            </SneakItemWrapper>
        )
    }
}
