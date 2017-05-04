
- Remove existing status bar: https://unix.stackexchange.com/questions/140898/vim-hide-status-line-in-the-bottom
- Create API for StatusBar
- Create state for status bar in redux store
- Create StatusBar react component as part of external UI
- Show current git branch
- Show current filename
- Show current mode
- Show line, character

- Priority for status bar tiles
- Regression in showing logs?

Longer-term:
- For `NeovimEditor`, make sure it gets disposed on unmount. Perhaps a centralized Neovim process factory for multi-plexing multiple processes.


- Does it make sense to directly dispatch redux-actions from the plugins? 
- This would prevent from having a duplicate / parallel protocol
