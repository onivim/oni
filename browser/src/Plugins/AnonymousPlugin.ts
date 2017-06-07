/**
 * AnonymousPlugin.ts
 *
 * Provides a globally-available, immediately-active plugin
 * Useful for testing the plugin API
 */

import * as Capabilities from "./Api/Capabilities"
import { IChannel } from "./Api/Channel"
import { Oni } from "./Api/Oni"

/**
 * AnomymousPlugin - globally available, immediately actived plugin
 * that provides a direct interface to the Oni object
 */
export class AnonymousPlugin {
    private _channel: IChannel
    private _oni: Oni

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

        this._oni = new Oni(this._channel.createPluginChannel(metadata, () => {}))

        window["Oni"] = this._oni
    }
}
