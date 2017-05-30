- Add hover styles for status line
- Investigate repaint issue - seems like there is a performance regression here
    - Looks like there is a layer overlap issue, where updating the status bar causes the whole UI to repaint
    - Seems like an issue with layering - since some elements are absolute positioned, the z-indexing is a bit messed up
    - Extract out to absolute positioned element

- Use same font for status line as for UI

- Implement rendering for current mode
    - n / i / v / etc (choose colors)
    - Log issue in neovim core to deterministically check mode - would be helpful to have the following autocmds:
        - `VisualEnter`
        - `VisualLeave`

- Debug timing issue where sometimes the status bar does not load immediately

- Add github icon?

- Switch to pure components to improve rendering speed (due to high volume of actions)

- Priority for status bar tiles
