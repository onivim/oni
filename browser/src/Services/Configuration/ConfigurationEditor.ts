/**
 * ConfigurationEditor.ts
 */

import * as fs from "fs"
import * as Oni from "oni-api"
import * as os from "os"
import * as path from "path"

import * as mkdirp from "mkdirp"

import * as Log from "./../../Log"

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
    editConfiguration(configurationFilePath: string): Promise<string>

    // When the edit file is saved, this is responsible for transpiling the contents
    // to javascript.
    transpileConfigurationToJavaScript(contents: string): Promise<string>
}

export class JavaScriptConfigurationEditor {
    public async editConfiguration(configurationFilePath: string): Promise<string> {
        // Create default file, if it doesn't already exist
        if (!fs.existsSync(configurationFilePath)) {
            const defaultConfigJsPath = path.join(__dirname, "configuration", "config.default.js")
            const defaultConfigLines = fs.readFileSync(defaultConfigJsPath, "utf8")

            mkdirp.sync(path.dirname(configurationFilePath))
            fs.writeFileSync(configurationFilePath, defaultConfigLines)
        }

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

    constructor(private _configuration: Configuration, private _editorManager: EditorManager) {
        this._editorManager.activeEditor.onBufferSaved.subscribe(evt => {
            const activeEditingSession = this._fileToEditor[evt.filePath]

            if (activeEditingSession) {
                const currentBuffer = this._editorManager.activeEditor.activeBuffer
                if (currentBuffer.filePath === evt.filePath) {
                    this._transpileConfiguration(
                        currentBuffer,
                        activeEditingSession.editor,
                        activeEditingSession.destinationConfigFilePath,
                    )
                }
            }
        })
    }

    public async editConfiguration(configFile: string): Promise<void> {
        const editor = this._configuration.editor
        const editFile = await editor.editConfiguration(configFile)

        const normalizedEditFile = !!editFile ? editFile : configFile

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

        this._editorManager.activeEditor.openFile(normalizedEditFile, {
            openMode: Oni.FileOpenMode.NewTab,
        })
    }

    private async _transpileConfiguration(
        buffer: Oni.Buffer,
        editor: IConfigurationEditor,
        destinationConfigFilePath: string,
    ): Promise<void> {
        Log.info(
            `[ConfigurationEditManager::_transpileConfiguration] Transpiling ${
                buffer.filePath
            } to ${destinationConfigFilePath}`,
        )

        const contents = await buffer.getLines()
        const joinedContents = contents.join(os.EOL)
        const transpiledContents = await editor.transpileConfigurationToJavaScript(joinedContents)

        if (
            buffer.filePath === destinationConfigFilePath &&
            joinedContents === transpiledContents
        ) {
            Log.info(
                `[ConfigurationEditManager::_transpileConfiguration] Aborting transpile since destination file / source file + contents are the same (expected for JavaScript strategy).`,
            )
            return
        }

        fs.writeFileSync(destinationConfigFilePath, transpiledContents)
    }
}
