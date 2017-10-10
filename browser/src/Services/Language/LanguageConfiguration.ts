/**
 * LanguageConfiguration.ts
 *
 * Helper for registering language client information from config
*/

import * as path from "path"

import * as Log from "./../../Log"

import { InitializationOptions, languageManager, ServerRunOptions } from "./LanguageManager"

export interface ILightweightLanguageConfiguration {
    languageServer?: ILightweightLanguageServerConfiguration
}

export interface ILightweightLanguageServerConfiguration {
    command?: string
}

export const createLanguageClientsFromConfiguration = (configurationValues: { [key: string]: any }) => {
    const languageInfo = expandLanguageConfiguration(configurationValues)
    const languages = Object.keys(languageInfo)

    languages.forEach((lang) => {
        createLanguageClientFromConfig(lang, languageInfo[lang])
    })
}

const expandLanguageConfiguration = (configuration: { [key: string]: any }) => {

    // Filter for all `language.` keys, ie `language.go.languageServerCommand`
    const keys = Object.keys(configuration).filter((k) => k.indexOf("language.") === 0)

    if (keys.length === 0) {
        return {}
    }

    const expanded = keys.reduce<any>((prev, current) => {

        const newValue = expandConfigurationSetting(prev, current.split("."), configuration[current])
        return newValue
    }, {})

    return expanded.language
}

const expandConfigurationSetting = (rootObject: any, configurationPath: string[], value: string): any  => {
    if (!configurationPath || !configurationPath.length) {
        return value
    }

    const [currentPath, ...remaining] = configurationPath

    const currentObject = rootObject[currentPath] || {}

    return {
        ...rootObject,
        [currentPath]: expandConfigurationSetting(currentObject, remaining, value)
    }
}

const createLanguageClientFromConfig = (language: string, config: ILightweightLanguageConfiguration): void => {
    if (!config || !config.languageServer || !config.languageServer.command) {
        return
    }

    const lightweightCommand = config.languageServer.command

    Log.info(`[Language Manager - Config] Registering info for language: ${language} - command: ${config.languageServer.command}`)

    const commandOrModule = lightweightCommand.endsWith(".js") ? { module: lightweightCommand } : { command: lightweightCommand }

    const simplePathResolver = (filePath: string) => Promise.resolve(path.dirname(filePath))
    const serverRunOptions: ServerRunOptions = {
        ...commandOrModule,
        args: [],
        workingDirectory: simplePathResolver
    }

    const initializationOptions: InitializationOptions = {
        rootPath: simplePathResolver
    }

    languageManager.createLanguageClient(language, serverRunOptions, initializationOptions)
}
