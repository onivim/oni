/**
 * Sneakable
 *
 * Helper for easily integrating 'sneak mode' with UI elements
 */

import * as React from "react"

import { Shapes } from "oni-api"
import { IDisposable } from "oni-types"

import { /* SneakProvider, Sneak,*/ getInstance as getSneak } from "./../../Services/Sneak"

import { EmptyArray } from "./../../Utility"

export interface ISneakableProps {
    tag?: string
    callback?: (evt?: any) => void
    tag?: string
}

export class Sneakable extends React.PureComponent<ISneakableProps, {}> {
    private _subscription: IDisposable
    private _element: HTMLDivElement = null

    public componentDidMount() {
        this._cleanupSubscription()

        this._subscription = getSneak().addSneakProvider(async () => {
            if (this._element) {
                const rect = this._element.getBoundingClientRect()

                return [
                    {
                        callback: this.props.callback
                            ? this.props.callback
                            : () => this._element.click(),
                        rectangle: Shapes.Rectangle.create(
                            rect.left,
                            rect.top,
                            rect.width,
                            rect.height,
                        ),
                        tag: this.props.tag || null,
                    },
                ]
            } else {
                return EmptyArray
            }
        })
    }

    public componentWillUnmount(): void {
        this._cleanupSubscription()
    }

    public _cleanupSubscription(): void {
        if (this._subscription) {
            this._subscription.dispose()
            this._subscription = null
        }
    }

    public render(): JSX.Element {
        return <div ref={elem => (this._element = elem)}>{this.props.children}</div>
    }
}
