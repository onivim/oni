import { BrowserWindow, Rectangle } from "electron"
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
            currentFocusedWindow.getBounds(),
            curr.getBounds(),
            prev.getBounds(),
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

export function windowIsInValidDirection(
    direction: string,
    currentPos: Rectangle,
    testPos: Rectangle,
) {
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
export function checkWindowToFindBest(
    currentWindow: Rectangle,
    testWindow: Rectangle,
    currentBest: Rectangle,
    direction: string,
) {
    const differenceInX = Math.abs(currentWindow.x - testWindow.x)
    const differenceInY = Math.abs(currentWindow.y - testWindow.y)

    const bestDiffInX = Math.abs(currentWindow.x - currentBest.x)
    const bestDiffInY = Math.abs(currentWindow.y - currentBest.y)

    // Use the main axis such that we always move to the closest window in the
    // direction we are moving.
    let mainAxisDiff = DistanceComparison.larger
    let secondAxisDiff = DistanceComparison.larger

    switch (direction) {
        case "left":
        case "right":
            mainAxisDiff = compareDistances(differenceInX, bestDiffInX)
            secondAxisDiff = compareDistances(differenceInY, bestDiffInY)
            break
        case "up":
        case "down":
            mainAxisDiff = compareDistances(differenceInY, bestDiffInY)
            secondAxisDiff = compareDistances(differenceInX, bestDiffInX)
            break
        default:
            return false
    }

    // If an equal distance away, we should check the other axis and
    // take the one that is closer in that axis.
    // If they are both the same? Just use the current one.
    if (mainAxisDiff === DistanceComparison.smaller) {
        return true
    } else if (
        mainAxisDiff === DistanceComparison.equal &&
        secondAxisDiff === DistanceComparison.smaller
    ) {
        return true
    } else {
        return false
    }
}

enum DistanceComparison {
    smaller,
    larger,
    equal,
}

// Helper function to compare the distances and return how the values
// compare.
export function compareDistances(currentDifference: number, bestDifference: number) {
    if (currentDifference === bestDifference) {
        return DistanceComparison.equal
    } else if (currentDifference < bestDifference) {
        return DistanceComparison.smaller
    } else {
        return DistanceComparison.larger
    }
}
