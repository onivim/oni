import * as React from "react"

export const Default = ""
export const Large = "fa-lg"
export const TwoX = "fa-2x"
export const ThreeX = "fa-3x"
export const FourX = "fa-4x"
export const FiveX = "fa-5x"

export enum IconSize {
    Default = 0,
    Large,
    TwoX,
    ThreeX,
    FourX,
    FiveX,
}

export interface IconProps {
    name: string
    size?: IconSize
}

export class Icon extends React.Component<IconProps, void> {
    public render(): JSX.Element {
        const className = "fa fa-" + this.props.name + " " + this._getClassForIconSize(this.props.size as any) // FIXME: undefined
        return <i className={className} aria-hidden="true"></i>
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
            default:
                return Default
        }
    }
}
