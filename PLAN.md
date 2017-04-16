## Next

- Split in separate files:
    - LanguageClient.ts
    - LanguageClientLogger.ts
    - LanguageClientHelpers.ts
    - Continue fixing parameters for remaining methods

- Clean up code
    - Add constants in languageClientHelper
    - Refactor string constants to use `CompletionItemKind`

- Validate shutdown path when switching between projects

- Validate performance
    - Validate only single instance of plugin is receiving updates (ensure no perf regressions)

## Separate issues
- Track in separate issue
- Still have issues with completion
    - `window.` + `setTimeout`
    - Interim completion
    - `private _onBufferUpdate(args: Oni.|)` + `EventContext` -> removes parentheses
        -test case for this?

- Errors
- Find all references
- Signature Help

## Longer term / Future work
- Set up status bar to show LSP status
- Hook up signature helper
- Hook up syntax highlighting
- Refactor TypeScript language service to use existing implementation
- Split up plugins to separate packages that are on-demand installed - for now, core language support (JS/TS, C#, Python, Rust, C++) will be bundled. Once some of the plugin management tasks are taken on, they can be split out into separate bundles that are installed on-demand.
