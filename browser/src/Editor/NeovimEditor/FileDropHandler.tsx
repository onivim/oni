import * as React from "react"

interface IFileDropHandler {
    target: HTMLElement
    handleFiles: (files: FileList) => void
}

type DragTypeName = "ondragover" | "ondragleave" | "ondragenter"

/**
 * Takes an element (which can accept drag and drop events) and a file drop event listener to it
 * N.B. the element cannot be obscured as this will prevent event transmission
 * @name FileDropHandler
 * @function
 *
 * @extends {React}
 */
export default class FileDropHandler extends React.Component<IFileDropHandler> {
    public componentDidMount() {
        this.addDropHandler()
    }

    public componentDidUpdate(prevProps: IFileDropHandler) {
        if (!prevProps.target && this.props.target) {
            this.addDropHandler()
        }
    }

    public addDropHandler() {
        if (!this.props.target) {
            return
        }

        const dragTypes = ["ondragenter", "ondragover", "ondragleave"]

        dragTypes.map((event: DragTypeName) => {
            if (this.props.target[event]) {
                this.props.target[event] = ev => {
                    ev.preventDefault()
                }
            }
        })

        this.props.target.ondrop = async ev => {
            const { files } = ev.dataTransfer

            if (files.length) {
                await this.props.handleFiles(files)
            }
            ev.preventDefault()
        }
    }

    public render(): JSX.Element {
        return null
    }
}
