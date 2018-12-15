/**
 * Tabs.tsx
 */

import * as path from "path"
import { createSelector } from "reselect"

import * as React from "react"
import { connect } from "react-redux"

import * as BufferSelectors from "./../../Editor/NeovimEditor/NeovimEditorSelectors"
import * as State from "./../../Editor/NeovimEditor/NeovimEditorStore"

import { addDefaultUnitIfNeeded } from "./../../Font"

import { Sneakable } from "./../../UI/components/Sneakable"
import { Icon } from "./../../UI/Icon"
import styled, {
    boxShadowUp,
    boxShadowUpInset,
    css,
    enableMouse,
    IThemeColors,
    keyframes,
    layer,
    scrollbarStyles,
    themeGet,
} from "./../components/common"

import { FileIcon } from "./../../Services/FileIcon"

export interface ITabProps {
    id: number
    name: string
    description: string
    isSelected: boolean
    isDirty: boolean
    iconFileName?: string
    userColor?: string
    shouldWrap?: boolean
}

export interface ITabContainerProps {
    onBufferSelect?: (bufferId: number) => void
    onBufferClose?: (bufferId: number) => void

    onTabSelect?: (tabId: number) => void
    onTabClose?: (tabId: number) => void
}

interface ITabsWrapperProps {
    fontFamily: string
    fontSize: string
    shouldWrap: boolean
}

const TabsWrapper = styled<ITabsWrapperProps, "div">("div")`
    ${enableMouse};
    ${layer};
    display: flex;
    flex-direction: row;
    ${props => props.shouldWrap && "flex-wrap: wrap"};
    align-items: flex-end;
    width: 100%;
    overflow-x: hidden;
    border-bottom: 4px solid ${themeGet("tabs.borderBottom", "tabs.background")};
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
    ${scrollbarStyles};
`

export interface ITabsProps {
    onTabSelect?: (id: number) => void
    onTabClose?: (id: number) => void

    visible: boolean
    tabs: ITabProps[]

    userColor?: string
    shouldWrap: boolean
    maxWidth: string
    height: string
    mode: string
    shouldShowHighlight: boolean

    fontFamily: string
    fontSize: string
}

const InnerName = styled.span`
    max-width: 20em;
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
`

export const Tabs: React.SFC<ITabsProps> = props => {
    if (!props.visible) {
        return null
    }

    const tabs = props.tabs.map(tab => (
        <Tab
            {...tab}
            key={tab.id}
            onClickName={() => props.onTabSelect(tab.id)}
            onClickClose={() => props.onTabClose(tab.id)}
            height={props.height}
            maxWidth={props.maxWidth}
            userColor={props.userColor}
            mode={props.mode}
            shouldShowHighlight={props.shouldShowHighlight}
        />
    ))

    return (
        <TabsWrapper
            data-id="tabs"
            fontFamily={props.fontFamily}
            fontSize={props.fontSize}
            shouldWrap={props.shouldWrap}
        >
            {tabs}
        </TabsWrapper>
    )
}

export const Name = styled.div`
    flex: 1 1 auto;
    text-align: center;
    height: 100%;

    display: flex;
    justify-content: center;
    align-items: center;
    margin: 0px 4px;
`

export const Corner = styled<{ isHoverEnabled?: boolean }, "div">("div")`
    flex: 0 0 auto;
    width: 32px;
    height: 100%;

    display: flex;
    align-items: center;
    justify-content: center;

    position: relative;

    ${({ isHoverEnabled }) =>
        isHoverEnabled &&
        ` &:hover {
            background-color: rgba(100, 100, 100, 0.1);
          }`};
`

const DirtyMarker = styled<{ userColor?: string }, "div">("div")`
    width: 8px;
    height: 8px;
    border-radius: 4px;
    background-color: ${props => props.userColor || props.theme.foreground};
`

const tabEntranceKeyFrames = keyframes`
    0% {
        transform: translateY(-3px) rotateX(-20deg);
    }
    100% {
        transform: translateY(0px) rotateX(0deg);
    }
`

interface ITabWrapperProps {
    isSelected: boolean
    isDirty: boolean
    height: string
    maxWidth: string
    mode: string
    shouldShowHighlight: boolean
}

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

export const getHighlightColor = (props: {
    isSelected: boolean
    shouldShowHighlight: boolean
    theme: IThemeColors
    mode: string
}) => {
    if (!props.shouldShowHighlight || !props.isSelected) {
        return "transparent"
    }
    const sanitizedMode = sanitizedModeForColors(props.mode)
    return props.theme[`highlight.mode.${sanitizedMode}.background`]
}

const active = css`
    ${boxShadowUp};
    opacity: 1;
`

const inactive = css`
    ${boxShadowUpInset};
    opacity: 0.6;

    &:hover {
        opacity: 0.9;
    }
`

const TabWrapper = styled<ITabWrapperProps, "div">("div")`
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    flex: 0 0 auto;
    max-width: ${props => props.maxWidth};
    height: ${props => props.height};
    transition: opacity 0.25s;
    overflow: hidden;
    user-select: none;
    animation: ${tabEntranceKeyFrames} 0.1s ease-in forwards;
    ${props => (props.isSelected ? active : inactive)};

    border-top: 2px solid ${getHighlightColor};
    background-color: ${themeGet("tabs.active.background", "tabs.background", "isSelected")};
    color: ${themeGet("tabs.active.foreground", "tabs.foreground", "isSelected")};
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

const tabHover = css`
    ${TabWrapper}:hover & {
        ${tabIconAppearAnimation};
    }
`

interface IIconContainerProps {
    isVisibleByDefault: boolean
    isVisibleOnTabHover?: boolean
}

const IconContainer = styled<IIconContainerProps, "div">("div")`
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
    ${props => (props.isVisibleByDefault ? tabIconAppearAnimation : "")};
    ${props => props.isVisibleOnTabHover && tabHover};
`

export interface ITabPropsWithClick extends ITabProps {
    onClickName: () => void
    onClickClose: () => void

    height: string
    maxWidth: string
    mode: string
    shouldShowHighlight: boolean
}

interface IScrollIntoView {
    behavior: string
    block: string
    inline: string
}

interface IChromeDivElement extends HTMLDivElement {
    scrollIntoViewIfNeeded: (args: IScrollIntoView) => void
}

export class Tab extends React.PureComponent<ITabPropsWithClick> {
    private _tab = React.createRef<IChromeDivElement>()

    public componentDidUpdate() {
        this._checkIfShouldScroll()
    }

    public componentDidMount() {
        this._checkIfShouldScroll()
    }

    // reports current state of the tab -> for testing
    public getStatus(selected: boolean, dirty: boolean) {
        const selectedState = selected ? "selected" : "not-selected"
        const dirtyState = dirty ? "is-dirty" : "not-dirty"
        return `tab-${selectedState}-${dirtyState}`
    }

    public render() {
        const {
            name,
            description,
            height,
            maxWidth,
            mode,
            isDirty,
            isSelected,
            iconFileName,
            userColor,
            onClickClose,
            onClickName,
            shouldShowHighlight,
        } = this.props

        const tabStatus = this.getStatus(isSelected, isDirty)
        return (
            <Sneakable callback={onClickName} tag={name}>
                <TabWrapper
                    mode={mode}
                    innerRef={this._tab}
                    data-status={tabStatus}
                    data-id="tab"
                    title={description}
                    height={height}
                    maxWidth={maxWidth}
                    isDirty={isDirty}
                    isSelected={isSelected}
                    shouldShowHighlight={shouldShowHighlight}
                >
                    <Corner data-id="tab-icon-corner" onMouseDown={this.handleTitleClick}>
                        <FileIcon
                            fileName={iconFileName}
                            isLarge={true}
                            playAppearAnimation={true}
                        />
                    </Corner>
                    <Name onMouseDown={this.handleTitleClick}>
                        <InnerName>{name}</InnerName>
                    </Name>
                    <Corner data-id="tab-close-button" isHoverEnabled onClick={onClickClose}>
                        <IconContainer isVisibleByDefault={false} isVisibleOnTabHover>
                            <Icon name="times" />
                        </IconContainer>
                        <IconContainer isVisibleByDefault={isDirty}>
                            <DirtyMarker userColor={userColor} />
                        </IconContainer>
                    </Corner>
                </TabWrapper>
            </Sneakable>
        )
    }

    private _checkIfShouldScroll(): void {
        if (this.props.isSelected && this._tab) {
            if (this._tab && this._tab.current && this._tab.current.scrollIntoViewIfNeeded) {
                this._tab.current.scrollIntoViewIfNeeded({
                    behavior: "smooth",
                    block: "center",
                    inline: "center",
                })
            }
        }
    }

    private handleTitleClick = (event: React.MouseEvent<HTMLElement>): void => {
        if (this._isLeftClick(event)) {
            this.props.onClickName()
        } else if (this._isMiddleClick(event)) {
            this.props.onClickClose()
        }
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

export const checkShouldShowHighlight = (state: State.IState): boolean => {
    return state.configuration["tabs.highlight"] && state.hasFocus
}

export const checkTabBuffers = (buffersInTabs: number[], buffers: State.IBuffer[]): boolean => {
    const tabBufs = buffers.filter(buf => buffersInTabs.find(tabBuf => tabBuf === buf.id))

    return tabBufs.some(buf => buf.modified)
}

export const checkDuplicate = (current: string, names: string[]) => {
    return names.filter((name: string) => path.basename(name) === path.basename(current)).length > 1
}

const getTabsFromBuffers = createSelector(
    [
        BufferSelectors.getBufferMetadata,
        BufferSelectors.getActiveBufferId,
        showTabId,
        shouldShowFileIcon,
        checkShouldShowHighlight,
    ],
    (
        allBuffers: State.IBuffer[],
        activeBufferId: number,
        shouldShowId: boolean,
        showFileIcon: boolean,
        showHighlight: boolean,
    ) => {
        const bufferCount = allBuffers.length
        const names = allBuffers.map(buffer => buffer.file)
        const tabs = allBuffers.map((buf, idx, buffers) => {
            const isDuplicate = checkDuplicate(buf.file, names)
            const isActive =
                (activeBufferId !== null && buf.id === activeBufferId) || bufferCount === 1
            const name =
                getIdPrefix(buf.id.toString(), shouldShowId) + getTabName(buf.file, isDuplicate)
            return {
                id: buf.id,
                name,
                iconFileName: showFileIcon ? getTabName(buf.file) : "",
                shouldShowHighlight: showHighlight,
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
        return tabState.tabs.map((t, idx) => ({
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

    const { mode } = state
    const height = state.configuration["tabs.height"]
    const maxWidth = state.configuration["tabs.maxWidth"]
    const shouldWrap = state.configuration["tabs.wrap"]
    const userColor = state.configuration["tabs.dirtyMarker.userColor"]
    const shouldShowHighlight = checkShouldShowHighlight(state)

    const selectFunc = shouldUseVimTabs ? ownProps.onTabSelect : ownProps.onBufferSelect
    const closeFunc = shouldUseVimTabs ? ownProps.onTabClose : ownProps.onBufferClose

    return {
        fontFamily: state.configuration["ui.fontFamily"],
        fontSize: addDefaultUnitIfNeeded(state.configuration["ui.fontSize"]),
        onTabSelect: selectFunc,
        onTabClose: closeFunc,
        userColor,
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
