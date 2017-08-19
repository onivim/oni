/**
 * AnonymousPlugin.ts
 *
 * Provides a globally-available, immediately-active plugin
 * Useful for testing the plugin API
 */

import * as Capabilities from "./Api/Capabilities"
import { IChannel } from "./Api/Channel"
import { Oni } from "./Api/Oni"

export class AnonymousPlugin {
    private _channel: IChannel
    private _oni: Oni.Plugin.Api

    public get oni(): Oni.Plugin.Api {
        return this._oni
    }

    constructor(
        channel: IChannel,
    ) {
        this._channel = channel

        const metadata: Capabilities.IPluginMetadata = {
            name: "oni-anonymous",
            main: null,
            engines: null,
            oni: {
                activationMode: "immediate",
                supportedFileTypes: ["*"],
            },
        }

        this._oni = new Oni(this._channel.createPluginChannel(metadata, () => {})) // tslint:disable-line no-empty

        window["Oni"] = this._oni // tslint:disable-line no-string-literal
    }
}
