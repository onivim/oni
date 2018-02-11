import * as React from "react"
import { css, ThemeProvider, withTheme } from "styled-components"

import { getInstance as TokenColorsInstance, TokenColor } from "./../../Services/TokenColors"
import { IThemeColors } from "./../../UI/components/common"

/**
 * Provides a check that a token exists and has valid values
 * if not it returns nothing or in the case of the foregroundColor it returns a default
 * @returns {string | undefined}
 */
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
/**
 * Construct Class name is a function which takes a token
 * and returns another function which takes the theme as an argument
 * with which it creates a css class based on the token name and returns this as
 * a string
 * @returns {fn(theme) => string}
 */
const constructClassName = (token: string) => (theme: INewTheme) => {
    const notPunctuation = !token.includes("punctuation")
    const tokenAsClass = token.replace(/[.]/g, "-")
    const tokenStyle = cssToken(theme, token)
    const cssClass = `
        .${tokenAsClass} {
            color: ${tokenStyle("foregroundColor")};
            ${tokenStyle("bold") && notPunctuation && "font-weight: bold"};
            ${tokenStyle("italic") && "font-style: italic"};
        }
    `
    return cssClass
}

/**
 * A object representing a key of default oni token and an array of tokens
 * to create based of of the colors of the default token
 */
const defaultsToMap = {
    "variable.parameter": [
        "support.variable",
        "support.variable.property.dom",
        "support.class.dom",
        "support.class.builtin",
        "support.type.primitive",
        "variable.language",
        "variable.language.this",
        "variable.parameter",
        "variable.object",
        "meta.object.type",
        "meta.object",
        "variable.other.readwrite",
        "variable.other.readwrite.alias",
    ],
    "support.function": [
        "support.function",
        "entity.name",
        "entity.name.type",
        "entity.name.type.alias",
        "entity.name.type.class",
        "entity.name.function",
        "entity.name.type.enum",
        "entity.name.type.interface",
        "entity.name.type.module",
        "punctuation.accessor",
        "punctuation.separator.continuation",
        "punctuation.separator.comma",
        "punctuation.terminator",
        "punctuation.terminator",
    ],
    "variable.other.constant": [
        "constant.language",
        "variable.other",
        "entity.other",
        "keyword.package",
        "keyword.var",
        "keyword.struct",
        "keyword.control",
        "keyword.function",
        "keyword.operator",
        "keyword.operator.expression",
        "keyword.operator.expression.void",
        "keyword.control.import",
        "storage.type",
        "storage.type.type",
        "storage.type.class",
        "storage.type.enum",
        "storage.type.string",
        "storage.type.interface",
        "keyword.control.import",
        "variable.object",
        "variable.object.property",
        "variable.other.constant",
        "variable.other.object",
        "variable.other.assignment",
        "variable.other.constant.object",
        "variable.other.object.property",
        "variable.other.property",
    ],
    String: ["string.quoted.double", "string.quoted.single", "string.quoted.triple"],
}

const symbols = Object.values(defaultsToMap)
    .reduce((acc, a) => [...acc, ...a], [])
    .map(constructClassName)

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

interface IDefaultMap {
    [defaultTokens: string]: string[]
}

interface IProps {
    render: (s: { theme: INewTheme; styles: any }) => React.ReactElement<any>
    theme: INewTheme
    defaultMap?: IDefaultMap
}

interface IState {
    theme: INewTheme
    styles: string
}

interface IGenerateTokenArgs {
    defaultMap?: IDefaultMap
    defaultTokens: TokenColor[]
}

/**
 * TokenThemeProvider is a Render Prop
 * It is designed to be used to give UI components access to a
 * theme with token colors as an accessible object as well as associated
 * styles for the tokens
 * It wraps the component it renders in a separate theme which shares values with the
 * main theme but adds on token colors to the theme as "editor.tokenColors.hoverTokens"
 * It takes the basic token colors and generates a larger set based on the existing
 * by copying the settings of the default ones this can be customised by passing a different set
 * of defaults as props
 */
class TokenThemeProvider extends React.Component<IProps, IState> {
    public state: IState = {
        styles: null,
        theme: null,
    }

    private tokenColors = TokenColorsInstance().tokenColors
    private enhancedTokens: TokenColor[]

    public componentDidMount() {
        const editorTokens = this.createThemeFromTokens()
        this.setState({ theme: { ...this.props.theme, ...editorTokens } })
    }

    public createThemeFromTokens() {
        if (!this.enhancedTokens) {
            this.enhancedTokens = this.generateTokens({ defaultTokens: this.tokenColors })
        }
        const tokenColorsMap = this.enhancedTokens.reduce((theme, token) => {
            return {
                ...theme,
                [token.scope]: {
                    ...token.settings,
                },
            }
        }, {})

        return { "editor.tokenColors.hoverTokens": tokenColorsMap }
    }

    public generateTokens({ defaultMap = defaultsToMap, defaultTokens }: IGenerateTokenArgs) {
        const newTokens = Object.keys(defaultMap).reduce((acc, key) => {
            const defaultToken = this.tokenColors.find(token => token.scope === key)
            if (defaultToken) {
                const tokens = defaultMap[key].map(name =>
                    this.generateSingleToken(name, defaultToken),
                )
                return [...acc, ...tokens]
            }
            return acc
        }, [])
        return [...newTokens, this.tokenColors]
    }

    public generateSingleToken(name: string, { settings }: TokenColor) {
        return {
            scope: name,
            settings,
        }
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
