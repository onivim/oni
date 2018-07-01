/**
 * Rename.tsx
 */

import * as React from "react"

import * as Oni from "oni-api"
import * as Log from "oni-core-logging"

import * as Helpers from "./../../Plugins/Api/LanguageClient/LanguageClientHelpers"

import { LanguageManager } from "./../../Services/Language"
import { RenameView } from "./../../Services/Language/RenameView"
import { Workspace } from "./../../Services/Workspace"

import { IToolTipsProvider } from "./ToolTipsProvider"

const _renameToolTipName = "rename-tool-tip"
export class Rename {
    private _isRenameActive: boolean

    constructor(
        private _editor: Oni.Editor,
        private _languageManager: LanguageManager,
        private _toolTipsProvider: IToolTipsProvider,
        private _workspace: Workspace,
    ) {}

    public async startRename(): Promise<void> {
        if (this._isRenameActive) {
            return
        }

        const activeBuffer = this._editor.activeBuffer

        const activeToken = await activeBuffer.getTokenAt(
            activeBuffer.cursor.line,
            activeBuffer.cursor.column,
        )

        if (!activeToken || !activeToken.tokenName) {
            return
        }

        this._isRenameActive = true

        this._toolTipsProvider.showToolTip(
            _renameToolTipName,
            <RenameView
                onCancel={() => this.cancelRename()}
                onComplete={newValue => this.commitRename(newValue)}
                tokenName={activeToken.tokenName}
            />,
            {
                position: null,
                openDirection: 2,
                onDismiss: () => this.cancelRename(),
            },
        )
    }

    public commitRename(newValue: string): void {
        Log.verbose("[RENAME] Committing rename")
        this.doRename(newValue)
        this.closeToolTip()
    }

    public cancelRename(): void {
        Log.verbose("[RENAME] Cancelling")
        this.closeToolTip()
    }

    public closeToolTip(): void {
        Log.verbose("[RENAME] closeToolTip")
        this._isRenameActive = false
        this._toolTipsProvider.hideToolTip(_renameToolTipName)
    }

    public async doRename(newName: string): Promise<void> {
        const activeBuffer = this._editor.activeBuffer

        const args = {
            textDocument: {
                uri: Helpers.wrapPathInFileUri(activeBuffer.filePath),
            },
            position: {
                line: activeBuffer.cursor.line,
                character: activeBuffer.cursor.column,
            },
            newName,
        }

        let result = null
        try {
            result = await this._languageManager.sendLanguageServerRequest(
                activeBuffer.language,
                activeBuffer.filePath,
                "textDocument/rename",
                args,
            )
        } catch (ex) {
            Log.debug(ex)
        }

        if (result) {
            await this._workspace.applyEdits(result)
        }
    }
}
