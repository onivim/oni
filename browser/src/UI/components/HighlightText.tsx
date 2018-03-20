import * as React from "react"

export interface IHighlightTextProps {
    highlightClassName: string
    highlightText: string
    text: string
    className: string
}

export class HighlightText extends React.PureComponent<IHighlightTextProps, {}> {
    public render(): JSX.Element {
        const childNodes: JSX.Element[] = []

        const letterCountDictionary = createLetterCountDictionary(this.props.highlightText)

        this.props.text.split("").forEach((c: string, idx: number) => {
            const currentVal = letterCountDictionary[c]
            letterCountDictionary[c] = currentVal - 1

            if (currentVal > 0) {
                childNodes.push(
                    <span key={`${idx}-${c}`} className={this.props.highlightClassName}>
                        {c}
                    </span>,
                )
            } else {
                childNodes.push(<span key={`${idx}-${c}`}>{c}</span>)
            }
        })

        return <span className={this.props.className}>{childNodes}</span>
    }
}

export interface IHighlightTextByIndexProps {
    highlightClassName: string
    highlightIndices: number[]
    text: string
    className: string
}

export class HighlightTextByIndex extends React.PureComponent<IHighlightTextByIndexProps, {}> {
    public render(): JSX.Element {
        const childNodes: JSX.Element[] = []
        const highlightIndices = this.props.highlightIndices || []
        let text = this.props.text || ""

        if (typeof text !== "string") {
            text = ""
        }

        text.split("").forEach((c: string, idx: number) => {
            if (shouldHighlightIndex(idx, highlightIndices)) {
                childNodes.push(
                    <span
                        key={`${idx}-${highlightIndices}-${c}`}
                        className={this.props.highlightClassName}
                    >
                        {c}
                    </span>,
                )
            } else {
                childNodes.push(<span key={`${idx}-${highlightIndices}-${c}`}>{c}</span>)
            }
        })

        return <span className={this.props.className}>{childNodes}</span>
    }
}

function shouldHighlightIndex(index: number, highlights: number[]): boolean {
    return highlights.indexOf(index) >= 0
}

export interface LetterCountDictionary {
    [letter: string]: number
}

export function createLetterCountDictionary(text: string): LetterCountDictionary {
    const array: string[] = text.split("")
    return array.reduce((previousValue: any, currentValue: string) => {
        const cur = previousValue[currentValue] || 0
        previousValue[currentValue] = cur + 1
        return previousValue
    }, {})
}
