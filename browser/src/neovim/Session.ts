import * as msgpack from "./MsgPack"
import * as msgpackLite from "msgpack-lite"

/**
 * Session is responsible for the Neovim msgpack session
 */
export class Session {
    private _encoder: any
    private _decoder: any
    private _requestId: number = 0

    private _pendingRequests: { [key: number]: Function } = {}

    private _messageHandlers: { [message: string]: Function[] } = {}

    constructor(writer: NodeJS.WritableStream, reader: NodeJS.ReadableStream) {

        const codec = msgpackLite.createCodec()

        codec.addExtPacker(0x01, msgpack.NeovimWindowReference, msgpack.Pack)
        codec.addExtUnpacker(0x01, msgpack.UnpackWindow)

        this._encoder = msgpackLite.createEncodeStream({ codec })
        this._decoder = msgpackLite.createDecodeStream({ codec })

        // reader.on("end", () => {
        //     console.warn("READER END")
        // })

        this._encoder.pipe(writer)

        reader.pipe(this._decoder)

        // pipey.on("data", (data: any) => {
        //     console.log("PIPEY--")
        //     console.dir(data)
        //     console.log("--PIPEY")
        // })

        // pipey.on("end", () => {
        //     console.warn("PIPEY END")
        // })

        this._decoder.on("data", (data: any) => {


            const type = data[0]

            switch(type) {
                case 0:
                    console.warn("Unhandled request")
                    break
                case 1 /* Response */:
                    const result = data[2] || data[3]
                    console["timeStamp"]("neovim.request." + data[1])
                    this._pendingRequests[data[1]](result)
                    break
                case 2:
                    const message = data[1]
                    const payload = data[2]

                    console["timeStamp"]("neovim.notification." + message)

                    if (this._messageHandlers["notification"]) {
                        const handlers = this._messageHandlers["notification"]
                        handlers.forEach(handler => handler(message, payload))
                    } else {
                        console.warn("Unhandled notification: " + message)
                    }
                    break

            }
        })

        this._decoder.on("end", () => {
            console.warn("DECODER END")
        })

        this._decoder.on("error", (err: Error) => {
            console.error("Decoder error!", err)
        })
    }

    public on(message: string, callback: any): void {
        const currentHandlers = this._messageHandlers[message] || []
        this._messageHandlers[message] = currentHandlers.concat(callback)
    }

    public request<T>(methodName: string, args: any): Promise<T> {
        // console.log("request")
        this._requestId++
            // const requestId = this._requestId
        let r
        const promise = new Promise<T>((resolve) => {
            r = (val: any) => {
                // console.log(`Completed request ${requestId} for ${methodName}`)
                resolve(val)
            }
        })

        this._pendingRequests[this._requestId] = r
        this._encoder.write([0, this._requestId, methodName, args])
        this._encoder._flush()

        return promise
        // this._encoder.end()
    }

    public notify(methodName: string, args: any) {
        // console.log("notify")
        this._encoder.write([2, methodName, args])
        this._encoder._flush()
    }
}
