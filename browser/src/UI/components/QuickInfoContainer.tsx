import { merge } from "lodash"
import * as React from "react"

import { IThemeColors, ThemeProvider, withTheme } from "./common"
import { QuickInfoContainer, QuickInfoDocumentation, QuickInfoTitle } from "./QuickInfo"

interface IQuickInfoProps {
    theme: IThemeColors
    titleAndContents: ITitleAndContents
}

interface IToken {
    scope: string[]
    settings: {
        fallback?: string
        foreground?: string
        background?: string
        bold?: boolean
        italic?: boolean
    }
}

interface ITokens {
    [token: string]: IToken
}

interface ITitleAndContents {
    title: {
        __html: string
    }
    description: {
        __html: string
    }
}

const quickInfoTokens: { "editor.tokenColors": ITokens } = {
    "editor.tokenColors": {
        "meta.import": {
            scope: [],
            settings: {
                fallback: "Define",
            },
        },
        "meta.namespace": {
            scope: ["meta.namespace.declaration"],
            settings: {
                fallback: "Type",
            },
        },
        "meta.type": {
            scope: ["meta.type.annotation", "meta.type.declaration"],
            settings: {
                fallback: "Type",
            },
        },
        "meta.brace": {
            scope: ["meta.brace.round"],
            settings: {
                fallback: "Normal",
            },
        },
        "meta.function": {
            scope: ["meta.function.call"],
            settings: {
                fallback: "Function",
            },
        },
        "variable.other": {
            scope: [
                "variable.other.constant",
                "variable.other.object",
                "variable.other.readwrite",
                "variable.other.property",
            ],
            settings: {
                fallback: "Constant",
            },
        },
        "support.class": {
            scope: ["support.class.builtin", "support.type.primitive"],
            settings: {
                fallback: "Type",
            },
        },
        "meta.object": {
            scope: ["meta.object.type"],
            settings: {
                fallback: "Identifier",
            },
        },
        "meta.class": {
            scope: [],
            settings: {
                fallback: "Type",
            },
        },
        "variable.object": {
            scope: [],
            settings: {
                fallback: "Identifier",
            },
        },
        "variable.language": {
            scope: [],
            settings: {
                fallback: "Identifier",
            },
        },
        "variable.parameter": {
            scope: [],
            settings: {
                fallback: "Identifier",
            },
        },
        "support.function": {
            scope: [],
            settings: {
                fallback: "Function",
            },
        },
        "entity.name": {
            scope: [],
            settings: {
                fallback: "Function",
            },
        },
        "entity.other": {
            scope: [],
            settings: {
                fallback: "Constant",
            },
        },
        "keyword.control": {
            scope: ["keyword.control.import"],
            settings: {
                fallback: "Constant",
            },
        },
        "meta.interface": {
            scope: [],
            settings: {
                fallback: "Type",
            },
        },
        "storage.type": {
            scope: ["storage.type.interface"],
            settings: {
                fallback: "Constant",
            },
        },
    },
}

interface IState {
    theme: IThemeColors
}

class QuickInfoHoverContainer extends React.Component<IQuickInfoProps, IState> {
    public state: IState = {
        theme: null,
    }

    public componentWillMount() {
        this.setTheme()
    }

    public setTheme() {
        const shallowTheme = { ...this.props.theme }
        const preUpdateTheme = merge(shallowTheme, quickInfoTokens)
        const quickInfoTheme = this.updateThemeWithDefaults(preUpdateTheme)
        const populatedScopes = this.populateScopes(quickInfoTheme["editor.tokenColors"])
        const composedTheme = { ...quickInfoTheme, ...populatedScopes }
        this.setState({ theme: composedTheme })
    }

    public updateThemeWithDefaults(theme: IThemeColors) {
        const tokenColors = theme["editor.tokenColors"]
        const updatedTheme = Object.keys(tokenColors).reduce((acc, t) => {
            const item = tokenColors[t]
            if (item && item.settings && !item.settings.foreground && item.settings.fallback) {
                acc[t] = {
                    ...item,
                    settings: {
                        ...item.settings,
                        ...tokenColors[item.settings.fallback.toLowerCase()].settings,
                    },
                }
                return acc
            }
            return acc
        }, tokenColors)
        return {
            ...theme,
            "editor.tokenColors": updatedTheme,
        }
    }

    public populateScopes(tokens: ITokens) {
        const scopes = Object.keys(tokens)
        const newScopes = scopes.reduce((result, scopeName) => {
            const parent = tokens[scopeName]
            if (parent && parent.scope && parent.scope[0]) {
                const children = parent.scope.reduce((acc, name) => {
                    if (name) {
                        const newScope = this.createChildFromScopeName(name, parent)
                        const [newScopeName] = newScope.scope
                        acc[newScopeName] = newScope
                    }
                    return acc
                }, {})
                const isEmpty = !Object.keys(children).length
                if (!isEmpty) {
                    const tokensCopy = { ...tokens }
                    merge(result, tokensCopy, children)
                }
            }
            return result
        }, {})
        return { "editor.tokenColors": newScopes }
    }

    public createChildFromScopeName(scopeName: string, parent: IToken) {
        return {
            ...parent,
            scope: [scopeName],
        }
    }

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

        return !!titleAndContents ? (
            <ThemeProvider theme={this.state.theme}>
                <QuickInfoContainer hasDocs={hasDocs}>
                    <QuickInfoTitle
                        padding={hasDocs ? "0.5rem" : null}
                        html={titleAndContents.title}
                    />
                    {titleAndContents.description && (
                        <QuickInfoDocumentation html={titleAndContents.description} />
                    )}
                </QuickInfoContainer>
            </ThemeProvider>
        ) : null
    }
}

export default withTheme(QuickInfoHoverContainer)
