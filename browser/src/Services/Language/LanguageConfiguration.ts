/**
 * LanguageConfiguration.ts
 *
 * Helper for registering language client information from config
 */

import * as path from "path"

import * as Log from "./../../Log"

import { InitializationOptions, LanguageClientProcess, ServerRunOptions } from "./LanguageClientProcess"
import { languageManager } from "./LanguageManager"

import { getRootProjectFileFunc } from "./../../Utility"

export interface ILightweightLanguageConfiguration {
    languageServer?: ILightweightLanguageServerConfiguration
}

export interface ILightweightLanguageServerConfiguration {
    command?: string
    rootFiles?: string[]
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
        [currentPath]: expandConfigurationSetting(currentObject, remaining, value),
    }
}

const simplePathResolver = (filePath: string) => Promise.resolve(path.dirname(filePath))

const createLanguageClientFromConfig = (language: string, config: ILightweightLanguageConfiguration): void => {
    if (!config || !config.languageServer || !config.languageServer.command) {
        return
    }

    const lightweightCommand = config.languageServer.command
    const rootFiles = config.languageServer.rootFiles

    Log.info(`[Language Manager - Config] Registering info for language: ${language} - command: ${config.languageServer.command}`)

    const commandOrModule = lightweightCommand.endsWith(".js") ? { module: lightweightCommand } : { command: lightweightCommand }

    let pathResolver = simplePathResolver

    if (rootFiles) {
        pathResolver = getRootProjectFileFunc(rootFiles)
    }

    const serverRunOptions: ServerRunOptions = {
        ...commandOrModule,
        args: [],
        workingDirectory: pathResolver,
    }

    const initializationOptions: InitializationOptions = {
        rootPath: pathResolver,
    }

    languageManager.registerLanguageClientFromProcess(language, new LanguageClientProcess(serverRunOptions, initializationOptions))
}
