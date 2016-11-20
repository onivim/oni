"use strict";
function debounce(promiseFunction) {
    let lastArguments = null;
    let pendingPromise = null;
    let queuedPromises = [];
    const executeNextPromise = () => {
        if (!pendingPromise && queuedPromises.length > 0) {
            for (var i = 0; i < queuedPromises.length - 1; i++) {
                queuedPromises[i].reject(new Error("Preempted"));
            }
            const currentPromise = queuedPromises[queuedPromises.length - 1];
            queuedPromises = [];
            runPromiseFunction(currentPromise, lastArguments);
        }
    };
    const runPromiseFunction = (currentPromise, lastArguments) => {
        pendingPromise = promiseFunction.apply(this, lastArguments);
        lastArguments = null;
        pendingPromise.then((val) => {
            currentPromise.resolve(val);
            pendingPromise = null;
            executeNextPromise();
        }, (err) => {
            currentPromise.reject(err);
            pendingPromise = null;
            executeNextPromise();
        });
    };
    return function (...args) {
        let resolve = null;
        let reject = null;
        const promise = new Promise(function () {
            resolve = arguments[0];
            reject = arguments[1];
        });
        const deferredPromise = {
            resolve: resolve,
            reject: reject,
            promise: promise
        };
        lastArguments = args;
        queuedPromises.push(deferredPromise);
        executeNextPromise();
        return promise;
    };
}
exports.debounce = debounce;
//# sourceMappingURL=PromiseDebouncer.js.map