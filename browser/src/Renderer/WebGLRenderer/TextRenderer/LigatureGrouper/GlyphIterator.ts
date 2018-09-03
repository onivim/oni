import { GlyphInfo } from "./GlyphInfo"

export interface IGlyphIteratorOptions {
    flags?: IGlyphIteratorFlags
    markAttachmentType?: number
}

export interface IGlyphIteratorFlags {
    ignoreMarks?: boolean
    ignoreBaseGlyphs?: boolean
    ignoreLigatures?: boolean
}

export class GlyphIterator {
    public index = 0

    private _markAttachmentType = 0
    private _flags: IGlyphIteratorFlags = {}

    constructor(private _glyphs: GlyphInfo[]) {
        this.reset()
    }

    public reset(options: IGlyphIteratorOptions = {}, index = 0) {
        this._flags = options.flags || {}
        this._markAttachmentType = options.markAttachmentType || 0
        this.index = index
    }

    get cur() {
        return this._glyphs[this.index] || null
    }

    public move(dir: number) {
        this.index += dir
        while (
            0 <= this.index &&
            this.index < this._glyphs.length &&
            this._shouldIgnore(this._glyphs[this.index])
        ) {
            this.index += dir
        }

        if (0 > this.index || this.index >= this._glyphs.length) {
            return null
        }

        return this._glyphs[this.index]
    }

    public next() {
        return this.move(+1)
    }

    public prev() {
        return this.move(-1)
    }

    public increment(count = 1) {
        const dir = count < 0 ? -1 : 1
        count = Math.abs(count)
        while (count--) {
            this.move(dir)
        }

        return this._glyphs[this.index]
    }

    private _shouldIgnore(glyph: GlyphInfo) {
        return (
            (this._flags.ignoreMarks && glyph.isMark) ||
            (this._flags.ignoreBaseGlyphs && glyph.isBase) ||
            (this._flags.ignoreLigatures && glyph.isLigature) ||
            (this._markAttachmentType &&
                glyph.isMark &&
                glyph.markAttachmentType !== this._markAttachmentType)
        )
    }
}
