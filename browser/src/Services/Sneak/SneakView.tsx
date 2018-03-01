/**
 * SneakView.tsx
 *
 * UX for the sneak functionality
 */

import * as React from "react"
import { connect } from "react-redux"

import { boxShadow, OverlayWrapper } from "./../../UI/components/common"
import { TextInputView } from "./../../UI/components/LightweightText"

import { IAugmentedSneakInfo, ISneakInfo, ISneakState } from "./SneakStore"

export interface ISneakContainerProps {
    onComplete: (sneakInfo: ISneakInfo) => void
}

export interface ISneakViewProps extends ISneakContainerProps {
    sneaks: IAugmentedSneakInfo[]
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
            <SneakItemView
                sneak={si}
                filterLength={normalizedFilterText.length}
                key={si.triggerKeys}
            />
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

import styled, { keyframes } from "styled-components"

const SneakEnterKeyFrames = keyframes`
    0% { opacity: 0; transform: scale(0.9) translateY(-5px) rotateX(-70deg); }
    100%% { opacity: 1; transform: scale(1.0) translateY(0px) rotateX(0deg); }
`

const SneakItemWrapper = styled.div`
    ${boxShadow} background-color: ${props => props.theme["highlight.mode.visual.background"]};
    color: ${props => props.theme["highlight.mode.visual.foreground"]};
    animation: ${SneakEnterKeyFrames} 0.2s ease-in;
    text-align: center;
`

const SneakItemViewSize = 22
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

const mapStateToProps = (
    state: ISneakState,
    containerProps?: ISneakContainerProps,
): ISneakViewProps => {
    return {
        ...containerProps,
        sneaks: state.sneaks || [],
    }
}

export const ConnectedSneakView = connect(mapStateToProps)(SneakView)
