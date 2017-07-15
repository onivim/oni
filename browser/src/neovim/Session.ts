import * as msgpackLite from "msgpack-lite"

import { EventEmitter } from "events"

import * as msgpack from "./MsgPack"

/**
 * Session is responsible for the Neovim msgpack session
 */
export class Session extends EventEmitter {
    private _encoder: msgpackLite.EncodeStream
    private _decoder: msgpackLite.DecodeStream
    private _requestId: number = 0
    private _pendingRequests: { [key: number]: Function } = {}

    constructor(writer: NodeJS.WritableStream, reader: NodeJS.ReadableStream) {
        super()

        const codec = msgpackLite.createCodec()

        codec.addExtPacker(0x01, msgpack.NeovimWindowReference, msgpack.Pack)
        codec.addExtUnpacker(0x01, msgpack.UnpackWindow)

        this._encoder = msgpackLite.createEncodeStream({ codec })
        this._decoder = msgpackLite.createDecodeStream({ codec })

        this._encoder.pipe(writer)
        reader.pipe(this._decoder)

        this._decoder.on("data", (data: any) => {
            const [type, ...remaining] = data

            switch (type) {
                case 0:
                    console.warn("Unhandled request")
                    break
                case 1 /* Response */:
                    const [responseMessage, payload1, payload2] = remaining
                    const result = payload1 || payload2
                    this._pendingRequests[responseMessage](result)
                    break
                case 2 /* Notification */:
                    const [notificationMessage, payload] = remaining

                    this.emit("notification", notificationMessage, payload)
                    break
                default:
                    console.warn("Unhandled message")
            }
        })

        this._decoder.on("end", () => {
            this.emit("disconnect")
        })

        this._decoder.on("error", (err: Error) => {
            console.error("Decoder error:", err)
        })
    }

    public request<T>(methodName: string, args: any): Promise<T> {
        this._requestId++
        let r = null
        const promise = new Promise<T>((resolve) => {
            r = (val: any) => {
                resolve(val)
            }
        })

        if (!r) {
            return Promise.reject(null)
        }

        this._pendingRequests[this._requestId] = r
        this._writeImmediate([0, this._requestId, methodName, args])

        return promise
    }

    public notify(methodName: string, args: any) {
        this._writeImmediate([2, methodName, args])
    }

    private _writeImmediate(args: any[]) {
        // Hacks to immediately `flush` the msgpack pipeline
        // The demo examples use `end` on the stream, but that
        // actually closes the stream - the flush is needed
        // to send the data immediately across the stream.
        (this._encoder as any).write(args);
        (this._encoder as any)._flush()
    }
}
