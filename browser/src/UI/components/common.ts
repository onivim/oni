import * as Color from "color"
import * as styledComponents from "styled-components"
import { ThemedStyledComponentsModule } from "styled-components" // tslint:disable-line no-duplicate-imports
import { IThemeColors } from "../../Services/Themes/ThemeManager"

export const bufferScrollBarSize = "7px"

const {
    default: styled,
    css,
    injectGlobal,
    keyframes,
    withTheme,
    ThemeProvider,
} = (styledComponents as ThemedStyledComponentsModule<any>) as ThemedStyledComponentsModule<
    IThemeColors
>

export type StyledFunction<T> = styledComponents.ThemedStyledFunction<T, IThemeColors>

export function withProps<T, U extends HTMLElement = HTMLElement>(
    styledFunction: StyledFunction<React.HTMLProps<U>>,
): StyledFunction<T & React.HTMLProps<U>> {
    return styledFunction
}

const darken = (c: string, deg = 0.15) =>
    Color(c)
        .darken(0.15)
        .hex()
        .toString()

const boxShadow = css`
    box-shadow: 0 4px 8px 2px rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19);
`

const boxShadowInset = css`
    box-shadow: inset 0 4px 8px 2px rgba(0, 0, 0, 0.2);
`

const enableMouse = css`
    pointer-events: auto;
`

export const OverlayWrapper = styled.div`
    position: absolute;
    top: 0px;
    left: 0px;
    right: 0px;
    bottom: 0px;
`
const tint = (base: string, mix: string, degree: number = 0.1) =>
    Color(base)
        .mix(Color(mix), 0.3)
        .toString()

const fontSizeSmall = `font-size: 0.9em;`

const fallBackFonts = `
    Consolas,
    Menlo,
    Monaco,
    Lucida Console,
    Liberation Mono,
    DejaVu Sans Mono,
    Bitstream Vera Sans Mono,
    Courier New,
    monospace,
    sans-serif
`.trim()

export {
    css,
    injectGlobal,
    keyframes,
    styled,
    ThemeProvider,
    withTheme,
    tint,
    boxShadow,
    boxShadowInset,
    enableMouse,
    fontSizeSmall,
    fallBackFonts,
    darken,
    IThemeColors,
}

export default styled
