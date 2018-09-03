import unicode from "unicode-properties"

import { Font } from "fontkit"
import { GlyphSubstitutor } from "./GlyphSubstitutor"

export class GlyphInfo {
    public features: { [featureTag: string]: boolean } = {}
    public ligatureID: number = null
    public ligatureComponent: number = null
    public isLigated = false
    public substituted = false
    public isMultiplied = false
    public isBase: boolean
    public isLigature: boolean
    public isMark: boolean
    public markAttachmentType: number
    public contextGroup: symbol = Symbol("contextGroup")

    constructor(
        private _font: Font,
        private _id: number,
        public codePoints: number[] = [],
        features?: { [featureKey: string]: boolean } | string[],
    ) {
        if (Array.isArray(features)) {
            for (const feature of features) {
                this.features[feature] = true
            }
        } else if (typeof features === "object") {
            Object.assign(this.features, features)
        }
    }

    get id() {
        return this._id
    }

    set id(id) {
        this._id = id
        this.substituted = true

        const GDEF = this._font.GDEF
        if (GDEF && GDEF.glyphClassDef) {
            // TODO: clean this up
            const classID = GlyphSubstitutor.getClassID(id, GDEF.glyphClassDef)
            this.isBase = classID === 1
            this.isLigature = classID === 2
            this.isMark = classID === 3
            this.markAttachmentType = GDEF.markAttachClassDef
                ? GlyphSubstitutor.getClassID(id, GDEF.markAttachClassDef)
                : 0
        } else {
            this.isMark = this.codePoints.length > 0 && this.codePoints.every(unicode.isMark)
            this.isBase = !this.isMark
            this.isLigature = this.codePoints.length > 1
            this.markAttachmentType = 0
        }
    }
}
