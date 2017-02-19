export interface PromiseFunction<T> {
    (...args: any[]): Promise<T>
}

export interface DeferredPromise<T> {
    promise: Promise<T>
    resolve: (val: T) => void
    reject: (error: Error) => void
}

export function debounce<T>(this: any, promiseFunction: PromiseFunction<T>): PromiseFunction<T> {

    let lastArguments: any[] = null as any
    let pendingPromise: Promise<T> = null as any
    let queuedPromises: Array<DeferredPromise<T>> = []

    const executeNextPromise = () => {
        if (!pendingPromise && queuedPromises.length > 0) {
            for (let i = 0; i < queuedPromises.length - 1; i++) {
                queuedPromises[i].reject(new Error("Preempted"))
            }

            const currentPromise = queuedPromises[queuedPromises.length - 1]
            queuedPromises = []
            runPromiseFunction(currentPromise, lastArguments)
        }
    }

    const runPromiseFunction = (currentPromise: any, lastArgs: any) => {
        pendingPromise = promiseFunction.apply(this, lastArgs)
        lastArguments = null

        pendingPromise.then((val) => {
            currentPromise.resolve(val)
            pendingPromise = null as any
            executeNextPromise()
        }, (err) => {
            currentPromise.reject(err)
            pendingPromise = null as any
            executeNextPromise()
        })

    }

    return function(...args): Promise<T> { // tslint:disable-line only-arrow-functions
        let resolve: any = null
        let reject: any = null
        const promise = new Promise<T>(function() { // tslint:disable-line only-arrow-functions
            resolve = arguments[0]
            reject = arguments[1]
        })

        const deferredPromise = {
            resolve,
            reject,
            promise,
        }

        lastArguments = args
        queuedPromises.push(deferredPromise as any)

        executeNextPromise()

        return promise
    }
}
