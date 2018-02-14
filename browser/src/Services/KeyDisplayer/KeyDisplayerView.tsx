/**
 * KeyDisplayer
 *
 * Utility for showing keys while typing
 */

import * as React from "react"
import { connect } from "react-redux"
import styled from "styled-components"

const KeyHeight = 50
const Margin = 10

const KeyWrapper = styled.div`
    position: absolute;
    right: 50px;
    background-color: rgba(0, 0, 0, 0.2);
    padding: 0px 30px;
    height: ${KeyHeight}px;
    line-height: ${KeyHeight}px;
    font-size: 2em;
    font-weight: bold;
    color: white;
`

import { getGroupedKeys, IKeyPressInfo, KeyDisplayerState } from "./KeyDisplayerStore"

export interface IKeyDisplayerViewProps {
    groupedKeys: IKeyPressInfo[][]
}

const getStringForKey = (key: string) => {
    if (key === "<space>") {
        return " "
    }

    return key
}

export class KeyDisplayerView extends React.PureComponent<IKeyDisplayerViewProps, {}> {
    public render(): JSX.Element {
        const keyElements = this.props.groupedKeys.map((k, idx) => (
            <KeyWrapper style={{ bottom: KeyHeight + (KeyHeight + Margin) * idx + "px" }}>
                {k.reduce<string>(
                    (prev: string, cur: IKeyPressInfo) => prev + getStringForKey(cur.key),
                    "",
                )}
            </KeyWrapper>
        ))

        return <div>{keyElements}</div>
    }
}

export const mapStateToProps = (state: KeyDisplayerState): IKeyDisplayerViewProps => ({
    groupedKeys: getGroupedKeys(state.currentTime, state.keys),
})

export const KeyDisplayerContainer = connect(mapStateToProps)(KeyDisplayerView)
