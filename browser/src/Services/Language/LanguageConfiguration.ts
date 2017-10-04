/**
 * LanguageConfiguration.ts
 *
 * Helper for registering language client information from config
*/

import * as Config from "./../../Config"

import { languageManager } from "./LanguageManager"

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

export const createLanguageClientsFromConfiguration = (configuration: { [key: string]: any }) => {
    const languageInfo = expandLanguageConfiguration(Config.instance().getValues())
    const languages = Object.keys(languageInfo)

    languages.forEach((lang) => {
        languageManager.createLanguageClientFromConfig(lang, languages[lang])
    })
}
