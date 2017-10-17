import * as React from "react"
import * as types from "vscode-languageserver-types"

import { ErrorIcon } from "./Error"

export interface IErrorInfoProps {
    errors: types.Diagnostic[]
}

export class ErrorInfo extends React.PureComponent<IErrorInfoProps, void> {

    public render(): null | JSX.Element {
        // if (!this.props.elements || !this.props.elements.length) {
        //     return null
        // }

        if (!this.props.errors) {
            return null
        }

        const errs = this.props.errors.map((e) => <div className="diagnostic">
                                           <ErrorIcon color={"red"} />
                                           <span>{e.message}</span>
                                           </div>)

        return <div className="diagnostic-container">
        {errs}
        </div>
    }
}

