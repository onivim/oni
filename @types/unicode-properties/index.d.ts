declare module "unicode-properties" {
    declare const unicodeProperties: UnicodeProperties

    interface UnicodeProperties {
        isMark(codePoint: number): boolean
        // Leaving out the rest for now
    }
    export default unicodeProperties
}
