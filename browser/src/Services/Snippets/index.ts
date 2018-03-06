export * from "./OniSnippet"
export * from "./SnippetManager"
export * from "./SnippetSession"
export * from "./SnippetVariableResolver"

import { PluginManager } from "./../../Plugins/PluginManager"

import { CommandManager } from "./../CommandManager"
import { CompletionProviders } from "./../Completion"
import { Configuration } from "./../Configuration"
import { editorManager } from "./../EditorManager"

import { SnippetCompletionProvider } from "./SnippetCompletionProvider"
import { SnippetManager } from "./SnippetManager"
import { PluginSnippetProvider } from "./SnippetProvider"

let _snippetManager: SnippetManager

export const activate = (commandManager: CommandManager, configuration: Configuration) => {
    _snippetManager = new SnippetManager(configuration, editorManager)

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
