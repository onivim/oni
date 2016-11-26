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
        this._debouncedCompletions = PromiseDebouncer_1.debounce((context, completionInfo) => this._languageService.getCompletions(context));
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
    evaluateBlock(position, code) {
        return this._languageService.evaluateBlock(position, code);
    }
}
exports.DebouncedLanguageService = DebouncedLanguageService;
//# sourceMappingURL=DebouncedLanguageService.js.map