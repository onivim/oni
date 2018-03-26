import * as Color from "color"
import * as React from "react"
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

export interface ContainerProps {
    direction: "horizontal" | "vertical"
    fullHeight?: boolean
    fullWidth?: boolean
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

    ${p => (p.fullHeight ? "height: 100%;" : "")}
    ${p => (p.fullWidth ? "width: 100%;" : "")}
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

export type StyledFunction<T> = styledComponents.ThemedStyledFunction<T, IThemeColors>

export function withProps<T, U extends HTMLElement = HTMLElement>(
    styledFunction: StyledFunction<React.HTMLProps<U>>,
): StyledFunction<T & React.HTMLProps<U>> {
    return styledFunction
}

export function withTestAttribute<P>(testAttribute: string) {
    return (Component: React.ReactType<P>) => (props: P) => {
        // The object spread operator can't be used here until
        // https://github.com/Microsoft/TypeScript/pull/13288 is merged
        // tslint:disable-next-line:prefer-object-spread
        const extendedProps = Object.assign({}, props, { "data-test": testAttribute })
        return React.createElement(Component, extendedProps)
    }
}

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

// Layer is used to force webkit to promote the element to an individual layer.
// This is used to tweak and control rendering performance, and not for layout
export const layer = css`
    will-change: transform;
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
