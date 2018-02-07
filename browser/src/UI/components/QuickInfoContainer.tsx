import { merge } from "lodash"
import * as React from "react"

import { IThemeColors, ThemeProvider, withTheme } from "./common"
import { QuickInfoContainer, QuickInfoDocumentation, QuickInfoTitle } from "./QuickInfo"

interface IQuickInfoProps {
    theme: IThemeColors
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

const quickInfoTokens = {
    "editor.tokenColors": {
        "meta.import": {
            scope: "meta-import",
            settings: {
                fallback: "Define",
            },
        },
        "storage.type": {
            scope: "storage.type",
            settings: {
                fallback: "Statement",
            },
        },
        "meta.namespace.declaration": {
            scope: "meta.namespace.declaration",
            settings: {
                fallback: "Type",
            },
        },
        "meta.type.annotation": {
            scope: "meta.type.annotation",
            settings: {
                fallback: "Type",
            },
        },
        "meta.type.declaration": {
            scope: "meta.type.declaration",
            settings: {
                fallback: "Keyword",
            },
        },
        "meta.brace.round": {
            scope: "meta.brace.round",
            settings: {
                fallback: "Normal",
            },
        },
        "meta.function.call": {
            scope: "meta.function.call",
            settings: {
                fallback: "Function",
            },
        },
        "variable.other.constant": {
            scope: "variable.other.constant",
            settings: {
                fallback: "Constant",
            },
        },
        "variable.other.object": {
            scope: "variable.other.object",
            settings: {
                fallback: "Identifier",
            },
        },
        "variable.other.readwrite": {
            scope: "variable.other.constant",
            settings: {
                fallback: "PreProc",
            },
        },
        "variable.other.property": {
            scope: "variable.other.property",
            settings: {
                fallback: "Statement",
            },
        },
        "support.class.builtin": {
            scope: "support.class.builtin",
            settings: {
                fallback: "Type",
            },
        },
        "support.type.primitive": {
            scope: "support.class.builtin",
            settings: {
                fallback: "Keyword",
            },
        },
        "meta.object.type": {
            scope: "meta.object.type",
            settings: {
                fallback: "Identifier",
            },
        },
        "meta.class": {
            scope: "meta.class",
            settings: {
                fallback: "Type",
            },
        },
        "variable.object": {
            scope: "variable.object",
            settings: {
                fallback: "Identifier",
            },
        },
        "variable.language": {
            scope: "variable.language",
            settings: {
                fallback: "Identifier",
            },
        },
        "variable.parameter": {
            scope: "variable.parameter",
            settings: {
                fallback: "Identifier",
            },
        },
        "variable.other": {
            scope: "variable.other",
            settings: {
                fallback: "Identifier",
            },
        },
        "support.function": {
            scope: "support.function",
            settings: "Function",
        },
        "entity.name": {
            scope: "entity.name",
            settings: {
                fallback: "Function",
            },
        },
        "entity.other": {
            scope: "entity.other",
            settings: {
                fallback: "Constant",
            },
        },
    },
}

class QuickInfoHoverContainer extends React.Component<IQuickInfoProps> {
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

    public render() {
        const shallowTheme = { ...this.props.theme }
        const preUpdateTheme = merge(shallowTheme, quickInfoTokens)
        const quickInfoTheme = this.updateThemeWithDefaults(preUpdateTheme)
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
            hasTitle && (
                <ThemeProvider theme={quickInfoTheme}>
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
            )
        )
    }
}

export default withTheme(QuickInfoHoverContainer)
