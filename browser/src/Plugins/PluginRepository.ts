/**
 * PluginRepository.ts
 *
 * Interface for querying various 'plugin repositories':
 * - Vim plugins via VimAwesome
 * - TODO: Oni plugins via NPM
 * - TODO: VSCode plugins via their API
 */

export interface PluginInfo {
    name: string
    author: string
    description: string
    yarnInstallPackageName: string

    // TODO:
    // Icon?
}

/**
 * PluginRepository
 *
 * General interface for querying for plugins
 */
export interface PluginRepository {
    searchPlugins(query: string): Promise<PluginInfo[]>
}

export interface VimAwesomePluginResult {
    github_repo_name: string
    github_owner: string
    name: string
    github_author: string
    short_desc: string
}

export interface VimAwesomeResult {
    total_results: number
    results_per_page: number
    total_pages: number
    plugins: VimAwesomePluginResult[]
}

const mapVimAwesomePluginsToPluginInfo = (
    vimAwesomePluginInfo: VimAwesomePluginResult[],
): PluginInfo[] => {
    return vimAwesomePluginInfo.map(vpi => ({
        name: vpi.name,
        author: vpi.github_author,
        description: vpi.short_desc,
        yarnInstallPackageName: `${vpi.github_owner}/${vpi.github_repo_name}`,
    }))
}

export class VimAwesomePluginRepository {
    public async searchPlugins(query: string): Promise<PluginInfo[]> {
        const initialResult = await fetch(
            `https://vimawesome.com/api/plugins?page=1&query=${query}`,
        )
        const info = (await initialResult.json()) as VimAwesomeResult

        // TODO: Iterate through pages until we get them all!
        return mapVimAwesomePluginsToPluginInfo(info.plugins)
    }
}

/**
 * CompositePluginRepository
 *
 * Implementation of PluginRepository that queries against multiple providers simulatenously
 */
export class CompositePluginRepository implements PluginRepository {
    private _repositories: PluginRepository[] = []

    constructor() {
        this._repositories.push(new VimAwesomePluginRepository())
    }

    public async searchPlugins(query: string): Promise<PluginInfo[]> {
        const allResults = this._repositories.map(repository => repository.searchPlugins(query))
        const pluginResults = await Promise.all(allResults)
        return pluginResults.reduce((prev, cur) => [...prev, ...cur], [])
    }
}
