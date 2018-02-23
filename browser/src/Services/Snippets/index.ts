export * from "./SnippetManager"
export * from "./SnippetSession"

import { PluginManager } from "./../../Plugins/PluginManager"

import { CompletionProviders } from "./../Completion"
import { CommandManager } from "./../CommandManager"
import { editorManager } from "./../EditorManager"

import { SnippetManager } from "./SnippetManager"
import { SnippetCompletionProvider } from "./SnippetCompletionProvider"
import { PluginSnippetProvider } from "./SnippetProvider"

let _snippetManager: SnippetManager

export const activate = (commandManager: CommandManager) => {
    _snippetManager = new SnippetManager(editorManager)

    commandManager.registerCommand({
        command: "snippet.nextPlaceholder",
        name: null,
        detail: null,
        enabled: () => _snippetManager.isSnippetActive(),
        execute: () => _snippetManager.nextPlaceholder(),
    })

    commandManager.registerCommand({
        command: "snippet.previousPlaceholder",
        name: null,
        detail: null,
        enabled: () => _snippetManager.isSnippetActive(),
        execute: () => _snippetManager.previousPlaceholder(),
    })

    commandManager.registerCommand({
        command: "snippet.cancel",
        name: null,
        detail: null,
        enabled: () => _snippetManager.isSnippetActive(),
        execute: () => _snippetManager.cancel(),
    })
}

export const activateCompletionProvider = (
    completionProviders: CompletionProviders,
    pluginManager: PluginManager,
) => {
    completionProviders.registerCompletionProvider(
        "oni-snippets",
        new SnippetCompletionProvider(_snippetManager),
    )

    _snippetManager.registerSnippetProvider(new PluginSnippetProvider(pluginManager))
}

export const getInstance = (): SnippetManager => {
    return _snippetManager
}
