import { TokenColor } from "./TokenColors"

type Settings = TokenColor["settings"]

class TrieNode {
    public children = new Map<string, TrieNode>()

    constructor(public scope: string, public settings: Settings) {}

    public asTokenColor(): TokenColor {
        return {
            scope: [this.scope],
            settings: this.settings,
        }
    }
}

export default class TokenColorTrie {
    private root: TrieNode
    private readonly ROOT_NAME = "__root"

    constructor() {
        this.root = new TrieNode(this.ROOT_NAME, null)
    }

    public add(token: string, settings: Settings) {
        this._addNode(this.root, token, settings)
    }

    public find(token: string) {
        if (!this.root) {
            return null
        }
        return this._findToken(this.root, token)
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
        this._getAll(this.root, tokens, token)
        return tokens
    }

    public remove(token: string) {
        if (!this.root) {
            return
        }
        this._removeToken(this.root, token)
    }

    public removeAll() {
        this.root.children.clear()
    }

    public contains(token: string) {
        return !!this.find(token)
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

    private _addNode(node: TrieNode, token: string, settings: Settings): void {
        if (!token || !settings) {
            return null
        }

        const [scope, ...parts] = token.split(".")
        let childNode = node.children.get(scope)

        if (!childNode) {
            const childScope = this._getScopeName(node.scope, scope)
            const newNode = new TrieNode(childScope, settings)
            node.children.set(scope, newNode)
            childNode = newNode
        }
        this._addNode(childNode, parts.join("."), settings)
    }

    private _findToken(node: TrieNode, token: string): TrieNode {
        const [scope, ...parts] = token.split(".")
        const child = node.children.get(scope)
        if (child) {
            if (!parts.length) {
                return child
            }
            return this._findToken(child, parts.join("."))
        }
        return null
    }

    private _getScopeName(parent: string, child: string) {
        if (parent === this.ROOT_NAME) {
            return child
        }
        return `${parent}.${child}`
    }
}
