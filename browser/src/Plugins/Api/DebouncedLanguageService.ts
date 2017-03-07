import { debounce, PromiseFunction } from "./PromiseDebouncer"

/**
 * Wrapper around language service to assist with debouncing
 * methods that are called frequently
 */
export class DebouncedLanguageService implements Oni.Plugin.LanguageService {

    private _debouncedCompletions: PromiseFunction<null | Oni.Plugin.CompletionResult>
    private _debouncedFormattingEdits: PromiseFunction<null | Oni.Plugin.FormattingEditsResponse>
    private _debouncedGetSignatureHelp: PromiseFunction<null | Oni.Plugin.SignatureHelpResult>
    private _debouncedQuickInfo: PromiseFunction<null | Oni.Plugin.QuickInfo>
    private _languageService: Oni.Plugin.LanguageService

    constructor(languageService: Oni.Plugin.LanguageService) {
        this._languageService = languageService
        this._debouncedCompletions = debounce(async (context) => { // tslint:disable-line arrow-parens
            if (this._languageService.getCompletions) {
                return this._languageService.getCompletions(context)
            } else {
                return null
            }
        })
        this._debouncedFormattingEdits = debounce(async (context) => { // tslint:disable-line arrow-parens
            if (this._languageService.getFormattingEdits) {
                return this._languageService.getFormattingEdits(context)
            } else {
                return null
            }
        })
        this._debouncedGetSignatureHelp = debounce(async (context) => { // tslint:disable-line arrow-parens
            if (this._languageService.getSignatureHelp) {
                return this._languageService.getSignatureHelp(context)
            } else {
                return null
            }
        })
        this._debouncedQuickInfo = debounce(async (context) => { // tslint:disable-line arrow-parens
            if (this._languageService.getQuickInfo) {
                return this._languageService.getQuickInfo(context)
            } else {
                return null
            }
        })
    }

    public findAllReferences(context: any): Promise<null | Oni.Plugin.ReferencesResult> {
        if (this._languageService.findAllReferences) {
            return this._languageService.findAllReferences(context)
        } else {
            return null
        }
    }

    public getQuickInfo(context: any): Promise<null | Oni.Plugin.QuickInfo> {
        return this._debouncedQuickInfo(context)
    }

    public getCompletions(position: Oni.EventContext): Promise<null | Oni.Plugin.CompletionResult> {
        return this._debouncedCompletions(position)
    }

    public async getDefinition(context: Oni.EventContext): Promise<null | Oni.Plugin.GotoDefinitionResponse> {
        if (this._languageService.getDefinition) {
            return this._languageService.getDefinition(context)
        } else {
            return null
        }
    }

    public async getCompletionDetails(position: Oni.EventContext, completionInfo: Oni.Plugin.CompletionInfo): Promise<null | Oni.Plugin.CompletionInfo> {
        if (this._languageService.getCompletionDetails) {
            return this._languageService.getCompletionDetails(position, completionInfo)
        } else {
            return null
        }
    }

    public getFormattingEdits(position: Oni.EventContext): Promise<null | Oni.Plugin.FormattingEditsResponse> {
        return this._debouncedFormattingEdits(position)
    }

    public getSignatureHelp(position: Oni.EventContext): Promise<null | Oni.Plugin.SignatureHelpResult> {
        return this._debouncedGetSignatureHelp(position)
    }

    public async evaluateBlock(position: Oni.EventContext, id: string, fileName: string, code: string): Promise<null | Oni.Plugin.EvaluationResult> {
        if (this._languageService.evaluateBlock) {
            return this._languageService.evaluateBlock(position, id, fileName, code)
        } else {
            return null
        }
    }
}
