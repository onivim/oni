import * as assert from "assert"

import * as Capabilities from "./../../../src/Plugins/Api/Capabilities"

describe("Capabilities", () => {

    const Plugin1: Capabilities.IPluginMetadata = {
        main: "",
        engines: "",
        oni: {
            "typescript": {
                "languageService": ["quick-info"],
            },
        },
    }

    const Plugin2: Capabilities.IPluginMetadata = {
        main: "",
        engines: "",
        oni: {
            "javascript": {
            },
        },
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

        it("returns true if requiredCapabilities matches", () => {
            const filter = Capabilities.createPluginFilter("typescript", {
                languageService: ["quick-info"],
            })

            const result = Capabilities.doesMetadataMatchFilter(Plugin1, filter)
            assert.strictEqual(result, true)
        })

        it("returns false if requiredCapabilities do not match", () => {
            const filter = Capabilities.createPluginFilter("typescript", {
                languageService: ["goto-definition"],
            })

            const result = Capabilities.doesMetadataMatchFilter(Plugin2, filter)
            assert.strictEqual(result, false)
        })
    })

    describe("doCapabilitiesMeetRequirements", () => {
        describe("commands", () => {

            it("command with same name passes filter", () => {
                const filter = Capabilities.createPluginFilterForCommand("typescript", "command1")

                const capabilityWithCommand = {
                    commands: {
                        command1: {
                            name: "Command1",
                            details: "Command1Details",
                        },
                    },
                }

                const result = Capabilities.doCapabilitiesMeetRequirements(capabilityWithCommand, filter.requiredCapabilities)
                assert.strictEqual(result, true)
            })

            it("command with different name does not pass filter", () => {
                const filter = Capabilities.createPluginFilterForCommand("typescript", "someOtherCommand")

                const capabilityWithCommand = {
                    commands: {
                        command1: {
                            name: "Command1",
                            details: "Command1Details",
                        },
                    },
                }

                const result = Capabilities.doCapabilitiesMeetRequirements(capabilityWithCommand, filter.requiredCapabilities)
                assert.strictEqual(result, false)
            })
        })
    })
})
