import * as React from "react"

import { QuickInfoContainer, QuickInfoDocumentation, QuickInfoTitle } from "./QuickInfo"

import TokenThemeProvider from "./../../Services/SyntaxHighlighting/TokenThemeProvider"

interface IQuickInfoProps {
    titleAndContents: ITitleAndContents
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
        const { titleAndContents } = this.props
        const hasTitle = !!(titleAndContents && titleAndContents.title.__html)
        const hasDocs =
            hasTitle &&
            !!(
                titleAndContents &&
                titleAndContents.description &&
                titleAndContents.description.__html
            )

        return (
            !!titleAndContents && (
                <TokenThemeProvider
                    render={({ theme, styles }) => (
                        <QuickInfoContainer hasDocs={hasDocs}>
                            <QuickInfoTitle
                                padding={hasDocs ? "0.5rem" : null}
                                html={titleAndContents.title}
                                tokenStyles={styles}
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
