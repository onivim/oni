// import { debounce, PromiseFunction } from "./PromiseDebouncer"

// /**
//  * Wrapper around language service to assist with debouncing
//  * methods that are called frequently
//  */
// export class DebouncedLanguageService implements Oni.Plugin.LanguageService {

//     private _debouncedCompletions: PromiseFunction<null | Oni.Plugin.CompletionResult>
//     private _debouncedFormattingEdits: PromiseFunction<null | Oni.Plugin.FormattingEditsResponse>
//     private _languageService: Oni.Plugin.LanguageService

//     constructor(languageService: Oni.Plugin.LanguageService) {
//         this._languageService = languageService
//         this._debouncedCompletions = debounce(async (context) => { // tslint:disable-line arrow-parens
//             if (this._languageService.getCompletions) {
//                 return this._languageService.getCompletions(context)
//             } else {
//                 return null
//             }
//         })
//         this._debouncedFormattingEdits = debounce(async (context) => { // tslint:disable-line arrow-parens
//             if (this._languageService.getFormattingEdits) {
//                 return this._languageService.getFormattingEdits(context)
//             } else {
//                 return null
//             }
//         })
//     }

//     public getCompletions(position: Oni.EventContext): Promise<null | Oni.Plugin.CompletionResult> {
//         return this._debouncedCompletions(position)
//     }

//     public async getCompletionDetails(position: Oni.EventContext, completionInfo: Oni.Plugin.CompletionInfo): Promise<null | Oni.Plugin.CompletionInfo> {
//         if (this._languageService.getCompletionDetails) {
//             return this._languageService.getCompletionDetails(position, completionInfo)
//         } else {
//             return null
//         }
//     }

//     public getFormattingEdits(position: Oni.EventContext): Promise<null | Oni.Plugin.FormattingEditsResponse> {
//         return this._debouncedFormattingEdits(position)
//     }
// }
