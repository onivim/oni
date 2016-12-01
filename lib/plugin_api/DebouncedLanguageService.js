"use strict";
const PromiseDebouncer_1 = require("./PromiseDebouncer");
/**
 * Wrapper around language service to assist with debouncing
 * methods that are called frequently
 */
class DebouncedLanguageService {
    constructor(languageService) {
        this._languageService = languageService;
        this._debouncedQuickInfo = PromiseDebouncer_1.debounce((context) => this._languageService.getQuickInfo(context));
        this._debouncedGetSignatureHelp = PromiseDebouncer_1.debounce((context) => this._languageService.getSignatureHelp(context));
        this._debouncedCompletions = PromiseDebouncer_1.debounce((context, completionInfo) => this._languageService.getCompletions(context));
        this._debouncedFormattingEdits = PromiseDebouncer_1.debounce((context) => this._languageService.getFormattingEdits(context));
    }
    getQuickInfo(context) {
        return this._debouncedQuickInfo(context);
    }
    getCompletions(position) {
        return this._debouncedCompletions(position);
    }
    getDefinition(context) {
        return this._languageService.getDefinition(context);
    }
    getCompletionDetails(position, completionInfo) {
        return this._languageService.getCompletionDetails(position, completionInfo);
    }
    getFormattingEdits(position) {
        return this._debouncedFormattingEdits(position);
    }
    getSignatureHelp(position) {
        return this._debouncedGetSignatureHelp(position);
    }
    evaluateBlock(position, id, fileName, code) {
        return this._languageService.evaluateBlock(position, id, fileName, code);
    }
}
exports.DebouncedLanguageService = DebouncedLanguageService;
//# sourceMappingURL=DebouncedLanguageService.js.map