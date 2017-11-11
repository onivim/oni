import * as React from "react"

import { connect } from "react-redux"
import * as State from "./../State"

export interface IBackgroundProps {
    backgroundColor: string
    backgroundImageUrl: string
    backgroundImageSize: string
    backgroundOpacity: number
}

export class BackgroundView extends React.PureComponent<IBackgroundProps, {}> {
    public render(): JSX.Element {
        const coverStyle = {
            backgroundColor: this.props.backgroundColor,
            opacity: this.props.backgroundOpacity,
        }

        return <div>
            <BackgroundImageView {...this.props} />
            <div className="background-cover" style={coverStyle}></div>
        </div>
    }
}

export const BackgroundImageView = (props: IBackgroundProps) => {

    if (props.backgroundImageUrl) {
        const imageStyle = {
            backgroundImage: "url(" + props.backgroundImageUrl + ")",
            backgroundSize: props.backgroundImageSize || "cover",
        }

        return <div className="background-image" style={imageStyle}></div>
    } else {
        return null
    }
}

const mapStateToProps = (state: State.IState): IBackgroundProps => {
    const conf = state.configuration
    return {
        backgroundColor: state.backgroundColor,
        backgroundImageUrl: State.readConf(conf, "editor.backgroundImageUrl"),
        backgroundImageSize: State.readConf(conf, "editor.backgroundImageSize"),
        backgroundOpacity: State.readConf(conf, "editor.backgroundOpacity"),
    }
}

export const Background = connect(mapStateToProps)(BackgroundView)
