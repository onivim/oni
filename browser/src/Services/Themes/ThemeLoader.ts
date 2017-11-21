/**
 * ThemeLoader
 *
 * - Manages loading of themes
 */

import { DefaultTheme, IThemeMetadata } from "./ThemeManager"

export interface IThemeLoader {
    getThemeByName(name: string): Promise<IThemeMetadata>
}

export class DefaultLoader implements IThemeLoader {
    public async getThemeByName(name: string): Promise<IThemeMetadata> {
        return DefaultTheme
    }
}
