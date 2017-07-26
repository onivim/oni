- Add border / padding
- Cursor: pointer
- Slower transition
- IN PARALLEL
    - Externalize tabline
        - Add ext_tabline option
        - Add redux store state
    - Refactor to tab component
    - Refactor completion / quickinfo to inside editor
        - `OniSurface` that wraps `NeovimSurface`?

- Start tab component
- Add 'B'/'T' options in corner
- Add close / modified icons to tab
- Get screenshot for feedback

- Can some of the refactoring be started in separate PR?
    - Refactor pipeline to have component instead of `render`
    - Move cursor/cursorline/quickinfo/etc there?

- Refactor some responsibilities to `NeovimSurface` - which is the core edit piece
    - Factoring out from `NeovimEditor`
    - Neovim exclusive responsibilities

    - Refactor EditorHost to have component instead of Element

    - `OniSurface`
        - wrapper around NeovimSurface that adds autocomplete, cursor, etc

    - `OniSplit`
    <div className="container full vertical">
        <div className="container fixed">
            <Tabs ../>
        </div>
        <div className="container full">
            <OniSurface ... />
        </div>
    </div>

    - `Overlays`?

    - `NeovimSurface` - core rendering logic from `NeovimEditor`
        - rendering
        - drag /drop
        - mouse
        - delta region manager

    - More general: Generalize plugins / interop outside of `NeovimEditor`
    - How to hook up buffers / tab split?
        - Add events for listening to buffer changes
        - Add events for listening to tab changes
    - Redux store?

- Factor cursorline and UI pieces into editor
- Fit into editor (expose API like 'open files', 'onOpenFilesChanged' on editor host)
- Just put directly into <Editor /> component for now
