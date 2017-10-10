
import { ILanguageClientProcess } from "./LanguageClientProcess"
import { PromiseQueue } from "./PromiseQueue"

// TODO: Naming it 'LanguageClient2' so as not to conflict with the other,
// legacy LanguageClient. Once the work is complete, `LanguageClient` will go away
// and `LanguageClient2` will be renamed.
export class LanguageClient2 {
    private _promiseQueue = new PromiseQueue()

    constructor(
        private _languageClientProcess: ILanguageClientProcess) {
    }

    public sendRequest<T>(fileName: string, requestName: string, protocolArguments: any): Promise<T> {
        return this._promiseQueue.enqueuePromise<T>(async () => {

            const connection = await this._languageClientProcess.ensureActive(fileName)

            console.log("connection")

            return connection.sendRequest<T>(requestName, protocolArguments)
        })
    }

    public sendNotification(fileName: string, notificationName: string, protocolArguments: any): void {
        this._promiseQueue.enqueuePromise(async () => {
            const connection = await this._languageClientProcess.ensureActive(fileName)

            console.log("connection")

            return connection.sendNotification(notificationName, protocolArguments)
        })
    }
}
