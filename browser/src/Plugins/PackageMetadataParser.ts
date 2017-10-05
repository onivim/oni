/**
 * PackageMetadataParser.ts
 *
 * Responsible for parsing and normalizing package.json for ONI plugins
 */

import * as keys from "lodash/keys"

import * as Capabilities from "./Api/Capabilities"

import * as Log from "./../Log"

export const PluginDefaults: Partial<Capabilities.IPluginCapabilities> = {
    commands: {},
    activationMode: "on-demand",
}

export const parseFromString = (packageJson: string): Capabilities.IPluginMetadata | null => {
    const metadata: Capabilities.IPluginMetadata = JSON.parse(packageJson)

    if (!metadata.engines || !metadata.engines["oni"]) { // tslint:disable-line no-string-literal
        Log.warn("Aborting plugin load as Oni engine version not specified")
        return null
    }

    const pluginData = metadata.oni || {}

    metadata.oni = {
        ...PluginDefaults,
        ...pluginData,
    }

    return metadata
}

export const getAllCommandsFromMetadata = (metadata: Capabilities.IPluginMetadata) => {
    if (!metadata || !metadata.oni) {
        return []
    }

    const commands = metadata.oni.commands

    if (!commands) {
        return []
    }

    const commandNames = keys(commands)
    return commandNames.map((command) => ({
        command,
        name: commands[command].name,
        details: commands[command].details,
    }))
}
