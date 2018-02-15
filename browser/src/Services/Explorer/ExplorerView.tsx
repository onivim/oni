/**
 * ExplorerSplit.tsx
 *
 */

import * as React from "react"
import { connect } from "react-redux"

import styled from "styled-components"

import { withProps } from "./../../UI/components/common"
import { SidebarContainerView, SidebarItemView } from "./../../UI/components/SidebarItemView"
import { VimNavigator } from "./../../UI/components/VimNavigator"
import { Icon } from "./../../UI/Icon"

import { FileIcon } from "./../FileIcon"

import * as ExplorerSelectors from "./ExplorerSelectors"
import { IExplorerState } from "./ExplorerStore"

export interface INodeViewProps {
    node: ExplorerSelectors.ExplorerNode
    isSelected: boolean
    onClick: () => void
}

const NodeWrapper = styled.div`
    &:hover {
        text-decoration: underline;
    }
`

// tslint:disable-next-line
const noop = (elem: HTMLElement) => {}
const scrollIntoViewIfNeeded = (elem: HTMLElement) => {
    // tslint:disable-next-line
    elem && elem["scrollIntoViewIfNeeded"] && elem["scrollIntoViewIfNeeded"]()
}

const MenuContainer = styled.div`
    width: 100%;
    height: 1.5rem;
    display: flex;
    align-items: flex-start;
    margin-bottom: 0.5rem;
`

const Option = withProps<{ color?: string }>(styled.span)`
    display: flex;
    flex: 1;
    margin: 0.5rem;
    justify-content: center;
    ${p => p.color && `color: ${p.color}`};
`

class Menu extends React.Component<{ selected: boolean; children: React.ReactNode }> {
    public renderMenu = () => (
        <MenuContainer>
            <Option color="red">
                <Icon name="trash" />
            </Option>
            <Option color="yellow">
                <Icon name="edit" />
            </Option>
        </MenuContainer>
    )

    public render() {
        const { children, selected } = this.props
        return selected ? (
            <div>
                {this.renderMenu()}
                {children}
            </div>
        ) : (
            children
        )
    }
}

export class NodeView extends React.PureComponent<INodeViewProps, {}> {
    public render(): JSX.Element {
        return (
            <NodeWrapper
                style={{ cursor: "pointer" }}
                onClick={() => this.props.onClick()}
                innerRef={this.props.isSelected ? scrollIntoViewIfNeeded : noop}
            >
                {this.getElement()}
            </NodeWrapper>
        )
    }

    public getElement(): JSX.Element {
        const node = this.props.node

        switch (node.type) {
            case "file":
                return (
                    <Menu selected={this.props.isSelected}>
                        <SidebarItemView
                            text={node.name}
                            isFocused={this.props.isSelected}
                            isContainer={false}
                            indentationLevel={node.indentationLevel}
                            icon={<FileIcon fileName={node.name} isLarge={true} />}
                        />
                    </Menu>
                )
            case "container":
                return (
                    <SidebarContainerView
                        isContainer={true}
                        isExpanded={node.expanded}
                        text={node.name}
                        isFocused={this.props.isSelected}
                    />
                )
            case "folder":
                return (
                    <SidebarContainerView
                        isContainer={false}
                        isExpanded={node.expanded}
                        text={node.name}
                        isFocused={this.props.isSelected}
                        indentationLevel={node.indentationLevel}
                    />
                )
            default:
                return <div>{JSON.stringify(node)}</div>
        }
    }
}

export interface IExplorerViewContainerProps {
    onSelectionChanged: (id: string) => void
    onClick: (id: string) => void
}

export interface IExplorerViewProps extends IExplorerViewContainerProps {
    nodes: ExplorerSelectors.ExplorerNode[]
    isActive: boolean
}

import { SidebarEmptyPaneView } from "./../../UI/components/SidebarEmptyPaneView"
import { Sneakable } from "./../../UI/components/Sneakable"

import { commandManager } from "./../CommandManager"

export class ExplorerView extends React.PureComponent<IExplorerViewProps, {}> {
    public render(): JSX.Element {
        const ids = this.props.nodes.map(node => node.id)

        if (!this.props.nodes || !this.props.nodes.length) {
            return (
                <SidebarEmptyPaneView
                    active={this.props.isActive}
                    contentsText="Nothing to show here, yet!"
                    actionButtonText="Open a Folder"
                    onClickButton={() => commandManager.executeCommand("workspace.openFolder")}
                />
            )
        }

        return (
            <VimNavigator
                ids={ids}
                active={this.props.isActive}
                onSelectionChanged={this.props.onSelectionChanged}
                onSelected={id => this.props.onClick(id)}
                render={(selectedId: string) => {
                    const nodes = this.props.nodes.map(node => (
                        <Sneakable callback={() => this.props.onClick(node.id)} key={node.id}>
                            <NodeView
                                node={node}
                                isSelected={node.id === selectedId}
                                onClick={() => this.props.onClick(node.id)}
                            />
                        </Sneakable>
                    ))

                    return (
                        <div className="explorer enable-mouse">
                            <div className="items">{nodes}</div>
                        </div>
                    )
                }}
            />
        )
    }
}

const mapStateToProps = (
    state: IExplorerState,
    containerProps: IExplorerViewContainerProps,
): IExplorerViewProps => {
    return {
        ...containerProps,
        isActive: state.hasFocus,
        nodes: ExplorerSelectors.mapStateToNodeList(state),
    }
}

export const Explorer = connect(mapStateToProps)(ExplorerView)
