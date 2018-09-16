import { TokenColor } from "./TokenColors"

type Settings = TokenColor["settings"]

class TrieNode {
    public children: { [token: string]: TrieNode } = {}
    constructor(public scope: string, public settings: Settings) {}
}

export default class TokenColorTrie {
    private root: TrieNode

    constructor() {
        this.root = new TrieNode("__root", null)
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

    public remove(tokenName: string) {
        //
    }

    public contains(token: string) {
        return !!this.find(token)
    }

    private _addNode(node: TrieNode, token: string, settings: Settings): void {
        if (!token || !settings) {
            return null
        }

        const [scope, ...parts] = token.split(".")
        let childNode = node.children[scope]

        if (!childNode) {
            const newNode = new TrieNode(scope, settings)
            node.children[scope] = newNode
            childNode = newNode
        }
        this._addNode(childNode, parts.join("."), settings)
    }

    private _findToken(node: TrieNode, token: string): TrieNode {
        const [scope, ...parts] = token.split(".")
        const child = node.children[scope]
        if (child) {
            if (!parts.length) {
                return child
            } else {
                return this._findToken(child, parts.join("."))
            }
        } else {
            return null
        }
    }
}
