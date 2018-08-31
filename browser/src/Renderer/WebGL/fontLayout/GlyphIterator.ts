import GlyphInfo from "./GlyphInfo"

export interface GlyphIteratorOptions {
    flags?: GlyphIteratorFlags
    markAttachmentType?: number
}

export interface GlyphIteratorFlags {
    ignoreMarks?: boolean
    ignoreBaseGlyphs?: boolean
    ignoreLigatures?: boolean
}

export default class GlyphIterator {
    index = 0

    private _markAttachmentType = 0
    private _flags: GlyphIteratorFlags = {}

    constructor(private _glyphs: GlyphInfo[]) {
        this.reset()
    }

    reset(options: GlyphIteratorOptions = {}, index = 0) {
        this._flags = options.flags || {}
        this._markAttachmentType = options.markAttachmentType || 0
        this.index = index
    }

    get cur() {
        return this._glyphs[this.index] || null
    }

    shouldIgnore(glyph: GlyphInfo) {
        return (
            (this._flags.ignoreMarks && glyph.isMark) ||
            (this._flags.ignoreBaseGlyphs && glyph.isBase) ||
            (this._flags.ignoreLigatures && glyph.isLigature) ||
            (this._markAttachmentType &&
                glyph.isMark &&
                glyph.markAttachmentType !== this._markAttachmentType)
        )
    }

    move(dir: number) {
        this.index += dir
        while (
            0 <= this.index &&
            this.index < this._glyphs.length &&
            this.shouldIgnore(this._glyphs[this.index])
        ) {
            this.index += dir
        }

        if (0 > this.index || this.index >= this._glyphs.length) {
            return null
        }

        return this._glyphs[this.index]
    }

    next() {
        return this.move(+1)
    }

    prev() {
        return this.move(-1)
    }

    peek(count = 1) {
        let idx = this.index
        let res = this.increment(count)
        this.index = idx
        return res
    }

    peekIndex(count = 1) {
        let idx = this.index
        this.increment(count)
        let res = this.index
        this.index = idx
        return res
    }

    increment(count = 1) {
        let dir = count < 0 ? -1 : 1
        count = Math.abs(count)
        while (count--) {
            this.move(dir)
        }

        return this._glyphs[this.index]
    }
}
