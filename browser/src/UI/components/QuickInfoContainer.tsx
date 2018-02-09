// import { mergeAll, mergeDeepRight } from "ramda"
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
            Boolean(
                titleAndContents &&
                    titleAndContents.description &&
                    titleAndContents.description.__html,
            )

        return (
            <TokenThemeProvider
                render={theme =>
                    !!titleAndContents ? (
                        <QuickInfoContainer hasDocs={hasDocs}>
                            <QuickInfoTitle
                                padding={hasDocs ? "0.5rem" : null}
                                html={titleAndContents.title}
                            />
                            {titleAndContents.description && (
                                <QuickInfoDocumentation html={titleAndContents.description} />
                            )}
                        </QuickInfoContainer>
                    ) : null
                }
            />
        )
    }
}

export default QuickInfoHoverContainer
