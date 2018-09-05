import * as React from "react"
import { css, ThemeProvider, withTheme } from "styled-components"

import { TokenColor, TokenColorStyle } from "./../../Services/TokenColors"
import { Css, IThemeColors } from "./../../UI/components/common"

/**
 * A object representing a key of default oni tokens and an array of tokens
 * to create based of of the colors of the default token
 */
const defaultsToMap = {
    "variable.parameter": [
        "support",
        "support.variable",
        "support.variable.property.dom",
        "support.variable.dom",
        "support.class.dom",
        "support.type.builtin",
        "support.class.builtin",
        "support.type.primitive",
        "support.variable.property",
        "variable.language",
        "variable.language.this",
        "variable.function",
        "variable.parameter",
        "variable.object",
        "variable",
        "meta.object.type",
        "meta.object",
        "variable.other.readwrite",
        "variable.other.readwrite.alias",
        "constant.numeric",
        "constant.language",
        "constant.numeric.integer",
        "constant.character.escape",
    ],
    "support.function": [
        "invalid",
        "function",
        "support.function",
        "entity.name",
        "entity.name.section",
        "entity.name.type",
        "entity.name.tag",
        "entity.name.type.alias",
        "entity.name.type.class",
        "entity.name.function",
        "entity.name.type.enum",
        "entity.name.type.interface",
        "entity.name.type.module",
        "entity.other.attribute.name",
        "entity.other.inherited-class",
        "entity.other.attribute.name",
        "punctuation.accessor",
        "punctuation.separator.continuation",
        "punctuation.separator.comma",
        "punctuation.terminator",
        "punctuation.terminator",
    ],
    "variable.other.constant": [
        "constant",
        "constant.language",
        "variable.other",
        "entity.other",
        "keyword",
        "keyword.package",
        "keyword.var",
        "keyword.const",
        "keyword.struct",
        "keyword.control",
        "keyword.function",
        "keyword.operator",
        "keyword.operator.expression",
        "keyword.operator.expression.void",
        "keyword.control.import",
        "storage.type",
        "storage.modifier",
        "storage.type.type",
        "storage.type.class",
        "storage.type.enum",
        "storage.type.string",
        "storage.type.interface",
        "storage.type.function",
        "storage.type.namespace",
        "keyword.control.import",
        "keyword.control.default",
        "keyword.control.export",
        "variable.object",
        "variable.object.property",
        "variable.other.constant",
        "variable.other.object",
        "variable.other.assignment",
        "variable.other.declaration",
        "variable.other.constant.object",
        "variable.other.object.property",
        "variable.other.property",
    ],
    "string.quoted.double": [
        "string.quoted.double",
        "string.quoted.single",
        "string.quoted.triple",
        "string",
        "string.other",
    ],
}

type TokenFunc = (theme: INewTheme) => string

export interface INewTheme extends IThemeColors {
    "editor.tokenColors.hoverTokens": {
        [token: string]: TokenColorStyle
    }
}

interface IDefaultMap {
    [defaultTokens: string]: string[]
}

interface RenderProps {
    theme: INewTheme
    styles: Css
}

interface IProps {
    render: (s: RenderProps) => React.ReactElement<RenderProps> | React.ReactNode
    theme: INewTheme
    defaultMap?: IDefaultMap
    tokenColors?: TokenColor[]
}

interface IState {
    theme: INewTheme
    styles: Css
}

interface IGenerateTokenArgs {
    defaultMap?: IDefaultMap
    defaultTokens: TokenColor[]
}

type Style = "bold" | "italic" | "foreground" | "background"

/**
 * **TokenThemeProvider** is a Render Prop
 * It is designed to be used to give UI components access to a
 * theme with token colors as an accessible object as well as associated
 * styles for the tokens.
 * It wraps the component it renders in a separate theme which shares values with the
 * main theme but adds on token colors to the theme as `"editor.tokenColors.hoverTokens"`
 * It takes the basic token colors and generates a larger set based on the existing
 * by copying the settings of the default ones this can be customised by passing a different set
 * of defaults as props
 */
class TokenThemeProvider extends React.Component<IProps, IState> {
    public state: IState = {
        styles: null,
        theme: this.props.theme,
    }

    public flattenedDefaults = Object.values(defaultsToMap).reduce((acc, a) => [...acc, ...a], [])

    public componentDidMount() {
        const themeTokenNames = this.convertTokenNamesToClasses(this.props.tokenColors)
        const tokensToHightlight = [...themeTokenNames, ...this.flattenedDefaults]
        const styles = this.constructStyles(tokensToHightlight)
        const editorTokens = this.createThemeFromTokens(this.props.tokenColors)

        const theme = { ...this.props.theme, ...editorTokens }
        this.setState({ theme, styles })
    }

    public createThemeFromTokens(tokens: TokenColor[]) {
        const combinedThemeAndDefaultTokens = this.generateTokens({
            defaultTokens: this.props.tokenColors,
        })
        const tokenColorsMap = combinedThemeAndDefaultTokens.reduce(
            (theme, token) => {
                return {
                    ...theme,
                    [token.scope]: {
                        ...token.settings,
                    },
                }
            },
            {} as { [key: string]: TokenColorStyle },
        )

        return { "editor.tokenColors.hoverTokens": tokenColorsMap }
    }

    public generateTokens({ defaultMap = defaultsToMap, defaultTokens }: IGenerateTokenArgs) {
        const newTokens = Object.keys(defaultMap).reduce((acc, defaultTokenName) => {
            const defaultToken = this.props.tokenColors.find(
                token => token.scope === defaultTokenName,
            )
            if (defaultToken) {
                const tokens = defaultMap[defaultTokenName].map(name =>
                    this.generateSingleToken(name, defaultToken),
                )
                return [...acc, ...tokens]
            }
            return acc
        }, [])
        return [...newTokens, ...this.props.tokenColors]
    }

    public generateSingleToken(name: string, { settings }: TokenColor) {
        return {
            scope: name,
            settings,
        }
    }

    /**
     * Provides a check that a token exists and has valid values
     * if not it returns nothing or in the case of the foregroundColor it returns a default
     * @returns {string | undefined}
     */
    public getCssRule = (
        hoverTokens: INewTheme["editor.tokenColors.hoverTokens"],
        token: string,
        style: Style,
    ): boolean | string | void => {
        const details = hoverTokens[token]
        if (!details) {
            return
        }

        switch (style) {
            case "italic":
            case "bold":
                return details.fontStyle.includes(style)
            case "foreground":
            default:
                return details[style]
        }
    }
    /**
     * Construct Class is a function which takes a token
     * and returns another function which takes the theme as an argument
     * with which it creates a css class based on the token name and returns this as a string
     * @returns {fn(theme) => string}
     */
    public constructClassName = (token: string) => (theme: INewTheme) => {
        const notPunctuation = !token.includes("punctuation")
        const tokenAsClass = token.replace(/[.]/g, "-")

        const hoverTokens = theme["editor.tokenColors.hoverTokens"]

        if (!hoverTokens || !(token in hoverTokens)) {
            return ""
        }

        const foreground = this.getCssRule(hoverTokens, token, "foreground")
        const italics = this.getCssRule(hoverTokens, token, "italic")
        const bold = this.getCssRule(hoverTokens, token, "bold")
        const hasContent = foreground || italics || bold

        if (!hasContent) {
            return ""
        }

        const cssClass = `
            .${tokenAsClass} {
                ${foreground ? `color: ${foreground}` : ""};
                ${italics ? "font-style: italic" : ""};
                ${bold && notPunctuation ? "font-weight: bold" : ""};
            }
        `
        return cssClass
    }

    public convertTokenNamesToClasses = (tokenArray: TokenColor[]) => {
        const arrayOfArrays = tokenArray.map(token => token.scope)
        const names = [].concat(...arrayOfArrays)
        return names
    }

    public constructStyles = (tokensToMap: string[] = this.flattenedDefaults) => {
        const symbols = tokensToMap.map(this.constructClassName)

        const flattenSymbols = (theme: INewTheme, fns: TokenFunc[]) =>
            fns.map(fn => fn(theme)).join("\n")

        const styles = css`
            ${p => flattenSymbols(p.theme, symbols)};
        `
        return styles
    }

    public render() {
        const { theme, styles } = this.state
        return (
            theme && (
                <ThemeProvider theme={theme}>{this.props.render({ theme, styles })}</ThemeProvider>
            )
        )
    }
}

export default withTheme(TokenThemeProvider)
