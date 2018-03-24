/**
 * CSS.ts
 *
 * Entry point for loading all of Oni's CSS
 */

export const activate = () => {
    require("./UI/components/common.less")

    require("./UI/components/QuickInfo.less")
    require("./UI/components/Tabs.less")
}
