/**
 * PackageMetadataParser.ts
 *
 * Responsible for parsing and normalizing package.json for ONI plugins
 */

import * as Capabilities from "./Api/Capabilities"

import * as Log from "./../Log"

export const parseFromString = (packageJson: string): Capabilities.IPluginMetadata | null => {

    let metadata: Capabilities.IPluginMetadata = null
    try {
        metadata = JSON.parse(packageJson) as Capabilities.IPluginMetadata
    } catch (ex) {
        Log.error(ex)
    }

    if (!metadata) {
        return null
    }

    if (!metadata.engines || !metadata.engines["oni"]) { // tslint:disable-line no-string-literal
        Log.warn("Aborting plugin load as Oni engine version not specified")
        return null
    }

    const contributes = {
        ...Capabilities.DefaultContributions,
        ...metadata.contributes
    }

    return {
        ...metadata,
        contributes,
    }
}
