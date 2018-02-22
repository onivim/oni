/**
 * StyleWriter.ts
 *
 * Helper to generate text for an inline style element
 */

import * as os from "os"

export class StyleWriter {
    private _style: string = ""

    public get style(): string {
        return this._style
    }

    constructor(private _primaryClassName: string) {}

    public writeFontFace(fontFamily: string, sourceUrl: string, format: string): void {
        // Inspired by:
        // https://stackoverflow.com/questions/11355147/font-face-changing-via-javascript
        const fontFaceBlock = [
            "@font-face {",
            `   font-family: ${fontFamily};`,
            `   src: url('${sourceUrl}') format('${format}');`,
            "}",
        ]

        this._append(fontFaceBlock)

        const primaryClassBlock = [
            ".fa." + this._primaryClassName + " {",
            "font-family: " + fontFamily + ";",
            "}",
        ]

        this._append(primaryClassBlock)
    }

    public writeIcon(iconName: string, fontColor: string, fontCharacter: string): void {
        const iconClass = this._primaryClassName + "-" + iconName
        const selector = ".fa." + this._primaryClassName + "." + iconClass

        if (fontColor) {
            const primaryClassBlock = [selector + " {", "color: " + fontColor + ";", "}"]
            this._append(primaryClassBlock)
        }

        const pseudoElementBlock = [selector + ":before {", `   content: '${fontCharacter}';`, "}"]
        this._append(pseudoElementBlock)
    }

    private _append(str: string[]): void {
        this._style += str.join(os.EOL) + os.EOL
    }
}
