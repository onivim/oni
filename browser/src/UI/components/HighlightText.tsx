import * as React from "react"
import { ReactType } from "react"

export interface IHighlightTextProps {
    highlightComponent: ReactType
    highlightText: string
    text: string
    className?: string
}

export const HighlightText = ({
    highlightComponent: HighlightComponent,
    highlightText,
    text = "",
    className,
}: IHighlightTextProps) => {
    const letterCountDictionary = createLetterCountDictionary(highlightText)

    const textCharacters = [...text]
    const childNodes = textCharacters.map((character, index) => {
        const remainingLetterCountBefore = letterCountDictionary[character]
        letterCountDictionary[character] = remainingLetterCountBefore - 1

        return remainingLetterCountBefore > 0 ? (
            <HighlightComponent key={`${index}-${character}`}>{character}</HighlightComponent>
        ) : (
            <span key={`${index}-${character}`}>{character}</span>
        )
    })

    return <span className={className}>{childNodes}</span>
}

export interface IHighlightTextByIndexProps {
    highlightComponent: ReactType
    highlightIndices: number[]
    text: string
    className?: string
}

export const HighlightTextByIndex = ({
    highlightComponent: HighlightComponent,
    highlightIndices = [],
    text = "",
    className,
}: IHighlightTextByIndexProps) => {
    const textCharacters = [...text]
    const childNodes = textCharacters.map(
        (character, index) =>
            shouldHighlightIndex(index, highlightIndices) ? (
                <HighlightComponent key={`${index}-${highlightIndices}-${character}`}>
                    {character}
                </HighlightComponent>
            ) : (
                <span key={`${index}-${highlightIndices}-${character}`}>{character}</span>
            ),
    )

    return <span className={className}>{childNodes}</span>
}

function shouldHighlightIndex(index: number, highlights: number[]): boolean {
    return highlights.indexOf(index) >= 0
}

export interface LetterCountDictionary {
    [letter: string]: number
}

export function createLetterCountDictionary(text: string) {
    const textCharacters = [...text]
    return textCharacters.reduce(
        (dictionary, character) => {
            const currentLetterCount = dictionary[character] || 0
            dictionary[character] = currentLetterCount + 1
            return dictionary
        },
        {} as LetterCountDictionary,
    )
}
