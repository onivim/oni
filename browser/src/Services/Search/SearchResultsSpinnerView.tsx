/**
 * Search/index.tsx
 *
 * Entry point for search-related features
 */

import * as React from "react"

import { IDisposable, IEvent } from "oni-types"

import styled, { keyframes } from "styled-components"

import { withProps } from "./../../UI/components/common"
import { Icon, IconSize } from "./../../UI/Icon"

export interface ISearchResultSpinnerViewProps {
    onSearchStarted: IEvent<void>
    onSearchFinished: IEvent<void>
}

export interface ISearchResultSpinnerViewState {
    isActive: boolean
}

const SpinnerWrapper = withProps<{ isActive: boolean }>(styled.div)`
    opacity: ${props => (props.isActive ? "0.5" : "0")};
    transition: opacity 0.5s ease-in;

    width: 100%;
    min-height: 5em;

    display: flex;
    justify-content: center;
    align-items: center;

    position: relative;
`

const RotateKeyFrames = keyframes`
    0% { transform: rotateZ(0deg); }
    100% { transform: rotateZ(360deg); }
`

const SpinnerRotator = styled.div`
    animation: ${RotateKeyFrames} 0.5s linear infinite;
    transform-origin: center;
`

export class SearchResultSpinnerView extends React.PureComponent<
    ISearchResultSpinnerViewProps,
    ISearchResultSpinnerViewState
> {
    private _subscriptions: IDisposable[] = []

    constructor(props: ISearchResultSpinnerViewProps) {
        super(props)

        this.state = {
            isActive: false,
        }
    }

    public componentDidMount(): void {
        this._cleanExistingSubscriptions()

        const s1 = this.props.onSearchStarted.subscribe(() => this.setState({ isActive: true }))
        const s2 = this.props.onSearchFinished.subscribe(() => this.setState({ isActive: false }))

        this._subscriptions = [s1, s2]
    }

    public componentWillUnmount(): void {
        this._cleanExistingSubscriptions()
    }

    private _cleanExistingSubscriptions(): void {
        this._subscriptions.forEach(s => s.dispose())
        this._subscriptions = []
    }

    public render(): JSX.Element {
        return (
            <SpinnerWrapper isActive={this.state.isActive}>
                <SpinnerRotator>
                    <Icon name={"circle-o-notch"} size={IconSize.ThreeX} />
                </SpinnerRotator>
            </SpinnerWrapper>
        )
    }
}
