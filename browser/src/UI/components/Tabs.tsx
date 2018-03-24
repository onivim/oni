/**
 * Tabs.tsx
 */

import * as path from "path"

import * as React from "react"
import { connect } from "react-redux"

import { keyframes } from "styled-components"

import * as BufferSelectors from "./../../Editor/NeovimEditor/NeovimEditorSelectors"
import * as State from "./../../Editor/NeovimEditor/NeovimEditorStore"

import { addDefaultUnitIfNeeded } from "./../../Font"

import { Sneakable } from "./../../UI/components/Sneakable"
import { Icon } from "./../../UI/Icon"
import {
    boxShadowUp,
    boxShadowUpInset,
    css,
    enableMouse,
    IThemeColors,
    layer,
    styled,
    withProps,
} from "./../components/common"

import { FileIcon } from "./../../Services/FileIcon"

export interface ITabProps {
    id: number
    name: string
    description: string
    isSelected: boolean
    isDirty: boolean
    iconFileName?: string
}

export interface ITabContainerProps {
    onBufferSelect?: (bufferId: number) => void
    onBufferClose?: (bufferId: number) => void

    onTabSelect?: (tabId: number) => void
    onTabClose?: (tabId: number) => void
}

const InnerName = withProps<{ isLong?: boolean }>(styled.span)`
    ${p => p.isLong && `width: 250px;`};
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
`

interface ITabsWrapperProps {
    fontFamily: string
    fontSize: string
    shouldWrap: boolean
}

const TabsWrapper = withProps<ITabsWrapperProps>(styled.div)`
    ${enableMouse};
    ${layer};

    display: flex;
    flex-direction: row;
    ${props => (props.shouldWrap ? "flex-wrap: wrap;" : "")}
    align-items: flex-end;

    width: 100%;
    overflow-x: hidden;

    border-bottom: 4px solid ${props => props.theme["tabs.background"]};
    font-family: ${props => props.fontFamily};
    font-size: ${props => props.fontSize};

    transform: translateY(-3px);
    transition: transform 0.25s ease;

    .loaded & {
        transform: translateY(0px);
    }

    &:hover {
        overflow-x: overlay;
    }

    &::-webkit-scrollbar {
        height: 3px;
    }
`

export interface ITabsProps {
    onSelect?: (id: number) => void
    onClose?: (id: number) => void

    visible: boolean
    tabs: ITabProps[]

    shouldWrap: boolean
    maxWidth: string
    height: string
    mode: string
    shouldShowHighlight: boolean

    fontFamily: string
    fontSize: string
}

export class Tabs extends React.PureComponent<ITabsProps, {}> {
    public render(): JSX.Element {
        if (!this.props.visible) {
            return null
        }

        const tabs = this.props.tabs.map(t => {
            return (
                <Tab
                    key={t.id}
                    {...t}
                    onClickName={() => this._onSelect(t.id)}
                    onClickClose={() => this._onClickClose(t.id)}
                    height={this.props.height}
                    maxWidth={this.props.maxWidth}
                    mode={this.props.mode}
                    shouldShowHighlight={this.props.shouldShowHighlight}
                />
            )
        })

        return (
            <TabsWrapper
                fontFamily={this.props.fontFamily}
                fontSize={this.props.fontSize}
                shouldWrap={this.props.shouldWrap}
            >
                {tabs}
            </TabsWrapper>
        )
    }

    private _onSelect(id: number): void {
        this.props.onSelect(id)
    }

    private _onClickClose(id: number): void {
        this.props.onClose(id)
    }
}

const Name = styled.div`
    flex: 1 1 auto;
    text-align: center;
    height: 100%;

    display: flex;
    justify-content: center;
    align-items: center;
    margin: 0px 4px;
`

const Corner = withProps<{ isHoverEnabled?: boolean }>(styled.div)`
    flex: 0 0 auto;
    width: 32px;
    height: 100%;

    display: flex;
    align-items: center;
    justify-content: center;

    position: relative;

    ${props =>
        props.isHoverEnabled
            ? `
                &:hover {
                    background-color: rgba(100, 100, 100, 0.1);
                }
            `
            : ""}
`

const Circle = styled.div`
    width: 8px;
    height: 8px;
    border-radius: 4px;
    background-color: #c8c8c8;
`

const tabEntranceKeyFrames = keyframes`
    0% { transform: translateY(-3px) rotateX(-20deg); }
    100% { transform: translateY(0px) rotateX(0deg); }
`

const sanitizedModeForColors = (mode: string): string => {
    if (mode === "showmatch") {
        return "insert"
    }

    return mode
}

export const getHighlightColor = (theme: IThemeColors, mode: string) => {
    const sanitizedMode = sanitizedModeForColors(mode)
    return theme[`highlight.mode${sanitizedMode}.background`]
}

interface ITabWrapperProps {
    isSelected: boolean
    isDirty: boolean
    height: string
    maxWidth: string
    mode: string
    shouldShowHighlight: boolean
}

const TabWrapper = withProps<ITabWrapperProps>(styled.div)`
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    cursor: pointer;

    flex: 0 0 auto;
    max-width: ${props => props.maxWidth};
    height: ${props => props.height};

    ${props => `
        background-color: ${props.theme["tabs.background"]};
        color: ${props.theme["tabs.foreground"]};
    `}
    transition: opacity 0.25s;

    overflow: hidden;
    user-select: none;
    animation: ${tabEntranceKeyFrames} 0.1s ease-in forwards;

    ${props =>
        props.isSelected
            ? `
                ${
                    props.shouldShowHighlight
                        ? `border-top: 2px solid ${getHighlightColor(props.theme, props.mode)};`
                        : ""
                }
                ${boxShadowUp};
                opacity: 1;
            `
            : `
                ${boxShadowUpInset};
                opacity: 0.6;

                &:hover {
                    opacity: 0.9;
                }
            `}
`

const tabIconAppearKeyframes = keyframes`
    0% {
        transform: scale(0.5);
    }
    50% {
        transform: scale(1.25);
    }
    100% {
        transform: scale(1);
    }
`

const tabIconAppearAnimation = css`
    animation-name: ${tabIconAppearKeyframes};
    animation-duration: 0.6s;
    animation-timing-function: ease-in;
    animation-fill-mode: forwards;
    opacity: 1;
`

interface IIconContainerProps {
    isVisibleByDefault: boolean
    isVisibleOnTabHover?: boolean
}

const IconContainer = withProps<IIconContainerProps>(styled.div)`
    position: absolute;
    top: 0px;
    left: 0px;
    right: 0px;
    bottom: 0px;

    display: flex;
    justify-content: center;
    align-items: center;

    opacity: 0;
    transition: opacity 0.25s ease-out;

    ${props => (props.isVisibleByDefault ? tabIconAppearAnimation : "")}

    ${props =>
        props.isVisibleOnTabHover
            ? css`
                  ${TabWrapper}:hover & {
                      ${tabIconAppearAnimation};
                  }
              `
            : ""}
`

export interface ITabPropsWithClick extends ITabProps {
    onClickName: () => void
    onClickClose: () => void

    height: string
    maxWidth: string
    mode: string
    shouldShowHighlight: boolean
}

export class Tab extends React.Component<ITabPropsWithClick> {
    private _tab: HTMLDivElement
    public componentWillReceiveProps(next: ITabPropsWithClick) {
        if (next.isSelected && this._tab) {
            const anyTab = this._tab as any
            if (anyTab.scrollIntoViewIfNeeded) {
                anyTab.scrollIntoViewIfNeeded({
                    behavior: "smooth",
                    block: "center",
                    inline: "center",
                })
            }
        }
    }
    public render() {
        return (
            <Sneakable callback={() => this.props.onClickName()}>
                <TabWrapper
                    innerRef={(e: HTMLDivElement) => (this._tab = e)}
                    title={this.props.description}
                    height={this.props.height}
                    maxWidth={this.props.maxWidth}
                    mode={this.props.mode}
                    shouldShowHighlight={this.props.shouldShowHighlight}
                    isSelected={this.props.isSelected}
                    isDirty={this.props.isDirty}
                >
                    <Corner onClick={this.props.onClickName}>
                        <FileIcon
                            fileName={this.props.iconFileName}
                            isLarge={true}
                            playAppearAnimation={true}
                        />
                    </Corner>
                    <Name onClick={this.props.onClickName}>
                        <InnerName isLong={this.props.name.length > 50}>
                            {this.props.name}
                        </InnerName>
                    </Name>
                    <Corner isHoverEnabled={true} onClick={this.props.onClickClose}>
                        <IconContainer isVisibleByDefault={false} isVisibleOnTabHover={true}>
                            <Icon name="times" />
                        </IconContainer>
                        <IconContainer isVisibleByDefault={this.props.isDirty}>
                            <Circle />
                        </IconContainer>
                    </Corner>
                </TabWrapper>
            </Sneakable>
        )
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
        showTabId,
        shouldShowFileIcon,
    ],
    (allBuffers: any, activeBufferId: any, shouldShowId: boolean, showFileIcon: boolean) => {
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
                isSelected: isActive,
                isDirty: buf.modified,
                description: buf.file,
            }
        })
        return tabs.sort(({ id: prevId }: ITabProps, { id: nextId }: ITabProps) => prevId - nextId)
    },
)

const getTabsFromVimTabs = createSelector(
    [getTabState, showTabId, shouldShowFileIcon, BufferSelectors.getBufferMetadata],
    (
        tabState: State.ITabState,
        shouldShowId: boolean,
        showFileIcon: boolean,
        allBuffers: State.IBuffer[],
    ) => {
        return tabState.tabs.map((t: State.ITab, idx: number) => ({
            id: idx + 1,
            name: getIdPrefix((idx + 1).toString(), shouldShowId) + getTabName(t.name),
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
    const mode = state.mode
    const shouldShowHighlight = state.configuration["tabs.highlight"] && state.hasFocus

    const selectFunc = shouldUseVimTabs ? ownProps.onTabSelect : ownProps.onBufferSelect
    const closeFunc = shouldUseVimTabs ? ownProps.onTabClose : ownProps.onBufferClose

    return {
        fontFamily: state.configuration["ui.fontFamily"],
        fontSize: addDefaultUnitIfNeeded(state.configuration["ui.fontSize"]),
        onSelect: selectFunc,
        onClose: closeFunc,
        height,
        maxWidth,
        shouldWrap,
        mode,
        shouldShowHighlight,
        visible,
        tabs,
    }
}

export const TabsContainer = connect(mapStateToProps)(Tabs)
