/**
 * TypeScriptConfigurationEditor.ts
 *
 * Entry point for ONI's TypeScript Language Service integraiton
 */

import * as fs from "fs"
import * as path from "path"

const tsConfigTemplate = (typePath: string) => `
import * as Oni from "E:/oni/node_modules/oni-api"

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
   // Set configuration values here...
}
`
const getTypeScriptConfigurationFromJavaScriptConfiguration = (configurationFile: string) => {
    const dirName = path.dirname(configurationFile)
    const typeScriptConfig = path.join(dirName, path.basename(configurationFile, ".js") + ".ts")

    console.log("getTypeScriptConfigurationFromJavaScriptConfiguration: " + typeScriptConfig)
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
        })

        return output.outputText
    }
}
