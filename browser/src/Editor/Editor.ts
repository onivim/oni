
// import { PluginManager } from "./../Plugins/PluginManager"
// import { CommandManager } from "./../Services/CommandManager"

export interface IEditor {
    init(args: any): void
    render(element: HTMLDivElement): void
}
