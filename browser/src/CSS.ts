/**
 * CSS.ts
 *
 * Entry point for loading all of Oni's CSS
 */

export const activate = () => {
    require("./UI/components/common.less") // tslint:disable-line no-var-requires
    require("./overlay.less") // tslint:disable-line

    require("./Services/Menu/Menu.less")
    require("./UI/components/InstallHelp.less")
}
