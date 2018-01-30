/**
 * DefaultConfiguration.ts
 *
 * Specifies Oni default settings
 */

import * as os from "os"

import * as path from "path"

import * as Platform from "./../../Platform"

import { IConfigurationValues } from "./IConfigurationValues"
import { ocamlAndReasonConfiguration, ocamlLanguageServerPath } from "./ReasonConfiguration"

const noop = () => {} // tslint:disable-line no-empty

const cssLanguageServerPath = path.join(
    __dirname,
    "node_modules",
    "vscode-css-languageserver-bin",
    "cssServerMain.js",
)
const htmlLanguageServerPath = path.join(
    __dirname,
    "node_modules",
    "vscode-html-languageserver-bin",
    "htmlServerMain.js",
)

const BaseConfiguration: IConfigurationValues = {
    activate: noop,
    deactivate: noop,

    "autoUpdate.enabled": false,

    "debug.fixedSize": null,
    "debug.neovimPath": null,
    "debug.persistOnNeovimExit": false,
    "debug.detailedSessionLogging": false,
    "debug.showTypingPrediction": false,

    "debug.fakeLag.languageServer": null,
    "debug.fakeLag.neovimInput": null,

    "experimental.editor.textMateHighlighting.enabled": false,
    "experimental.commandline.mode": false,
    "experimental.commandline.icons": false,
    "experimental.welcome.enabled": false,
    "experimental.wildmenu.mode": false,

    "experimental.neovim.transport": "stdio",
    // TODO: Enable pipe transport for Windows
    // "experimental.neovim.transport": Platform.isWindows() ? "pipe" : "stdio",

    "editor.maxLinesForLanguageServices": 2500,

    "autoClosingPairs.enabled": true,
    "autoClosingPairs.default": [
        { open: "{", close: "}" },
        { open: "[", close: "]" },
        { open: "(", close: ")" },
    ],

    "oni.audio.bellUrl": null,

    "oni.useDefaultConfig": true,

    "oni.enhancedSyntaxHighlighting": true,

    "oni.loadInitVim": false,

    "oni.hideMenu": false,

    "oni.exclude": ["node_modules", ".git"],
    "oni.bookmarks": [],

    "editor.backgroundOpacity": 1.0,
    "editor.backgroundImageUrl": null,
    "editor.backgroundImageSize": "cover",

    "editor.clipboard.enabled": true,
    "editor.clipboard.synchronizeYank": true,
    "editor.clipboard.synchronizeDelete": false,

    "editor.definition.enabled": true,
    "editor.quickInfo.enabled": true,
    "editor.quickInfo.delay": 500,

    "editor.completions.mode": "oni",
    "editor.errors.slideOnFocus": true,
    "editor.formatting.formatOnSwitchToNormalMode": false,

    "editor.fontLigatures": true,
    "editor.fontSize": "12px",
    "editor.fontFamily": "",

    "editor.linePadding": 2,

    "editor.quickOpen.execCommand": null,
    "editor.quickOpen.filterStrategy": "fuse",

    "editor.typingPrediction": true,

    "editor.scrollBar.visible": true,

    "editor.scrollBar.cursorTick.visible": true,

    "editor.fullScreenOnStart": false,
    "editor.maximizeScreenOnStart": false,

    "editor.cursorLine": true,
    "editor.cursorLineOpacity": 0.1,

    "editor.cursorColumn": false,
    "editor.cursorColumnOpacity": 0.1,

    "editor.tokenColors": [
        {
            scope: "variable.object",
            settings: "Identifier",
        },
        {
            scope: "variable.other.constant",
            settings: "Constant",
        },
        {
            scope: "variable.language",
            settings: "Identifier",
        },
        {
            scope: "variable.parameter",
            settings: "Identifier",
        },
        {
            scope: "variable.other",
            settings: "Identifier",
        },
        {
            scope: "support.function",
            settings: "Function",
        },
        {
            scope: "entity.name",
            settings: "Function",
        },
        {
            scope: "entity.other",
            settings: "Constant",
        },
    ],

    "environment.additionalPaths": [],

    "language.html.languageServer.command": htmlLanguageServerPath,
    "language.html.languageServer.arguments": ["--stdio"],

    "language.go.languageServer.command": "go-langserver",
    "language.go.textMateGrammar": path.join(__dirname, "extensions", "go", "syntaxes", "go.json"),

    "language.python.languageServer.command": "pyls",
    "language.cpp.languageServer.command": "clangd",
    "language.c.languageServer.command": "clangd",

    "language.css.languageServer.command": cssLanguageServerPath,
    "language.css.languageServer.arguments": ["--stdio"],
    "language.css.textMateGrammar": path.join(
        __dirname,
        "extensions",
        "css",
        "syntaxes",
        "css.tmLanguage.json",
    ),
    "language.css.tokenRegex": "[$_a-zA-Z0-9-]",

    "language.less.languageServer.command": cssLanguageServerPath,
    "language.less.languageServer.arguments": ["--stdio"],
    "language.less.textMateGrammar": path.join(
        __dirname,
        "extensions",
        "less",
        "syntaxes",
        "less.tmLanguage.json",
    ),
    "language.less.tokenRegex": "[$_a-zA-Z0-9-]",

    "language.scss.languageServer.command": cssLanguageServerPath,
    "language.scss.languageServer.arguments": ["--stdio"],
    "language.scss.textMateGrammar": path.join(
        __dirname,
        "extensions",
        "scss",
        "syntaxes",
        "scss.json",
    ),
    "language.scss.tokenRegex": "[$_a-zA-Z0-9-]",

    "language.reason.languageServer.command": ocamlLanguageServerPath,
    "language.reason.languageServer.arguments": ["--stdio"],
    "language.reason.languageServer.rootFiles": [".merlin", "bsconfig.json"],
    "language.reason.languageServer.configuration": ocamlAndReasonConfiguration,
    "language.reason.textMateGrammar": path.join(
        __dirname,
        "extensions",
        "reason",
        "syntaxes",
        "reason.json",
    ),

    "language.ocaml.languageServer.command": ocamlLanguageServerPath,
    "language.ocaml.languageServer.arguments": ["--stdio"],
    "language.ocaml.languageServer.configuration": ocamlAndReasonConfiguration,

    "language.typescript.completionTriggerCharacters": [".", "/", "\\"],
    "language.typescript.textMateGrammar": {
        ".ts": path.join(
            __dirname,
            "extensions",
            "typescript",
            "syntaxes",
            "TypeScript.tmLanguage.json",
        ),
        ".tsx": path.join(
            __dirname,
            "extensions",
            "typescript",
            "syntaxes",
            "TypeScriptReact.tmLanguage.json",
        ),
    },
    "language.javascript.completionTriggerCharacters": [".", "/", "\\"],
    "language.javascript.textMateGrammar": {
        ".js": path.join(
            __dirname,
            "extensions",
            "javascript",
            "syntaxes",
            "JavaScript.tmLanguage.json",
        ),
        ".jsx": path.join(
            __dirname,
            "extensions",
            "javascript",
            "syntaxes",
            "JavaScriptReact.tmLanguage.json",
        ),
    },

    "menu.caseSensitive": "smart",
    "menu.rowHeight": 40,
    "menu.maxItemsToShow": 6,

    "recorder.copyScreenshotToClipboard": false,
    "recorder.outputPath": os.tmpdir(),

    "sidebar.enabled": true,
    "sidebar.width": "50px",

    "statusbar.enabled": true,
    "statusbar.fontSize": "0.9em",
    "statusbar.priority": {
        "oni.status.workingDirectory": 0,
        "oni.status.linenumber": 2,
        "oni.status.gitHubRepo": 0,
        "oni.status.mode": 1,
        "oni.status.filetype": 1,
        "oni.status.git": 3,
    },

    "tabs.mode": "buffers",
    "tabs.height": "2.5em",
    "tabs.highlight": true,
    "tabs.maxWidth": "30em",
    "tabs.showFileIcon": true,
    "tabs.showIndex": false,
    "tabs.wrap": false,

    "ui.animations.enabled": true,
    "ui.colorscheme": "nord",
    "ui.iconTheme": "theme-icons-seti",
    "ui.fontFamily":
        "BlinkMacSystemFont, 'Lucida Grande', 'Segoe UI', Ubuntu, Cantarell, sans-serif",
    "ui.fontSize": "13px",
    "ui.fontSmoothing": "auto",

    "workspace.defaultWorkspace": null,
}

const MacConfigOverrides: Partial<IConfigurationValues> = {
    "editor.fontFamily": "Menlo",
    "environment.additionalPaths": ["/usr/bin", "/usr/local/bin"],
}

const WindowsConfigOverrides: Partial<IConfigurationValues> = {
    "editor.fontFamily": "Consolas",
}

const LinuxConfigOverrides: Partial<IConfigurationValues> = {
    "editor.fontFamily": "DejaVu Sans Mono",
    "environment.additionalPaths": ["/usr/bin", "/usr/local/bin"],
}

const PlatformConfigOverride = Platform.isWindows()
    ? WindowsConfigOverrides
    : Platform.isLinux() ? LinuxConfigOverrides : MacConfigOverrides

export const DefaultConfiguration = {
    ...BaseConfiguration,
    ...PlatformConfigOverride,
}
