/**
 * CompletionProviders.ts
 */

import * as types from "vscode-languageserver-types"

import { ICompletionsRequestor } from "./CompletionsRequestor"

export interface ICompletionProviderInfo {
    id: string
    provider: ICompletionsRequestor
}

export interface ICompletionInfoWithProvider extends types.CompletionItem {
    __provider: string
}

export class CompletionProviders implements ICompletionsRequestor {
    private _completionProviders: ICompletionProviderInfo[] = []

    public registerCompletionProvider(id: string, provider: ICompletionsRequestor): void {
        this._completionProviders.push({
            id,
            provider,
        })
    }

    public async getCompletions(language: string, filePath: string, line: number, column: number): Promise<types.CompletionItem[]> {
        const completionItemsPromise = this._completionProviders.map(async (prov) => {
            const items = await prov.provider.getCompletions(language, filePath, line, column)

            // Tag the items with the provider id, so we know who to ask for details
            const augmentedItems = items.map((item) => {
                return {
                    ...item,
                    __provider: prov.id,
                }
            })

            return augmentedItems
        })

        const allItems = await Promise.all(completionItemsPromise)

        const flattenedItems = allItems.reduce((prev: ICompletionInfoWithProvider[], current: ICompletionInfoWithProvider[]) => {
                return [...prev, ...current]
        }, [] as ICompletionInfoWithProvider[])

        return flattenedItems
    }

    public async getCompletionDetails(language: string, filePath: string, completionItem: ICompletionInfoWithProvider): Promise<types.CompletionItem> {
        if (completionItem.__provider) {
            const prov = this._getProviderById(completionItem.__provider)

            if (prov && prov.getCompletionDetails) {
                return prov.getCompletionDetails(language, filePath, completionItem)
            }
        }

        return completionItem
    }

    private _getProviderById(id: string): ICompletionsRequestor {
        const providersMatchingId = this._completionProviders.filter((prov) => prov.id === id)

        return providersMatchingId.length > 0 ? providersMatchingId[0].provider : null
    }
}

let _completionProviders: CompletionProviders

export const activate = () => {
    _completionProviders = new CompletionProviders()
}

export const getInstance = (): CompletionProviders => {
    return _completionProviders
}
