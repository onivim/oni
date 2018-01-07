import * as os from "os"

import * as React from "react"
import styled, { boxShadowInset, fontSizeSmall } from "./common"

const Documentation = styled.div`
    ${fontSizeSmall};
    ${boxShadowInset};
    padding: 8px;
    min-width: 300px;
    max-height: 48px;
    overflow-y: auto;
    margin-bottom: 0.5rem;
`

const Title = styled.div`
    width: 100%;
    margin: 8px;
    overflow-x: hidden;

    &:hover {
        overflow-x: overlay;
    }

    &::-webkit-scrollbar {
        height: 2px;
    }
`

export interface ITextProps {
    text: string
}

export class TextComponent extends React.PureComponent<ITextProps, {}> {

}

export class QuickInfoTitle extends TextComponent {
    public render(): JSX.Element {
        return <Title>{this.props.text}</Title>
    }
}

export class QuickInfoDocumentation extends TextComponent {
    public render(): JSX.Element {

        if (!this.props.text) {
            return null
        }

        const lines = this.props.text.split(os.EOL)
        const divs = lines.map((l) => <div>{l}</div>)

        return <Documentation>{divs}</Documentation>
    }
}
