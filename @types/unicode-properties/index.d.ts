interface UnicodeProperties {
    isMark(codePoint: number): boolean
    // Leaving out the rest for now
}

declare module "unicode-properties" {
    declare const unicodeProperties: UnicodeProperties

    export default unicodeProperties
}
