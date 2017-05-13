- Implement rendering for current mode
    - n / i / v / etc (choose colors)
    - Log issue in neovim core to deterministically check mode - would be helpful to have the following autocmds:
        - `VisualEnter`
        - `VisualLeave`

- Change font color of file item

- Debug timing issue where sometimes the status bar does not load immediately

- Switch to pure components to improve rendering speed (due to high volume of actions)

- Priority for status bar tiles
