import * as marked from "marked"
import { StackElement } from "vscode-textmate"
import { GrammarLoader } from "../../Services/SyntaxHighlighting/GrammarLoader"

interface IGetTokens {
    line: string
    prevState: StackElement
    language: string
    ext: string
}
async function getTokens({ language, ext, line, prevState }: IGetTokens) {
    const Grammer = new GrammarLoader()
    const grammer = await Grammer.getGrammarForLanguage(language, ext)
    grammer.tokenizeLine(line, prevState)
}

export const convertMarkdown = (markdown: string): { __html: string } => {
    marked.setOptions({
        sanitize: true,
        gfm: true,
    })

    const html = marked(markdown)
    return { __html: html }
}
