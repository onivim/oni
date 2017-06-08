import * as assert from "assert"

import * as Capabilities from "./../../src/Plugins/Api/Capabilities"
import * as PackageMetadataParser from "./../../src/Plugins/PackageMetadataParser"

describe("PackageMetadataParser", () => {

    const blankMetadataWithOniEngine: Partial<Capabilities.IPluginMetadata> = {
        name: "blankMetadata",
        engines: {
            oni: "0.1",
        },
    }

    describe("parseFromString", () => {
        it("returns null if no engine specified", () => {
            const blankMetadata = {}
            const blankMetadataString = JSON.stringify(blankMetadata)

            const output = PackageMetadataParser.parseFromString(blankMetadataString)
            assert.strictEqual(output, null)
        })

        it("creates default `oni` object", () => {
            const metadata = { ...blankMetadataWithOniEngine }
            const metadataString = JSON.stringify(metadata)

            const output = PackageMetadataParser.parseFromString(metadataString)
            assert.deepEqual(output.oni, PackageMetadataParser.PluginDefaults)
        })

        it("passes through language capabilities", () => {
            const metadata = { ...blankMetadataWithOniEngine }
            metadata.oni = {
                supportedFileTypes: ["typescript"],
            }

            const metadataString = JSON.stringify(metadata)

            const output = PackageMetadataParser.parseFromString(metadataString)
            assert.deepEqual(output.oni, {
                ...PackageMetadataParser.PluginDefaults,
                ...metadata.oni,
            })
        })
    })

    describe("getAllCommandsFromMetadata", () => {
        const PluginWithNoCommands: Capabilities.IPluginMetadata = {
            name: "PluginWithNoCommands",
            main: "",
            engines: "",
            oni: {
            },
        }
        const PluginWithCommand: Capabilities.IPluginMetadata = {
            name: "PluginWithNoCommands",
            main: "",
            engines: "",
            oni: {
                supportedFileTypes: ["javascript"],
                commands: {
                    "test.testCommand": {
                        name: "Test Command",
                        details: "Test Command Details",
                    },
                },
            },
        }

        const PluginWithDuplicateCommands: Capabilities.IPluginMetadata = {
            name: "PluginWithDuplicateCommands",
            main: "",
            engines: "",
            oni: {
                supportedFileTypes: ["javascript", "typescript"],
                commands: {
                    "test.testCommand": {
                        name: "Test Command",
                        details: "Test Command Details",
                    },
                },
            },
        }

        it("returns empty array if no commands", () => {
            const commands = PackageMetadataParser.getAllCommandsFromMetadata(PluginWithNoCommands)
            assert.deepEqual(commands, [])
        })

        it("returns single command", () => {
            const commands = PackageMetadataParser.getAllCommandsFromMetadata(PluginWithCommand)
            assert.deepEqual(commands, [{
                command: "test.testCommand",
                name: "Test Command",
                details: "Test Command Details",
            }])
        })

        it("doesn't return duplicate commands", () => {
            const commands = PackageMetadataParser.getAllCommandsFromMetadata(PluginWithDuplicateCommands)
            assert.deepEqual(commands, [{
                command: "test.testCommand",
                name: "Test Command",
                details: "Test Command Details",
            }])
        })
    })
})
