import { NeovimEditorCapability } from "oni-api"
import { CompletionItem, CompletionItemKind } from "vscode-languageserver-types"
import { CompletionsRequestContext, ICompletionsRequestor } from "./CompletionsRequestor"
import { INeovimCompletionInfo } from "../../neovim"
import { IEvent, IDisposable } from "oni-types"

export interface INeovimWithCompletions extends NeovimEditorCapability {
    onHidePopupMenu: IEvent<void>
    onShowPopupMenu: IEvent<INeovimCompletionInfo>
}

export default class NeovimCompletionsRequestor implements ICompletionsRequestor {
    private _completions: CompletionItem[] = []
    // @ts-ignore
    private _subscriptions: IDisposable[]

    constructor(private _neovim: INeovimWithCompletions) {
        this._setupSubscriptions()
    }

    private _setupSubscriptions() {
        this._subscriptions = [
            this._neovim.onShowPopupMenu.subscribe(this._addNeovimCompletion),
            this._neovim.onHidePopupMenu.subscribe(this._clearNeovimCompletions),
        ]
    }

    public async getCompletions(context: CompletionsRequestContext) {
        console.log("this._completions: ", this._completions)
        return this._completions
    }

    public async getCompletionDetails(
        fileLanguage: string,
        filePath: string,
        completionItem: CompletionItem,
    ): Promise<CompletionItem> {
        return null
    }

    private _addNeovimCompletion(completionInfo: INeovimCompletionInfo) {
        const items = completionInfo.items.map(item => {
            return {
                label: item.word,
                kind: CompletionItemKind.Keyword,
                detail: item.info,
            }
        })
        this._completions = items
    }

    public _clearNeovimCompletions() {
        this._completions = []
    }
}
