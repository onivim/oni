import { TokenColor } from "./TokenColors"

type Settings = TokenColor["settings"]

class TrieNode {
    public children = new Map<string, TrieNode>()

    constructor(public scope: string, public parentScopes?: string[], public settings?: Settings) {}

    public asTokenColor(): TokenColor {
        return {
            scope: [this.scope],
            settings: this.settings,
        }
    }
}

export default class TokenColorTrie {
    private _root: TrieNode
    private readonly _ROOT_NAME = "__root"

    constructor() {
        this._root = new TrieNode(this._ROOT_NAME)
    }

    public add(token: string, settings: Settings) {
        const { childScope, parentScopes } = this._separateParentAndChildScopes(token)
        this._addNode(this._root, childScope, parentScopes, settings)
    }

    public find(token: string, parentScopes?: string[]) {
        if (!this._root) {
            return null
        }
        return this._findToken(this._root, token, parentScopes)
    }

    public setTokens(tokens: TokenColor[]) {
        for (const token of tokens) {
            for (const scope of token.scope) {
                this.add(scope, token.settings)
            }
        }
    }

    public getAll() {
        const token = ""
        const tokens: TrieNode[] = []
        this._getAll(this._root, tokens, token)
        return tokens
    }

    public remove(token: string) {
        if (!this._root) {
            return
        }
        this._removeToken(this._root, token)
    }

    public match(token: string) {
        const { childScope, parentScopes } = this._separateParentAndChildScopes(token)
        return this._match(childScope, parentScopes)
    }

    public removeAll() {
        this._root.children.clear()
    }

    public contains(token: string) {
        return !!this.find(token)
    }

    public _separateParentAndChildScopes(token: string) {
        const parts = token.split(/ /)
        const parentScopes = parts.length > 1 ? parts.slice(0, parts.length - 1) : []
        const childScope = parts[parts.length - 1]

        return { childScope, parentScopes }
    }

    private _getAll(node: TrieNode, tokens: TrieNode[], token: string) {
        for (const [scope, child] of node.children) {
            token = [token, scope].join(".")
            tokens.push(child)
            this._getAll(child, tokens, token)
            const parts = token.split(".")
            token = parts[parts.length - 1]
        }
    }

    private _removeToken(node: TrieNode, token: string) {
        const [scope] = token.split(".")
        const child = node.children.get(scope)
        if (child) {
            node.children.delete(scope)
        }
    }

    private _addNode(
        node: TrieNode,
        token: string,
        parentScopes: string[],
        settings: Settings,
    ): void {
        if (!token || !settings) {
            return null
        }

        const [scope, ...rest] = token.split(".")
        let childNode = node.children.get(scope)

        if (!childNode) {
            const childScope = this._getScopeName(node.scope, scope)
            const newNode = new TrieNode(childScope, parentScopes, settings)
            node.children.set(scope, newNode)
            childNode = newNode
        }

        const inheritedSettings = { ...childNode.settings, ...settings }
        const nextScope = rest.join(".")
        this._addNode(childNode, nextScope, parentScopes, inheritedSettings)
    }

    private _getParentScopeSettings(parentScopes: string[]) {
        if (!parentScopes.length) {
            return {}
        }
        const parentSettings = parentScopes.reduce(
            (acc, parent) => {
                const token = this.find(parent)
                if (!token || !token.settings) {
                    return acc
                }
                return {
                    ...acc,
                    ...token.settings,
                }
            },
            {} as Settings,
        )
        return parentSettings
    }

    private _compare(childScopes: string[], parentScopes: string[]) {
        if (!childScopes.length && !parentScopes.length) {
            return true
        }
        const child = new Set(childScopes)
        const parent = new Set(parentScopes)
        const intersection = new Set([...child].filter(x => parent.has(x)))
        return !!intersection.size
    }

    /**
     * if the lowest scope level doesn't match then we go up one level
     * i.e. constant.numeric.special -> constant.numeric
     * and search the theme colors for a match
     *
     */
    private _match(scope: string, parentScopes: string[] = []): TrieNode {
        const parts = scope.split(".")
        if (parts.length < 2) {
            return null
        }
        const match = this.find(scope, parentScopes)
        if (match) {
            return match
        }
        const currentScope = parts.slice(0, parts.length - 1).join(".")
        return this._match(currentScope)
    }

    private _findToken(node: TrieNode, token: string, parentScopes: string[] = []): TrieNode {
        const [scope, ...parts] = token.split(".")
        const child = node.children.get(scope)

        if (child) {
            const parentsMatch = this._compare(child.parentScopes, parentScopes)
            if (!parts.length && parentsMatch) {
                const parentSettings = this._getParentScopeSettings(parentScopes)
                child.settings = { ...parentSettings, ...child.settings }
                return child
            }
            return this._findToken(child, parts.join("."), parentScopes)
        }
        return null
    }

    private _getScopeName(parent: string, child: string) {
        if (parent === this._ROOT_NAME) {
            return child
        }
        return `${parent}.${child}`
    }
}
