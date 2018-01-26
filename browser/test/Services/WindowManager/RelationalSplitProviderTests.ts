/**
 * RelationalSplitProviderTests.ts
 */

import * as assert from "assert"

import { RelationalSplitNavigator, SingleSplitProvider } from "./../../../src/Services/WindowManager"

export class MockWindowSplit {
    public render(): JSX.Element { return null }
}

describe("RelationalSplitProvider", () => {
    let splitProvider: RelationalSplitNavigator
    let split1: MockWindowSplit
    let split2: MockWindowSplit
    let split1Provider: SingleSplitProvider
    let split2Provider: SingleSplitProvider


    beforeEach(() => {
        splitProvider = new RelationalSplitNavigator()
        split1 = new MockWindowSplit()
        split2 = new MockWindowSplit()
        split1Provider = new SingleSplitProvider(split1)
        split2Provider = new SingleSplitProvider(split2)
    })

    it("contains returns true/false", () => {
        // Make split2 'right' of split1
        splitProvider.setRelationship(split1Provider, split2Provider, "right")

        assert.strictEqual(true, splitProvider.contains(split1))
        assert.strictEqual(true, splitProvider.contains(split2))
        assert.strictEqual(false, splitProvider.contains(new MockWindowSplit()))
    })

    describe("move", () => {
        it("moves from one split to another", () => {
            // Make split2 'right' of split1
            splitProvider.setRelationship(split1Provider, split2Provider, "right")

            const forwardResult = splitProvider.move(split1, "right")
            assert.strictEqual(forwardResult, split2, "Move in the forward direction works")

            const inverseResult = splitProvider.move(split2, "left")
            assert.strictEqual(inverseResult, split1, "Move in the inverse direction works")
        })
    })

})
