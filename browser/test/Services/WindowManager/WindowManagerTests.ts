/**
 * WindowManagerTests.ts
 */

import * as assert from "assert"

import { ISplitInfo, WindowManager } from "./../../../src/Services/WindowManager"
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

    it("can get split after a split is closed", async () => {
        const split1 = new MockWindowSplit("window1")
        const split2 = new MockWindowSplit("window2")
        const split3 = new MockWindowSplit("window3")

        windowManager.createSplit("horizontal", split1)
        const handle2 = windowManager.createSplit("vertical", split2, split1)

        handle2.close()

        const handle3 = windowManager.createSplit("vertical", split3, split1)

        const handle = windowManager.getSplitHandle(split3)

        assert.strictEqual(handle.id, handle3.id)
    })

    it("respects direction even if a reference split is not passed in", async () => {
        const split1 = new MockWindowSplit("window1")
        const split2 = new MockWindowSplit("window2")

        const handle1 = windowManager.createSplit("horizontal", split1)
        handle1.focus()

        windowManager.createSplit("vertical", split2, split1)

        const splitRoot = windowManager.splitRoot

        const firstChild = splitRoot.splits[0] as ISplitInfo<MockWindowSplit>

        assert.strictEqual(firstChild.type, "Split")
        assert.strictEqual(
            firstChild.direction,
            "horizontal",
            "Validate the splits are arranged horizontally (it's confusing... but this means they are vertical splits)",
        )
        assert.strictEqual(firstChild.splits.length, 2, "Validate both windows are in this split")
    })
})
