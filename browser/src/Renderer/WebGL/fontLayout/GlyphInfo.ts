import unicode from "unicode-properties"

import OTProcessor from "./OTProcessor"

export default class GlyphInfo {
    codePoints: number[]
    features: {}
    ligatureID: number
    ligatureComponent: any
    isLigated: boolean
    cursiveAttachment: any
    markAttachment: any
    shaperInfo: any
    substituted: boolean
    isMultiplied: boolean
    isBase: boolean
    isLigature: boolean
    isMark: boolean
    markAttachmentType: any
    contextGroup: symbol

    private _font: any
    private _id: any

    constructor(font: any, id: any, codePoints: any[] = [], features?: any) {
        this._font = font // TODO this could be removed
        this.codePoints = codePoints
        this.id = id
        this.contextGroup = Symbol("contextGroup")

        this.features = {}
        if (Array.isArray(features)) {
            for (let i = 0; i < features.length; i++) {
                let feature = features[i]
                this.features[feature] = true
            }
        } else if (typeof features === "object") {
            Object.assign(this.features, features)
        }

        this.ligatureID = null
        this.ligatureComponent = null
        this.isLigated = false
        this.cursiveAttachment = null
        this.markAttachment = null
        this.shaperInfo = null
        this.substituted = false
        this.isMultiplied = false
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
            let classID = OTProcessor.prototype.getClassID(id, GDEF.glyphClassDef)
            this.isBase = classID === 1
            this.isLigature = classID === 2
            this.isMark = classID === 3
            this.markAttachmentType = GDEF.markAttachClassDef
                ? OTProcessor.prototype.getClassID(id, GDEF.markAttachClassDef)
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
