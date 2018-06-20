import { EventCallback, IDisposable, IEvent } from "oni-types"

import * as dompurify from "dompurify"
import * as hljs from "highlight.js"
import * as marked from "marked"
import * as Oni from "oni-api"
import * as React from "react"

/**
 * Props are like the constructor arguments
 * for the React component (immutable)
 */
interface IMarkdownPreviewProps {
    oni: Oni.Plugin.Api
    instance: MarkdownPreviewEditor
}

interface IColors {
    background: string
    foreground: string
    link: string
    codeBackground: string
    codeForeground: string
    codeBorder: string
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
            link: this.props.oni.colors.getColor("highlight.mode.normal.background"),
            codeBackground: this.props.oni.colors.getColor("background"),
            codeForeground: this.props.oni.colors.getColor("foreground"),
            codeBorder: this.props.oni.colors.getColor("toolTip.border"),
        }

        this.state = { source: "", colors }
    }

    public componentDidMount() {
        const activeEditor: Oni.Editor = this.props.oni.editors.activeEditor

        if (!activeEditor) {
            return
        }

        this.subscribe(activeEditor.onBufferChanged, args => this.onBufferChanged(args))
        // TODO: Subscribe "onFocusChanged"

        if (this.props.oni.configuration.getValue("experimental.markdownPreview.autoScroll")) {
            this.subscribe(activeEditor.onBufferScrolled, args => this.onBufferScrolled(args))
        }

        this.previewBuffer(activeEditor.activeBuffer)
    }

    public componentWillUnmount() {
        for (const subscription of this._subscriptions) {
            subscription.dispose()
        }
        this._subscriptions = []
    }

    public render(): JSX.Element {
        const renderedMarkdown = this.generateMarkdown()
        this.props.instance.updateContent(this.state.source, renderedMarkdown)
        const html = renderedMarkdown + this.generateContainerStyle()
        const classes = "stack enable-mouse oniPluginMarkdownPreviewContainerStyle"
        return <div className={classes} dangerouslySetInnerHTML={{ __html: html }} />
    }

    private generateContainerStyle(): string {
        const colors = this.state.colors
        const syntaxHighlightTheme = this.props.oni.configuration.getValue(
            "experimental.markdownPreview.syntaxTheme",
        )

        const codeBlockStyle = `
            background: ${colors.codeBackground};
            color: ${colors.codeForeground};
            border-color: ${colors.codeBackground};
            font-family: Consolas,Menlo,Monaco,Lucida Console,Liberation Mono,DejaVu Sans Mono,Bitstream Vera Sans Mono,Courier New,monospace,sans-serif
            padding: 0.4em 0.4em 0.4em 0.4em;
            margin: 0.4em 0.4em 0.4em 0.4em;
        `

        return `
            <link rel="stylesheet" href="node_modules/highlight.js/styles/${syntaxHighlightTheme}.css">

            <style>
            .oniPluginMarkdownPreviewContainerStyle {
                padding: 1em 1em 1em 1em;
                overflow-y: auto;
                background: ${colors.background};
                color: ${colors.foreground};
            }

            .oniPluginMarkdownPreviewContainerStyle a:link {
                color: ${colors.link};
            }

            .oniPluginMarkdownPreviewContainerStyle pre {
                display: flex;
                ${codeBlockStyle}
            }

            .oniPluginMarkdownPreviewContainerStyle code {
                ${codeBlockStyle}
            }
            </style>
        `
    }

    private generateMarkdown(): string {
        const markdownLines: string[] = dompurify.sanitize(this.state.source).split("\n")

        const generateAnchor = (line: number): string => {
            return `<a id="${generateScrollingAnchorId(line)}"></a>`
        }

        let isBlock: boolean = false
        const originalLinesCount: number = markdownLines.length - 1
        // tslint:disable-next-line
        for (var i = originalLinesCount; i > 0; i--) {
            if (markdownLines[i].includes("```")) {
                isBlock = !isBlock
            } else if (isBlock) {
                // Skip blocks
            } else if (markdownLines[i].trim() === "") {
                // Skip empty lines
            } else {
                markdownLines.splice(i, 0, generateAnchor(i))
            }
        }
        markdownLines.splice(0, 0, generateAnchor(i))
        markdownLines.push(generateAnchor(originalLinesCount - 1))

        marked.setOptions({
            baseUrl: this.props.oni.workspace.activeWorkspace,
            highlight(code, lang) {
                const languageExists = hljs.getLanguage(lang)
                const languageNotDefinedOrInvalid =
                    typeof lang === "undefined" ||
                    (typeof languageExists === "undefined" && lang !== "nohighlight")

                if (languageNotDefinedOrInvalid) {
                    return hljs.highlightAuto(code).value
                }

                if (lang === "nohighlight") {
                    return code
                }

                return hljs.highlight(lang, code).value
            },
        })

        return marked(markdownLines.join("\n"))
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
        if (this.props.oni.editors.activeEditor.activeBuffer.language !== "markdown") {
            return
        }

        let anchor = null
        for (let line = args.windowTopLine - 1; !anchor && line < args.bufferTotalLines; line++) {
            anchor = document.getElementById(generateScrollingAnchorId(line))
        }

        if (anchor) {
            anchor.scrollIntoView()
        }
    }

    private previewBuffer(buffer: Oni.Buffer): void {
        buffer.getLines().then((lines: string[]) => {
            this.previewString(lines.join("\n"))
        })
    }

    private previewString(str: string): void {
        this.setState({ source: str })
    }
}

class MarkdownPreviewEditor implements Oni.IWindowSplit {
    private _open: boolean = false
    private _manuallyClosed: boolean = false
    private _unrenderedContent: string = ""
    private _renderedContent: string = ""
    private _split: Oni.WindowSplitHandle

    constructor(private _oni: Oni.Plugin.Api) {
        this._oni.editors.activeEditor.onBufferEnter.subscribe(args => this.onBufferEnter(args))
        this._oni.editors.activeEditor.onBufferLeave.subscribe(args => this.onBufferLeave(args))
    }

    public isPaneOpen(): boolean {
        return this._open
    }

    public getUnrenderedContent(): string {
        return this._unrenderedContent
    }

    public getRenderedContent(): string {
        return this._renderedContent
    }

    public updateContent(unrendered: string, rendered: string): void {
        this._unrenderedContent = unrendered
        this._renderedContent = rendered
    }

    public toggle(): void {
        if (this._open) {
            this.close(true)
        } else {
            this.open()
        }
    }

    public open(): void {
        if (!this._open) {
            this._open = true
            this._manuallyClosed = false
            const editorSplit = this._oni.windows.activeSplitHandle

            // TODO: Update API
            this._split = this._oni.windows.createSplit("vertical", this)
            editorSplit.focus()
        }
    }

    public close(manuallyClosed = false): void {
        if (this._open) {
            this._open = false
            this._manuallyClosed = manuallyClosed
            this._split.close()
        }
    }

    public render(): JSX.Element {
        return <MarkdownPreview oni={this._oni} instance={this} />
    }

    private onBufferEnter(bufferInfo: Oni.EditorBufferEventArgs): void {
        if (bufferInfo.language === "markdown" && this._manuallyClosed === false) {
            this.open()
        }
    }

    private onBufferLeave(bufferInfo: Oni.EditorBufferEventArgs): void {
        this.close()
    }
}

export function activate(oni: any): any {
    if (!oni.configuration.getValue("experimental.markdownPreview.enabled", false)) {
        return
    }

    const preview = new MarkdownPreviewEditor(oni)

    oni.commands.registerCommand(
        new Command(
            "markdown.openPreview",
            "Open Markdown Preview",
            "Open the Markdown preview pane if it is not already opened",
            () => {
                preview.open()
            },
        ),
    )

    oni.commands.registerCommand(
        new Command(
            "markdown.closePreview",
            "Close Markdown Preview",
            "Close the Markdown preview pane if it is not already closed",
            () => {
                preview.close(true)
            },
        ),
    )

    oni.commands.registerCommand(
        new Command(
            "markdown.togglePreview",
            "Toggle Markdown Preview",
            "Open the Markdown preview pane if it is closed, otherwise open it",
            () => {
                preview.toggle()
            },
        ),
    )

    return preview as any
}

class Command implements Oni.Commands.ICommand {
    constructor(
        public command: string,
        public name: string,
        public detail: string,
        public execute: Oni.Commands.CommandCallback,
    ) {}
}
