import GlyphIterator from "./GlyphIterator"
import {
    Font,
    GSUBTable,
    ScriptTable,
    LangSysTable,
    TextDirection,
    ConditionTable,
    FeatureTable,
    Lookup,
    ClassDefinitionTable,
    GSUBLookupTable,
    GSUBLookupTableType1,
    CoverageTable,
    GSUBLookupTableType2,
    GSUBLookupTableType3,
    GSUBLookupTableType4,
    GSUBLookupTableType5,
    GSUBLookupTableType6,
    GSUBLookupTableType7,
    LookupRecord,
} from "fontkit"
import GlyphInfo from "./GlyphInfo"

const DEFAULT_SCRIPTS = ["DFLT", "dflt", "latn"]

export default class GlyphSubstitutor {
    private _script: ScriptTable = null
    private _scriptTag: string = null
    private _language: LangSysTable = null
    private _languageTag: string = null
    private _features: { [featureTag: string]: FeatureTable } = {}
    private _variationsIndex = this._font._variationProcessor
        ? this.findVariationsIndex(this._font._variationProcessor.normalizedCoords)
        : -1
    private _glyphs: GlyphInfo[] = []
    private _ligatureID: number = 1
    private _currentFeature: string = null
    private _direction: TextDirection
    private _glyphIterator: GlyphIterator

    constructor(private _font: Font, private _table: GSUBTable) {
        // Setup variation substitutions
        // initialize to default script + language
        this.selectScript()
    }

    private _findScript(script: string | string[]) {
        if (this._table.scriptList == null) {
            return null
        }

        if (!Array.isArray(script)) {
            script = [script]
        }

        for (let s of script) {
            for (let entry of this._table.scriptList) {
                if (entry.tag === s) {
                    return entry
                }
            }
        }

        return null
    }

    selectScript(script?: string, language?: string, direction?: TextDirection) {
        let changed = false
        let entry
        if (!this._script || script !== this._scriptTag) {
            entry = this._findScript(script)
            if (!entry) {
                entry = this._findScript(DEFAULT_SCRIPTS)
            }

            if (!entry) {
                return this._scriptTag
            }

            this._scriptTag = entry.tag
            this._script = entry.script
            this._language = null
            this._languageTag = null
            changed = true
        }

        if (!direction || direction !== this._direction) {
            this._direction = direction || "ltr"
        }

        if (language && language.length < 4) {
            language += " ".repeat(4 - language.length)
        }

        if (!language || language !== this._languageTag) {
            this._language = null

            for (let lang of this._script.langSysRecords) {
                if (lang.tag === language) {
                    this._language = lang.langSys
                    this._languageTag = lang.tag
                    break
                }
            }

            if (!this._language) {
                this._language = this._script.defaultLangSys
                this._languageTag = null
            }

            changed = true
        }

        // Build a feature lookup table
        if (changed) {
            this._features = {}
            if (this._language) {
                for (let featureIndex of this._language.featureIndexes) {
                    let record = this._table.featureList[featureIndex]
                    let substituteFeature = this.substituteFeatureForVariations(featureIndex)
                    this._features[record.tag] = substituteFeature || record.feature
                }
            }
        }

        return this._scriptTag
    }

    lookupsForFeatures(userFeatures: string[] = [], exclude?: number[]) {
        let lookups: Lookup[] = []
        for (let tag of userFeatures) {
            let feature = this._features[tag]
            if (!feature) {
                continue
            }

            for (let lookupIndex of feature.lookupListIndexes) {
                if (exclude && exclude.indexOf(lookupIndex) !== -1) {
                    continue
                }

                lookups.push({
                    feature: tag,
                    index: lookupIndex,
                    lookup: this._table.lookupList.get(lookupIndex),
                })
            }
        }

        lookups.sort((a, b) => a.index - b.index)
        return lookups
    }

    substituteFeatureForVariations(featureIndex: number) {
        if (this._variationsIndex === -1) {
            return null
        }

        let record = this._table.featureVariations.featureVariationRecords[this._variationsIndex]
        let substitutions = record.featureTableSubstitution.substitutions
        for (let substitution of substitutions) {
            if (substitution.featureIndex === featureIndex) {
                return substitution.alternateFeatureTable
            }
        }

        return null
    }

    findVariationsIndex(coords: number[]) {
        let variations = this._table.featureVariations
        if (!variations) {
            return -1
        }

        let records = variations.featureVariationRecords
        for (let i = 0; i < records.length; i++) {
            let conditions = records[i].conditionSet.conditionTable
            if (this.variationConditionsMatch(conditions, coords)) {
                return i
            }
        }

        return -1
    }

    variationConditionsMatch(conditions: ConditionTable[], coords: number[]) {
        return conditions.every((condition: ConditionTable) => {
            let coord = condition.axisIndex < coords.length ? coords[condition.axisIndex] : 0
            return condition.filterRangeMinValue <= coord && coord <= condition.filterRangeMaxValue
        })
    }

    applyFeatures(userFeatures: string[], glyphs: GlyphInfo[]) {
        let lookups = this.lookupsForFeatures(userFeatures)
        this.applyLookups(lookups, glyphs)
    }

    applyLookups(lookups: Lookup[], glyphs: GlyphInfo[]) {
        this._glyphs = glyphs
        this._glyphIterator = new GlyphIterator(glyphs)

        for (let { feature, lookup } of lookups) {
            this._currentFeature = feature
            this._glyphIterator.reset(lookup.flags)

            while (this._glyphIterator.index < glyphs.length) {
                if (!(feature in this._glyphIterator.cur.features)) {
                    this._glyphIterator.next()
                    continue
                }

                for (let table of lookup.subTables) {
                    let res = this.applyLookup(lookup.lookupType, table)
                    if (res) {
                        break
                    }
                }

                this._glyphIterator.next()
            }
        }
    }

    applyLookup(lookupType: number, table: GSUBLookupTable): boolean {
        switch (lookupType) {
            case 1: {
                // Single Substitution
                const type1Table = table as GSUBLookupTableType1
                let index = this.coverageIndex(type1Table.coverage)
                if (index === -1) {
                    return false
                }

                let glyph = this._glyphIterator.cur
                switch (type1Table.version) {
                    case 1:
                        glyph.id = (glyph.id + type1Table.deltaGlyphID) & 0xffff
                        break

                    case 2:
                        glyph.id = type1Table.substitute.get(index)
                        break
                }

                return true
            }

            case 2: {
                // Multiple Substitution
                const type2Table = table as GSUBLookupTableType2
                let index = this.coverageIndex(type2Table.coverage)
                if (index !== -1) {
                    let sequence = type2Table.sequences.get(index)
                    this._glyphIterator.cur.id = sequence[0]
                    this._glyphIterator.cur.ligatureComponent = 0

                    let features = this._glyphIterator.cur.features
                    let curGlyph = this._glyphIterator.cur
                    let replacement = sequence.slice(1).map((gid: number, i: number) => {
                        let glyph = new GlyphInfo(this._font, gid, undefined, features)
                        glyph.contextGroup = curGlyph.contextGroup
                        glyph.isLigated = curGlyph.isLigated
                        glyph.ligatureComponent = i + 1
                        glyph.substituted = true
                        glyph.isMultiplied = true
                        return glyph
                    })

                    this._glyphs.splice(this._glyphIterator.index + 1, 0, ...replacement)
                    return true
                }

                return false
            }

            case 3: {
                // Alternate Substitution
                const type3Table = table as GSUBLookupTableType3
                let index = this.coverageIndex(type3Table.coverage)
                if (index !== -1) {
                    let USER_INDEX = 0 // TODO
                    this._glyphIterator.cur.id = type3Table.alternateSet.get(index)[USER_INDEX]
                    return true
                }

                return false
            }

            case 4: {
                // Ligature Substitution
                const type4Table = table as GSUBLookupTableType4
                let index = this.coverageIndex(type4Table.coverage)
                if (index === -1) {
                    return false
                }

                for (let ligature of type4Table.ligatureSets.get(index)) {
                    let matched = this.sequenceMatchIndices(1, ligature.components) as number[]
                    if (!matched) {
                        continue
                    }

                    let curGlyph = this._glyphIterator.cur

                    // Concatenate all of the characters the new ligature will represent
                    let characters = curGlyph.codePoints.slice()
                    for (let index of matched) {
                        characters.push(...this._glyphs[index].codePoints)
                    }

                    // Create the replacement ligature glyph
                    let ligatureGlyph = new GlyphInfo(
                        this._font,
                        ligature.glyph,
                        characters,
                        curGlyph.features,
                    )
                    ligatureGlyph.contextGroup = curGlyph.contextGroup
                    ligatureGlyph.isLigated = true
                    ligatureGlyph.substituted = true

                    // From Harfbuzz:
                    // - If it *is* a mark ligature, we don't allocate a new ligature id, and leave
                    //   the ligature to keep its old ligature id.  This will allow it to attach to
                    //   a base ligature in GPOS.  Eg. if the sequence is: LAM,LAM,SHADDA,FATHA,HEH,
                    //   and LAM,LAM,HEH for a ligature, they will leave SHADDA and FATHA with a
                    //   ligature id and component value of 2.  Then if SHADDA,FATHA form a ligature
                    //   later, we don't want them to lose their ligature id/component, otherwise
                    //   GPOS will fail to correctly position the mark ligature on top of the
                    //   LAM,LAM,HEH ligature. See https://bugzilla.gnome.org/show_bug.cgi?id=676343
                    //
                    // - If a ligature is formed of components that some of which are also ligatures
                    //   themselves, and those ligature components had marks attached to *their*
                    //   components, we have to attach the marks to the new ligature component
                    //   positions!  Now *that*'s tricky!  And these marks may be following the
                    //   last component of the whole sequence, so we should loop forward looking
                    //   for them and update them.
                    //
                    //   Eg. the sequence is LAM,LAM,SHADDA,FATHA,HEH, and the font first forms a
                    //   'calt' ligature of LAM,HEH, leaving the SHADDA and FATHA with a ligature
                    //   id and component == 1.  Now, during 'liga', the LAM and the LAM-HEH ligature
                    //   form a LAM-LAM-HEH ligature.  We need to reassign the SHADDA and FATHA to
                    //   the new ligature with a component value of 2.
                    //
                    //   This in fact happened to a font...  See https://bugzilla.gnome.org/show_bug.cgi?id=437633
                    let isMarkLigature = curGlyph.isMark
                    for (let i = 0; i < matched.length && isMarkLigature; i++) {
                        isMarkLigature = this._glyphs[matched[i]].isMark
                    }

                    ligatureGlyph.ligatureID = isMarkLigature ? null : this._ligatureID++

                    let lastLigID = curGlyph.ligatureID
                    let lastNumComps = curGlyph.codePoints.length
                    let curComps = lastNumComps
                    let idx = this._glyphIterator.index + 1

                    // Set ligatureID and ligatureComponent on glyphs that were skipped in the matched sequence.
                    // This allows GPOS to attach marks to the correct ligature components.
                    for (let matchIndex of matched) {
                        // Don't assign new ligature components for mark ligatures (see above)
                        if (isMarkLigature) {
                            idx = matchIndex
                        } else {
                            while (idx < matchIndex) {
                                var ligatureComponent =
                                    curComps -
                                    lastNumComps +
                                    Math.min(this._glyphs[idx].ligatureComponent || 1, lastNumComps)
                                this._glyphs[idx].ligatureID = ligatureGlyph.ligatureID
                                this._glyphs[idx].ligatureComponent = ligatureComponent
                                idx++
                            }
                        }

                        lastLigID = this._glyphs[idx].ligatureID
                        lastNumComps = this._glyphs[idx].codePoints.length
                        curComps += lastNumComps
                        idx++ // skip base glyph
                    }

                    // Adjust ligature components for any marks following
                    if (lastLigID && !isMarkLigature) {
                        for (let i = idx; i < this._glyphs.length; i++) {
                            if (this._glyphs[i].ligatureID === lastLigID) {
                                var ligatureComponent =
                                    curComps -
                                    lastNumComps +
                                    Math.min(this._glyphs[i].ligatureComponent || 1, lastNumComps)
                                this._glyphs[i].ligatureComponent = ligatureComponent
                            } else {
                                break
                            }
                        }
                    }

                    // Delete the matched glyphs, and replace the current glyph with the ligature glyph
                    for (let i = matched.length - 1; i >= 0; i--) {
                        this._glyphs.splice(matched[i], 1)
                    }

                    this._glyphs[this._glyphIterator.index] = ligatureGlyph
                    return true
                }

                return false
            }

            case 5: // Contextual Substitution
                return this.applyContext(table as GSUBLookupTableType5)

            case 6: // Chaining Contextual Substitution
                return this.applyChainingContext(table as GSUBLookupTableType6)

            case 7: // Extension Substitution
                const type7Table = table as GSUBLookupTableType7
                return this.applyLookup(type7Table.lookupType, type7Table.extension)

            default:
                throw new Error(`GSUB lookupType ${lookupType} is not supported`)
        }
    }

    applyLookupList(lookupRecords: LookupRecord[]) {
        let glyphIndex = this._glyphIterator.index

        for (let lookupRecord of lookupRecords) {
            // Reset flags and find glyph index for this lookup record
            this._glyphIterator.reset(null, glyphIndex)
            this._glyphIterator.increment(lookupRecord.sequenceIndex)

            // Get the lookup and setup flags for subtables
            let lookup = this._table.lookupList.get(lookupRecord.lookupListIndex)
            this._glyphIterator.reset(lookup.flags, this._glyphIterator.index)

            // Apply lookup subtables until one matches
            for (let table of lookup.subTables) {
                if (this.applyLookup(lookup.lookupType, table)) {
                    break
                }
            }
        }

        this._glyphIterator.reset(null, glyphIndex)
        return true
    }

    coverageIndex(coverage: CoverageTable, glyphId?: number) {
        if (glyphId == null) {
            glyphId = this._glyphIterator.cur.id
        }

        switch (coverage.version) {
            case 1:
                return coverage.glyphs.indexOf(glyphId)

            case 2:
                for (let range of coverage.rangeRecords) {
                    if (range.start <= glyphId && glyphId <= range.end) {
                        return range.startCoverageIndex + glyphId - range.start
                    }
                }

                break
        }

        return -1
    }

    match<T>(
        sequenceIndex: number,
        sequence: T[],
        fn: (component: T, glyph: GlyphInfo) => boolean,
        matched?: number[],
    ) {
        let pos = this._glyphIterator.index
        let glyph = this._glyphIterator.increment(sequenceIndex)
        let idx = 0

        while (idx < sequence.length && glyph && fn(sequence[idx], glyph)) {
            if (matched) {
                matched.push(this._glyphIterator.index)
            }

            idx++
            glyph = this._glyphIterator.next()
        }

        this._glyphIterator.index = pos
        if (idx < sequence.length) {
            return false
        }

        return matched || true
    }

    sequenceMatches(sequenceIndex: number, sequence: number[]) {
        return this.match(sequenceIndex, sequence, (component, glyph) => component === glyph.id)
    }

    sequenceMatchIndices(sequenceIndex: number, sequence: number[]) {
        return this.match(
            sequenceIndex,
            sequence,
            (component, glyph) => {
                // If the current feature doesn't apply to this glyph,
                if (!(this._currentFeature in glyph.features)) {
                    return false
                }

                return component === glyph.id
            },
            [],
        )
    }

    coverageSequenceMatches(sequenceIndex: number, sequence: CoverageTable[]) {
        return this.match(
            sequenceIndex,
            sequence,
            (coverage, glyph) => this.coverageIndex(coverage, glyph.id) >= 0,
        )
    }

    static getClassID(glyphId: number, classDef: ClassDefinitionTable) {
        switch (classDef.version) {
            case 1: // Class array
                let i = glyphId - classDef.startGlyph
                if (i >= 0 && i < classDef.classValueArray.length) {
                    return classDef.classValueArray[i]
                }

                break

            case 2:
                for (let range of classDef.classRangeRecord) {
                    if (range.start <= glyphId && glyphId <= range.end) {
                        return range.class
                    }
                }

                break
        }

        return 0
    }

    classSequenceMatches(
        sequenceIndex: number,
        sequence: number[],
        classDef: ClassDefinitionTable,
    ) {
        return this.match(
            sequenceIndex,
            sequence,
            (classID, glyph) => classID === GlyphSubstitutor.getClassID(glyph.id, classDef),
        )
    }

    updateContextGroupsInSequence(startOffset: number, contextGroupLength: number) {
        const pos = this._glyphIterator.index

        this._glyphIterator.move(startOffset)
        const contextGroupToLinkTo = this._glyphIterator.cur.contextGroup
        const contextGroupEndIndex = pos + contextGroupLength
        this._glyphIterator.next()

        while (this._glyphIterator.index < contextGroupEndIndex) {
            const glyphToUpdate = this._glyphIterator.cur
            glyphToUpdate.contextGroup = contextGroupToLinkTo
            this._glyphIterator.next()
        }

        this._glyphIterator.index = pos
    }

    applyContext(table: GSUBLookupTableType5) {
        switch (table.version) {
            case 1:
                let index = this.coverageIndex(table.coverage)
                if (index === -1) {
                    return false
                }

                const ruleSet = table.ruleSets[index]
                for (let rule of ruleSet) {
                    if (this.sequenceMatches(1, rule.input)) {
                        // CUSTOM INSERTION
                        this.updateContextGroupsInSequence(-1, rule.input.length + 1)
                        // CUSTOM INSERTION
                        return this.applyLookupList(rule.lookupRecords)
                    }
                }

                break

            case 2:
                if (this.coverageIndex(table.coverage) === -1) {
                    return false
                }

                index = GlyphSubstitutor.getClassID(this._glyphIterator.cur.id, table.classDef)
                if (index === -1) {
                    return false
                }

                const classSet = table.classSet[index]
                for (let rule of classSet) {
                    if (this.classSequenceMatches(1, rule.classes, table.classDef)) {
                        // CUSTOM INSERTION
                        this.updateContextGroupsInSequence(-1, rule.classes.length + 1)
                        // CUSTOM INSERTION
                        return this.applyLookupList(rule.lookupRecords)
                    }
                }

                break

            case 3:
                if (this.coverageSequenceMatches(0, table.coverages)) {
                    // CUSTOM INSERTION
                    this.updateContextGroupsInSequence(0, table.coverages.length)
                    // CUSTOM INSERTION
                    return this.applyLookupList(table.lookupRecords)
                }

                break
        }

        return false
    }

    applyChainingContext(table: GSUBLookupTableType6) {
        switch (table.version) {
            case 1:
                let index = this.coverageIndex(table.coverage)
                if (index === -1) {
                    return false
                }

                let set = table.chainRuleSets[index]
                for (let rule of set) {
                    if (
                        this.sequenceMatches(-rule.backtrack.length, rule.backtrack) &&
                        this.sequenceMatches(1, rule.input) &&
                        this.sequenceMatches(1 + rule.input.length, rule.lookahead)
                    ) {
                        // CUSTOM INSERTION
                        this.updateContextGroupsInSequence(
                            -rule.backtrack.length,
                            rule.input.length + rule.lookahead.length,
                        )
                        // CUSTOM INSERTION
                        return this.applyLookupList(rule.lookupRecords)
                    }
                }

                break

            case 2:
                if (this.coverageIndex(table.coverage) === -1) {
                    return false
                }

                index = GlyphSubstitutor.getClassID(this._glyphIterator.cur.id, table.inputClassDef)
                let rules = table.chainClassSet[index]
                if (!rules) {
                    return false
                }

                for (let rule of rules) {
                    if (
                        this.classSequenceMatches(
                            -rule.backtrack.length,
                            rule.backtrack,
                            table.backtrackClassDef,
                        ) &&
                        this.classSequenceMatches(1, rule.input, table.inputClassDef) &&
                        this.classSequenceMatches(
                            1 + rule.input.length,
                            rule.lookahead,
                            table.lookaheadClassDef,
                        )
                    ) {
                        // CUSTOM INSERTION
                        this.updateContextGroupsInSequence(
                            -rule.backtrack.length,
                            rule.input.length + rule.lookahead.length,
                        )
                        // CUSTOM INSERTION
                        return this.applyLookupList(rule.lookupRecords)
                    }
                }

                break

            case 3:
                if (
                    this.coverageSequenceMatches(
                        -table.backtrackGlyphCount,
                        table.backtrackCoverage,
                    ) &&
                    this.coverageSequenceMatches(0, table.inputCoverage) &&
                    this.coverageSequenceMatches(table.inputGlyphCount, table.lookaheadCoverage)
                ) {
                    // CUSTOM INSERTION
                    this.updateContextGroupsInSequence(
                        -table.backtrackGlyphCount,
                        table.inputGlyphCount + table.lookaheadCoverage.length,
                    )
                    // CUSTOM INSERTION
                    return this.applyLookupList(table.lookupRecords)
                }

                break
        }

        return false
    }
}
