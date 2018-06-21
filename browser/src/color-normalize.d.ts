type ColorInput =
    | string
    | Int8Array
    | Int16Array
    | Int32Array
    | Uint8Array
    | Uint16Array
    | Uint32Array
    | Float32Array
    | Float64Array
    | Array
    | Uint8ClampedArray

declare module "color-normalize" {
    export function call(thisArg: any, color: ColorInput, type: "float"): float[]
    export function call(thisArg: any, color: ColorInput, type: "array"): float[]
    export function call(thisArg: any, color: ColorInput, type: "int8"): Int8Array
    export function call(thisArg: any, color: ColorInput, type: "int16"): Int8Array
    export function call(thisArg: any, color: ColorInput, type: "int32"): Int8Array
    export function call(thisArg: any, color: ColorInput, type: "uint"): Uint8Array
    export function call(thisArg: any, color: ColorInput, type: "uint8"): Uint8Array
    export function call(thisArg: any, color: ColorInput, type: "uint16"): Uint8Array
    export function call(thisArg: any, color: ColorInput, type: "uint32"): Uint8Array
    export function call(thisArg: any, color: ColorInput, type: "float32"): Float32Array
    export function call(thisArg: any, color: ColorInput, type: "float64"): Float64Array
    export function call(thisArg: any, color: ColorInput, type: "uint_clamped"): Uint8ClampedArray
    export function call(thisArg: any, color: ColorInput, type: "uint8_clamped"): Uint8ClampedArray
    export function call(thisArg: any, color: ColorInput): float[]
}
