import * as React from "react"

type SetRef = (elem: HTMLElement) => void

interface IFileDropHandler {
    handleFiles: (files: FileList) => void
    children: (args: { setRef: SetRef }) => React.ReactElement<{ setRef: SetRef }>
}

type DragTypeName = "ondragover" | "ondragleave" | "ondragenter"

/**
 * Takes an element (which can accept drag and drop events) and a file drop event listener callback
 * N.B. the element cannot be obscured as this will prevent event transmission
 * @name FileDropHandler
 * @function
 *
 * @extends {React}
 */
export default class FileDropHandler extends React.Component<IFileDropHandler> {
    private _target: HTMLElement

    public componentDidMount() {
        this.addDropHandler()
    }

    public setRef = (element: HTMLElement) => {
        this._target = element
    }

    public addDropHandler() {
        if (!this._target) {
            return
        }

        // This is necessary to prevent electron's default behaviour on drag and dropping
        // which replaces the webContent aka the entire editor with the text, NOT Good
        // also DO Not Stop Propagation as this breaks other drag drop functionality
        document.addEventListener("dragover", ev => {
            ev.preventDefault()
        })

        document.addEventListener("dragenter", ev => {
            ev.preventDefault()
        })

        document.addEventListener("drop", ev => {
            ev.preventDefault()
        })

        const dragTypes = ["ondragenter", "ondragover", "ondragleave"]

        dragTypes.map((event: DragTypeName) => {
            if (this._target[event]) {
                this._target[event] = ev => {
                    ev.preventDefault()
                    ev.stopPropagation()
                }
            }
        })

        this._target.ondrop = async ev => {
            const { files } = ev.dataTransfer

            if (files.length) {
                await this.props.handleFiles(files)
            }
            ev.preventDefault()
        }
    }

    public render() {
        return this.props.children({ setRef: this.setRef })
    }
}
