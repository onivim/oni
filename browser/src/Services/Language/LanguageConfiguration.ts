/**
 * LanguageConfiguration.ts
 *
 * Helper for registering language client information from config
 */

import * as Log from "oni-core-logging"

import { LanguageClient } from "./LanguageClient"
import {
    InitializationOptions,
    LanguageClientProcess,
    ServerRunOptions,
} from "./LanguageClientProcess"
import * as LanguageManager from "./LanguageManager"

import { getRootProjectFile } from "./../../Utility"

export interface ILightweightLanguageConfiguration {
    languageServer?: ILightweightLanguageServerConfiguration
}

export interface ILightweightLanguageServerConfiguration {
    arguments?: string[]
    command?: string
    rootFiles?: string[]
    configuration?: any
}

export const createLanguageClientsFromConfiguration = (configurationValues: {
    [key: string]: any
}) => {
    const languageInfo = expandLanguageConfiguration(configurationValues)
    const languages = Object.keys(languageInfo)

    languages.forEach(lang => {
        createLanguageClientFromConfig(lang, languageInfo[lang])
    })
}

const expandLanguageConfiguration = (configuration: { [key: string]: any }) => {
    // Filter for all `language.` keys, ie `language.go.languageServerCommand`
    const keys = Object.keys(configuration).filter(k => k.indexOf("language.") === 0)

    if (keys.length === 0) {
        return {}
    }

    const expanded = keys.reduce<any>((prev, current) => {
        const newValue = expandConfigurationSetting(
            prev,
            current.split("."),
            configuration[current],
        )
        return newValue
    }, {})

    return expanded.language
}

const expandConfigurationSetting = (
    rootObject: any,
    configurationPath: string[],
    value: string,
): any => {
    if (!configurationPath || !configurationPath.length) {
        return value
    }

    const [currentPath, ...remaining] = configurationPath

    const currentObject = rootObject[currentPath] || {}

    return {
        ...rootObject,
        [currentPath]: expandConfigurationSetting(currentObject, remaining, value),
    }
}

const simplePathResolver = (filePath: string) => Promise.resolve(filePath)

const createLanguageClientFromConfig = (
    language: string,
    config: ILightweightLanguageConfiguration,
): void => {
    if (!config || !config.languageServer || !config.languageServer.command) {
        return
    }

    const lightweightCommand = config.languageServer.command
    const rootFiles = config.languageServer.rootFiles
    const args = config.languageServer.arguments || []
    const configuration = config.languageServer.configuration || null

    Log.info(
        `[Language Manager - Config] Registering info for language: ${language} - command: ${
            config.languageServer.command
        }`,
    )

    const commandOrModule = lightweightCommand.endsWith(".js")
        ? { module: lightweightCommand }
        : { command: lightweightCommand }

    let getWorkingOrRootDirectory = simplePathResolver

    if (rootFiles) {
        getWorkingOrRootDirectory = getRootProjectFile(rootFiles)
    }

    const serverRunOptions: ServerRunOptions = {
        ...commandOrModule,
        args,
        workingDirectory: getWorkingOrRootDirectory,
    }

    const initializationOptions: InitializationOptions = {
        rootPath: getWorkingOrRootDirectory,
    }
    const languageClient = new LanguageClient(
        language,
        new LanguageClientProcess(serverRunOptions, initializationOptions, configuration),
    )
    LanguageManager.getInstance().registerLanguageClient(language, languageClient)
}
