/**
 * Mocks/MockPluginManager.ts
 */

import * as Oni from "oni-api"

import { IContributions } from "./../../src/Plugins/Api/Capabilities"

export class MockPluginManager implements Oni.IPluginManager {
    public get loaded(): boolean {
        return false
    }

    public discoverPlugins(): void {
        // tslint:disable-line
    }

    public getAllContributionsOfType<T>(selector: (capabilities: IContributions) => T[]): T[] {
        return []
    }

    public startApi(): Oni.Plugin.Api {
        return null
    }

    public getPlugin(name: string): any {
        return null
    }
}
