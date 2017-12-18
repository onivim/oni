
import test from "ava"

import * as WindowSplit from "../src/Services/WindowSplit"

function getRoot<T>() { return WindowSplit.createSplitRoot<T>(WindowSplit.SplitDirection.Horizontal, null) }

test("WindowSplit.applySplit() adds split to empty root", t => {
     const root = getRoot<number>()

     const leaf = WindowSplit.createSplitLeaf(1)

     const result = WindowSplit.applySplit(root, WindowSplit.SplitDirection.Horizontal, leaf)

     t.is(result.splits.length, 1)
     t.is(result.splits[0], leaf)
})

test("WindowSplit.closeSplit() removes split from array", t => {
     const root = getRoot<number>()
     const leaf = WindowSplit.createSplitLeaf(1)
     const result = WindowSplit.applySplit(root, WindowSplit.SplitDirection.Horizontal, leaf)

     const resultAfterClose = WindowSplit.closeSplit(result, 1)

     t.is(resultAfterClose.splits.length, 0)
})

