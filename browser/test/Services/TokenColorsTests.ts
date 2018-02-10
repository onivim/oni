/**
 * TokenColorsTest
 */

import * as assert from "assert"

import { TokenColors } from "./../../src/Services/TokenColors"

import { MockConfiguration } from "./../Mocks"
// import * as TestHelpers from "./../TestHelpers"

import { IThemeContribution } from "./../../src/Plugins/Api/Capabilities"
import {
    DefaultTheme,
    IThemeLoader,
    ThemeManager,
    IThemeMetadata,
} from "./../../src/Services/Themes"

export class MockThemeLoader implements IThemeLoader {
    private _nameToTheme: { [key: string]: IThemeMetadata } = {}

    public getAllThemes(): Promise<IThemeContribution[]> {
        const themeContributions = Object.keys(this._nameToTheme).map(
            (name): IThemeContribution => ({
                name,
                path: null,
            }),
        )
        return Promise.resolve(themeContributions)
    }

    public getThemeByName(name: string): Promise<IThemeMetadata> {
        return Promise.resolve(this._nameToTheme[name])
    }

    public addTheme(name: string, theme: IThemeMetadata): void {
        this._nameToTheme[name] = theme
    }
}

describe("TokenColors", () => {
    let mockConfiguration: MockConfiguration
    let themeLoader: MockThemeLoader
    let themeManager: ThemeManager

    beforeEach(() => {
        mockConfiguration = new MockConfiguration()
        themeLoader = new MockThemeLoader()
        themeManager = new ThemeManager(themeLoader)
        themeLoader.addTheme("testTheme", DefaultTheme)
    })

    it("setting theme triggers onTokenColorsChanged event", async () => {
        const tokenColors = new TokenColors(mockConfiguration as any, themeManager)

        let hitCount = 0
        tokenColors.onTokenColorsChanged.subscribe(() => hitCount++)

        await themeManager.setTheme("testTheme")

        assert.strictEqual(hitCount, 1, "Validate onTokenColorsChanged was fired")
    })

    it("setting token configuration value triggers onTokenColorsChanged event", () => {
        const tokenColors = new TokenColors(mockConfiguration as any, themeManager)

        let hitCount = 0
        tokenColors.onTokenColorsChanged.subscribe(() => hitCount++)

        mockConfiguration.simulateConfigurationChangedEvent({ someConfigValue: 2 })
        assert.strictEqual(hitCount, 1, "Validate onTokenColorsChanged was fired")
    })
})
