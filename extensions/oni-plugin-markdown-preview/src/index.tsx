import { EventCallback, IDisposable, IEvent } from "oni-types"

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

enum ContentLanguage {
    MARKDOWN,
    LATEX,
    OTHER,
}

interface IMarkdownPreviewState {
    rendered: string
    colors: IColors
}

function mapLanguage(language: string): ContentLanguage {
    if (language === "markdown") {
        return ContentLanguage.MARKDOWN
    }
    if (language === "plaintex") {
        return ContentLanguage.LATEX
    }
    return ContentLanguage.OTHER
}

const generateScrollingAnchorId = (line: number) => {
    return "scrolling-anchor-id-" + line
}

class MarkdownPreview extends React.PureComponent<IMarkdownPreviewProps, IMarkdownPreviewState> {
    private _subscriptions: IDisposable[] = []
    private _mathjax = require("mathjax-electron")

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
        this.state = { rendered: "", colors }
    }

    public componentDidMount() {
        const activeEditor: Oni.Editor = this.props.oni.editors.activeEditor

        if (!activeEditor) {
            return
        }

        this.subscribe(activeEditor.onBufferChanged, args => this.onBufferChanged(args))
        // TODO: Subscribe "onFocusChanged"
        this.subscribe(activeEditor.onBufferScrolled, args => this.onBufferScrolled(args))

        this.previewBuffer(activeEditor.activeBuffer)
    }

    public componentWillUnmount() {
        for (const subscription of this._subscriptions) {
            subscription.dispose()
        }
        this._subscriptions = []
    }

    public render(): JSX.Element {
        const html = this.state.rendered + this.generateContainerStyle()
        const classes = "stack enable-mouse oniPluginMarkdownPreviewContainerStyle"
        return <div className={classes} dangerouslySetInnerHTML={{ __html: html }} />
    }

    private generateContainerStyle(): string {
        const colors = this.state.colors

        const codeBlockStyle = `
            background: ${colors.codeBackground};
            color: ${colors.codeForeground};
            border-color: ${colors.codeBackground};
            font-family: Consolas,Menlo,Monaco,Lucida Console,Liberation Mono,DejaVu Sans Mono,Bitstream Vera Sans Mono,Courier New,monospace,sans-serif
            padding: 0.4em 0.4em 0.4em 0.4em;
            margin: 0.4em 0.4em 0.4em 0.4em;
        `

        return `
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

    private setContent(source: string, rendered: string): void {
        this.props.instance.updateContent(source, rendered)
        this.setState({ rendered })
    }

    private generateMarkdown(source: string): void {
        const markdownLines: string[] = source.split("\n")

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

        this.setContent(source, marked(markdownLines.join("\n")))
    }

    private generateLatex(source: string): void {
        const container = document.createElement("div")
        container.innerHTML = source

        const cb = () => {
            this.setContent(source, container.innerHTML)
        }

        this._mathjax.loadAndTypeset(document, container, cb)
    }

    private subscribe<T>(editorEvent: IEvent<T>, eventCallback: EventCallback<T>): void {
        this._subscriptions.push(editorEvent.subscribe(eventCallback))
    }

    private onBufferChanged(bufferInfo: Oni.EditorBufferChangedEventArgs): void {
        if (mapLanguage(bufferInfo.buffer.language) !== ContentLanguage.OTHER) {
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
        const language = mapLanguage(buffer.language)

        buffer.getLines().then((lines: string[]) => {
            this.previewString(lines.join("\n"), language)
        })
    }

    private previewString(str: string, language: ContentLanguage): void {
        const source = dompurify.sanitize(str)

        if (language === ContentLanguage.MARKDOWN) {
            this.generateMarkdown(source)
        } else if (language === ContentLanguage.LATEX) {
            this.generateLatex(source)
        }
    }
}

class MarkdownPreviewEditor implements Oni.IWindowSplit {
    private _open: boolean = false
    private _unrenderedContent: string = ""
    private _renderedContent: string = ""
    private _split: Oni.WindowSplitHandle

    constructor(private _oni: Oni.Plugin.Api) {
        this._oni.editors.activeEditor.onBufferEnter.subscribe(args => this.onBufferEnter(args))
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
            this.close()
        } else {
            this.open()
        }
    }

    public open(): void {
        if (!this._open) {
            this._open = true
            // TODO: Update API
            this._split = this._oni.windows.createSplit("vertical", this)
        }
    }

    public close(): void {
        if (this._open) {
            this._open = false
            this._split.close()
        }
    }

    public render(): JSX.Element {
        return <MarkdownPreview oni={this._oni} instance={this} />
    }

    private onBufferEnter(bufferInfo: Oni.EditorBufferEventArgs): void {
        if (mapLanguage(bufferInfo.language) !== ContentLanguage.OTHER) {
            this.open()
        }
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
                preview.close()
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
