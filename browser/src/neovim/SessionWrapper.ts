import * as Q from "q"

export class SessionWrapper {

    private _session: any

    constructor(session: any) {
        this._session = session
    }

    public invoke<T>(methodName: string, args: any[]): Q.Promise<T> {
        const allArgs = [methodName, [args]]
        return Q(this._session.request.apply(this._session, allArgs))
        // const promise = Q.ninvoke<T>(this._session, "request", methodName, args)

        // PromiseHelper.wrapPromiseAndNotifyError<T>("neovim.request." + methodName, promise)

        // return promise
    }
}
