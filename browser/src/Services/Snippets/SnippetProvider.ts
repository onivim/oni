/**
 * SnippetProvider.ts
 *
 * Manages snippet integration
 */

import * as fs from "fs"

import { PluginManager } from "./../../Plugins/PluginManager"

import * as Log from "./../../Log"
import { flatMap } from "./../../Utility"

export interface ISnippet {
    prefix: string
    body: string
    description: string
}

export interface ISnippetProvider {
    getSnippets(language: string): Promise<ISnippet[]>
}

export class CompositeSnippetProvider implements ISnippetProvider {
    private _providers: ISnippetProvider[] = []

    public registerProvider(provider: ISnippetProvider): void {
        this._providers.push(provider)
    }

    public async getSnippets(language: string): Promise<ISnippet[]> {
        const snippets = this._providers.map(p => p.getSnippets(language))

        const allSnippets = await Promise.all(snippets)

        return allSnippets.reduce((prev, cur) => {
            return [...prev, ...cur]
        }, [])
    }
}

export class PluginSnippetProvider implements ISnippetProvider {
    private _snippetCache: { [language: string]: ISnippet[] } = {}

    constructor(private _pluginManager: PluginManager) {}

    public async getSnippets(language: string): Promise<ISnippet[]> {
        // If we have existing snippets, we'll use those...
        const currentSnippets = this._snippetCache[language]
        if (currentSnippets) {
            return currentSnippets
        }

        // Otherwise, we need to discover snippets

        const filteredPlugins = this._pluginManager.plugins.filter(
            p => p.metadata && p.metadata.contributes && p.metadata.contributes.snippets,
        )

        const snippets = flatMap(filteredPlugins, pc => pc.metadata.contributes.snippets).filter(
            s => s.language === language,
        )

        const snippetLoadPromises = snippets.map(s => this._loadSnippetsFromFile(s.path))
        const loadedSnippets = await Promise.all(snippetLoadPromises)
        const flattenedSnippets = loadedSnippets.reduce(
            (x: ISnippet[], y: ISnippet[]) => [...x, ...y],
            [],
        )

        this._snippetCache[language] = flattenedSnippets
        return flattenedSnippets
    }

    private async _loadSnippetsFromFile(snippetFilePath: string): Promise<ISnippet[]> {
        const contents = await new Promise<string>((resolve, reject) => {
            fs.readFile(snippetFilePath, "utf8", (err, data) => {
                if (err) {
                    reject(err)
                    return
                }

                resolve(data)
            })
        })

        const snippets = Object.values(JSON.parse(contents)) as ISnippet[]
        Log.verbose(
            `[PluginSnippetProvider._loadSnippetsFromFile] - Loaded ${
                snippets.length
            } snippets from ${snippetFilePath}`,
        )
        return snippets
    }
}
