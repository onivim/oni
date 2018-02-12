/**
 * Tabs.tsx
 */

import * as path from "path"

import * as React from "react"
import { connect } from "react-redux"

import * as classNames from "classnames"
import { keyframes } from "styled-components"

import * as BufferSelectors from "./../../Editor/NeovimEditor/NeovimEditorSelectors"
import * as State from "./../../Editor/NeovimEditor/NeovimEditorStore"

import { addDefaultUnitIfNeeded } from "./../../Font"

import { Sneakable } from "./../../UI/components/Sneakable"
import { Icon } from "./../../UI/Icon"
import { styled, withProps } from "./../components/common"

import { FileIcon } from "./../../Services/FileIcon"

export interface ITabProps {
    id: number
    name: string
    description: string
    isSelected: boolean
    isDirty: boolean
    iconFileName?: string
    highlightColor?: string
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

    shouldWrap: boolean
    maxWidth: string
    height: string

    fontFamily: string
    fontSize: string
}

const InnerName = withProps<{ isLong?: boolean }>(styled.span)`
    ${p => p.isLong && `width: 250px;`};
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
`

export class Tabs extends React.PureComponent<ITabsProps, {}> {
    public render(): JSX.Element {
        if (!this.props.visible) {
            return null
        }

        const wrapStyle: React.CSSProperties = {
            flexWrap: "wrap",
        }

        const overflowStyle = this.props.shouldWrap ? wrapStyle : {}

        const tabBorderStyle: React.CSSProperties = {
            ...overflowStyle,
            borderBottom: `4px solid ${this.props.backgroundColor}`,
            fontFamily: this.props.fontFamily,
            fontSize: this.props.fontSize,
        }

        const tabs = this.props.tabs.map(t => {
            return (
                <Tab
                    key={t.id}
                    {...t}
                    onClickName={() => this._onSelect(t.id)}
                    onClickClose={() => this._onClickClose(t.id)}
                    backgroundColor={this.props.backgroundColor}
                    foregroundColor={this.props.foregroundColor}
                    height={this.props.height}
                    maxWidth={this.props.maxWidth}
                />
            )
        })

        return (
            <div className="tabs horizontal enable-mouse layer" style={tabBorderStyle}>
                {tabs}
            </div>
        )
    }

    private _onSelect(id: number): void {
        this.props.onSelect(id)
    }

    private _onClickClose(id: number): void {
        this.props.onClose(id)
    }
}

export interface ITabPropsWithClick extends ITabProps {
    onClickName: () => void
    onClickClose: () => void

    backgroundColor: string
    foregroundColor: string

    height: string
    maxWidth: string
}

const TabEntranceKeyFrames = keyframes`
    0% { transform: translateY(-3px) rotateX(-20deg); }
    100% { transform: translateY(0px) rotateX(0deg); }
`

const TabWrapper = styled.div`
    animation: ${TabEntranceKeyFrames} 0.1s ease-in forwards;
`

export class Tab extends React.Component<ITabPropsWithClick> {
    private _tab: HTMLDivElement
    public componentWillReceiveProps(next: ITabPropsWithClick) {
        if (next.isSelected && this._tab) {
            this._tab.scrollIntoView({ behavior: "smooth", block: "center", inline: "center" })
        }
    }
    public render() {
        const cssClasses = classNames("tab", {
            selected: this.props.isSelected,
            "not-selected": !this.props.isSelected,
            "is-dirty": this.props.isDirty,
            "not-dirty": !this.props.isDirty,
        })

        const style: React.CSSProperties = {
            backgroundColor: this.props.backgroundColor,
            color: this.props.foregroundColor,
            maxWidth: this.props.maxWidth,
            height: this.props.height,
            borderTop: "2px solid " + this.props.highlightColor,
        }

        return (
            <Sneakable callback={() => this.props.onClickName()}>
                <TabWrapper
                    innerRef={(e: HTMLDivElement) => (this._tab = e)}
                    className={cssClasses}
                    title={this.props.description}
                    style={style}
                >
                    <div className="corner" onClick={this.props.onClickName}>
                        <FileIcon
                            fileName={this.props.iconFileName}
                            isLarge={true}
                            additionalClassNames={"file-icon-appear-animation"}
                        />
                    </div>
                    <div className="name" onClick={this.props.onClickName}>
                        <InnerName isLong={this.props.name.length > 50}>
                            {this.props.name}
                        </InnerName>
                    </div>
                    <div className="corner enable-hover" onClick={this.props.onClickClose}>
                        <div className="icon-container x-icon-container">
                            <Icon name="times" />
                        </div>
                        <div className="icon-container circle-icon-container">
                            <div className="circle" />
                        </div>
                    </div>
                </TabWrapper>
            </Sneakable>
        )
    }
}

const getTabName = (name: string): string => {
    if (!name) {
        return "[No Name]"
    }

    return path.basename(name)
}

import { createSelector } from "reselect"

const getTabState = (state: State.IState) => state.tabState

const sanitizedModeForColors = (mode: string): string => {
    if (mode === "showmatch") {
        return "insert"
    }

    return mode
}

export const getHighlightColor = (state: State.IState) => {
    if (!state.configuration["tabs.highlight"] || !state.hasFocus) {
        return "transparent"
    }

    const sanitizedMode = sanitizedModeForColors(state.mode)
    const colorForMode = "highlight.mode." + sanitizedMode + ".background"
    const color = state.colors[colorForMode]
    return color || "transparent"
}

export const showTabId = (state: State.IState) => {
    return state.configuration["tabs.showIndex"]
}

export const getIdPrefix = (id: string, shouldShow: boolean): string => {
    return shouldShow ? id + ": " : ""
}

export const shouldShowFileIcon = (state: State.IState): boolean => {
    return state.configuration["tabs.showFileIcon"]
}

const getTabsFromBuffers = createSelector(
    [
        BufferSelectors.getBufferMetadata,
        BufferSelectors.getActiveBufferId,
        getHighlightColor,
        showTabId,
        shouldShowFileIcon,
    ],
    (
        allBuffers: any,
        activeBufferId: any,
        color: string,
        shouldShowId: boolean,
        showFileIcon: boolean,
    ) => {
        const bufferCount = allBuffers.length
        const tabs = allBuffers.map((buf: any): ITabProps => {
            const isActive =
                (activeBufferId !== null && buf.id === activeBufferId) || bufferCount === 1
            return {
                id: buf.id,
                name: getIdPrefix(buf.id, shouldShowId) + getTabName(buf.file),
                iconFileName: showFileIcon ? getTabName(buf.file) : "",
                highlightColor: isActive ? color : "transparent",
                isSelected: isActive,
                isDirty: buf.modified,
                description: buf.file,
            }
        })
        return tabs.sort(({ id: prevId }: ITabProps, { id: nextId }: ITabProps) => prevId - nextId)
    },
)

const getTabsFromVimTabs = createSelector(
    [getTabState, getHighlightColor, showTabId, shouldShowFileIcon],
    (tabState: any, color: any, shouldShowId: boolean, showFileIcon: boolean) => {
        return tabState.tabs.map((t: any, idx: number) => ({
            id: t.id,
            name: getIdPrefix((idx + 1).toString(), shouldShowId) + getTabName(t.name),
            highlightColor: t.id === tabState.selectedTabId ? color : "transparent",
            iconFileName: showFileIcon ? getTabName(t.name) : "",
            isSelected: t.id === tabState.selectedTabId,
            isDirty: false,
            description: t.name,
        }))
    },
)

const mapStateToProps = (state: State.IState, ownProps: ITabContainerProps): ITabsProps => {
    const oniTabMode = state.configuration["tabs.mode"]
    const shouldUseVimTabs = oniTabMode === "tabs"

    const tabs = shouldUseVimTabs ? getTabsFromVimTabs(state) : getTabsFromBuffers(state)

    const visible = oniTabMode !== "native" && oniTabMode !== "hidden"

    const height = state.configuration["tabs.height"]
    const maxWidth = state.configuration["tabs.maxWidth"]
    const shouldWrap = state.configuration["tabs.wrap"]

    const selectFunc = shouldUseVimTabs ? ownProps.onTabSelect : ownProps.onBufferSelect
    const closeFunc = shouldUseVimTabs ? ownProps.onTabClose : ownProps.onBufferClose

    return {
        fontFamily: state.configuration["ui.fontFamily"],
        fontSize: addDefaultUnitIfNeeded(state.configuration["ui.fontSize"]),
        backgroundColor: state.colors["tabs.background"],
        foregroundColor: state.colors["tabs.foreground"],
        onSelect: selectFunc,
        onClose: closeFunc,
        height,
        maxWidth,
        shouldWrap,
        visible,
        tabs,
    }
}

export const TabsContainer = connect(mapStateToProps)(Tabs)
