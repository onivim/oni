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

declare function colorNormalize(color: ColorInput, type: "float"): float[]
declare function colorNormalize(color: ColorInput, type: "array"): float[]
declare function colorNormalize(color: ColorInput, type: "int8"): Int8Array
declare function colorNormalize(color: ColorInput, type: "int16"): Int8Array
declare function colorNormalize(color: ColorInput, type: "int32"): Int8Array
declare function colorNormalize(color: ColorInput, type: "uint"): Uint8Array
declare function colorNormalize(color: ColorInput, type: "uint8"): Uint8Array
declare function colorNormalize(color: ColorInput, type: "uint16"): Uint8Array
declare function colorNormalize(color: ColorInput, type: "uint32"): Uint8Array
declare function colorNormalize(color: ColorInput, type: "float32"): Float32Array
declare function colorNormalize(color: ColorInput, type: "float64"): Float64Array
declare function colorNormalize(color: ColorInput, type: "uint_clamped"): Uint8ClampedArray
declare function colorNormalize(color: ColorInput, type: "uint8_clamped"): Uint8ClampedArray
declare function colorNormalize(color: ColorInput): float[]

declare module "color-normalize" {
    export default colorNormalize
}
