- fuzzy matching for items

- Good reference implementation of mouse: 
https://github.com/rhysd/neovim-component/blob/6d3efd8e2ed4fec67ccfa2c8b047aa1711c2f01d/src/neovim/screen-drag.ts

- Error scenario
    - Display mapping
        - Fix event handling, so that the OverlayManager activeWindowDimensionsChanged gets called on:
            - new split
        - Create overlay to follow UI around
        - Overlay needs to listen to buffer event to know which buffer is active
        - Component to show error

    - Split UI into layers
        - Chrome (Pane, Menu, Completion, QuickInfo)
        - Plugin (layers)
    - Get mapping for lines

    - File explorer

- Fast nav through chrome

- Broken keys
    - VolumeUp/VolumeDown
    - ScrollLock

- Overlay concept
    - Host in webview vs browser window?
    - What would API look like for this?
    - Git changes
    - Handling error messages
    - Minimap
    - Scrollbar

- How to map display line to buffer line?
    - line('w0') and line('w$')? (:help line)
    - Can start at top and scroll through with 'j'
    - Can use 'winline()' to see the display line
        - Iterate from 'w0' to 'w$' to build up mapping

- Type signature help
- Scroll bar
    - Minimap
    - git changes
    - errors

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
- Error highlighting
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
    - CTRL-P open window

- Implement single main but multiple browser windows, for quick re-open

- Create Oni API object, pass to plugin
    - Add 'engine' property - "oni": "^0.0.1"
        - Exclude other plugins
    - Make plugins debuggable
        - Expose plugin list from neovim instance
        - Make sure neovim instance is global
    - NeovimInstance - emit 'rpcnotify' action

    - Plugin - subscribe to rpcnotify
        - onBufferOpened(..)
        - onBufferClosed(..)
        - onBufferChanged(..)

        - registerLanguageService("typescript", {
                getCompletions = (bufferPosition) => ICompletionItem[]
                getCompletions(position: BufferPosition => {
                    return []
                })

                resolveCompletion = (completionItem) => ResolvedCompletionItem
                resolveCompletion(completionItem => {

                })
            })

    - LanguageServiceManager
        - Manage current active language service
        - Manage rendering auto-complete UI
