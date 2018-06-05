/**
 * PackageMetadataParser.ts
 *
 * Responsible for parsing and normalizing package.json for ONI plugins
 */

import * as fs from "fs"
import * as path from "path"

import * as Log from "oni-core-logging"

import * as Capabilities from "./Api/Capabilities"

const remapToAbsolutePaths = (
    packageRoot: string,
    contributes: Capabilities.IContributions,
): Capabilities.IContributions => {
    const remapThemePath = (
        themes: Capabilities.IThemeContribution,
    ): Capabilities.IThemeContribution => {
        return {
            ...themes,
            path: path.join(packageRoot, themes.path),
        }
    }

    const remapIconPath = (
        iconThemes: Capabilities.IIconThemeContribution,
    ): Capabilities.IIconThemeContribution => {
        return {
            ...iconThemes,
            path: path.join(packageRoot, iconThemes.path),
        }
    }

    const remapSnippetPath = (
        snippet: Capabilities.ISnippetContribution,
    ): Capabilities.ISnippetContribution => {
        return {
            ...snippet,
            path: path.join(packageRoot, snippet.path),
        }
    }

    return {
        ...contributes,
        themes: contributes.themes.map(t => remapThemePath(t)),
        iconThemes: contributes.iconThemes.map(it => remapIconPath(it)),
        snippets: contributes.snippets.map(s => remapSnippetPath(s)),
    }
}

export const readMetadata = (packagePath: string): Capabilities.IPluginMetadata | null => {
    const packageContents = fs.readFileSync(packagePath, "utf8")

    let metadata: Capabilities.IPluginMetadata = null
    try {
        metadata = JSON.parse(packageContents) as Capabilities.IPluginMetadata
    } catch (ex) {
        Log.error(ex)
    }

    if (!metadata) {
        return null
    }

    // tslint:disable-next-line no-string-literal
    if (!metadata.engines || !metadata.engines["oni"]) {
        Log.warn("Aborting plugin load as Oni engine version not specified")
        return null
    }

    const contributes = {
        ...Capabilities.DefaultContributions,
        ...metadata.contributes,
    }

    return {
        ...metadata,
        contributes: remapToAbsolutePaths(path.dirname(packagePath), contributes),
    }
}
