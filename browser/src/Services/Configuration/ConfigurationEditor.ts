/**
 * ConfigurationEditor.ts
 */

import { EditorManager } from "./../EditorManager"

import { Configuration } from "./Configuration"

// For configuring Oni, JavaScript is the de-facto language, and the configuration
// today will _always_ happen through `config.js`
//
// However, we want to support configuring in dialects of JS, like:
// - TypeScript
// - Reason
// - ClojureScript
// - CoffeeScript
// - Script# (C#)
// etc...
//
// Or even wasm languages!
//
// `IConfigurationEditor` provides an interface for this functionality.
//
// The expectation is that implementors of this will specify a separate file,
// and implement functionality for compilng to JavaScript.
export interface IConfigurationEditor {
    // For configuration editors that use a different language
    // (TypeScript, Reason, etc), this specifies the file
    // that should be opened for editing.
    getEditFile(configurationFilePath: string): Promise<string>

    // When the edit file is saved, this is responsible for transpiling the contents
    // to javascript.
    transpileConfigurationToJavaScript(contents: string): Promise<string>
}

export class JavaScriptConfigurationEditor {
    public async getEditFile(configurationFilePath: string): Promise<string> {
        return configurationFilePath
    }

    public async transpileConfigurationToJavaScript(contents: string): Promise<string> {
        return contents
    }
}

export interface IConfigurationEditInfo {
    editor: IConfigurationEditor
    destinationConfigFilePath: string
}

export class ConfigurationEditManager {
    private _fileToEditor: { [filePath: string]: IConfigurationEditInfo } = {}

    constructor(private _configuration: Configuration, private _editorManager: EditorManager) {}

    public async editConfiguration(configFile: string): Promise<void> {
        const editor = this._configuration.editor
        const editFile = await editor.getEditFile(configFile)

        if (editFile) {
            this._fileToEditor[editFile] = {
                editor,
                destinationConfigFilePath: configFile,
            }
        } else {
            this._fileToEditor[configFile] = {
                editor: new JavaScriptConfigurationEditor(),
                destinationConfigFilePath: configFile,
            }
        }
    }
}
