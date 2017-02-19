/**
 * PackageMetadataParser.ts
 *
 * Responsible for parsing and normalizing package.json for ONI plugins
 */

import * as Capabilities from "./Api/Capabilities"

export const parseFromString = (packageJson: string) => {
    const metadata: Capabilities.IPluginMetadata = JSON.parse(packageJson)

    if (!metadata.engines || !metadata.engines["oni"]) { // tslint:disable-line no-string-literal
        console.warn("Aborting plugin load as Oni engine version not specified")
        return null
    }

    metadata.oni = metadata.oni || {}

    _expandMultipleLanguageKeys(metadata.oni)

    return metadata
}

/*
* For blocks that handle multiple languages
* ie, javascript,typescript
* Split into separate language srevice blocks
*/
function _expandMultipleLanguageKeys(packageMetadata: { [languageKey: string]: any }): void {
    Object.keys(packageMetadata).forEach((key) => {
        if (key.indexOf(",")) {
            const val = packageMetadata[key]
            key.split(",").forEach((splitKey) => {
                packageMetadata[splitKey] = val
            })
        }
    })
}
