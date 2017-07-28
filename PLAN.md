- Issues with mouse with wrong line
- Slower transition
- IN PARALLEL
    - Buffer state
        - Create `IBufferState`
            - selected buffer id
            - buffer id -> buffer info
        - Add buffer id
        - savedTick
        - changeTick
        - isDirty selector
    - Externalize tabline
        - Add border / padding to state
        - Add redux store state
    - Add configuration for disabling / enabling tabs in entirety `tabs.enabled`
    - Add configuration for buffers vs vim-style tabs (`tabs.useVimTabs`)
    - Hook up `close` action

- Alt text?
- Overflow / Scrollbar if too many tabs?
    - Focus tab when navigating?

- Get screenshot for feedback

- More general: Generalize plugins / interop outside of `NeovimEditor`
- How to hook up buffers / tab split?
    - Add events for listening to buffer changes
    - Add events for listening to tab changes
- Redux store?
