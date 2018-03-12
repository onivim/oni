import { Rectangle, BrowserWindow } from "electron"
import * as Log from "./Log"

// Function to process moving to the next Oni window, given a direction.
export function moveToNextOniInstance(windows: BrowserWindow[], direction: string) {
    const currentFocusedWindows = windows.filter(f => f.isFocused())

    if (currentFocusedWindows.length === 0) {
        Log.info("No window currently focused")
        return
    } else if (windows.length === 1) {
        Log.info("No window to swap to")
        return
    }

    const currentFocusedWindow = currentFocusedWindows[0]
    const windowsToCheck = windows.filter(
        window => window !== currentFocusedWindow && !window.isMinimized(),
    )

    const validWindows = windowsToCheck.filter(window =>
        windowIsInValidDirection(direction, currentFocusedWindow.getBounds(), window.getBounds()),
    )

    if (validWindows.length === 0) {
        return
    }

    const windowToSwapTo = validWindows.reduce<BrowserWindow>((curr, prev) => {
        const isCurrentWindowBetter = checkWindowToFindBest(
            currentFocusedWindow,
            curr,
            prev,
            direction,
        )

        if (isCurrentWindowBetter) {
            return curr
        } else {
            return prev
        }
    }, validWindows[0])

    windows[windows.indexOf(windowToSwapTo)].focus()
}

function windowIsInValidDirection(direction: string, currentPos: Rectangle, testPos: Rectangle) {
    let valuesIncrease = false
    let coord = "x"

    switch (direction) {
        case "left":
            valuesIncrease = false
            break
        case "right":
            valuesIncrease = true
            break
        case "up":
            valuesIncrease = false
            coord = "y"
            break
        case "down":
            valuesIncrease = true
            coord = "y"
            break
        default:
            return false
    }

    // Check if the screen we are testing is in the right direction.
    // shouldBeBigger is used for moving to the right or down, since the X/Y values increase.
    // Othewise, we want the value that decreases (i.e. for left or up)
    if (valuesIncrease) {
        if (testPos[coord] > currentPos[coord]) {
            return true
        }
    } else {
        if (testPos[coord] < currentPos[coord]) {
            return true
        }
    }

    return false
}

// Given a window, check if it is the best window seen so far.
// This is determined by the difference in X and Y relative to the current window.
function checkWindowToFindBest(
    currentWindow: BrowserWindow,
    testWindow: BrowserWindow,
    currentBest: BrowserWindow,
    direction: string,
) {
    const differenceInX = Math.abs(currentWindow.getBounds().x - testWindow.getBounds().x)
    const differenceInY = Math.abs(currentWindow.getBounds().y - testWindow.getBounds().y)

    const bestDiffInX = Math.abs(currentWindow.getBounds().x - currentBest.getBounds().x)
    const bestDiffInY = Math.abs(currentWindow.getBounds().y - currentBest.getBounds().y)

    if (differenceInX < bestDiffInX || differenceInY < bestDiffInY) {
        return true
    } else {
        return false
    }
}
