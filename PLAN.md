## Blocking issue
- Defer activation of plugin until relevant file is opened
- Performance issue with error marker (always re-rendered)
- Add performance tracking for actions - test performance for particular action

## Next
- Validate shutdown path when switching between projects
- Create constants - does vscode-langserver-types have constants for the notifications?
- Clean up code
    - Add typing for the buffer events coming from Oni
    - Replace 'any' types
    - Rationalize the `Thenable`s returned by the vscode types

- Validate performance
    - Validate only single instance of plugin is receiving updates (ensure no perf regressions)

- Refactor string constants to use `CompletionItemKind`


## Separate issues
- Errors
- Find all references
- Signature Help

## Longer term / Future work
- Set up status bar to show LSP status
- Hook up signature helper
- Hook up syntax highlighting
- Refactor TypeScript language service to use existing implementation
- Split up plugins to separate packages that are on-demand installed - for now, core language support (JS/TS, C#, Python, Rust, C++) will be bundled. Once some of the plugin management tasks are taken on, they can be split out into separate bundles that are installed on-demand.
