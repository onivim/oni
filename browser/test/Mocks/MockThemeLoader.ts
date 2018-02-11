/**
 * Mocks/MockThemeLoader.ts
 */

import { IThemeContribution } from "./../../src/Plugins/Api/Capabilities"
import { IThemeLoader, IThemeMetadata } from "./../../src/Services/Themes"

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
