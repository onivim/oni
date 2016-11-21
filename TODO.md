- Command line argument to include additional plugin path

- LaunchService
    - Launch command: editor.launch
    - F5 launch
        launch.json
    - F5 -> editor.launch
    - GetLaunchOptions(..)
    - Launch(launchOption)

- Sample language service plugin
    - Refactor the common prefix-resolution to a helper method in Oni
    - Launch
    - Documentation  - generate from Oni.d.ts

- Tasks provider
    - npm tasks
    - output window
        - rightbelow 20new
            -20new = number of lines
        - set nomodifiable
        - create as scratch buffer: http://vim.wikia.com/wiki/Vim_buffer_FAQ
    - GetTasks(..)
    - RunTask(..)
    - Include tasks in QuickOpen

- Errors + Quick Info
    - Add field for errors in quick info
    - Factor current error state management from overlay to service
    - When opening QuickInfo, check if there is an error at current position, and add
    - Remove slide out error detail

- Performance: Scrolling
- Aniamtion/Performance: Optimistic Typing
- Animation: Cursor velocity
- Animation: Background video / background image
- Aniamtion: QuickOpen - blur 

- Overlay fixes
    - Config variable to show overlay
    - Find repro for the overlay to shift

- VimTutor enhancements
    - Konami code / game

- Overlay concept
    - Host in webview vs browser window?
    - What would API look like for this?
    - Git changes
    - Handling error messages
    - Minimap
    - Scrollbar
    - Filetype overlay

- Markdown preview mode
    - Side-by-side? Pane view?

- Welcome page
    - Overlay plugin

- Pane
    - Assumptions around sizing / positions

- File explorer
    - Fast nav hook up?

- Allow multiple language services / completion providers

- Fast nav through chrome

- Broken keys
    - VolumeUp/VolumeDown
    - ScrollLock


- Type signature help
- Scroll bar
    - Minimap
    - git changes
    - errors

- Config loading relative to path

- CTRL+Shift+P - command palette
- Preview window

- Terminal support
    - 'Read-only' except for command line
    - Generalizing neovim to work in text box

- REPL support
    - Run functions locally
    - How to hook up to build?Meta

- General pane integration
    - Host plugins as webview browserwindow

- File explorer integration
    - Webview pane?
- Performance
    - DOM Renderer
- Enhanced syntax highlighting

- <C-P> further work
    - Git detection
        - Handle case when git is not available, fallback to readdir approach

    - Fuzzy matching full path ('fuzzy' npm module)
    - Scrollbar / integration with C-n
    - Extending pinned concept - use time or ordering to remove from MRU


- Update metadata
    - Dictionary instead of array
    - capabilities: {
        completionProvider: {
            resolveProvider: true,
            }
        },
        signatureHelpProvider: {
            triggerCharacters: [(]
        }

- Can we stabilize the language service by waiting to write?
    - Is the process actually crashing?
    - Ability to add logging: https://github.com/Microsoft/TypeScript/wiki/Standalone-Server-%28tsserver%29
    - Logging here: http://stackoverflow.com/questions/34881343/node-js-detect-a-child-process-exit

- Fix UI for completion

- Start hooking up TypeScript language service - bring over typescript completion plugin

- Continue investigating performance

- Bound commands
    - KeyBindings
        - Get bound command (key press)
    - CommandManager
        - Pluginmanager - subscribeToCommand("editor.gotoDefinition")

- Need to pivot on the request/response
    - send 'buffer-update'
    - send 'vim-event'
    - send 'request'
        - 'quick-info'
        - 'definition'
        - 'completions'

    - plugin sends back 'response'
        - 'quick-info'
        - 'definition'
        - 'completions'

    - Plugin manager - don't directly call send
        - bufferUpdate function
        - handleVimEvent function

    - Means we need to push up the handling
        - if event is 'CursorMoved', do quick-info request
        - if event is 'CursorMovedI', do completion request

- Plugin manifest
    - engine property: "oni": "^0.0.1"
    - oni
        "typescript": {
            "subscriptions": [
                "buffer-update"
            ],
            "languageService": [
                "quick-info": true,
                "goto-definition": true,
                "completion-provider": true,
            ]
        }
    - activationEvents
    - contributes
        - language service
            - quick info
            - goto definition
            - completion
            - syntax highlighting
        - debugger
        - unit test mapping
            - relevant tests for a code block
        - REPL
            - execute highlighted code
            - execute general code
        - 'Notebook' view
            - Show components live
        - code coverage

- Features
    - Cycle open windows
    - CTRL-p open window

- Implement single main but multiple browser windows, for quick re-open

- Performance: Start-up time: Minification of bundle.js 

- Mouse
    - Modifier keys
        - Ctrl/alt/shift
        - Right / middle button

- QuickOpen: fuzzy matching for items
- AutoComplete: fuzzy matching

