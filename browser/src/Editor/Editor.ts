
import { PluginManager } from "./../Plugins/PluginManager"
import { CommandManager } from "./../Services/CommandManager"

export interface IEditorContext {
    plugins: PluginManager
    commands: CommandManager
    args: any
}

export interface IEditor {
    init(editorContext: IEditorContext): void
    render(element: HTMLDivElement): void
}
