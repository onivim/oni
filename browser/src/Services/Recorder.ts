/**
 * Recorder.ts
 *
 * Manages a variety of recording scenarios, including:
 *  - Take & save screenshot
 *  - Record & save video (.webm)
 */

import * as fs from "fs"
import * as path from "path"
import { desktopCapturer } from "electron"

import * as Log from "./../Log"

import { configuration } from "./Configuration"

declare var MediaRecorder: any

const ONI_RECORDER_TITLE = "oni_recorder_title"

const toBuffer = (ab: ArrayBuffer) => {
    let buffer = new Buffer(ab.byteLength);
    let arr = new Uint8Array(ab);
    for (let i = 0; i < arr.byteLength; i++) {
        buffer[i] = arr[i];
    }
    return buffer;
}

class Recorder {
    private _recorder: any = null
    private _blobs: Blob[] = []

    public startRecording(): void {
        var title = document.title
        document.title = ONI_RECORDER_TITLE

        desktopCapturer.getSources({ types: ["window", "screen"] }, (error, sources) => {
            if (error) throw error
            for (let i = 0; i < sources.length; i++) {
                let src = sources[i]
                if (src.name === ONI_RECORDER_TITLE) {
                    document.title = title

                    const size = getDimensions()
                    navigator["webkitGetUserMedia"]({
                        audio: false,
                        video: {
                            mandatory: {
                                chromeMediaSource: "desktop",
                                chromeMediaSourceId: src.id,
                                minWidth: 320,
                                maxWidth: size.width,
                                minHeight: 240,
                                maxHeight: size.height,
                            }
                        }
                    }, (stream: any) => { this._handleStream(stream) },
                        (err: Error) => { this._handleUserMediaError(err) })
                    return
                }
            }
        });
    }

    public get isRecording(): boolean {
        return !!this._recorder
    }

    private _handleStream(stream: any) {
        this._recorder = new MediaRecorder(stream)
        this._blobs = []
        this._recorder.ondataavailable = (evt: any) => { this._blobs.push(evt.data) }
        this._recorder.start(100 /* ms */)
    }

    private _handleUserMediaError(err: Error) {
        Log.error(err)
    }

    public async stopRecording(): Promise<void> {
        this._recorder.stop()

        const arrayBuffer = await toArrayBuffer(new Blob(this._blobs, {type: "video/webm"}))

        const buffer = toBuffer(arrayBuffer)
        const videoFilePath = getOutputPath("oni-video", "webm")

        // TODO: Finish making this async
        if (fs.existsSync(videoFilePath)) {
            fs.unlinkSync(videoFilePath)
        }

        fs.writeFileSync(videoFilePath, buffer)

        this._recorder = null
        this._blobs = []
        alert("Recording saved to: " + videoFilePath)
    }

    public takeScreenshot(scale: number = 1): void {
        const webContents = require("electron").remote.getCurrentWebContents()
        webContents.capturePage((image) => {
            const pngBuffer = image.toPNG({ scaleFactor: scale})
            const screenshotPath = getOutputPath("oni-screenshot", "png")
            fs.writeFileSync(screenshotPath, pngBuffer)
            alert("Screenshot saved to: " + screenshotPath)
        })
    }
}

// Some of this code was adapted and modified from this stackoverflow post:
// https://stackoverflow.com/questions/36753288/saving-desktopcapturer-to-video-file-in-electron

const toArrayBuffer = async (blob: Blob): Promise<ArrayBuffer> => {
    return new Promise<ArrayBuffer>((resolve, reject) => {
        const fileReader = new FileReader()
        fileReader.onload = function() {
            let arrayBuffer = this.result
            resolve(arrayBuffer)
        }
        fileReader.readAsArrayBuffer(blob)
    })
}

const getDimensions = () => {
    const size = require("electron").remote.getCurrentWindow().getSize()
    return {
        width: size[0],
        height: size[1],
    }
}

const getOutputPath = (fileBase: string, fileExtension: string) => {
    const outputPath = configuration.getValue("recorder.outputPath")
    const fileName = `${fileBase}-${new Date().getTime()}.${fileExtension}`
    return path.join(outputPath, fileName)
}

export const recorder = new Recorder()
