import * as os from "os"
import * as marked from "marked"

import * as React from "react"

export interface ITextProps {
    text: string
}

export class TextComponent extends React.PureComponent<ITextProps, {}> {

}

marked.setOptions({ sanitize: true })

export class QuickInfoTitle extends TextComponent {
    public render(): JSX.Element {
        return <div className="title">{this.props.text.replace(/\\/g, "")}</div>
    }
}

export class QuickInfoDocumentation extends TextComponent {
    public render(): JSX.Element {

        if (!this.props.text) {
            return null
        }

        const lines = this.props.text.split(os.EOL)
        const divs = lines.map((l) => <div key={l} dangerouslySetInnerHTML={{ __html: marked(l) }} />)
        // const divs = lines.map((l) => <div key={l}>{l}</div>)

        return <div className="documentation">{divs}</div>
    }
}
