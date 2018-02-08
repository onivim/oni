import * as React from "react"

import { QuickInfoContainer, QuickInfoDocumentation, QuickInfoTitle } from "./QuickInfo"

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

        return !!titleAndContents ? (
            <QuickInfoContainer hasDocs={hasDocs}>
                <QuickInfoTitle padding={hasDocs ? "0.5rem" : null} html={titleAndContents.title} />
                {titleAndContents.description && (
                    <QuickInfoDocumentation html={titleAndContents.description} />
                )}
            </QuickInfoContainer>
        ) : null
    }
}

export default QuickInfoHoverContainer
