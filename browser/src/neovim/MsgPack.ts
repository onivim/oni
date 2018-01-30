/**
 * MsgPack.ts
 *
 * Definition of MsgPack types for Neovim
 */

import * as msgpackLite from "msgpack-lite"

export class MsgPackObjectReference {
    public id: string
}

export class NeovimBufferReference extends MsgPackObjectReference {}
export class NeovimWindowReference extends MsgPackObjectReference {}
export class NeovimTabReference extends MsgPackObjectReference {}

export const Pack = (reference: MsgPackObjectReference) => {
    return msgpackLite.encode(reference.id)
}

export const Unpack = (rawData: any, msgPackObject: MsgPackObjectReference) => {
    const id = msgpackLite.decode(rawData)
    msgPackObject.id = id
    return msgPackObject
}

export const UnpackBuffer = (rawData: any) => Unpack(rawData, new NeovimBufferReference())
export const UnpackTab = (rawData: any) => Unpack(rawData, new NeovimTabReference())
export const UnpackWindow = (rawData: any) => Unpack(rawData, new NeovimWindowReference())
