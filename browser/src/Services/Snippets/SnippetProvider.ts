/**
 * SnippetProvider.ts
 *
 * Manages snippet integration
 */

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
