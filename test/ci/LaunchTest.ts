import * as assert from "assert"
import * as path from "path"

import { Oni } from "./../common"

const LongTimeout = 5000

describe("application launch", function() { // tslint:disable-line only-arrow-functions
    // Retry up to two times
    this.retries(2)

    let oni: Oni

    beforeEach(async () => {
        oni = new Oni()
        return oni.start()
    })

    afterEach(async () => {
        return oni.close()
    })

    it("launches oni", async () => {
        await oni.client.waitForExist(".editor", LongTimeout)
        const text = await oni.client.getText(".editor")
        assert(text && text.length > 0, "Validate editor element is present")
    })
})
