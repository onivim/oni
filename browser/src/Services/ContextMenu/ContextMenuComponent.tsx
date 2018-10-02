/**
 * ContextMenu.tsx
 */

import * as React from "react"
import * as types from "vscode-languageserver-types"

import { connect, Provider } from "react-redux"
import { Store } from "redux"

import * as Oni from "oni-api"

import { IMenus } from "./../Menu/MenuState"

import { Arrow, ArrowDirection } from "./../../UI/components/Arrow"
import styled, { enableMouse, layer } from "./../../UI/components/common"
import { HighlightText } from "./../../UI/components/HighlightText"
import { QuickInfoDocumentation } from "./../../UI/components/QuickInfo"
import { Icon } from "./../../UI/Icon"

import { ContextMenuState } from "./ContextMenu"

export interface IContextMenuItem {
    label: string
    detail?: string
    documentation?: string | types.MarkupContent
    icon?: string
}

const Autocompletion = styled.div`
    ${layer};
    ${enableMouse};
    width: 600px;
    overflow: hidden;
    animation-name: appear;
    animation-duration: 0.1s;
`

export interface IContextMenuProps {
    visible: boolean
    base: string
    entries: IContextMenuItem[]
    selectedIndex: number
}

export const ContextMenuView: React.SFC<IContextMenuProps> = props => {
    if (!props.visible) {
        return null
    }

    let entriesToRender: IContextMenuItem[] = []
    let { selectedIndex: adjustedIndex } = props

    // TODO: sync max display items (10) with value in Reducer.autoCompletionReducer() (Reducer.ts)
    if (adjustedIndex < 10) {
        entriesToRender = props.entries.slice(0, 10)
    } else {
        entriesToRender = props.entries.slice(adjustedIndex - 9, adjustedIndex + 1)
        adjustedIndex = entriesToRender.length - 1
    }

    const entries = entriesToRender.map((entry, index) => {
        const isSelected = index === adjustedIndex

        return (
            <ContextMenuItem
                {...entry}
                key={`${index}-${entry.detail}`}
                isSelected={isSelected}
                base={props.base}
            />
        )
    })

    const selectedItemDocumentation = getDocumentationFromItems(entriesToRender, adjustedIndex)
    return (
        <Autocompletion data-id="autocompletion">
            {entries}
            <ContextMenuDocumentation documentation={selectedItemDocumentation} />
        </Autocompletion>
    )
}

const getDocumentationFromItems = (items: any[], selectedIndex: number): string => {
    if (!items || !items.length) {
        return null
    }

    if (selectedIndex < 0 || selectedIndex >= items.length) {
        return null
    }

    return items[selectedIndex].documentation
}

export const Label = styled(HighlightText)`
    flex: 1 0 auto;
    min-width: 100px;
    margin-left: 8px;
`

const Highlight = styled.span`
    text-decoration: underline;
`

interface ISelectedProps {
    isSelected: boolean
}

const Entry = styled<ISelectedProps, "div">("div")`
    ${({ isSelected }) =>
        isSelected &&
        `transform: translateY(0.1px);
         box-shadow: 0 1px 8px 1px rgba(0, 0, 0, 0.2), 0 1px 20px 0 rgba(0, 0, 0, 0.19);
    `};
`

const Main = styled<ISelectedProps, "div">("div")`
    transition: opacity 1s;
    opacity: ${props => (props.isSelected ? "1" : "0.8")};
    display: flex;
    flex-direction: row;
    align-items: center;
`

const IconWrapper = styled.div`
    padding: 4px;
    width: 1.2em;
    flex: 0 0 auto;
    text-align: center;
    background-color: ${({ theme }) => theme["contextMenu.highlight"]};
    i {
        font-size: 0.9em;
    }
`

export const Detail = styled<ISelectedProps, "div">("div")`
    flex: 0 1 auto;
    min-width: 50px;
    text-align: right;
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
    margin: 0 5px 0 16px;
    font-size: 0.8em;
    opacity: 0.8;
    visibility: hidden;
    ${props => (props.isSelected ? "visibility:visible;" : "")};
`

export interface IContextMenuItemProps extends Oni.Menu.MenuOption, ISelectedProps {
    base: string
}

export const ContextMenuItem: React.SFC<IContextMenuItemProps> = props => {
    const { isSelected, label, icon, base, detail } = props

    return (
        <Entry isSelected={isSelected} key={label}>
            <Main isSelected={isSelected}>
                <IconWrapper>
                    <Icon name={icon} />
                </IconWrapper>
                <Arrow direction={ArrowDirection.Right} size={5} isSelected={isSelected} />
                <Label highlightComponent={Highlight} highlightText={base} text={label} />
                <Detail isSelected={isSelected}>{detail}</Detail>
            </Main>
        </Entry>
    )
}

export interface IContextMenuDocumentationProps {
    documentation: string
}

export const ContextMenuDocumentation = ({ documentation }: IContextMenuDocumentationProps) => {
    return documentation ? <QuickInfoDocumentation text={documentation} /> : null
}

type IState = IMenus<types.CompletionItem, types.CompletionItem>

const mapStateToProps = ({ menu: contextMenu }: IState): IContextMenuProps => {
    if (!contextMenu) {
        return {
            visible: false,
            base: "",
            entries: [] as IContextMenuItem[],
            selectedIndex: 0,
        } as IContextMenuProps
    }
    return {
        visible: true,
        base: contextMenu.filter,
        entries: contextMenu.filteredOptions,
        selectedIndex: contextMenu.selectedIndex,
    }
}

export const ConnectedContextMenu = connect(mapStateToProps)(ContextMenuView)

export const ContextMenuContainer = (props: { store: Store<ContextMenuState> }) => {
    return (
        <Provider store={props.store}>
            <ConnectedContextMenu />
        </Provider>
    )
}
