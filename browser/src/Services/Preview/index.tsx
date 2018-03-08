/**
 * Preview/index.tsx
 *
 * Entry point for preview functionality
 */

import { CallbackCommand, CommandManager } from "./../CommandManager"
import { EditorManager } from "./../EditorManager"

import { Preview } from "./Preview"

let _preview: Preview

export const activate = (commandManager: CommandManager, editorManager: EditorManager) => {
    _preview = new Preview(editorManager)

    commandManager.registerCommand(
        new CallbackCommand("preview.open", "Preview: Open", "Open preview pane", () =>
            _preview.openPreview(),
        ),
    )
}
