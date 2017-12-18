
import * as styledComponents from "styled-components"
import { ThemedStyledComponentsModule } from "styled-components" // tslint:disable-line no-duplicate-imports
import { IThemeColors } from "../../Services/Themes/ThemeManager"

export const bufferScrollBarSize = "7px"

const {
  default: styled,
  css,
  injectGlobal,
  keyframes,
  ThemeProvider,
} = styledComponents as ThemedStyledComponentsModule<any> as ThemedStyledComponentsModule<IThemeColors>

export type StyledFunction<T> = styledComponents.ThemedStyledFunction<T, IThemeColors>

export function withProps<T, U extends HTMLElement = HTMLElement>(
    styledFunction: StyledFunction<React.HTMLProps<U>>,
): StyledFunction<T & React.HTMLProps<U>> {
    return styledFunction
}

export { css, injectGlobal, keyframes, styled, ThemeProvider }
export default styled
