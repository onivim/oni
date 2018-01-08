import * as marked from "marked"

export const convertMarkdown = (markdown: string): { __html: string } => {
    marked.setOptions({
        sanitize: true,
        gfm: true,
    })

    const html = marked(markdown)
    return { __html: html }
}
