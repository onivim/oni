- Remove version arg from buffer_enter command since it isn't set up anyway

- Handle `bd` command on different buffer
    - Have deletion send invalidation / list of whole set of buffers
    - Can use `nvim_list_bufs` to get the full list of buffers?

- Hook up save / changed show dirty icon
- Hook up'close' action to mouse click

- Add configuration for disabling / enabling tabs in entirety `tabs.enabled`
- Add configuration for buffers vs vim-style tabs (`tabs.useVimTabs`)

- Issues with mouse with wrong line
- Slower transition

- Alt text?
- Overflow / Scrollbar if too many tabs?
    - Focus tab when navigating?

- Get screenshot for feedback

- More general: Generalize plugins / interop outside of `NeovimEditor`
- How to hook up buffers / tab split?
    - Add events for listening to buffer changes
    - Add events for listening to tab changes
- Redux store?
