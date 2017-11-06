import * as assert from "assert"

import * as rxjs from "rxjs"

import * as Utility from "./../src/Utility"

type PromiseInfo = { resolve: Function, reject: Function } 
type PromiseCreationResult = { info: PromiseInfo[], inputs: any[], promiseCreator: (input: any) => Promise<any> }
const createPromiseFunction = (): PromiseCreationResult => {
    let info: any[] = []
    let inputs: any[] = []

    const promiseCreator = (input: any) => {
        inputs.push(input)

        console.log("called")

        return new Promise((resolve, reject) => {
            info.push({ resolve, reject })
        })
    }

    return {
        info,
        inputs,
        promiseCreator,
    }
}

describe("Utility", () => {

    describe("ignoreWhilePendingPromise", () => {

            let subject: rxjs.Subject<any>

            beforeEach(() => {
                subject = new rxjs.Subject()
            })

            it.only("Executes promise function in response to observable input", () => {
                const promiseFunction = createPromiseFunction()

                const outputObservable$ = Utility.ignoreWhilePendingPromise(subject, promiseFunction.promiseCreator)

                let outputs: any[] = []
                outputObservable$.subscribe((val) => { outputs.push(val) })

                // Resolve the promise that gets fired as a result of subject triggered
                subject.next(5)
                promiseFunction.info[0].resolve("a")

                subject.complete()

                return outputObservable$.delay(1).toPromise()
                    .then(() => {
                        assert.strictEqual(promiseFunction.inputs.length, 1)
                        assert.deepEqual(outputs, ["a"])
                    })
            })

            it.only("Does not dispatch promise function while previous is still pending", () => {
                const promiseFunction = createPromiseFunction()

                const outputObservable$ = Utility.ignoreWhilePendingPromise(subject, promiseFunction.promiseCreator)

                let outputs: any[] = []
                outputObservable$.subscribe((val) => { outputs.push(val) })

                // Bring in multiple inputs
                subject.next(5)
                subject.next(6)
                subject.next(7)
                promiseFunction.info[0].resolve("a")

                subject.complete()

                return outputObservable$.delay(1).toPromise()
                    .then(() => {
                        // Only 5 should've been dispatched to the function,
                        // because the observable should've been held
                        // while the first promise was in flight.
                        assert.deepEqual(promiseFunction.inputs, [5])
                        assert.deepEqual(outputs, ["a"])
                    })
            })

    })
})
