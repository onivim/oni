/* global:clock */
import * as assert from "assert"
import * as sinon from "sinon"

import { focusManager } from "../../src/Services/FocusManager"

// tslint:disable-next-line no-string-literal
const clock: any = global["clock"]

describe("FocusManager", () => {
    let sandbox: sinon.SinonSandbox

    beforeEach(() => {
        sandbox = sinon.sandbox.create()
    })
    afterEach(() => {
        sandbox.restore()
        // tslint:disable-next-line no-string-literal
        focusManager["_focusElementStack"] = []
    })

    describe("pushFocus", () => {
        let enforceFocus: sinon.SinonStub
        beforeEach(() => {
            enforceFocus = sandbox.stub(focusManager, "enforceFocus")
        })

        const assertEnforcesFocus = () => {
            sinon.assert.notCalled(enforceFocus)
            clock.tick(0)
            sinon.assert.calledOnce(enforceFocus)
            sinon.assert.calledWithExactly(enforceFocus)
        }

        it("prepends element to the stack and ensures it's focused", () => {
            const elNew = "elNew" as any
            const elPrev = "elPrev" as any
            // tslint:disable-next-line no-string-literal
            focusManager["_focusElementStack"] = [elPrev]

            focusManager.pushFocus(elNew)

            // tslint:disable-next-line no-string-literal
            assert.deepStrictEqual(focusManager["_focusElementStack"], [elNew, elPrev])
            assertEnforcesFocus()
        })

        it("does not update the stack if the element is already in it", () => {
            const el1 = "el1" as any
            const el2 = "el2" as any
            const el3 = "el3" as any
            // tslint:disable-next-line no-string-literal
            focusManager["_focusElementStack"] = [el1, el2, el3]

            focusManager.pushFocus(el2)

            // tslint:disable-next-line no-string-literal
            assert.deepStrictEqual(focusManager["_focusElementStack"], [el1, el2, el3])
            assertEnforcesFocus()
        })
    })
})
