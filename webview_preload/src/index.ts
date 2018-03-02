/**
 * Entry point for 'sneak integration' + Oni augmentations in the browser
 *
 * This script is a 'preload' script for the webview. You can see more info here:
 * https://electronjs.org/docs/api/webview-tag#preload
 */

const __oni_win: any = window

// Note that this name must be in sync with 'BrowserView.tsx'
__oni_win["__oni_sneak_collector__"] = () => {
    console.log("hello world")
    return ["1, 2, 3, 4"]
}
