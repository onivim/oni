import * as msgpackLite from "msgpack-lite"

import { EventEmitter } from "events"

import * as Log from "./../Log"

import { configuration } from "./../Services/Configuration"

import * as msgpack from "./MsgPack"

type RequestHandlerFunction = (result: any) => void

type NvimError = [number, string]
type Primitives = "string" | "number" | "object"

const log = (msg: string) => {
    if (configuration.getValue("debug.detailedSessionLogging")) {
        Log.info("[DEBUG - Neovim Session] " + msg)
    }
}

// TODO: This can possibly be generalised to use in other
// neovim type guard check functions
const isArrayOfType = <P>(value: NvimError | P, variableType: Primitives): value is P => {
    if (value && Array.isArray(value)) {
        return typeof value[0] === variableType
    }
    return false
}

/**
 * Session is responsible for the Neovim msgpack session
 */
export class Session extends EventEmitter {
    private _encoder: msgpackLite.EncodeStream
    private _decoder: msgpackLite.DecodeStream
    private _requestId: number = 0
    private _pendingRequests: { [key: number]: RequestHandlerFunction } = {}

    constructor(writer: NodeJS.WritableStream, reader: NodeJS.ReadableStream) {
        super()

        const codec = msgpackLite.createCodec()

        codec.addExtPacker(0x00, msgpack.NeovimBufferReference, msgpack.Pack)
        codec.addExtUnpacker(0x00, msgpack.UnpackBuffer)

        codec.addExtPacker(0x01, msgpack.NeovimWindowReference, msgpack.Pack)
        codec.addExtUnpacker(0x01, msgpack.UnpackWindow)

        codec.addExtPacker(0x02, msgpack.NeovimTabReference, msgpack.Pack)
        codec.addExtUnpacker(0x02, msgpack.UnpackTab)

        this._encoder = msgpackLite.createEncodeStream({ codec })
        this._decoder = msgpackLite.createDecodeStream({ codec })

        this._encoder.pipe(writer)
        reader.pipe(this._decoder)

        this._decoder.on("data", (data: any) => {
            const [type, ...remaining] = data

            switch (type) {
                case 0:
                    Log.warn("Unhandled request")
                    break
                case 1 /* Response */:
                    const [responseMessage, payload1, payload2] = remaining
                    const result = payload1 || payload2
                    log("Received response - " + responseMessage + " : " + result)
                    this._pendingRequests[responseMessage](result)
                    this._pendingRequests[responseMessage] = null
                    break
                case 2 /* Notification */:
                    const [notificationMessage, payload] = remaining
                    log("Received notification - " + notificationMessage)

                    this.emit("notification", notificationMessage, payload)
                    break
                default:
                    Log.warn("Unhandled message")
            }
        })

        this._decoder.on("end", () => {
            log("Disconnect")
            this.emit("disconnect")
        })

        this._decoder.on("error", (err: Error) => {
            Log.error("Decoder error:", err)
        })
    }

    // Neovim does not error if it is unable to get lines instead it returns an array
    // of type [1, "an error message"] **on Some occasions**, we only check the first on the assumption that
    // that is where the number is placed by neovim
    public isNeovimError = <T>(val: T, methodName: string) => {
        switch (methodName) {
            case "nvim_buf_get_lines":
                return !isArrayOfType<T>(val, "string")
            default:
                return false
        }
    }

    public request<T>(methodName: string, args: any): Promise<T> {
        this._requestId++
        let r = null
        const promise = new Promise<T>((resolve, reject) => {
            r = (val: T) => {
                if (this.isNeovimError<T>(val, methodName)) {
                    return reject(null)
                }
                resolve(val)
            }
        })

        if (!r) {
            return Promise.reject(null)
        }

        log("Sending request - " + methodName + " : " + this._requestId)

        this._pendingRequests[this._requestId] = r
        this._writeImmediate([0, this._requestId, methodName, args])

        return promise
    }

    public notify(methodName: string, args: any) {
        log("Sending notification - " + methodName)
        this._writeImmediate([2, methodName, args])
    }

    private _writeImmediate(args: any[]) {
        // Hacks to immediately `flush` the msgpack pipeline
        // The demo examples use `end` on the stream, but that
        // actually closes the stream - the flush is needed
        // to send the data immediately across the stream.
        ;(this._encoder as any).write(args)
        ;(this._encoder as any)._flush()
    }
}
