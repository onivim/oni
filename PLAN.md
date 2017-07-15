
- Is `Map.set` slow in DOMRenderer?
- What other things can be optimized in DOMRenderer?
- Factor out line numbers?

- Create `Neovim` class that handles starting neovim and bubbling out events
    - `awaitify` `NeovimInstance`
    - Set up `request` event
    - Refactor events to be strongly typed? `onBufferChanged`?
    - Refactor out plugin dependency
        - Use initialization event, or hook promise to start plugins instead

- React perf profiling?
- Refactor out so that other node-based RPC clients can use it

- Load time - lazy load some dependencies?
