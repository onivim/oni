/**
 * TypeScriptConfigurationEditor.ts
 *
 * Entry point for ONI's TypeScript Language Service integraiton
 */

import * as fs from "fs"
import * as path from "path"

const getTypeScriptConfigurationFromJavaScriptConfiguration = (configurationFile: string) => {
    const dirName = path.dirname(configurationFile)
    const typeScriptConfig = path.join(dirName, "config.typescript.ts")
    return typeScriptConfig
}

const ensureTsConfigJson = async (configurationDirectory: string): Promise<void> => {
    const tsConfigJsonPath = path.join(configurationDirectory, "tsconfig.json")
    if (!fs.existsSync(tsConfigJsonPath)) {
        fs.writeFileSync(tsConfigJsonPath, "test")
    }
}

export class TypeScriptConfigurationEditor {
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

        // Ensure that a `tsconfig.json` exists
        await ensureTsConfigJson()

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
