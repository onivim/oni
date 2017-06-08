import * as assert from "assert"

import * as Capabilities from "./../../../src/Plugins/Api/Capabilities"

describe("Capabilities", () => {

    const Plugin1: Capabilities.IPluginMetadata = {
        name: "plugin1",
        main: "",
        engines: "",
        oni: {
            "supportedFileTypes": ["typescript"],
        },
    }

    const Plugin2: Capabilities.IPluginMetadata = {
        name: "plugin2",
        main: "",
        engines: "",
        oni: { },
    }

    describe("doesMetadataMatchFilter", () => {
        it("returns true if filetype matches", () => {
            const filter = Capabilities.createPluginFilter("typescript")

            const result = Capabilities.doesMetadataMatchFilter(Plugin1, filter)
            assert.strictEqual(result, true)
        })

        it("returns false if filetype does not match", () => {
            const filter = Capabilities.createPluginFilter("typescript")

            const result = Capabilities.doesMetadataMatchFilter(Plugin2, filter)
            assert.strictEqual(result, false)
        })
    })
})
