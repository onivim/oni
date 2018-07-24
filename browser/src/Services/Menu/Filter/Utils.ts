import { configuration } from "./../../../Services/Configuration"

export const shouldBeCaseSensitive = (searchString: string): boolean => {
    // TODO: Technically, this makes the reducer 'impure',
    // which is not ideal - need to refactor eventually.
    //
    // One option is to plumb through the configuration setting
    // from the top-level, but it might be worth extracting
    // out the filter strategy in general.
    const caseSensitivitySetting = configuration.getValue("menu.caseSensitive")

    if (caseSensitivitySetting === false) {
        return false
    } else if (caseSensitivitySetting === true) {
        return true
    } else {
        // "Smart" casing strategy
        // If the string is all lower-case, not case sensitive..
        if (searchString === searchString.toLowerCase()) {
            return false
            // Otherwise, it is case sensitive..
        } else {
            return true
        }
    }
}
