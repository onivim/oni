// import { mergeAll, mergeDeepRight } from "ramda"
import * as React from "react"

import { ThemeProvider, withTheme } from "styled-components"
import { getInstance as TokenColors } from "./../../Services/TokenColors"
import { IThemeColors } from "./common"
import { QuickInfoContainer, QuickInfoDocumentation, QuickInfoTitle } from "./QuickInfo"

interface IQuickInfoProps {
    theme: IThemeColors
    titleAndContents: ITitleAndContents
}

// interface ITokens {
//     [token: string]: TokenColor
// }

// interface IScopes {
//     [highlight: string]: string[]
// }

interface ITitleAndContents {
    title: {
        __html: string
    }
    description: {
        __html: string
    }
}

// const quickInfoTokens: IScopes = {
//     define: ["meta.import"],
//     identifier: [
//         "support.variable",
//         "support.variable.property.dom",
//         "variable.language",
//         "variable.parameter",
//         "variable.object",
//         "meta.object.type",
//         "meta.object",
//     ],
//     function: [
//         "support.function",
//         "entity.name",
//         "entity.name.type.enum",
//         "entity.name.type.interface",
//         "meta.function.call",
//         "meta.function",
//         "punctuation.accessor",
//         "punctuation.separator.continuation",
//         "punctuation.separator.comma",
//         "punctuation.terminator",
//         "punctuation.terminator",
//     ],
//     constant: [
//         "storage.type.interface",
//         "storage.type.enum",
//         "storage.type.interface",
//         "entity.other",
//         "keyword.control.import",
//         "keyword.control",
//         "variable.other.constant",
//         "variable.other.object",
//         "variable.other.property",
//     ],
//     type: [
//         "meta.type.annotation",
//         "meta.type.declaration",
//         "meta.interface",
//         "meta.class",
//         "support.class.builtin",
//         "support.type.primitive",
//         "support.class",
//         "variable.other.readwrite",
//         "meta.namespace.declaration",
//         "meta.namespace",
//     ],
//     normal: ["meta.brace.round"],
// }

interface INewTheme extends IThemeColors {
    "editor.tokenColors.hoverTokens": {
        [token: string]: {
            foregroundColor: string
            backgroundColor: string
            italic: string
            bold: string
        }
    }
}

interface IProps {
    render: (s: { theme: INewTheme }) => React.ReactElement<any>
    theme: INewTheme
}

interface IState {
    theme: INewTheme
}

class TokenTheme extends React.Component<IProps, IState> {
    public state: IState = {
        theme: {} as INewTheme,
    }

    public componentDidMount() {
        const editorTokens = this.createThemeFromTokens()
        this.setState({ theme: { ...this.props.theme, ...editorTokens } })
    }

    public createThemeFromTokens() {
        const { tokenColors } = TokenColors()
        const tokenColorsMap = tokenColors.reduce((theme, token) => {
            return {
                ...theme,
                [token.scope]: {
                    ...token.settings,
                },
            }
        }, {})

        return { "editor.tokenColors.hoverTokens": tokenColorsMap }
    }

    public render() {
        const { theme } = this.state
        return theme && <ThemeProvider theme={theme}>{this.props.render({ theme })}</ThemeProvider>
    }
}

const TokenThemeProvider = withTheme(TokenTheme)

class QuickInfoHoverContainer extends React.Component<IQuickInfoProps, IState> {
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

export default withTheme(QuickInfoHoverContainer)
