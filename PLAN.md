- Investigate overlay issue (other `stack` element blocking click / mouse events)

- Implement rendering for current mode
    - n / i / v / etc (choose colors)
    - Log issue in neovim core to deterministically check mode - would be helpful to have the following autocmds:
        - `VisualEnter`
        - `VisualLeave`

- Add language server status bar item (separate WI?)
- Add git branch status bar item (separate WI?)

- Add click handlers for status bar items
- Use same font for status line as for UI

- Debug timing issue where sometimes the status bar does not load immediately
    - General plugin issue, if file is opened directly
