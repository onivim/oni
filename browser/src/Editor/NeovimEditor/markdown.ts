// import * as Highlight from "highlight.js"
import * as marked from "marked"

export const convertMarkdown = (markdown: string): { __html: string } => {
    marked.setOptions({
        sanitize: true,
        gfm: true,
        // highlight: (code) => {
        //     return Highlight.highlightAuto(code).value
        // },
    })

    const html = marked(markdown)
    return { __html: html }
}
