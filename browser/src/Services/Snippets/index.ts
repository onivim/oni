export * from "./SnippetManager"
export * from "./SnippetSession"

import { PluginManager } from "./../../Plugins/PluginManager"

import { CommandManager } from "./../CommandManager"
import { CompletionProviders } from "./../Completion"
import { Configuration } from "./../Configuration"
import { editorManager } from "./../EditorManager"

import { SnippetCompletionProvider } from "./SnippetCompletionProvider"
import { SnippetManager } from "./SnippetManager"

import { PluginSnippetProvider } from "./SnippetProvider"
import { UserSnippetProvider } from "./UserSnippetProvider"

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

export const activateProviders = (
    commandManager: CommandManager,
    completionProviders: CompletionProviders,
    configuration: Configuration,
    pluginManager: PluginManager,
) => {
    completionProviders.registerCompletionProvider(
        "oni-snippets",
        new SnippetCompletionProvider(_snippetManager),
    )

    _snippetManager.registerSnippetProvider(new PluginSnippetProvider(pluginManager))
    const userProvider = new UserSnippetProvider(configuration)
    _snippetManager.registerSnippetProvider(userProvider)
}

export const getInstance = (): SnippetManager => {
    return _snippetManager
}
