/**
 * AnonymousPlugin.ts
 *
 * Provides a globally-available, immediately-active plugin
 * Useful for testing the plugin API
 */

import * as OniApi from "oni-api"

import { Oni } from "./Api/Oni"

export class AnonymousPlugin {
    private _oni: OniApi.Plugin.Api

    public get oni(): OniApi.Plugin.Api {
        return this._oni
    }

    constructor() {
        this._oni = new Oni() // tslint:disable-line no-empty
        window["Oni"] = this._oni // tslint:disable-line no-string-literal
    }
}
