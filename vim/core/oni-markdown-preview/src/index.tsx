import * as marked from "marked"
import * as React from "react"

/**
 * Props are like the constructor arguments
 * for the React component (immutable)
 */
export interface IMarkdownPreviewProps {
    oni: Oni.Plugin.Api
}

export interface IMarkdownPreviewState {
    source: string
}

export class MarkdownPreview extends React.PureComponent<IMarkdownPreviewProps, IMarkdownPreviewState> {
    private _fs = require('fs')
    private _subscriptions: Array<Oni.IDisposable> = []

    constructor(props: IMarkdownPreviewProps) {
        super(props)

        this.state = { source: "" }
    }

    componentDidMount() {
        const activeEditor: Oni.Editor = this.props.oni.editors.activeEditor
        this.subscribe(activeEditor.onBufferChanged, (args) => this.onBufferChanged(args))
        //TODO: Subscribe "onFocusChanged"

        this.previewBuffer(activeEditor.activeBuffer)
    }

    componentWillUnmount() {
        for (let subscription of this._subscriptions) {
            subscription.dispose()
        }
        this._subscriptions = []
    }

    private subscribe<T>(editorEvent: Oni.IEvent<T>, eventCallback: Oni.EventCallback<T>): void {
        this._subscriptions.push(editorEvent.subscribe(eventCallback))
    }

    private onBufferChanged(bufferInfo: Oni.EditorBufferChangedEventArgs): void {
        if (bufferInfo.buffer.language == "markdown") {
            this.previewBuffer(bufferInfo.buffer)
        }
    }

    private previewBuffer(buffer: Oni.Buffer): void {
        this.previewString("# Loading preview...")
        buffer.getLines().then((lines: string[]) => {this.previewString(lines.join("\n"))})
    }

    private previewString(str: string): void {
        this.setState({source: str})
    }

    public render(): JSX.Element {
        const containerStyle: React.CSSProperties = {
            padding: "1em 1em 1em 1em",
            "overflow-y": "auto",
        }

        const html = marked(this.state.source)
        return <div className="stack enable-mouse" style={containerStyle} dangerouslySetInnerHTML={{__html: html}}></div>
    }
}

export class MarkdownPreviewEditor implements Oni.IWindowSplit {

    private _open: boolean = false

    constructor(
        private _oni: Oni.Plugin.Api
    ) {
        this._oni.editors.activeEditor.onBufferEnter.subscribe((args) => this.onBufferEnter(args))
    }

    private onBufferEnter(bufferInfo: Oni.EditorBufferEventArgs): void {
        if (bufferInfo.language == "markdown") {
            this.open()
        }
    }

    public toggle(): void {
        if (this._open) {
            this.close()
        } else {
            this.open()
        }
    }

    public open(): void {
        if (!this._open) {
            this._open = true
            this._oni.windows.split(1, this)
        }
    }

    public close(): void {
        if (this._open) {
            this._open = false
            this._oni.windows.close(this)
        }
    }

    public render(): JSX.Element {
        return <MarkdownPreview oni={this._oni} />
    }
}

var preview: MarkdownPreviewEditor = null

export const activate = (oni: any) => {
    if (!preview) {
        preview = new MarkdownPreviewEditor(oni)
    }

    oni.commands.registerCommand(new Command(
        "markdown.openPreview",
        "Open Markdown Preview",
        "Open the Markdown preview pane if it is not already opened",
        () => { preview.open() }
    ))

    oni.commands.registerCommand(new Command(
        "markdown.closePreview",
        "Close Markdown Preview",
        "Close the Markdown preview pane if it is not already closed",
        () => { preview.close() }
    ))

    oni.commands.registerCommand(new Command(
        "markdown.togglePreview",
        "Toggle Markdown Preview",
        "Open the Markdown preview pane if it is closed, otherwise open it",
        () => { preview.toggle() }
    ))
};

class Command implements Oni.ICommand {
    constructor(
        public command: string,
        public name: string,
        public detail: string,
        public execute: Oni.ICommandCallback
    ) {}
}

