- Add setting `experimental.editor.renderer` = `canvas` | `dom`
- Create prototype canvas renderer, reviving canvas renderer from before

- Bring back `INeovimRenderer` interface
    - .start
    - .stop
    - .onResize
    - .onAction
- Refactor existing code to use that implementation

- Seems like we can reuse the `ISpan` concept, which is generic
- Can get a list of all `spans` that were modified
- `combineSpansAtBoundary` will need to be reworked for this strategy
    - rename to `combineSpanElementsAtBoundary`

- create `combineSpansAtBoundary`, which can return a new span if it combines with the current spans in the grid
- the rendering takes the final, returned span, and re-renders

- per-word + foreground + background render style
