/**
 * DefaultConfiguration.ts
 *
 * Specifies Oni default settings
 */

import * as os from "os"

import * as Oni from "oni-api"

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

    "browser.defaultUrl": "https://duckduckgo.com",
    "configuration.editor": "typescript",
    "configuration.showReferenceBuffer": true,

    "debug.fixedSize": null,
    "debug.neovimPath": null,
    "debug.persistOnNeovimExit": false,
    "debug.detailedSessionLogging": false,
    "debug.showTypingPrediction": false,
    "debug.showNotificationOnError": process.env.NODE_ENV !== "production",

    "debug.fakeLag.languageServer": null,
    "debug.fakeLag.neovimInput": null,

    "wildmenu.mode": true,
    "commandline.mode": true,
    "commandline.icons": true,
    "experimental.preview.enabled": false,
    "experimental.welcome.enabled": false,
    "experimental.particles.enabled": false,
    "experimental.sessions.enabled": false,
    "experimental.sessions.directory": null,
    "experimental.vcs.sidebar": false,
    "experimental.vcs.blame.enabled": false,
    "experimental.vcs.blame.mode": "auto",
    "experimental.vcs.blame.timeout": 800,

    "experimental.colorHighlight.enabled": false,
    "experimental.colorHighlight.filetypes": [
        ".css",
        ".js",
        ".jsx",
        ".tsx",
        ".ts",
        ".re",
        ".sass",
        ".scss",
        ".less",
        ".pcss",
        ".sss",
        ".stylus",
        ".xml",
        ".svg",
    ],
    "experimental.indentLines.enabled": false,
    "experimental.indentLines.color": null,
    "experimental.indentLines.skipFirst": false,
    "experimental.indentLines.bannedFiletypes": [],
    "experimental.markdownPreview.enabled": false,
    "experimental.markdownPreview.autoScroll": true,
    "experimental.markdownPreview.syntaxHighlights": true,
    "experimental.markdownPreview.syntaxTheme": "atom-one-dark",

    "experimental.neovim.transport": "stdio",
    // TODO: Enable pipe transport for Windows
    // "experimental.neovim.transport": Platform.isWindows() ? "pipe" : "stdio",

    "editor.maxLinesForLanguageServices": 2500,
    "editor.textMateHighlighting.enabled": true,

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

    "editor.renderer": "canvas",

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
    "editor.fontWeight": "normal",
    "editor.fontFamily": "",

    "editor.linePadding": 2,

    "editor.quickOpen.execCommand": undefined,
    "editor.quickOpen.filterStrategy": "vscode",
    "editor.quickOpen.defaultOpenMode": Oni.FileOpenMode.Edit,
    "editor.quickOpen.alternativeOpenMode": Oni.FileOpenMode.ExistingTab,
    "editor.quickOpen.showHidden": true,

    "editor.split.mode": "native",

    "editor.typingPrediction": true,

    "editor.scrollBar.visible": true,

    "editor.scrollBar.cursorTick.visible": true,

    "editor.fullScreenOnStart": false,
    "editor.maximizeScreenOnStart": false,

    "editor.cursorLine": true,
    "editor.cursorLineOpacity": 0.1,

    "editor.cursorColumn": false,
    "editor.cursorColumnOpacity": 0.1,

    "editor.tokenColors": [],

    "editor.imageLayerExtensions": [".gif", ".jpg", ".jpeg", ".bmp", ".png"],

    "explorer.persistDeletedFiles": true,
    "explorer.maxUndoFileSizeInBytes": 500_000,

    "environment.additionalPaths": [],

    "keyDisplayer.showInInsertMode": false,

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

    "language.elixir.textMateGrammar": {
        ".ex": path.join(__dirname, "extensions", "elixir", "syntaxes", "elixir.tmLanguage.json"),
        ".exs": path.join(__dirname, "extensions", "elixir", "syntaxes", "elixir.tmLanguage.json"),
        ".eex": path.join(__dirname, "extensions", "elixir", "syntaxes", "eex.tmLanguage.json"),
        ".html.eex": path.join(
            __dirname,
            "extensions",
            "elixir",
            "syntaxes",
            "html(eex).tmLanguage.json",
        ),
    },

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

    "language.haskell.languageServer.command": "stack",
    "language.haskell.languageServer.arguments": ["exec", "--", "hie", "--lsp"],
    "language.haskell.languageServer.rootFiles": [".git"],
    "language.haskell.languageServer.configuration": {},

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
    "language.lua.textMateGrammar": path.join(
        __dirname,
        "extensions",
        "lua",
        "syntaxes",
        "lua.tmLanguage.json",
    ),
    "language.clojure.textMateGrammar": path.join(
        __dirname,
        "extensions",
        "clojure",
        "syntaxes",
        "clojure.tmLanguage.json",
    ),
    "language.ruby.textMateGrammar": path.join(
        __dirname,
        "extensions",
        "ruby",
        "syntaxes",
        "ruby.tmLanguage.json",
    ),
    "language.swift.textMateGrammar": path.join(
        __dirname,
        "extensions",
        "swift",
        "syntaxes",
        "swift.tmLanguage.json",
    ),
    "language.rust.textMateGrammar": path.join(
        __dirname,
        "extensions",
        "rust",
        "syntaxes",
        "rust.tmLanguage.json",
    ),
    "language.php.textMateGrammar": path.join(
        __dirname,
        "extensions",
        "php",
        "syntaxes",
        "php.tmLanguage.json",
    ),
    "language.objc.textMateGrammar": {
        ".m": path.join(
            __dirname,
            "extensions",
            "objective-c",
            "syntaxes",
            "objective-c.tmLanguage.json",
        ),
        ".h": path.join(
            __dirname,
            "extensions",
            "objective-c",
            "syntaxes",
            "objective-c.tmLanguage.json",
        ),
    },
    "language.objcpp.textMateGrammar": {
        ".mm": path.join(
            __dirname,
            "extensions",
            "objective-c++",
            "syntaxes",
            "objective-c++.tmLanguage.json",
        ),
    },
    "language.python.textMateGrammar": path.join(
        __dirname,
        "extensions",
        "python",
        "syntaxes",
        "python.tmLanguage.json",
    ),
    "language.sh.textMateGrammar": path.join(
        __dirname,
        "extensions",
        "shell",
        "syntaxes",
        "shell.tmLanguage.json",
    ),
    "language.zsh.textMateGrammar": path.join(
        __dirname,
        "extensions",
        "shell",
        "syntaxes",
        "shell.tmLanguage.json",
    ),
    "language.markdown.textMateGrammar": {
        ".md": path.join(
            __dirname,
            "extensions",
            "markdown",
            "syntaxes",
            "markdown.tmLanguage.json",
        ),
        ".markdown": path.join(
            __dirname,
            "extensions",
            "markdown",
            "syntaxes",
            "markdown.tmLanguage.json",
        ),
        ".mkd": path.join(
            __dirname,
            "extensions",
            "markdown",
            "syntaxes",
            "markdown.tmLanguage.json",
        ),
        ".mdown": path.join(
            __dirname,
            "extensions",
            "markdown",
            "syntaxes",
            "markdown.tmLanguage.json",
        ),
    },
    "language.java.textMateGrammar": {
        ".java": path.join(__dirname, "extensions", "java", "syntaxes", "Java.tmLanguage.json"),
        ".jar": path.join(__dirname, "extensions", "java", "syntaxes", "Java.tmLanguage.json"),
    },
    "language.cs.textMateGrammar": path.join(
        __dirname,
        "extensions",
        "csharp",
        "syntaxes",
        "csharp.tmLanguage.json",
    ),
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

    "learning.enabled": true,
    "achievements.enabled": true,

    "menu.caseSensitive": "smart",
    "menu.rowHeight": 40,
    "menu.maxItemsToShow": 8,

    "notifications.enabled": true,

    "recorder.copyScreenshotToClipboard": false,
    "recorder.outputPath": os.tmpdir(),

    "sidebar.enabled": true,
    "sidebar.default.open": true,
    "sidebar.width": "15em",

    "sidebar.marks.enabled": false,
    "sidebar.plugins.enabled": false,

    "snippets.enabled": true,
    "snippets.userSnippetFolder": null,

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

    "oni.plugins.prettier": {
        settings: {
            semi: false,
            tabWidth: 2,
            useTabs: false,
            singleQuote: false,
            trailingComma: "es5",
            bracketSpacing: true,
            jsxBracketSameLine: false,
            arrowParens: "avoid",
            printWidth: 80,
        },
        formatOnSave: false,
        enabled: false,
    },

    "tabs.mode": "tabs",
    "tabs.height": "2.5em",
    "tabs.highlight": true,
    "tabs.maxWidth": "30em",
    "tabs.showFileIcon": true,
    "tabs.showIndex": false,
    "tabs.wrap": false,
    "tabs.dirtyMarker.userColor": "",

    "terminal.shellCommand": null,

    "ui.animations.enabled": true,
    "ui.colorscheme": "nord",
    "ui.iconTheme": "theme-icons-seti",
    "ui.fontFamily":
        "BlinkMacSystemFont, 'Lucida Grande', 'Segoe UI', Ubuntu, Cantarell, sans-serif",
    "ui.fontSize": "13px",
    "ui.fontSmoothing": "auto",

    "workspace.defaultWorkspace": null,
    "workspace.autoDetectWorkspace": "noworkspace",
    "workspace.autoDetectRootFiles": [
        ".git",
        "node_modules",
        ".svn",
        "package.json",
        ".hg",
        ".bzr",
        "build.xml",
    ],
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
    : Platform.isLinux()
        ? LinuxConfigOverrides
        : MacConfigOverrides

export const DefaultConfiguration = {
    ...BaseConfiguration,
    ...PlatformConfigOverride,
}
