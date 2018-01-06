import * as assert from "assert"

import * as MarkdownPreview from "./index"

import * as OniApi from "oni-api"

export const test = (oni: OniApi.Plugin.Api): void => {
    //const splitRoot = oni.windows.splitRoot;

    describe("initially", () => {
        it("has only one split", () => {
            //assert.strictEqual(splitRoot.leaves.length, 1)
        })
    })

    describe("activate", () => {
        MarkdownPreview.activate(oni)

        describe("open an empty markdown file", () => {
            oni.automation.sendKeys(":e markdown-preview-test.md")

            it("opens a new preview split", () => {
                //assert.strictEqual(splitRoot.leaves.length, 2)
            })

            describe("the markdown-preview split", () => {
                it("has no text", () => {
                    // assert.strictEqual(splitRoot.leaves[1].content.text.trim(), "")
                })
            })

            describe("with Markdown title", () => {
                oni.automation.sendKeys("i# Title 1")
                it("has a Header element", () => {
                    // const headers = splitRoot.leaves[1].content.getElements("h1")
                    // assert.strictEqual(headers.length, 1)
                    // assert.strictEqual(headers[0].text.trim(), "Title 1")
                })
            })
        })
    })
}
