import * as React from "react"
import { css, ThemeProvider, withTheme } from "styled-components"

import {
    getInstance as TokenColorsInstance,
    TokenColor,
    TokenColorStyle,
} from "./../../Services/TokenColors"
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
    render: (s: RenderProps) => React.ReactElement<RenderProps>
    theme: INewTheme
    defaultMap?: IDefaultMap
}

interface IState {
    theme: INewTheme
    styles: Css
}

interface IGenerateTokenArgs {
    defaultMap?: IDefaultMap
    defaultTokens: TokenColor[]
}

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

    private tokenColors = TokenColorsInstance().tokenColors
    private enhancedTokens: TokenColor[]

    public componentDidMount() {
        const themeTokenNames = this.convertTokenNamesToClasses(this.tokenColors)
        const styles = this.constructStyles(themeTokenNames)
        const editorTokens = this.createThemeFromTokens(this.tokenColors)

        // FIXME: the new tokens aren't highlighting properly
        this.setState({ theme: { ...this.props.theme, ...editorTokens }, styles })
    }

    public createThemeFromTokens(tokens: TokenColor[]) {
        if (!this.enhancedTokens) {
            this.enhancedTokens = this.generateTokens({ defaultTokens: this.tokenColors })
            // console.log("this.enhancedTokens: ", this.enhancedTokens)
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
        return [...newTokens, ...this.tokenColors]
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
    public cssToken = (theme: INewTheme, token: string) => (property: string) => {
        try {
            const details = theme["editor.tokenColors.hoverTokens"][token]
            if (property === "bold" || property === "italic") {
                return details.fontStyle === property
            }
            return details[property]
        } catch (e) {
            if (property === "foreground") {
                return theme["toolTip.foreground"]
            }
        }
    }
    /**
     * Construct Class name is a function which takes a token
     * and returns another function which takes the theme as an argument
     * with which it creates a css class based on the token name and returns this as a string
     * @returns {fn(theme) => string}
     */
    public constructClassName = (token: string) => (theme: INewTheme) => {
        const notPunctuation = !token.includes("punctuation")
        const tokenAsClass = token.replace(/[.]/g, "-")
        const tokenStyle = this.cssToken(theme, token)
        const cssClass = `
        .${tokenAsClass} {
            color: ${tokenStyle("foreground")};
            ${tokenStyle("italic") ? "font-style: italic" : ""};
            ${tokenStyle("bold") && notPunctuation ? "font-weight: bold" : ""};
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
