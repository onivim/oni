/**
 * PureComponentWithDisposeTracking.tsx
 *
 * Component to assist with bookkeeping disposables and managing their lifecycle
 */

import * as React from "react"

import { IDisposable } from "oni-types"

export class PureComponentWithDisposeTracking<TProps, TState> extends React.PureComponent<
    TProps,
    TState
> {
    private _subscriptions: IDisposable[] = []

    public componentDidMount(): void {
        this._cleanExistingSubscriptions()
    }

    public componentWillUnmount(): void {
        this._cleanExistingSubscriptions()
    }

    protected trackDisposable(disposable: IDisposable): void {
        this._subscriptions.push(disposable)
    }

    private _cleanExistingSubscriptions(): void {
        this._subscriptions.forEach(s => s.dispose())
        this._subscriptions = []
    }
}
