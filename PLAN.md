## Next
- Look at `File` - way to resolve file path

- Hook up to existing Vim events
    - Hook up quick info
    - Hook up buffer updates
    - Hook up code completion
    - Hook up goto definition
    - Convert to typescript

- Refactor to a common place / function
    - Something like `Oni.createLanguageServerClient({ ...serverOptions})`

- Defer activation of plugin until a relevant file is opened

## Longer term
- Refactor TypeScript language service to use existing implementation

## Open issues
- How to manage lifecycle of language server provider?


