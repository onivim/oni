import * as React from "react"

import { connect } from "react-redux"
import * as Config from "./../../Config"
import * as State from "./../State"

export interface IBackgroundProps {
    backgroundColor: string
}

export class BackgroundRenderer extends React.Component<IBackgroundProps, void> {
    private config = Config.instance()

    public render(): JSX.Element {
        const imageStyle = {
            backgroundImage: "url(" + this.config.getValue<string>("editor.backgroundImageUrl") + ")",
            backgroundSize: this.config.getValue<string>("editor.backgroundImageSize") || "cover",
        }
        const coverStyle = {
            backgroundColor: this.props.backgroundColor,
            opacity: this.config.getValue<number>("editor.backgroundOpacity"),
        }

        return <div>
                 <div className="background-image" style={imageStyle}></div>
                 <div className="background-cover" style={coverStyle}></div>
               </div>
    }
}

const mapStateToProps = (state: State.IState) => {
    return {
        backgroundColor: state.backgroundColor,
    }
}

export const Background = connect(mapStateToProps)(BackgroundRenderer)
