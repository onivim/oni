/**
 * Tabs.tsx
 */

import * as path from "path"

import * as React from "react"
import { connect } from "react-redux"

import * as classNames from "classnames"

import * as Selectors from "./../Selectors"
import * as State from "./../State"

import { Icon } from "./../Icon"

require("./Tabs.less") // tslint:disable-line no-var-requires

export interface ITabProps {
    id: number
    name: string
    description: string
    isSelected: boolean
    isDirty: boolean
}

export interface ITabContainerProps {
    onBufferSelect?: (bufferId: number) => void
    onBufferClose?: (bufferId: number) => void

    onTabSelect?: (tabId: number) => void
    onTabClose?: (tabId: number) => void
}

export interface ITabsProps {
    onSelect?: (id: number) => void
    onClose?: (id: number) => void

    visible: boolean
    tabs: ITabProps[]

    backgroundColor: string
    foregroundColor: string
}

export class Tabs extends React.PureComponent<ITabsProps, void> {
    public render(): JSX.Element {
        if (!this.props.visible) {
            return null
        }

        const tabBorderStyle = {
            "borderBottom": `4px solid ${this.props.backgroundColor}`,
        }

        const tabs = this.props.tabs.map((t) => {
            return <Tab
                key={t.id}
                {...t}
                onClickName={() => this._onSelect(t.id)}
                onClickClose={() => this._onClickClose(t.id)}
                backgroundColor={this.props.backgroundColor}
                foregroundColor={this.props.foregroundColor}
            />
        })

        return <div className="tabs horizontal enable-mouse layer" style={tabBorderStyle}>
            {tabs}
        </div>
    }

    private _onSelect(id: number): void {
        this.props.onSelect(id)
    }

    private _onClickClose(id: number): void {
        this.props.onClose(id)
    }
}

export interface ITabPropsWithClick extends ITabProps {
    onClickName: React.EventHandler<React.MouseEvent<HTMLDivElement>>
    onClickClose: React.EventHandler<React.MouseEvent<HTMLDivElement>>

    backgroundColor: string
    foregroundColor: string
}

export const Tab = (props: ITabPropsWithClick) => {
    const cssClasses = classNames("tab", {
        "selected": props.isSelected,
        "not-selected": !props.isSelected,
        "is-dirty": props.isDirty,
        "not-dirty": !props.isDirty,
    })

    const style = {
        backgroundColor: props.backgroundColor,
        color: props.foregroundColor,
    }

    return <div className={cssClasses} title={props.description} style={style}>
        <div className="corner"></div>
        <div className="name" onClick={props.onClickName}>
            <span className="name-inner">
                {props.name}
            </span>
        </div>
        <div className="corner enable-hover" onClick={props.onClickClose}>
            <div className="icon-container x-icon-container">
                <Icon name="times" />
            </div>
            <div className="icon-container circle-icon-container">
                <div className="circle" />
            </div>
        </div>
    </div>
}

const getTabName = (name: string): string => {
    if (!name) {
        return "[No Name]"
    }

    return path.basename(name)
}

import { createSelector } from "reselect"

const getBufferState = (state: State.IState) => state.buffers

const getTabState = (state: State.IState) => state.tabState

const getTabsFromBuffers = createSelector(
    [getBufferState],
    (buffers) => {
        const allBuffers = Selectors.getAllBuffers(buffers)
        const tabs = allBuffers.map((buf): ITabProps => ({
            id: buf.id,
            name: getTabName(buf.file),
            isSelected: buf.id === buffers.activeBufferId,
            isDirty: buf.version > buf.lastSaveVersion,
            description: buf.file,
        }))
        return tabs
    })

const getTabsFromVimTabs = createSelector(
    [getTabState],
    (tabState) => {
        return tabState.tabs.map((t) => ({
            id: t.id,
            name: getTabName(t.name),
            isSelected: t.id === tabState.selectedTabId,
            isDirty: false,
            description: t.name,
        }))
    })

const mapStateToProps = (state: State.IState, ownProps: ITabContainerProps): ITabsProps => {

    const shouldUseVimTabs = state.configuration["tabs.showVimTabs"]

    let tabs: ITabProps[]

    if (shouldUseVimTabs) {
        tabs = getTabsFromVimTabs(state)
    } else {
        tabs = getTabsFromBuffers(state)
    }

    const visible = state.configuration["tabs.enabled"]

    const selectFunc = shouldUseVimTabs ? ownProps.onTabSelect : ownProps.onBufferSelect
    const closeFunc = shouldUseVimTabs ? ownProps.onTabClose : ownProps.onBufferClose

    return {
        backgroundColor: state.backgroundColor,
        foregroundColor: state.foregroundColor,
        onSelect: selectFunc,
        onClose: closeFunc,
        visible,
        tabs,
    }
}

export const TabsContainer = connect(mapStateToProps)(Tabs)
