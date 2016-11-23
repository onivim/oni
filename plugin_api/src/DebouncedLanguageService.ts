import { PromiseFunction, debounce } from "./PromiseDebouncer"

/**
 * Wrapper around language service to assist with debouncing
 * methods that are called frequently
 */
export class DebouncedLanguageService implements Oni.Plugin.LanguageService {

    private _debouncedQuickInfo: PromiseFunction<Oni.Plugin.QuickInfo>
    private _debouncedCompletions: PromiseFunction<Oni.Plugin.CompletionResult>

    private _languageService: Oni.Plugin.LanguageService

    constructor(languageService: Oni.Plugin.LanguageService) {
        this._languageService = languageService

        this._debouncedQuickInfo = debounce((context) => this._languageService.getQuickInfo(context))
        this._debouncedCompletions = debounce((context, completionInfo) => this._languageService.getCompletions(context))
    }

    public getQuickInfo(context: any): Promise<Oni.Plugin.QuickInfo> {
        return this._debouncedQuickInfo(context)
    }

    public getCompletions(position: Oni.EventContext): Promise<Oni.Plugin.CompletionResult> {
        return this._debouncedCompletions(position)
    }

    public getDefinition(context: Oni.EventContext): Promise<Oni.Plugin.GotoDefinitionResponse> {
        return this._languageService.getDefinition(context)
    }

    public getCompletionDetails(position: Oni.EventContext, completionInfo: Oni.Plugin.CompletionInfo): Promise<Oni.Plugin.CompletionInfo> {
        return this._languageService.getCompletionDetails(position, completionInfo)
    }
}
