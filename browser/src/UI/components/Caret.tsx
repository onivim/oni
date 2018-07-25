import * as React from "react"

const Caret = ({ active }: { active: boolean }) => {
    const caretStyle = {
        transform: active ? "rotateZ(45deg)" : "rotateZ(0deg)",
        transition: "transform 0.1s ease-in",
    }

    return <i style={caretStyle} className="fa fa-caret-right" />
}

export default Caret
