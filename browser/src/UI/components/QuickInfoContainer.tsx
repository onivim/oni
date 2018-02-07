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
            settings: "Define",
        },
        "storage.type": {
            scope: "storage.type",
            settings: "Statement",
        },
        "meta.namespace.declaration": {
            scope: "meta.namespace.declaration",
            settings: "Type",
        },
        "meta.type.annotation": {
            scope: "meta.type.annotation",
            settings: "Type",
        },
        "meta.type.declaration": {
            scope: "meta.type.declaration",
            settings: "Keyword",
        },
        "meta.brace.round": {
            scope: "meta.brace.round",
            settings: "Normal",
        },
        "meta.function.call": {
            scope: "meta.function.call",
            settings: "Function",
        },
        "variable.other.constant": {
            scope: "variable.other.constant",
            settings: "Constant",
        },
        "variable.other.object": {
            scope: "variable.other.object",
            settings: "Identifier",
        },
        "variable.other.readwrite": {
            scope: "variable.other.constant",
            settings: "PreProc",
        },
        "variable.other.property": {
            scope: "variable.other.property",
            settings: "Statement",
        },
        "support.class.builtin": {
            scope: "support.class.builtin",
            settings: "Type",
        },
        "support.type.primitive": {
            scope: "support.class.builtin",
            settings: "Keyword",
        },
        "meta.object.type": {
            scope: "meta.object.type",
            settings: "Identifier",
        },
        "meta.class": {
            scope: "meta.class",
            settings: "Type",
        },
        "variable.object": {
            scope: "variable.object",
            settings: "Identifier",
        },
        "variable.language": {
            scope: "variable.language",
            settings: "Identifier",
        },
        "variable.parameter": {
            scope: "variable.parameter",
            settings: "Identifier",
        },
        "variable.other": {
            scope: "variable.other",
            settings: "Identifier",
        },
        "support.function": {
            scope: "support.function",
            settings: "Function",
        },
        "entity.name": {
            scope: "entity.name",
            settings: "Function",
        },
        "entity.other": {
            scope: "entity.other",
            settings: "Constant",
        },
    },
}

class QuickInfoHoverContainer extends React.Component<IQuickInfoProps> {
    public updateThemeWithDefaults(theme: IThemeColors) {
        const tokenColors = theme["editor.tokenColors"]
        const updatedTheme = Object.keys(tokenColors).reduce((acc, t) => {
            const item = tokenColors[t]
            if (item && !item.color && item.settings) {
                acc[t] = {
                    ...item,
                    color: tokenColors[item.settings.toLowerCase()].color,
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
