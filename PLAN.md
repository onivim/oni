- Create prototype canvas renderer, reviving canvas renderer from before
    - Previous strategy lives here: https://github.com/extr0py/oni/commit/efc687c8420a55002dcad12ca92bb29125d98a8b

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
