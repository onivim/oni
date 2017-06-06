- Configuration value to enable statusbar

- Implement rendering for current mode
    - n / i / v / etc (choose colors)
    - Log issue in neovim core to deterministically check mode - would be helpful to have the following autocmds:
        - `VisualEnter`
        - `VisualLeave`

- Add language server status bar item (separate WI?)
- Add git branch status bar item (separate WI?)

- Use same font for status line as for UI

- Test on OSX, Linux

- Debug timing issue where sometimes the status bar does not load immediately
    - Reproduces even without a file
    - Seems to reproduce if hitting "refresh" in dev tools
    - Would be interesting to see what events are occurring

- Debug issue where opening a file directly does not load
