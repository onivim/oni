- Factor out to new DOM strategy
- Move keyboard to _onKeyboard
- Move config to _onConfig
- Move event to _onVimEvent
- Refactor log events to helper methods
- Refactor mode-change to helper method
- Refactor render function to helper method

- Refactor the show install help to NeovimEditor

- Will eventually need to decouple the `Services` from individual Neovim instances

- Will need to funnel common plugin manager events to the active editor
