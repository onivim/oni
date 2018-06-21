/**
 * SnippetProvider.ts
 *
 * Manages snippet integration
 */

import * as fs from "fs"
import * as os from "os"

import * as Oni from "oni-api"
import * as Log from "oni-core-logging"

import { PluginManager } from "./../../Plugins/PluginManager"

import { Configuration } from "./../Configuration"

import * as Utility from "./../../Utility"

export class CompositeSnippetProvider implements Oni.Snippets.SnippetProvider {
    private _providers: Oni.Snippets.SnippetProvider[] = []

    constructor(private _configuration: Configuration) {}

    public registerProvider(provider: Oni.Snippets.SnippetProvider): void {
        this._providers.push(provider)
    }

    public async getSnippets(language: string): Promise<Oni.Snippets.Snippet[]> {
        if (!this._configuration.getValue("snippets.enabled")) {
            return []
        }

        const snippets = this._providers.map(p => p.getSnippets(language))

        const allSnippets = await Promise.all(snippets)

        return allSnippets.reduce((prev, cur) => {
            return [...prev, ...cur]
        }, [])
    }
}

export interface ISnippetPluginContribution {
    prefix: string
    body: string[]
    description: string
}

export class PluginSnippetProvider implements Oni.Snippets.SnippetProvider {
    private _snippetCache: { [language: string]: Oni.Snippets.Snippet[] } = {}

    constructor(private _pluginManager: PluginManager) {}

    public async getSnippets(language: string): Promise<Oni.Snippets.Snippet[]> {
        // If we have existing snippets, we'll use those...
        const currentSnippets = this._snippetCache[language]
        if (currentSnippets) {
            return currentSnippets
        }

        // Otherwise, we need to discover snippets

        const filteredPlugins = this._pluginManager.plugins.filter(
            p => p.metadata && p.metadata.contributes && p.metadata.contributes.snippets,
        )

        const snippets = Utility.flatMap(
            filteredPlugins,
            pc => pc.metadata.contributes.snippets,
        ).filter(s => s.language === language)

        const snippetLoadPromises = snippets.map(s => this._loadSnippetsFromFile(s.path))
        const loadedSnippets = await Promise.all(snippetLoadPromises)
        const flattenedSnippets = loadedSnippets.reduce(
            (x: Oni.Snippets.Snippet[], y: Oni.Snippets.Snippet[]) => [...x, ...y],
            [],
        )

        this._snippetCache[language] = flattenedSnippets
        return flattenedSnippets
    }

    private async _loadSnippetsFromFile(snippetFilePath: string): Promise<Oni.Snippets.Snippet[]> {
        return loadSnippetsFromFile(snippetFilePath)
    }
}

export const loadSnippetsFromFile = async (
    snippetFilePath: string,
): Promise<Oni.Snippets.Snippet[]> => {
    Log.verbose("[loadSnippetsFromFile] Trying to load snippets from: " + snippetFilePath)
    const contents = await new Promise<string>((resolve, reject) => {
        fs.readFile(snippetFilePath, "utf8", (err, data) => {
            if (err) {
                reject(err)
                return
            }

            resolve(data)
        })
    })

    const snippets = loadSnippetsFromText(contents)

    Log.verbose(
        `[loadSnippetsFromFile] - Loaded ${snippets.length} snippets from ${snippetFilePath}`,
    )

    return snippets
}

interface KeyToSnippet {
    [key: string]: ISnippetPluginContribution
}

export const loadSnippetsFromText = (contents: string): Oni.Snippets.Snippet[] => {
    let snippets: ISnippetPluginContribution[] = []
    try {
        const snippetObject = Utility.parseJson5<KeyToSnippet>(contents)
        snippets = Object.values(snippetObject)
    } catch (ex) {
        Log.error(ex)
        snippets = []
    }

    const normalizedSnippets = snippets.map(
        (snip: ISnippetPluginContribution): Oni.Snippets.Snippet => {
            return {
                prefix: snip.prefix,
                description: snip.description,
                body: typeof snip.body === "string" ? snip.body : snip.body.join(os.EOL),
            }
        },
    )

    return normalizedSnippets
}
