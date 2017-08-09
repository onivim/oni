import * as React from "react"

import { connect } from "react-redux"
import * as State from "./../State"

export interface IBackgroundProps {
    backgroundColor: string
    backgroundImageUrl: string
    backgroundImageSize: string
    backgroundOpacity: number
}

export class BackgroundRenderer extends React.PureComponent<IBackgroundProps, void> {
    public render(): JSX.Element {
        const imageStyle = {
            backgroundImage: "url(" + this.props.backgroundImageUrl + ")",
            backgroundSize: this.props.backgroundImageSize || "cover",
        }
        const coverStyle = {
            backgroundColor: this.props.backgroundColor,
            opacity: this.props.backgroundOpacity,
        }

        return <div>
                 <div className="background-image" style={imageStyle}></div>
                 <div className="background-cover" style={coverStyle}></div>
               </div>
    }
}

const mapStateToProps = (state: State.IState): IBackgroundProps => {
    let conf = state.configuration
    return {
        backgroundColor: state.backgroundColor,
        backgroundImageUrl: State.readConf(conf, "editor.backgroundImageUrl"),
        backgroundImageSize: State.readConf(conf, "editor.backgroundImageSize"),
        backgroundOpacity: State.readConf(conf, "editor.backgroundOpacity"),
    }
}

export const Background = connect(mapStateToProps)(BackgroundRenderer)
