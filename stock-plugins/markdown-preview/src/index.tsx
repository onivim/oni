import { Event, EventCallback, IDisposable, IEvent } from "oni-types"

import * as dompurify from "dompurify"
import * as marked from "marked"
import * as Oni from "oni-api"
import * as React from "react"

/**
 * Props are like the constructor arguments
 * for the React component (immutable)
 */
interface IMarkdownPreviewProps {
    oni: Oni.Plugin.Api
}

interface IColors {
    background: string
    foreground: string
}

interface IMarkdownPreviewState {
    source: string
    colors: IColors
}

const generateScrollingAnchorId = (line: number) => {
    return "scrolling-anchor-id-" + line
}

class MarkdownPreview extends React.PureComponent<IMarkdownPreviewProps, IMarkdownPreviewState> {
    private _subscriptions: IDisposable[] = []

    constructor(props: IMarkdownPreviewProps) {
        super(props)

        const colors: IColors = {
            background: this.props.oni.colors.getColor("editor.background"),
            foreground: this.props.oni.colors.getColor("editor.foreground"),
        }
        this.state = { source: "", colors }
    }

    public componentDidMount() {
        const activeEditor: Oni.Editor = this.props.oni.editors.activeEditor
        this.subscribe(activeEditor.onBufferChanged, (args) => this.onBufferChanged(args))
        // TODO: Subscribe "onFocusChanged"
        this.subscribe(activeEditor.onBufferScrolled, (args) => this.onBufferScrolled(args))

        this.previewBuffer(activeEditor.activeBuffer)
    }

    public componentWillUnmount() {
        for (const subscription of this._subscriptions) {
            subscription.dispose()
        }
        this._subscriptions = []
    }

    public render(): JSX.Element {
        const containerStyle: React.CSSProperties = {
            padding: "1em 1em 1em 1em",
            overflowY: "auto",
            background: this.state.colors.background,
            color: this.state.colors.foreground,
        }

        const markdownLines = dompurify.sanitize(this.state.source).split("\n")

        const generateAnchor = (line: number) => {
            return "<a id=\"" + generateScrollingAnchorId(line) + "\"></a>"
        }

        const originalLinesCount = markdownLines.length - 1
        for (var i = originalLinesCount; i > 0; i--) { // tslint:disable-line
            if (markdownLines[i].trim() !== "") {
                markdownLines.splice(i, 0, generateAnchor(i))
            }
        }
        markdownLines.splice(0, 0, generateAnchor(i))
        markdownLines.push(generateAnchor(originalLinesCount - 1))

        const html = marked(markdownLines.join("\n"))
        return <div className="stack enable-mouse" style={containerStyle} dangerouslySetInnerHTML={{__html: html}}></div>
    }

    private subscribe<T>(editorEvent: IEvent<T>, eventCallback: EventCallback<T>): void {
        this._subscriptions.push(editorEvent.subscribe(eventCallback))
    }

    private onBufferChanged(bufferInfo: Oni.EditorBufferChangedEventArgs): void {
        if (bufferInfo.buffer.language === "markdown") {
            this.previewBuffer(bufferInfo.buffer)
        }
    }

    private onBufferScrolled(args: Oni.EditorBufferScrolledEventArgs): void {
        let anchor = null
        for (let line = args.windowTopLine - 1; !anchor && line < args.bufferTotalLines; line++) {
            anchor = document.getElementById(generateScrollingAnchorId(line))
        }

        if (anchor) {
            anchor.scrollIntoView()
        }
    }

    private previewBuffer(buffer: Oni.Buffer): void {
        this.previewString("# Loading preview...")
        buffer.getLines().then((lines: string[]) => {this.previewString(lines.join("\n"))})
    }

    private previewString(str: string): void {
        this.setState({source: str})
    }
}

class MarkdownPreviewEditor implements Oni.IWindowSplit {

    private _open: boolean = false

    constructor(
        private _oni: Oni.Plugin.Api,
    ) {
        this._oni.editors.activeEditor.onBufferEnter.subscribe((args) => this.onBufferEnter(args))
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

    private onBufferEnter(bufferInfo: Oni.EditorBufferEventArgs): void {
        if (bufferInfo.language === "markdown") {
            this.open()
        }
    }
}

let preview: MarkdownPreviewEditor = null

export const activate = (oni: any) => {
    if (!oni.configuration.getValue("experimental.markdownPreview.enabled", false)) {
        return
    }

    if (!preview) {
        preview = new MarkdownPreviewEditor(oni)
    }

    oni.commands.registerCommand(new Command(
        "markdown.openPreview",
        "Open Markdown Preview",
        "Open the Markdown preview pane if it is not already opened",
        () => { preview.open() },
    ))

    oni.commands.registerCommand(new Command(
        "markdown.closePreview",
        "Close Markdown Preview",
        "Close the Markdown preview pane if it is not already closed",
        () => { preview.close() },
    ))

    oni.commands.registerCommand(new Command(
        "markdown.togglePreview",
        "Toggle Markdown Preview",
        "Open the Markdown preview pane if it is closed, otherwise open it",
        () => { preview.toggle() },
    ))
}

class Command implements Oni.ICommand {
    constructor(
        public command: string,
        public name: string,
        public detail: string,
        public execute: Oni.ICommandCallback,
    ) {}
}
