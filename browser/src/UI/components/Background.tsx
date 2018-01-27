import * as React from "react"

import { connect } from "react-redux"
import * as State from "./../Shell/ShellState"

import styled from "styled-components"
import { withProps } from "./common"

export interface IBackgroundProps {
    backgroundColor: string
    backgroundImageUrl: string
    backgroundImageSize: string
    backgroundOpacity: number
}

export const BackgroundImageView = withProps<IBackgroundProps>(styled.div)`
    background-image: url("${props => props.backgroundImageUrl}");
    background-size: ${props => props.backgroundImageSize || "cover"};
    width: 100%;
    height: 100%;
    position: absolute;
    `

export const BackgroundColorView = withProps<IBackgroundProps>(styled.div)`
    background-color: ${props => props.backgroundColor};
    opacity: ${props => props.backgroundOpacity};
    width: 100%;
    height: 100%;
    position: absolute;
    `

export const BackgroundView = (props: IBackgroundProps) => (
    <div>
        {props.backgroundImageUrl ? <BackgroundImageView {...props} /> : null}
        <BackgroundColorView {...props} />
    </div>
)

const mapStateToProps = (state: State.IState): IBackgroundProps => {
    const conf = state.configuration
    return {
        backgroundColor: state.colors.background,
        backgroundImageUrl: State.readConf(conf, "editor.backgroundImageUrl"),
        backgroundImageSize: State.readConf(conf, "editor.backgroundImageSize"),
        backgroundOpacity: State.readConf(conf, "editor.backgroundOpacity"),
    }
}

export const Background = connect(mapStateToProps)(BackgroundView)
