/**
 * TokenColorsTest
 */

import * as assert from "assert"

import { TokenColors } from "./../../src/Services/TokenColors"

import { MockConfiguration, MockThemeLoader } from "./../Mocks"

import { DefaultTheme, ThemeManager } from "./../../src/Services/Themes"

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

    it("if configuration is updated, but 'editor.tokenColors' isn't there, onTokenColorsChanged should not be triggered", () => {
        const tokenColors = new TokenColors(mockConfiguration as any, themeManager)

        let hitCount = 0
        tokenColors.onTokenColorsChanged.subscribe(() => hitCount++)

        mockConfiguration.simulateConfigurationChangedEvent({ someConfigValue: 2 })
        assert.strictEqual(hitCount, 0, "Validate onTokenColorsChanged was fired")
    })

    it("if 'editor.tokenColors' is updated from the config, onTokenColorsChanged event should be triggered", () => {
        const tokenColors = new TokenColors(mockConfiguration as any, themeManager)

        let hitCount = 0
        tokenColors.onTokenColorsChanged.subscribe(() => hitCount++)

        mockConfiguration.simulateConfigurationChangedEvent({ "editor.tokenColors": [] })
        assert.strictEqual(hitCount, 1, "Validate onTokenColorsChanged was fired")
    })
})
