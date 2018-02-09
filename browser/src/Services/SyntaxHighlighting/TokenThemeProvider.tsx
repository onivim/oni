import * as React from "react"
import { css, ThemeProvider, withTheme } from "styled-components"

import { getInstance as TokenColors } from "./../../Services/TokenColors"
import { IThemeColors } from "./../../UI/components/common"

const cssToken = (theme: INewTheme, token: string) => (property: string) => {
    try {
        const details = theme["editor.tokenColors.hoverTokens"][token]
        return details[property]
    } catch (e) {
        if (property === "foregroundColor") {
            return theme["toolTip.foreground"]
        }
    }
}
const constructClassName = (token: string) => (theme: INewTheme) => {
    const tokenAsClass = token.replace(/[.]/g, "-")
    const tokenStyle = cssToken(theme, token)
    const cssClass = `
        .${tokenAsClass} {
            color: ${tokenStyle("foregroundColor")};
            ${tokenStyle("bold") && "font-weight: bold"};
            ${tokenStyle("italic") && "font-style: italic"};
        }
    `
    return cssClass
}

const symbols = [
    "source",
    "marked.identifier",
    "marked.function",
    "marked.constant",
    "meta.class",
    "entity.name",
    "support.function",
    "variable.other",
    "variable.object",
    "variable.language",
    "variable.parameter",
    "variable.object.property",
    "keyword.operator",
    "keyword.operator-expression",
    "keyword.operator-void",
    "support.class",
    "support.class.dom",
    "support.class.builtin",
    "support.type.primitive",
    "variable.other.readwrite",
    "variable.other.property",
    "variable.other.object",
    "variable.other.constant.object",
    "variable.other.object.property",
    "variable.other.readwrite.alias",
    "storage.type",
    "storage.type.enum",
    "storage.type.interface",
    "entity.name.type",
    "entity.name.function",
    "entity.name.type.enum",
    "entity.name.type.interface",
    "entity.name.type.module",
    "keyword.control.import",
    "keyword.operator.relational",
    "punctuation.terminator",
    "punctuation.accessor",
    "punctuation.definition.block",
    "punctuation.separator.comma",
    "support.variable.property.dom",
    "punctuation.separator.continuation",
    "punctuation.definition.parameters.begin",
    "punctuation.definition.parameters.end",
    "punctuation.separator.continuation",
].map(constructClassName)

type TokenFunc = (theme: INewTheme) => string

const flattenedSymbols = (theme: INewTheme, fns: TokenFunc[]) => fns.map(fn => fn(theme)).join("\n")

const styles = css`
    ${p => flattenedSymbols(p.theme, symbols)};
`

export interface INewTheme extends IThemeColors {
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
    render: (s: { theme: INewTheme; styles: any }) => React.ReactElement<any>
    theme: INewTheme
}

interface IState {
    theme: INewTheme
    styles: string
}

class TokenThemeProvider extends React.Component<IProps, IState> {
    public state: IState = {
        styles: "",
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
        return (
            theme && (
                <ThemeProvider theme={theme}>{this.props.render({ theme, styles })}</ThemeProvider>
            )
        )
    }
}

export default withTheme(TokenThemeProvider)
