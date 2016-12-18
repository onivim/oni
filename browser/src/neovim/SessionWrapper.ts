import * as Q from "q"

import * as PromiseHelper from "./../PromiseHelper"

export class SessionWrapper {

    private _session: any

    constructor(session: any) {
        this._session = session
    }

    public invoke<T>(methodName: string, args: any[]): Q.Promise<T> {
        const promise = Q.ninvoke<T>(this._session, "request", methodName, args)

        PromiseHelper.wrapPromiseAndNotifyError<T>("neovim.request." + methodName, promise)

        return promise
    }
}
