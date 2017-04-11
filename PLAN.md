## Next
- Find all references
- Signature Help
- Errors
- Create constants - does vscode-langserver-types have constants for the notifications?
- Clean up code
    - Replace 'any' types
    - Rationalize the `Thenable`s returned by the vscode types

- Set up lifecycle when switching between projects - create / shutdown
- Refactor to use function for creating initialization params

- Validate QuickInfo across multiple projects - LSP close / open based on root directory

- Defer activation of plugin until a relevant file is opened
- Validate performance
    - Validate only single instance of plugin is receiving updates (ensure no perf regressions)

## Longer term / Future work
- Set up status bar to show LSP status
- Hook up signature helper
- Hook up syntax highlighting
- Refactor TypeScript language service to use existing implementation
- Split up plugins to separate packages that are on-demand installed - for now, core language support (JS/TS, C#, Python, Rust, C++) will be bundled. Once some of the plugin management tasks are taken on, they can be split out into separate bundles that are installed on-demand.
