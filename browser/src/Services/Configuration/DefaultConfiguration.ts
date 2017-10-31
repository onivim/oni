/**
 * DefaultConfiguration.ts
 *
 * Specifies Oni default settings
 */

import * as os from "os"
import * as path from "path"

import * as Platform from "./../../Platform"

import { IConfigurationValues } from "./IConfigurationValues"

const noop = () => { } // tslint:disable-line no-empty


const ocamlAndReasonConfiguration = {
    reason: {
        codelens: {
            enabled: true,
            unicode: true,
        },
        bsb: {
            enabled: true,
        },
        debounce: {
            linter: 500,
        },
        diagnostic: {
            tools: ["merlin"],
        },
        path: {
            bsb: "bash -ic bsb",
            ocamlfind: "bash -ic ocamlfind",
            ocamlmerlin: "bash -ic ocamlmerlin",
            opam: "bash -ic opam",
            rebuild: "bash -ic rebuild",
            refmt: "bash -ic refmt",
            refmterr: "bash -ic refmterr",
            rtop: "bash -ic rtop",
        }
    }
}

const BaseConfiguration: IConfigurationValues = {
    activate: noop,
    deactivate: noop,

    "debug.fixedSize": null,
    "debug.neovimPath": null,
    "debug.persistOnNeovimExit": false,
    "debug.detailedSessionLogging": false,

    "experimental.enableLanguageServerFromConfig": false,

    "oni.audio.bellUrl": path.join(__dirname, "audio", "beep.wav"),

    "oni.useDefaultConfig": true,

    "oni.enhancedSyntaxHighlighting": true,

    "oni.loadInitVim": false,

    "oni.useExternalPopupMenu": true,

    "oni.hideMenu": false,

    "oni.exclude": ["node_modules", ".git"],
    "oni.bookmarks": [],

    "editor.backgroundOpacity": 1.0,
    "editor.backgroundImageUrl": null,
    "editor.backgroundImageSize": "cover",

    "editor.clipboard.enabled": true,

    "editor.quickInfo.enabled": true,
    "editor.quickInfo.delay": 500,

    "editor.completions.enabled": true,
    "editor.errors.slideOnFocus": true,
    "editor.formatting.formatOnSwitchToNormalMode": false,

    "editor.fontLigatures": true,
    "editor.fontSize": "12px",
    "editor.fontFamily": "",

    "editor.linePadding": 2,

    "editor.quickOpen.execCommand": null,

    "editor.scrollBar.visible": true,

    "editor.fullScreenOnStart": false,
    "editor.maximizeScreenOnStart": false,

    "editor.cursorLine": true,
    "editor.cursorLineOpacity": 0.1,

    "editor.cursorColumn": false,
    "editor.cursorColumnOpacity": 0.1,

    "environment.additionalPaths": [],

    "language.go.languageServer.command": "go-langserver",
    "language.python.languageServer.command": "pyls",
    "language.cpp.languageServer.command": "clangd",
    "language.c.languageServer.command": "clangd",


    "language.reason.languageServer.command": "ocaml-language-server",
    "language.reason.languageServer.arguments": ["--stdio"],
    "language.reason.languageServer.rootFiles": [".merlin", "bsconfig.json"],
    "language.reason.languageServer.configuration": ocamlAndReasonConfiguration,

    "language.ocaml.languageServer.command": "ocaml-language-server",
    "language.ocaml.languageServer.arguments": ["--stdio"],
    "language.ocaml.languageServer.configuration": ocamlAndReasonConfiguration,

    "menu.caseSensitive": "smart",

    "recorder.copyScreenshotToClipboard": false,
    "recorder.outputPath": os.tmpdir(),

    "statusbar.enabled": true,
    "statusbar.fontSize": "0.9em",

    "tabs.enabled": true,
    "tabs.showVimTabs": false,
    "tabs.height": "2.5em",
    "tabs.maxWidth": "30em",
    "tabs.wrap": false,
}

const MacConfigOverrides: Partial<IConfigurationValues> = {
    "editor.fontFamily": "Menlo",
    "environment.additionalPaths": [
        "/usr/bin",
        "/usr/local/bin",
    ],
}

const WindowsConfigOverrides: Partial<IConfigurationValues> = {
    "editor.fontFamily": "Consolas",
}

const LinuxConfigOverrides: Partial<IConfigurationValues> = {
    "editor.fontFamily": "DejaVu Sans Mono",
    "environment.additionalPaths": [
        "/usr/bin",
        "/usr/local/bin",
    ],
}

const PlatformConfigOverride = Platform.isWindows() ? WindowsConfigOverrides : Platform.isLinux() ? LinuxConfigOverrides : MacConfigOverrides

export const DefaultConfiguration = {
    ...BaseConfiguration,
    ...PlatformConfigOverride,
}
