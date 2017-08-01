- Handle `bd` command on different buffer
    - Have deletion send invalidation / list of whole set of buffers
    - Create SET_CURRENT_BUFFERS action and reducer
        - payload: number[]
    - Can use `nvim_list_bufs` to get the full list of buffers?

- Hook up click name to activate buffer
- Hook up close only to the 'x' for buffers

- Add configuration for disabling / enabling tabs in entirety `tabs.enabled`
- Add configuration for buffers vs vim-style tabs (`tabs.useVimTabs`)

- Hook up 'close' action to mouse click for tabs mode

- Overflow / Scrollbar if too many tabs?
    - Focus tab when navigating?
