import * as React from "react"

export const Default = ""
export const Large = "fa-lg"
export const TwoX = "fa-2x"
export const ThreeX = "fa-3x"
export const FourX = "fa-4x"
export const FiveX = "fa-5x"
export const NineX = "fa-9x"

export enum IconSize {
    Default = 0,
    Large,
    TwoX,
    ThreeX,
    FourX,
    FiveX,
    NineX,
}

export interface IconProps {
    name: string
    size?: IconSize
    className?: string
    style?: React.CSSProperties
}
const EmptyStyle: React.CSSProperties = {}

export class Icon extends React.PureComponent<IconProps, {}> {
    public render(): JSX.Element {
        const style = this.props.style || EmptyStyle
        const className =
            "fa fa-" + this.props.name + " " + this._getClassForIconSize(this.props.size as any) // FIXME: undefined
        const additionalClass = this.props.className || ""
        return <i className={className + additionalClass} style={style} aria-hidden="true" />
    }

    private _getClassForIconSize(size: IconSize): string {
        const normalizedSize = size || IconSize.Default

        switch (normalizedSize) {
            case IconSize.Large:
                return Large
            case IconSize.TwoX:
                return TwoX
            case IconSize.ThreeX:
                return ThreeX
            case IconSize.FourX:
                return FourX
            case IconSize.FiveX:
                return FiveX
            case IconSize.NineX:
                return NineX
            default:
                return Default
        }
    }
}
