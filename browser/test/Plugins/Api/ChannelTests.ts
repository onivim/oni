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

    describe("InProcessChannel", () => {
        it("broadcasts created plugin channel on host send", () => {
            const channel = new Channel.InProcessChannel()
            const pluginChannel = channel.createPluginChannel(null)

            channel.host.send("test", Capabilities.createPluginFilter(null))

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
            const pluginChannel1 = channel.createPluginChannel(null)
            const pluginChannel2 = channel.createPluginChannel(null)

            channel.host.send("test", Capabilities.createPluginFilter(null))

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
