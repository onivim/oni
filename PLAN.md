- Neovim-backed UI - `SharedNeovimInstance`
    - Refactor NeovimInstance out to a method
        - Set buffer size
        - Set `nomodifiable`

- UX
    - Fix padding
    - Fix font colors
    - Add function to map colors / icons
    - Transitions?

- Focus
    - Differentiate focus between panes
    - Handle focus navigation back to primary window splits

Add new commands:
    - `explorer.refresh` - update the explorer window
    - `explorer.newFile`- create a new file
    - `explorer.expand` - expand a folder
    - `explorer.rename` - rename a file
    - `explorer.delete` - delete a file /selection
    - `explorer.copy` - copy selection
    - `explorer.paste` - paste selection

