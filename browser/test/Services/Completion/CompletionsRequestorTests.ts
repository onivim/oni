import * as assert from "assert"
import * as sinon from "sinon"

import { LanguageServiceCompletionsRequestor } from "./../../../src/Services/Completion/CompletionsRequestor"
import { LanguageManager } from "./../../../src/Services/Language"

describe("LanguageServiceCompletionsRequestor", () => {
    describe("getCompletionDetails", () => {
        let completionItem: any, completionDetails: any, languageManager: any, requestor: any

        beforeEach(() => {
            completionItem = sinon.stub()
            completionDetails = sinon.stub()
            languageManager = sinon.createStubInstance(LanguageManager)
            languageManager.sendLanguageServerRequest.resolves(completionDetails)
            requestor = new LanguageServiceCompletionsRequestor(languageManager)
        })

        it("doesn't send the request if the server is incapable", async () => {
            languageManager.getCapabilitiesForLanguage.resolves({
                completionProvider: { resolveProvider: false },
            })

            const returnedDetails = await requestor.getCompletionDetails(
                "mocklang",
                "mockpath",
                completionItem as any,
            )

            sinon.assert.calledWithExactly(languageManager.getCapabilitiesForLanguage, "mocklang")
            sinon.assert.notCalled(languageManager.sendLanguageServerRequest)
            assert.strictEqual(returnedDetails, completionItem)
        })

        it("requests completion details if server is capable", async () => {
            languageManager.getCapabilitiesForLanguage.resolves({
                completionProvider: { resolveProvider: true },
            })

            const returnedDetails = await requestor.getCompletionDetails(
                "mocklang",
                "mockpath",
                completionItem as any,
            )

            sinon.assert.calledWithExactly(languageManager.getCapabilitiesForLanguage, "mocklang")
            sinon.assert.calledWithExactly(
                languageManager.sendLanguageServerRequest,
                "mocklang",
                "mockpath",
                "completionItem/resolve",
                completionItem,
            )
            assert.strictEqual(returnedDetails, completionDetails)
        })
    })
})
