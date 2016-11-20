export interface PromiseFunction<T> {
    (...args):  Promise<T> 
}

export interface DeferredPromise<T> {
    promise: Promise<T>
    resolve: (val: T) => void
    reject: (error: Error) => void
}

export function debounce<T>(promiseFunction: PromiseFunction<T>): PromiseFunction<T> {

    let lastArguments: any[] = null
    let pendingPromise: Promise<T> = null
    let queuedPromises: DeferredPromise<T>[] = []

    const executeNextPromise = () => {
        if (!pendingPromise && queuedPromises.length > 0 ) {
            for(var i = 0; i < queuedPromises.length - 1; i++) {
                queuedPromises[i].reject(new Error("Preempted"))
            }

            const currentPromise = queuedPromises[queuedPromises.length - 1]
            queuedPromises = []
            runPromiseFunction(currentPromise, lastArguments)
        }
    }

    const runPromiseFunction = (currentPromise, lastArguments) => {
        pendingPromise = promiseFunction.apply(this, lastArguments)
        lastArguments = null

        pendingPromise.then((val) => {
            currentPromise.resolve(val)
            pendingPromise = null
            executeNextPromise()
        }, (err) => {
            currentPromise.reject(err)
            pendingPromise = null
            executeNextPromise()
        })

    }

    return function(...args): Promise<T> {
        
        let resolve = null
        let reject = null
        const promise = new Promise<T>(function () {
            resolve = arguments[0]
            reject = arguments[1]
        });

        const deferredPromise = {
            resolve: resolve,
            reject: reject,
            promise: promise
        }

        lastArguments = args
        queuedPromises.push(deferredPromise)

        executeNextPromise()

        return promise
    }
}
