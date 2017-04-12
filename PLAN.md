## Next
- Remove hard coded path - test with switching between two different C# projects
    - Validate shutdown path
- Errors
- Create constants - does vscode-langserver-types have constants for the notifications?
- Clean up code
    - Add typing for the buffer events coming from Oni
    - Replace 'any' types
    - Rationalize the `Thenable`s returned by the vscode types

- Refactor to use function for creating initialization params

- Validate QuickInfo across multiple projects - LSP close / open based on root directory

- Validate performance
    - Validate only single instance of plugin is receiving updates (ensure no perf regressions)

## Blocking issue
- Defer activation of plugin until relevant file is opened

## Separate issues
- Find all references
- Signature Help

## Longer term / Future work
- Set up status bar to show LSP status
- Hook up signature helper
- Hook up syntax highlighting
- Refactor TypeScript language service to use existing implementation
- Split up plugins to separate packages that are on-demand installed - for now, core language support (JS/TS, C#, Python, Rust, C++) will be bundled. Once some of the plugin management tasks are taken on, they can be split out into separate bundles that are installed on-demand.
