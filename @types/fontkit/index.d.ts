interface GlyphVariationProcessor {
    normalizedCoords: number[]
}

interface LazyArray<T> {
    get(index: number): T
}

declare module "fontkit" {
    declare const fontkit: Fontkit

    export interface Font {
        postscriptName: string
        fullName?: string
        familyName?: string
        subfamilyName?: string
        copyright?: string
        version?: string
        availableFeatures: string[]
        GDEF: GDEFTable
        GSUB: GSUBTable
        glyphsForString(text: string): Glyph[]
        layout(
            text: string,
            features: string[] = [],
            script?: string,
            language?: string,
            direction?: TextDirection,
        ): GlyphRun
        _variationProcessor: GlyphVariationProcessor
    }

    // Types for irrelevant information are left out for now

    export type TextDirection = "" | "ltr" | "rtl"

    export interface Glyph {
        id: number
        codePoints: number[]
        advanceWidth: number
    }
    // Types for irrelevant information are left out for now

    export interface GlyphRun {
        glyphs: Glyph[]
    }
    // Types for irrelevant information are left out for now

    export interface GDEFTable {
        glyphClassDef: ClassDefinitionTable
        markAttachClassDef: ClassDefinitionTable
        // Types for irrelevant information are left out for now
        attachmentList: any
        ligatureCaretList: any
        markGlyphSetsTable: any
        itemVariationStore: any
    }

    export type ClassDefinitionTable = ClassDefinitionTableVersion1 | ClassDefinitionTableVersion2

    interface ClassDefinitionTableVersion1 {
        version: 1
        startGlyph: number
        glyphCount: number
        classValueArray: number[]
    }

    interface ClassDefinitionTableVersion2 {
        version: 2
        classRangeCount: number
        classRangeRecord: ClassRangeRecord[]
    }

    interface ClassRangeRecord {
        start: number
        end: number
        class: number
    }

    export interface GSUBTable {
        scriptList: ScriptRecord[]
        featureList: FeatureRecord[]
        lookupList: LazyArray<LookupTable>
        featureVariations: FeatureVariationsTable
    }

    interface ScriptRecord {
        tag: string
        script: ScriptTable
    }

    export interface ScriptTable {
        defaultLangSys: LangSysTable
        langSysRecords: LangSysRecord[]
    }

    interface LangSysRecord {
        tag: string
        langSys: LangSysTable
    }

    export interface LangSysTable {
        featureIndexes: number[]
    }

    interface FeatureRecord {
        tag: string
        feature: FeatureTable
    }

    export interface FeatureTable {
        lookupListIndexes: number[]
    }

    interface FeatureVariationsTable {
        featureVariationRecords: FeatureVariationRecord[]
    }

    interface FeatureVariationRecord {
        conditionSet: ConditionSetTable
        featureTableSubstitution: FeatureTableSubstitutionTable
    }

    interface ConditionSetTable {
        conditionTable: ConditionTable[]
    }

    export interface ConditionTable {
        axisIndex: number
        filterRangeMinValue: number
        filterRangeMaxValue: number
    }

    interface FeatureTableSubstitutionTable {
        substitutions: FeatureTableSubstitutionRecord[]
    }

    interface FeatureTableSubstitutionRecord {
        featureIndex: number
        alternateFeatureTable: FeatureTable
    }

    export interface Lookup {
        feature: string
        index: number
        lookup: LookupTable
    }

    export interface LookupRecord {
        sequenceIndex: number
        lookupListIndex: number
    }

    export interface LookupTable {
        lookupType: number
        flags: LookupTableFlags
        subTableCount: number
        subTables: GSUBLookupTable[]
        markFilteringSet?: number
    }

    interface LookupTableFlags {
        markAttachmentType: number
        flags: {
            rightToLeft: boolean
            ignoreBaseGlyphs: boolean
            ignoreLigatures: boolean
            ignoreMarks: boolean
            useMarkFilteringSet: boolean
        }
    }

    export type GSUBLookupTable =
        | GSUBLookupTableType1
        | GSUBLookupTableType2
        | GSUBLookupTableType3
        | GSUBLookupTableType4
        | GSUBLookupTableType5
        | GSUBLookupTableType6
        | GSUBLookupTableType7
        | GSUBLookupTableType8

    export type GSUBLookupTableType1 = GSUBLookupTableType1Version1 | GSUBLookupTableType1Version2

    export interface GSUBLookupTableType1Version1 {
        version: 1
        coverage: CoverageTable
        deltaGlyphID: number
    }

    export interface GSUBLookupTableType1Version2 {
        version: 2
        coverage: CoverageTable
        glyphCount: number
        substitute: LazyArray<number>
    }

    export interface GSUBLookupTableType2 {
        substFormat: number
        coverage: CoverageTable
        count: number
        sequences: LazyArray<number[]>
    }

    export interface GSUBLookupTableType3 {
        substFormat: number
        coverage: CoverageTable
        count: number
        alternateSet: LazyArray<number[]>
    }

    export interface GSUBLookupTableType4 {
        substFormat: number
        coverage: CoverageTable
        count: number
        ligatureSets: LazyArray<Ligature[]>
    }

    interface Ligature {
        glyph: number
        compCount: number
        components: number[]
    }

    export type GSUBLookupTableType5 =
        | ContextSubstitutionTableVersion1
        | ContextSubstitutionTableVersion2
        | ContextSubstitutionTableVersion3

    interface ContextSubstitutionTableVersion1 {
        version: 1
        coverage: CoverageTable
        ruleSetCount: number
        ruleSets: Rule[][]
    }

    interface Rule {
        glyphCount: number
        lookupCount: number
        input: number[]
        lookupRecords: LookupRecord[]
    }

    interface ContextSubstitutionTableVersion2 {
        version: 2
        coverage: CoverageTable
        classDef: ClassDefinitionTable
        classSetCnt: number
        classSet: ClassRule[][]
    }

    interface ClassRule {
        glyphCount: number
        lookupCount: number
        classes: number[]
        lookupRecords: LookupRecord[]
    }

    interface ContextSubstitutionTableVersion3 {
        version: 3
        glyphCount: number
        lookupCount: number
        coverages: CoverageTable[]
        lookupRecords: LookupRecord[]
    }

    export type GSUBLookupTableType6 =
        | ChainingContextSubstitutionTableVersion1
        | ChainingContextSubstitutionTableVersion2
        | ChainingContextSubstitutionTableVersion3

    interface ChainingContextSubstitutionTableVersion1 {
        version: 1
        coverage: CoverageTable
        chainCount: number
        chainRuleSets: ChainRule[][]
    }

    interface ChainRule {
        backtrackGlyphCount: number
        backtrack: number[]
        inputGlyphCount: number
        input: number[]
        lookaheadGlyphCount: number
        lookahead: number[]
        lookupCount: number
        lookupRecords: LookupRecord[]
    }

    interface ChainingContextSubstitutionTableVersion2 {
        version: 2
        coverage: CoverageTable
        backtrackClassDef: ClassDefinitionTable
        inputClassDef: ClassDefinitionTable
        lookaheadClassDef: ClassDefinitionTable
        chainCount: number
        chainClassSet: ChainRule[][]
    }

    interface ChainingContextSubstitutionTableVersion3 {
        version: 3
        backtrackGlyphCount: number
        backtrackCoverage: CoverageTable[]
        inputGlyphCount: number
        inputCoverage: CoverageTable[]
        lookaheadGlyphCount: number
        lookaheadCoverage: CoverageTable[]
        lookupCount: number
        lookupRecords: LookupRecord[]
    }

    export interface GSUBLookupTableType7 {
        substFormat: number
        lookupType: number // cannot also be 7
        extension: GSUBLookupTable
    }

    export interface GSUBLookupTableType8 {}

    export type CoverageTable = CoverageTableVersion1 | CoverageTableVersion2

    interface CoverageTableVersion1 {
        version: 1
        glyphCount: number
        glyphs: number[]
    }

    interface CoverageTableVersion2 {
        version: 2
        rangeCount: number
        rangeRecords: RangeRecord[]
    }

    interface RangeRecord {
        start: number
        end: number
        startCoverageIndex: number
    }

    interface Fontkit {
        openSync(filename: string, postscriptName = null): Font
        create(buffer: Buffer): Font
        // Types for irrelevant information are left out for now
    }

    export default fontkit
}
