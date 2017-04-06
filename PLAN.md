## Next
- Hook up logging & telemetry events
- Create `LanguageClient` to start hosting this functionality / lifecycle
- Refactor to `Oni.createLanguageClient` method

At plugin-level:

let languageService = ...

```
Oni.on("buffer-enter", (args) => {
    if (!languageService)
        languageService = Oni.createLanguageClient(...)
    else if (languageService.initializationParams.rootPath !== getRootPath(args.rootPath)) {
        languageService.dispose()
        languageService = Oni.createLanguageClient(...)
    }
})
```

```
LanguageClient
    _initializationPromise

    dispose(): void 
        unregister language service
        unbind all Oni listeners
        dispose connection
```

- Validate QuickInfo across multiple projects - LSP close / open based on root directory
- Replace constants - does vscode-langserver-types have constants for the notifications?
- Hook up buffer update / incremental buffer update - validate with quick info
- Hook up code completion
- Hook up goto definition
- Hook up signature helper

- Refactor to a common place / function
    - Something like `Oni.createLanguageServerClient({ ...serverOptions})`
    - Expose dispose method on returned object so it can be closed on deactivation

- Defer activation of plugin until a relevant file is opened

- Validate only single instance of plugin is receiving updates (ensure no perf regressions)

## Longer term
- Log issue to speed up perceived performance of startup time (animation, etc)
- Refactor TypeScript language service to use existing implementation
- Split up plugins to separate packages that are on-demand installed - for now, core language support (JS/TS, C#, Python, Rust, C++) will be bundled. Once some of the plugin management tasks are taken on, they can be split out into separate bundles that are installed on-demand.

## Open issues
- How to manage lifecycle of language server provider? When should the LSP be closed / exited?
