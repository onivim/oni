/**
 * TypeScriptConfigurationEditor.ts
 *
 * Entry point for ONI's TypeScript Language Service integraiton
 */

import * as fs from "fs"
import * as path from "path"

const normalizePath = (str: string) => str.split("\\").join("\\\\")

const tsConfigTemplate = (typePath: string) => `
import * as React from "${normalizePath(path.join(typePath, "react"))}"
import * as Oni from "${normalizePath(path.join(typePath, "oni-api"))}"

export const activate = (oni: Oni.Plugin.Api) => {
    console.log("config activated")

    // Input
    //
    // Add input bindings here:
    //
    oni.input.bind("<c-enter>", () => console.log("Control+Enter was pressed"))

    //
    // Or remove the default bindings here by uncommenting the below line:
    //
    // oni.input.unbind("<c-p>")

}

export const deactivate = (oni: Oni.Plugin.Api) => {
    console.log("config deactivated")
}

export const configuration = {
    //add custom config here, such as

    "ui.colorscheme": "nord",

    //"oni.useDefaultConfig": true,
    //"oni.bookmarks": ["~/Documents"],
    //"oni.loadInitVim": false,
    //"editor.fontSize": "12px",
    //"editor.fontFamily": "Monaco",

    // UI customizations
    "ui.animations.enabled": true,
    "ui.fontSmoothing": "auto",
}
`
const getTypeScriptConfigurationFromJavaScriptConfiguration = (configurationFile: string) => {
    const dirName = path.dirname(configurationFile)
    const typeScriptConfig = path.join(dirName, path.basename(configurationFile, ".js") + ".tsx")

    return typeScriptConfig
}

const ensureTsConfig = async (typeScriptConfigFile: string, typeRoots: string): Promise<void> => {
    if (!fs.existsSync(typeScriptConfigFile)) {
        fs.writeFileSync(typeScriptConfigFile, tsConfigTemplate(typeRoots))
    }
}

export class TypeScriptConfigurationEditor {
    constructor(private _mainProcessDirectory) {}

    public async editConfiguration(configurationFilePath: string): Promise<string> {
        // If a javascript configuration exists, but not a TypeScript one, we'll
        // let the default config handle it.
        const javaScriptConfigExists = fs.existsSync(configurationFilePath)
        const typeScriptConfigFile = getTypeScriptConfigurationFromJavaScriptConfiguration(
            configurationFilePath,
        )
        const typeScriptConfigExists = fs.existsSync(typeScriptConfigFile)

        if (javaScriptConfigExists && !typeScriptConfigExists) {
            return null
        }

        const configDirectory = path.dirname(configurationFilePath)

        const typeRoots = path.join(this._mainProcessDirectory, "node_modules")

        // Ensure that a `tsconfig.json` exists
        // await ensureTsConfigJson(configDirectory, typeRoots)
        await ensureTsConfig(typeScriptConfigFile, typeRoots)

        return typeScriptConfigFile
    }

    public async transpileConfigurationToJavaScript(contents: string): Promise<string> {
        const ts = await import("typescript")

        const output = ts.transpileModule(contents, {
            reportDiagnostics: true,
            compilerOptions: {
                jsx: "React",
            } as any,
        })

        if (output.diagnostics.length > 0) {
            const errorMessage = output.diagnostics.map(
                d => `Error ${d.code}[${d.start}] ${d.messageText}]`,
            )
            throw new Error(errorMessage.join("\n"))
        }

        return output.outputText
    }
}
