/**
 * Coordinates.ts
 *
 * Types and definitions related to working with the coordinate systems in Oni
 */

import * as types from "vscode-languageserver-types"

// In Oni, there are 3 main coordinate systems we reference when looking at building a
// rich UI feature.
//
// - *Buffer Space* - this is a zero-based line and column referencing a position in a buffer.
// - *Screen Space* - this is the zero-based x,y position of a cell in the screen grid.
// - *Pixel Space* - this is the actual pixel coordinate of an item.
//
// For rich UI features, like showing an error squiggle, being able to map from 'buffer space' to 'pixel space'
// is important so that we can show UI in the appropriate place. This mapping is really dependent on the
// dimensions of the window, because the same buffer shown in different size windows will have a different
// mapping from buffer space -> screen space.
//
// The mapping from screen space to pixel space is very simple, as this is purely dependent on the cell size
// (which is based on the font width / height)

export interface ScreenSpacePoint {
    screenX: number
    screenY: number
}

export interface PixelSpacePoint {
    pixelX: number
    pixelY: number
}

export type BufferToScreen = (position: types.Position) => ScreenSpacePoint | null
export type ScreenToPixel = (screenPoint: ScreenSpacePoint) => PixelSpacePoint | null
