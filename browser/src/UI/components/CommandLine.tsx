import * as React from "react"
import { connect } from "react-redux"
// import * as Selectors from "./../Selectors"
import * as State from "./../State"
require("./CommandLine.less") // tslint:disable-line no-var-requires

export interface ICommandLineRendererProps {
    visible: boolean,
    content: Array<[any, string]> | null
    position: number,
    firstchar: string
    // level: number
}

class CommandLineRenderer extends React.PureComponent<ICommandLineRendererProps, {}> {
    // private _inputElement: HTMLInputElement = null

    public render(): null |  JSX.Element {
        if (!this.props.visible) {
            return null
        }

        /*const CommandLineStyle: React.CSSProperties = {*/
            // visibility: "visible",
            // position: "absolute",
            // backgroundColor: "rgb(40,40,40)",
            // left: 300 + "px",
            // top: 300 + "px",
            // width: 300 + "px",
            // height: 300 + "px",
        /*}*/

        return <div className="commandline-background">
                <div className="commandLine">
                    {this.props.firstchar + this.props.content[0][1]}
                </div>
            </div>
    }
}
const emptyProps: ICommandLineRendererProps = {
    content: null,
    visible: false,
    firstchar: "",
    position: 0,
}

const mapStateToProps = (state: State.IState, props: ICommandLineRendererProps) => {
    const visible = state.commandLine != null
    if (!visible) {
        return emptyProps
    }

    const content = state.commandLine.content
    const firstchar = state.commandLine.firstchar
    const position = state.commandLine !== null ? state.commandLine.position : 0

    return {
        position,
        visible,
        content,
        firstchar,
    }
}

export const CommandLine = connect(mapStateToProps)(CommandLineRenderer)
