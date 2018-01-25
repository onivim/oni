/*/
 * ServerCapibilities.ts
 */

// Copied from:
// https://github.com/Microsoft/language-server-protocol/blob/master/protocol.md

/**
 * Defines how the host (editor) should sync document changes to the language server.
 */
export namespace TextDocumentSyncKind {
    /**
     * Documents should not be synced at all.
     */
    export const None = 0

    /**
     * Documents are synced by always sending the full content
     * of the document.
     */
    export const Full = 1

    /**
     * Documents are synced by sending the full content on open.
     * After that only incremental updates to the document are
     * send.
     */
    export const Incremental = 2
}

/**
 * Completion options.
 */
export interface CompletionOptions {
    /**
     * The server provides support to resolve additional
     * information for a completion item.
     */
    resolveProvider?: boolean

    /**
     * The characters that trigger completion automatically.
     */
    triggerCharacters?: string[]
}
/**
 * Signature help options.
 */
export interface SignatureHelpOptions {
    /**
     * The characters that trigger signature help
     * automatically.
     */
    triggerCharacters?: string[]
}

/**
 * Code Lens options.
 */
export interface CodeLensOptions {
    /**
     * Code lens has a resolve provider as well.
     */
    resolveProvider?: boolean
}

/**
 * Format document on type options
 */
export interface DocumentOnTypeFormattingOptions {
    /**
     * A character on which formatting should be triggered, like `}`.
     */
    firstTriggerCharacter: string

    /**
     * More trigger characters.
     */
    moreTriggerCharacter?: string[]
}

/**
 * Document link options
 */
export interface DocumentLinkOptions {
    /**
     * Document links have a resolve provider as well.
     */
    resolveProvider?: boolean
}

/**
 * Execute command options.
 */
export interface ExecuteCommandOptions {
    /**
     * The commands to be executed on the server
     */
    commands: string[]
}

/**
 * Save options.
 */
export interface SaveOptions {
    /**
     * The client is supposed to include the content on save.
     */
    includeText?: boolean
}

export interface TextDocumentSyncOptions {
    /**
     * Open and close notifications are sent to the server.
     */
    openClose?: boolean
    /**
     * Change notifications are sent to the server. See TextDocumentSyncKind.None, TextDocumentSyncKind.Full
     * and TextDocumentSyncKindIncremental.
     */
    change?: number
    /**
     * Will save notifications are sent to the server.
     */
    willSave?: boolean
    /**
     * Will save wait until requests are sent to the server.
     */
    willSaveWaitUntil?: boolean
    /**
     * Save notifications are sent to the server.
     */
    save?: SaveOptions
}

export interface IServerCapabilities {
    /**
     * Defines how text documents are synced. Is either a detailed structure defining each notification or
     * for backwards compatibility the TextDocumentSyncKind number.
     */
    textDocumentSync?: TextDocumentSyncOptions | number
    /**
     * The server provides hover support.
     */
    hoverProvider?: boolean
    /**
     * The server provides completion support.
     */
    completionProvider?: CompletionOptions
    /**
     * The server provides signature help support.
     */
    signatureHelpProvider?: SignatureHelpOptions
    /**
     * The server provides goto definition support.
     */
    definitionProvider?: boolean
    /**
     * The server provides find references support.
     */
    referencesProvider?: boolean
    /**
     * The server provides document highlight support.
     */
    documentHighlightProvider?: boolean
    /**
     * The server provides document symbol support.
     */
    documentSymbolProvider?: boolean
    /**
     * The server provides workspace symbol support.
     */
    workspaceSymbolProvider?: boolean
    /**
     * The server provides code actions.
     */
    codeActionProvider?: boolean
    /**
     * The server provides code lens.
     */
    codeLensProvider?: CodeLensOptions
    /**
     * The server provides document formatting.
     */
    documentFormattingProvider?: boolean
    /**
     * The server provides document range formatting.
     */
    documentRangeFormattingProvider?: boolean
    /**
     * The server provides document formatting on typing.
     */
    documentOnTypeFormattingProvider?: DocumentOnTypeFormattingOptions
    /**
     * The server provides rename support.
     */
    renameProvider?: boolean
    /**
     * The server provides document link support.
     */
    documentLinkProvider?: DocumentLinkOptions
    /**
     * The server provides execute command support.
     */
    executeCommandProvider?: ExecuteCommandOptions
    /**
     * Experimental server capabilities.
     */
    experimental?: any
}
