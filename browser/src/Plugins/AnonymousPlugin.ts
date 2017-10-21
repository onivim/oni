/**
 * AnonymousPlugin.ts
 *
 * Provides a globally-available, immediately-active plugin
 * Useful for testing the plugin API
 */

import { Oni } from "./Api/Oni"

export class AnonymousPlugin {
    private _oni: Oni.Plugin.Api

    public get oni(): Oni.Plugin.Api {
        return this._oni
    }

    constructor() {
        this._oni = new Oni() // tslint:disable-line no-empty
        window["Oni"] = this._oni // tslint:disable-line no-string-literal
    }
}
