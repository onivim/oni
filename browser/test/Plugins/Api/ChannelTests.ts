import * as assert from "assert"
import * as sinon from "sinon"

import * as Capabilities from "./../../../src/Plugins/Api/Capabilities"
import * as Channel from "./../../../src/Plugins/Api/Channel"

describe("Channel", () => {

    let clock: sinon.SinonFakeTimers

    beforeEach(() => {
        clock = sinon.useFakeTimers()
    })

    afterEach(() => {
        clock.restore()
    })

    const defaultPluginMetadata: Capabilities.IPluginMetadata = {
        name: "defaultPluginMetadata",
        main: "index.js",
        engines: {
            oni: "0.1.0",
        },
        oni: {
            supportedFileTypes: ["testFileType"],
        },
    }

    const noop = () => { } // tslint:disable-line no-empty

    describe("InProcessChannel", () => {
        it("broadcasts created plugin channel on host send", () => {
            const channel = new Channel.InProcessChannel()
            const pluginChannel = channel.createPluginChannel(defaultPluginMetadata, noop)

            channel.host.send("test", Capabilities.createPluginFilter("testFileType"))

            let wasChannelCalled = false
            pluginChannel.onRequest((arg) => {
                wasChannelCalled = true
                assert.strictEqual(arg, "test")
            })
            clock.tick(1)

            assert.ok(wasChannelCalled)
        })

        it("broadcasts to multiple created plugin channels on host send", () => {
            const channel = new Channel.InProcessChannel()
            const pluginChannel1 = channel.createPluginChannel(defaultPluginMetadata, noop)
            const pluginChannel2 = channel.createPluginChannel(defaultPluginMetadata, noop)

            channel.host.send("test", Capabilities.createPluginFilter("testFileType"))

            let channelCallCount = 0
            pluginChannel1.onRequest((arg) => {
                channelCallCount++
                assert.strictEqual(arg, "test")
            })
            pluginChannel2.onRequest((arg) => {
                channelCallCount++
                assert.strictEqual(arg, "test")
            })
            clock.tick(1)

            assert.strictEqual(channelCallCount, 2)
        })
    })
})
