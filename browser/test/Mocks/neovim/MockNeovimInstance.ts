/**
 * Mocks/neovim/MockNeovimInstance.ts
 *
 * Implementations of test mocks and doubles,
 * for Neovim facing classes / interfaces.
 */

import * as Utility from "./../../../src/Utility"

export interface NeovimRequest {
    requestName: string
    args: any[]
}

export class MockNeovimInstance {
    private _requests: NeovimRequest[] = []
    private _pendingPromises: Utility.ICompletablePromise<any>[] = []

    public request(requestName: string, args: any[]) {
        this._requests.push({ requestName, args })
        const promise = Utility.createCompletablePromise()
        this._pendingPromises.push(promise)

        return promise.promise
    }

    public getPendingRequests(): NeovimRequest[] {
        return this._requests
    }

    public flushPendingRequests(): void {
        this._pendingPromises.forEach(p => p.resolve())
        this._requests = []
        this._pendingPromises = []
    }
}
