- Handle `bd` command on different buffer
    - Have deletion send invalidation / list of whole set of buffers
    - Can use `nvim_list_bufs` to get the full list of buffers?

- Hook up'close' action to mouse click

- Add configuration for disabling / enabling tabs in entirety `tabs.enabled`
- Add configuration for buffers vs vim-style tabs (`tabs.useVimTabs`)

- Overflow / Scrollbar if too many tabs?
    - Focus tab when navigating?

- More general: Generalize plugins / interop outside of `NeovimEditor`
- How to hook up buffers / tab split?
    - Add events for listening to buffer changes
    - Add events for listening to tab changes
- Redux store?
