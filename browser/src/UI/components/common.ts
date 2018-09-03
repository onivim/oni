import * as Color from "color"
import * as styledComponents from "styled-components"
import { ThemedStyledComponentsModule, ThemeProps } from "styled-components" // tslint:disable-line no-duplicate-imports
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

export type Css =
    | styledComponents.InterpolationValue[]
    | Array<styledComponents.FlattenInterpolation<ThemeProps<IThemeColors>>>

type FlexDirection = "flex-start" | "flex-end" | "center" | "space-between"

export interface ContainerProps {
    direction: "horizontal" | "vertical"
    fullHeight?: boolean
    fullWidth?: boolean
    extension?: Css
    justify?: FlexDirection
    alignment?: FlexDirection
}

export const Fixed = styled.div`
    flex: 0 0 auto;
`

export const Full = styled.div`
    flex: 1 1 auto;
`

export const Container = withProps<ContainerProps>(styled.div)`
    display: flex;
    flex-direction: ${p => (p.direction === "vertical" ? "column" : "row")};
    ${p => (p.fullHeight ? "height: 100%" : "")};
    ${p => (p.fullWidth ? "width: 100%" : "")};
    ${p => (p.justify ? p.justify : "")};
    ${p => (p.alignment ? p.alignment : "")}
    ${p => p.extension};
`

export const scrollbarStyles = css`
    ${props =>
        props.theme["scrollbar.track"] &&
        `&::-webkit-scrollbar-track {
                background: ${props.theme["scrollbar.track"]};
        }`}
    ${props =>
        props.theme["scrollbar.thumb"] &&
        `&::-webkit-scrollbar-thumb {
                background: ${props.theme["scrollbar.thumb"]};
        }`}
    ${props =>
        props.theme["scrollbar.thumb.hover"] &&
        `&::-webkit-scrollbar-thumb:hover {
                background: ${props.theme["scrollbar.thumb.hover"]};
        }`};
    `

export const Bold = styled.span`
    font-weight: bold;
`

export const Center = styled.div`
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
`

export const stack = css`
    position: absolute;
    top: 0px;
    left: 0px;
    right: 0px;
    bottom: 0px;
`

// Layer is used to force webkit to promote the element to an individual layer.
// This is used to tweak and control rendering performance, and not for layout
export const layer = css`
    will-change: transform;
`

export const StackLayer = styled<{ zIndex?: number | string }, "div">("div")`
    ${stack};
    ${layer};
    ${p => p.zIndex && `z-index: ${p.zIndex}`};
`

type GetBorder = (
    args: {
        isSelected?: boolean
        borderSize?: string
        theme?: styledComponents.ThemeProps<IThemeColors>
    },
) => string

export const showScrollbarOnHover = css`
    overflow: hidden;
    &:hover {
        overflow: overlay;
    }
`

export const getSelectedBorder: GetBorder = ({ isSelected, borderSize = "1px", theme }) =>
    isSelected
        ? `${borderSize} solid ${theme["highlight.mode.normal.background"]}`
        : `${borderSize} solid transparent`

export const sidebarItemSelected = css`
    border: ${getSelectedBorder};
`

export type StyledFunction<T> = styledComponents.ThemedStyledFunction<T, IThemeColors>

export function withProps<T, U extends HTMLElement = HTMLElement>(
    styledFunction: StyledFunction<React.HTMLProps<U>>,
): StyledFunction<T & React.HTMLProps<U>> {
    return styledFunction
}

export const pixel = (v: string | number): string => `${v}px`

const darken = (c: string, deg = 0.15) =>
    Color(c)
        .darken(deg)
        .hex()
        .toString()

const lighten = (c: string, deg = 0.25) =>
    Color(c)
        .lighten(deg)
        .hex()

const boxShadow = css`
    box-shadow: 0 4px 8px 2px rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19);
`

const boxShadowUp = css`
    box-shadow: 0 -8px 20px 0 rgba(0, 0, 0, 0.2);
`

const boxShadowInset = css`
    box-shadow: inset 0 4px 8px 2px rgba(0, 0, 0, 0.2);
`

const boxShadowUpInset = css`
    box-shadow: 0px -4px 20px 0px rgba(0, 0, 0, 0.2) inset;
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

export const textOverflow = css`
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
`

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

/**
 * Get a prop from the Oni theme
 *
 * @name propsInTheme
 * @function
 * @param {T} generic(theme object)
 * @param {string} ...paths the dot notation string path
 * @returns {string} the accessed prop or null
 */
export function propInTheme<T>(themeObject: T, ...paths: string[]): string {
    return paths.reduce(
        (targetObject, key) => (targetObject && targetObject[key] ? targetObject[key] : null),
        themeObject,
    )
}

/**
 * **themeGet**
 *
 * helper method to pull a prop out of the theme and specify a fallback
 * the fallback can be a key in the theme object or a css style like "red" for color
 * the third argument is a key in the props object of the component which should represent
 * a boolean determining whether or no the default should be used
 * CREDIT: Styled-System
 **/
export const themeGet = <T>(
    paths: keyof IThemeColors,
    fallback?: string,
    shouldDefault?: keyof T,
) => (props: OniStyledProps<T>) => {
    if (shouldDefault && shouldDefault in props && !props[shouldDefault]) {
        return propInTheme(props.theme, fallback)
    }
    return propInTheme(props.theme, paths) || propInTheme(props.theme, fallback) || fallback
}

export type OniThemeProps = ThemeProps<IThemeColors>
export type OniStyledProps<T> = OniThemeProps & T

export {
    css,
    injectGlobal,
    keyframes,
    styled,
    ThemeProvider,
    withTheme,
    tint,
    boxShadow,
    boxShadowUp,
    boxShadowInset,
    boxShadowUpInset,
    enableMouse,
    fontSizeSmall,
    fallBackFonts,
    darken,
    lighten,
    IThemeColors,
}

export default styled
