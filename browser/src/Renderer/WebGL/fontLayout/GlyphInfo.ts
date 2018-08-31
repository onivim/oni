import unicode from "unicode-properties"

import GlyphSubstitutor from "./GlyphSubstitutor"
import { Font } from "fontkit"

export default class GlyphInfo {
    features: { [featureTag: string]: boolean } = {}
    ligatureID: number = null
    ligatureComponent: number = null
    isLigated = false
    substituted = false
    isMultiplied = false
    isBase: boolean
    isLigature: boolean
    isMark: boolean
    markAttachmentType: number
    contextGroup: symbol = Symbol("contextGroup")

    constructor(
        private _font: Font,
        private _id: number,
        public codePoints: number[] = [],
        features?: { [featureKey: string]: boolean } | string[],
    ) {
        if (Array.isArray(features)) {
            for (let i = 0; i < features.length; i++) {
                let feature = features[i]
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

        let GDEF = this._font.GDEF
        if (GDEF && GDEF.glyphClassDef) {
            // TODO: clean this up
            let classID = GlyphSubstitutor.getClassID(id, GDEF.glyphClassDef)
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

    copy() {
        return new GlyphInfo(this._font, this.id, this.codePoints, this.features)
    }
}
