import * as React from "react"

export const Caret = (props: { isExpanded: boolean }): JSX.Element => {
    const caretStyle = {
        transform: props.isExpanded ? "rotateZ(45deg)" : "rotateZ(0deg)",
        transition: "transform 0.1s ease-in",
    }
    return <i style={caretStyle} className="fa fa-caret-right" />
}
