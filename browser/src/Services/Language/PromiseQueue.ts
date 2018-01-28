import * as Log from "./../../Log"

export class PromiseQueue {
    private _currentPromise: Promise<any> = Promise.resolve(null)

    public enqueuePromise<T>(
        functionThatReturnsPromiseOrThenable: () => Promise<T> | Thenable<T>,
        requireConnection: boolean = true,
    ): Promise<T> {
        const promiseExecutor = () => {
            return functionThatReturnsPromiseOrThenable()
        }

        const newPromise = this._currentPromise.then(
            () => promiseExecutor(),
            err => {
                Log.error(err)
                return promiseExecutor()
            },
        )

        this._currentPromise = newPromise
        return newPromise
    }
}
