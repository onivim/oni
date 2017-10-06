import * as assert from "assert"

import { Oni } from "./../common"

const LongTimeout = 5000

describe("application launch", () => {

    let oni: Oni

    beforeEach(() => {
        oni = new Oni()
        return oni.start(["C:/oni/lib/browser/bundle.js"])
    })

    afterEach(() => {
        return oni.close()
    })

    const individualTest = (testName) => {
        it(testName, async () => {
            await oni.client.waitForExist(".editor", LongTimeout)
            const text = await oni.client.getText(".editor")
            assert(text && text.length > 0, "Validate editor element is present")
        })
    }

    for (let i = 0; i < 50; i++) {
        individualTest("stability - iteration: " + i.toString())
    }
})
