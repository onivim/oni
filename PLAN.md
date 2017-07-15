- Create `Neovim` class that handles starting neovim and bubbling out events
    - Hook up `quit` event
    - `awaitify` `NeovimInstance`

    - Set up `request` event
    - Set up `disconnect` event

    - export Neovim.start()
    - export `INeovimInstance`
    - Refactor events to be strongly typed? `onBufferChanged`?
    - Refactor out plugin dependency
        - Use initialization event, or hook promise to start plugins instead

- React perf profiling?
- Refactor out so that other node-based RPC clients can use it

- Load time - lazy load some dependencies?
