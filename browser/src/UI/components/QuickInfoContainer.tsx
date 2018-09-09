import * as React from "react"

import { QuickInfoContainer, QuickInfoDocumentation, QuickInfoTitle } from "./QuickInfo"

import TokenThemeProvider from "./../../Services/SyntaxHighlighting/TokenThemeProvider"
import { getInstance as TokenColorsInstance } from "./../../Services/TokenColors"

interface IQuickInfoProps {
    titleAndContents: ITitleAndContents
    isVisible: boolean
}

interface ITitleAndContents {
    title: {
        __html: string
    }
    description: {
        __html: string
    }
}

class QuickInfoHoverContainer extends React.Component<IQuickInfoProps> {
    public render() {
        const { tokenColors } = TokenColorsInstance()
        const { titleAndContents, isVisible } = this.props
        const hasTitle = !!(titleAndContents && titleAndContents.title.__html)
        const hasDocs =
            hasTitle &&
            !!(
                titleAndContents &&
                titleAndContents.description &&
                titleAndContents.description.__html
            )

        return (
            isVisible && (
                <TokenThemeProvider
                    tokenColors={tokenColors}
                    render={({ styles }) => (
                        <QuickInfoContainer hasDocs={hasDocs}>
                            <QuickInfoTitle
                                tokenStyles={styles}
                                padding={hasDocs && "0.5rem"}
                                html={titleAndContents.title}
                            />
                            {titleAndContents.description && (
                                <QuickInfoDocumentation
                                    html={titleAndContents.description}
                                    tokenStyles={styles}
                                />
                            )}
                        </QuickInfoContainer>
                    )}
                />
            )
        )
    }
}

export default QuickInfoHoverContainer
