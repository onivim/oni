import * as assert from "assert"

import * as PackageMetadataParser from "./../../src/Plugins/PackageMetadataParser"

describe("PackageMetadataParser", () => {

    const blankMetadataWithOniEngine: any = {
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
            assert.deepEqual(output.oni, {})
        })

        it("passes through language capabilities", () => {
            const metadata = { ...blankMetadataWithOniEngine }
            metadata.oni = {}
            metadata.oni["typescript"] = { // tslint:disable-line no-string-literal
                "languageService": ["quick-info"],
            }
            const metadataString = JSON.stringify(metadata)

            const output = PackageMetadataParser.parseFromString(metadataString)
            assert.deepEqual(output.oni, {
                "typescript": {
                    "languageService": ["quick-info"],
                },
            })
        })

        it("expands multiple language capabilities", () => {
            const metadata = { ...blankMetadataWithOniEngine }
            metadata.oni = {}
            metadata.oni["typescript,javascript"] = {
                "languageService": ["quick-info"],
            }
            const metadataString = JSON.stringify(metadata)

            const output = PackageMetadataParser.parseFromString(metadataString)
            assert.deepEqual(output.oni, {
                "typescript": {
                    "languageService": ["quick-info"],
                },
                "javascript": {
                    "languageService": ["quick-info"],
                },
                "typescript,javascript": {
                    "languageService": ["quick-info"],
                },
            })
        })
    })
})
