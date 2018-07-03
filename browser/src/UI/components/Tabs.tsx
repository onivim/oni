/**
 * Tabs.tsx
 */

import * as path from "path"

import * as React from "react"
import { connect } from "react-redux"

import classNames from "classnames"
import { keyframes } from "styled-components"

import * as BufferSelectors from "./../../Editor/NeovimEditor/NeovimEditorSelectors"
import * as State from "./../../Editor/NeovimEditor/NeovimEditorStore"

import { addDefaultUnitIfNeeded } from "./../../Font"

import { Sneakable } from "./../../UI/components/Sneakable"
import { Icon } from "./../../UI/Icon"
import { styled } from "./../components/common"

import { FileIcon } from "./../../Services/FileIcon"

import { configuration } from "./../../Services/Configuration"

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
    onTabSelect?: (id: number) => void
    onTabClose?: (id: number) => void

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

const InnerName = styled.span`
    max-width: 20em;
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
                    onSelect={this.props.onTabSelect}
                    onClose={this.props.onTabClose}
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
}

export interface ITabPropsWithClick extends ITabProps {
    onSelect: (id: number) => void
    onClose: (id: number) => void

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

interface IChromeDivElement extends HTMLDivElement {
    scrollIntoViewIfNeeded: (args: { behavior: string; block: string; inline: string }) => void
}

export class Tab extends React.PureComponent<ITabPropsWithClick> {
    private _tab: IChromeDivElement

    public componentDidUpdate() {
        this._checkIfShouldScroll()
    }

    public componentDidMount(): void {
        this._checkIfShouldScroll()
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

        const handleTitleClick = this._handleTitleClick.bind(this)
        const handleCloseButtonClick = this._handleCloseButtonClick.bind(this)

        const userColor = configuration.getValue("editor.dirtyMarker.userColor")
        const DirtyMarker = styled<{ userColor?: string }, "div">("div")`
            width: 8px;
            height: 8px;
            border-radius: 4px;
            background-color: ${props => props.userColor || props.theme.foreground};
        `

        return (
            <Sneakable callback={() => this.props.onSelect(this.props.id)} tag={this.props.name}>
                <TabWrapper
                    innerRef={(e: IChromeDivElement) => (this._tab = e)}
                    className={cssClasses}
                    title={this.props.description}
                    style={style}
                >
                    <div className="corner" onMouseDown={handleTitleClick}>
                        <FileIcon
                            fileName={this.props.iconFileName}
                            isLarge={true}
                            playAppearAnimation={true}
                        />
                    </div>
                    <div className="name" onMouseDown={handleTitleClick}>
                        <InnerName>{this.props.name}</InnerName>
                    </div>
                    <div className="corner enable-hover" onClick={handleCloseButtonClick}>
                        <div className="icon-container x-icon-container">
                            <Icon name="times" />
                        </div>
                        <div className="icon-container circle-icon-container">
                            <DirtyMarker userColor={userColor} />
                        </div>
                    </div>
                </TabWrapper>
            </Sneakable>
        )
    }

    private _checkIfShouldScroll(): void {
        if (this.props.isSelected && this._tab) {
            if (this._tab.scrollIntoViewIfNeeded) {
                this._tab.scrollIntoViewIfNeeded({
                    behavior: "smooth",
                    block: "center",
                    inline: "center",
                })
            }
        }
    }

    private _handleTitleClick(event: React.MouseEvent<HTMLElement>): void {
        if (this._isLeftClick(event)) {
            this.props.onSelect(this.props.id)
        } else if (this._isMiddleClick(event)) {
            this.props.onClose(this.props.id)
        }
    }

    private _handleCloseButtonClick(): void {
        this.props.onClose(this.props.id)
    }

    private _isMiddleClick(event: React.MouseEvent<HTMLElement>): boolean {
        return event.button === 1
    }

    private _isLeftClick(event: React.MouseEvent<HTMLElement>): boolean {
        return event.button === 0
    }
}

export const getTabName = (name: string, isDuplicate?: boolean): string => {
    if (!name) {
        return "[No Name]"
    }

    const filename = path.basename(name)
    if (isDuplicate) {
        const folderAndFile = name
            .split(path.sep)
            .slice(-2)
            .join(path.sep)
        return folderAndFile
    }

    return filename
}

import { createSelector } from "reselect"

const getTabState = (state: State.IState) => state.tabState

const sanitizedModeForColors = (mode: string): string => {
    switch (mode) {
        case "showmatch":
            return "insert"
        case "cmdline_normal":
            return "normal"
        default:
            return mode
    }
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

export const checkTabBuffers = (buffersInTabs: number[], buffers: State.IBuffer[]): boolean => {
    const tabBufs = buffers.filter(buf => buffersInTabs.find(tabBuf => tabBuf === buf.id))

    return tabBufs.some(buf => buf.modified)
}

export const checkDuplicate = (current: string, names: string[]) =>
    names.filter((name: string) => path.basename(name) === path.basename(current)).length > 1

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
        const names = allBuffers.map((b: any) => b.file)
        const tabs = allBuffers.map((buf: any, idx: number, buffers: any): ITabProps => {
            const isDuplicate = checkDuplicate(buf.file, names)
            const isActive =
                (activeBufferId !== null && buf.id === activeBufferId) || bufferCount === 1
            return {
                id: buf.id,
                name: getIdPrefix(buf.id, shouldShowId) + getTabName(buf.file, isDuplicate),
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
    [
        getTabState,
        getHighlightColor,
        showTabId,
        shouldShowFileIcon,
        BufferSelectors.getBufferMetadata,
    ],
    (
        tabState: State.ITabState,
        color: any,
        shouldShowId: boolean,
        showFileIcon: boolean,
        allBuffers: State.IBuffer[],
    ) => {
        return tabState.tabs.map((t: State.ITab, idx: number) => ({
            id: idx + 1,
            name: getIdPrefix((idx + 1).toString(), shouldShowId) + getTabName(t.name),
            highlightColor: t.id === tabState.selectedTabId ? color : "transparent",
            iconFileName: showFileIcon ? getTabName(t.name) : "",
            isSelected: t.id === tabState.selectedTabId,
            isDirty: checkTabBuffers(t.buffersInTab, allBuffers),
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
        onTabSelect: selectFunc,
        onTabClose: closeFunc,
        height,
        maxWidth,
        shouldWrap,
        visible,
        tabs,
    }
}

export const TabsContainer = connect(mapStateToProps)(Tabs)
