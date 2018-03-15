/**
 * WindowManagerTests.ts
 */

import * as assert from "assert"

import { WindowManager } from "./../../../src/Services/WindowManager"
import { MockWindowSplit } from "./../../Mocks"

describe("WindowManagerTests", () => {
    let windowManager: WindowManager

    beforeEach(() => {
        windowManager = new WindowManager()
    })
    it("sends focus to previous split after closing", async () => {
        const split1 = new MockWindowSplit("window1")
        const split2 = new MockWindowSplit("window2")
        const split3 = new MockWindowSplit("window3")

        const handle1 = windowManager.createSplit("horizontal", split1)
        const handle2 = windowManager.createSplit("vertical", split2, split1)

        assert.strictEqual(windowManager.activeSplit.id, handle2.id)

        handle2.close()

        assert.strictEqual(windowManager.activeSplit.id, handle1.id)

        const handle3 = windowManager.createSplit("horizontal", split3, split1)
        assert.strictEqual(windowManager.activeSplit.id, handle3.id)

        handle3.close()

        assert.strictEqual(windowManager.activeSplit.id, handle1.id)
    })
})
