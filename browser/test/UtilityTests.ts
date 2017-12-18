import test from "ava"

import * as rxjs from "rxjs"

import * as Utility from "../src/Utility"

interface PromiseInfo { resolve: (val: any) => void, reject: (err: Error) => void }
interface PromiseCreationResult { info: PromiseInfo[], inputs: any[], promiseCreator: (input: any) => Promise<any> }
const createPromiseFunction = (): PromiseCreationResult => {
    const info: any[] = []
    const inputs: any[] = []

    const promiseCreator = (input: any) => {
        inputs.push(input)

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

let subject: rxjs.Subject<any>

test.beforeEach(() => {
    subject = new rxjs.Subject()
})

test("ignoreWhilePendingPromise() executes promise function in response to observable input", t => {
    const promiseFunction = createPromiseFunction()

    const outputObservable$ = Utility.ignoreWhilePendingPromise(subject, promiseFunction.promiseCreator)

    const outputs: any[] = []
    outputObservable$.subscribe((val) => { outputs.push(val) })

    // Resolve the promise that gets fired as a result of subject triggered
    subject.next(5)
    promiseFunction.info[0].resolve("a")

    return outputObservable$.take(1).toPromise()
        .then(() => {
            t.deepEqual(promiseFunction.inputs, [5])
            t.deepEqual(outputs, ["a"])
        })
})

test("ignoreWhilePendingPromise() does not dispatch promise function while previous is still pending", t => {
    const promiseFunction = createPromiseFunction()

    const outputObservable$ = Utility.ignoreWhilePendingPromise(subject, promiseFunction.promiseCreator)

    const outputs: any[] = []
    outputObservable$.subscribe((val) => { outputs.push(val) })

    // Bring in multiple inputs
    subject.next(5)
    subject.next(6)
    subject.next(7)
    subject.next(8)
    promiseFunction.info[0].resolve("a")

    return outputObservable$.take(1).toPromise()
        .then(() => {
            // Only 5 & 7 should've been dispatched to the function,
            // because the observable should've been held
            // while the first promise was in flight,
            // and 8 would've been dispatched when the promise for 5 was completed.
            t.deepEqual(promiseFunction.inputs, [5, 8])
            t.deepEqual(outputs, ["a"])
        })
})

