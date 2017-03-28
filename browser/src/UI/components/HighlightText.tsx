import * as React from "react"

export interface IHighlightTextProps {
    highlightClassName: string
    highlightText: string
    text: string
    className: string
}

export class HighlightText extends React.Component<IHighlightTextProps, void> {

    public render(): JSX.Element {

        const childNodes: JSX.Element[] = []

        const letterCountDictionary = createLetterCountDictionary(this.props.highlightText)

        this.props.text.split("").forEach((c: string) => {

            const currentVal = letterCountDictionary[c]
            letterCountDictionary[c] = currentVal - 1

            if (currentVal > 0) {
                childNodes.push(<span className={this.props.highlightClassName}>{c}</span>)
            } else {
                childNodes.push(<span>{c}</span>)
            }
        })

        return <span className={this.props.className}>{childNodes}</span>
    }
}

export interface IHighlightTextByIndexProps {
    highlightClassName: string
    highlightIndices: number[][]
    text: string
    className: string
}

export class HighlightTextByIndex extends React.Component<IHighlightTextByIndexProps, void> {
    public render(): JSX.Element {

        const childNodes: JSX.Element[] = []
        const highlightIndices = this.props.highlightIndices || []

        this.props.text.split("").forEach((c: string, idx: number) => {

            if (shouldHighlightIndex(idx, highlightIndices)) {
                childNodes.push(<span className={this.props.highlightClassName}>{c}</span>)
            } else {
                childNodes.push(<span>{c}</span>)
            }
        })

        return <span className={this.props.className}>{childNodes}</span>
    }

}

function shouldHighlightIndex(index: number, highlights: number[][]): boolean {
    let matchFound = false
    for (let startEnd of highlights) {
        if (startEnd[0] <= index && index <= startEnd[1]) {
            matchFound = true
            break
        }
    }
    return matchFound
}

export function createLetterCountDictionary(text: string): any {
    const array: string[] = text.split("")
    return array.reduce((previousValue: any, currentValue: string) => {
        let cur = previousValue[currentValue] || 0
        previousValue[currentValue] = cur + 1
        return previousValue
    }, {})
}
