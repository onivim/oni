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
import { HighlightText } from "./../../UI/components/HighlightText"
import { QuickInfoDocumentation } from "./../../UI/components/QuickInfo"
import { Icon } from "./../../UI/Icon"

import { ContextMenuState } from "./ContextMenu"
import styled, { withProps, css, layer, enableMouse } from "../../UI/components/common"

export interface IContextMenuItem {
    label: string
    detail?: string
    documentation?: string
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

    backgroundColor: string
    foregroundColor: string
    borderColor: string
    highlightColor: string
}

export class ContextMenuView extends React.PureComponent<IContextMenuProps, {}> {
    public render(): null | JSX.Element {
        if (!this.props.visible) {
            return null
        }

        let entriesToRender: IContextMenuItem[] = []
        let adjustedIndex = this.props.selectedIndex

        // TODO: sync max display items (10) with value in Reducer.autoCompletionReducer() (Reducer.ts)
        if (adjustedIndex < 10) {
            entriesToRender = this.props.entries.slice(0, 10)
        } else {
            entriesToRender = this.props.entries.slice(adjustedIndex - 9, adjustedIndex + 1)
            adjustedIndex = entriesToRender.length - 1
        }

        const entries = entriesToRender.map((s, i) => {
            const isSelected = i === adjustedIndex

            return (
                <ContextMenuItem
                    key={`${i}-${s.detail}`}
                    {...s}
                    isSelected={isSelected}
                    base={this.props.base}
                    highlightColor={this.props.highlightColor}
                />
            )
        })

        const selectedItemDocumentation = getDocumentationFromItems(entriesToRender, adjustedIndex)
        return (
            <Autocompletion>
                {entries}
                <ContextMenuDocumentation documentation={selectedItemDocumentation} />
            </Autocompletion>
        )
    }
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

const Label = styled(HighlightText)`
    flex: 1 0 auto;
    min-width: 100px;
    margin-left: 8px;
`

const Highlight = styled.span`
    text-decoration: underline;
`

interface IEntryProps {
    isSelected: boolean
}
const Entry = withProps<IEntryProps>(styled.div)`
    ${props =>
        props.isSelected
            ? css`
                  transform: translateY(0.1px);
                  box-shadow: 0 1px 8px 1px rgba(0, 0, 0, 0.2), 0 1px 20px 0 rgba(0, 0, 0, 0.19);
              `
            : ""}
`

interface IMainProps {
    isSelected: boolean
}
const Main = withProps<IMainProps>(styled.div)`
    transition: opacity 1s;
    opacity: ${props => (props.isSelected ? "1" : "0.8")};
    display: flex;
    flex-direction: row;
    align-items: center;
`
interface IconWrapperProps {
    backgroundColor: string
}
const IconWrapper = withProps<IconWrapperProps>(styled.div)`
    padding: 4px;
    width: 1.2em;
    flex: 0 0 auto;
    text-align: center;
    background-color: ${props => props.backgroundColor}

    i {
        font-size: 0.9em;
    }
`

interface IDetailProps {
    isSelected: boolean
}
const Detail = withProps<IDetailProps>(styled.div)`
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

    ${props => (props.isSelected ? "visibility:visible;" : "")}
`

export interface IContextMenuItemProps extends Oni.Menu.MenuOption {
    base: string
    isSelected: boolean
    highlightColor?: string
}

export class ContextMenuItem extends React.PureComponent<IContextMenuItemProps, {}> {
    public render(): JSX.Element {
        const highlightColor = this.props.highlightColor

        const arrowColor = this.props.isSelected ? highlightColor : "transparent"

        return (
            <Entry isSelected={this.props.isSelected} key={this.props.label}>
                <Main isSelected={this.props.isSelected}>
                    <IconWrapper backgroundColor={highlightColor}>
                        <Icon name={this.props.icon} />
                    </IconWrapper>
                    <Arrow direction={ArrowDirection.Right} size={5} color={arrowColor} />
                    <Label
                        highlightComponent={Highlight}
                        highlightText={this.props.base}
                        text={this.props.label}
                    />
                    <Detail isSelected={this.props.isSelected}>{this.props.detail}</Detail>
                </Main>
            </Entry>
        )
    }
}

export interface IContextMenuDocumentationProps {
    documentation: string
}

export const ContextMenuDocumentation = (props: IContextMenuDocumentationProps) => {
    const { documentation } = props

    if (!documentation) {
        return null
    }

    return <QuickInfoDocumentation text={documentation} />
}

const EmptyProps = {
    visible: false,
    base: "",
    entries: [] as IContextMenuItem[],
    selectedIndex: 0,
    backgroundColor: "",
    foregroundColor: "",
    borderColor: "",
    highlightColor: "",
}

const mapStateToProps = (state: IMenus<types.CompletionItem, types.CompletionItem>) => {
    const contextMenu = state.menu
    if (!contextMenu) {
        return EmptyProps
    } else {
        const ret: IContextMenuProps = {
            visible: true,
            base: contextMenu.filter,
            entries: contextMenu.filteredOptions,
            selectedIndex: contextMenu.selectedIndex,
            foregroundColor: contextMenu.foregroundColor,
            backgroundColor: contextMenu.backgroundColor,
            borderColor: contextMenu.borderColor,
            highlightColor: contextMenu.highlightColor,
        }
        return ret
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
