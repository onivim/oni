## Next

- Validate shutdown path when switching between projects

## Separate issues
- Still have issues with completion
    - `window.` + `setTimeout`
    - Interim completion
    - `private _onBufferUpdate(args: Oni.|)` + `EventContext` -> removes parentheses
        -test case for this?
    - Helpers.ProtocolConstants.| (TextDocument) -> fail

- Errors
- Find all references
- Signature Help

## Longer term / Future work
- Clean up code
    - Refactor string constants to use `CompletionItemKind`
- Move PluginManager / current typescript server to use VS types - have conversion at plugin layer
    - Start updating Oni.d.ts to use vscode types
- Set up status bar to show LSP status
- Hook up signature helper
- Hook up syntax highlighting
- Refactor TypeScript language service to use existing implementation
- Split up plugins to separate packages that are on-demand installed - for now, core language support (JS/TS, C#, Python, Rust, C++) will be bundled. Once some of the plugin management tasks are taken on, they can be split out into separate bundles that are installed on-demand.
