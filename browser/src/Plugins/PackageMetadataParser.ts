/**
 * PackageMetadataParser.ts
 *
 * Responsible for parsing and normalizing package.json for ONI plugins
 */

import * as _ from "lodash"

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

export const getAllCommandsFromMetadata = (metadata: Capabilities.IPluginMetadata) => {
    if (!metadata || !metadata.oni) {
        return []
    }

    const languages = _.values(metadata.oni)
    const commandsWithName = _.flatMap(languages, (item) => {
        if (!item.commands) {
            return []
        }

        const commandNames = _.keys(item.commands)
        return commandNames.map((command) => ({
            command,
            name: item.commands[command].name,
            details: item.commands[command].details,
        }))
    })

    return _.uniqBy(commandsWithName, (c) => c.command)
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
