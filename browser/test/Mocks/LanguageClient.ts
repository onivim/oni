
import { Event } from "oni-types"
import * as Language from "../../src/Services/Language"

export class MockLanguageClient implements Language.ILanguageClient {

    public serverCapabilities: any = {}

    public subscribe(notificationName: string, evt: Event<any>): void {
        // tslint: disable-line
    }

    public handleRequest(requestName: string, handler: Language.RequestHandler): void {
        // tslint: disable-line
    }

    public sendRequest<T>(fileName: string, requestName: string, protocolArguments: Language.NotificationValueOrThunk): Promise<T> {
        return Promise.resolve(null)
    }

    public sendNotification(fileName: string, notificationName: string, protocolArguments: Language.NotificationValueOrThunk): void {
        // tslint: disable-line
    }
}

export default MockLanguageClient

