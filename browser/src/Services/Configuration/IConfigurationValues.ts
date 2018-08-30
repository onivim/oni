/**
 * IConfigurationValues
 * - Set of configuration values that Oni relies on
 *
 * NOTE: This may not be the complete set of configuration values,
 * because dependent packages or plugins may have their own set of configuration
 */

import * as Oni from "oni-api"

import { TokenColor } from "./../TokenColors"

export type FontSmoothingOptions = "auto" | "antialiased" | "subpixel-antialiased" | "none"
export type DetectionSettings = "always" | "noworkspace" | "never"

export interface IConfigurationValues {
    activate?: (oni: Oni.Plugin.Api) => void
    deactivate?: () => void

    // Debug settings
    "debug.fixedSize": {
        rows: number
        columns: number
    } | null

    // Option to override neovim path. Used for testing new versions before bringing them in.
    "debug.neovimPath": string | null

    "debug.persistOnNeovimExit": boolean
    "debug.detailedSessionLogging": boolean
    "debug.showTypingPrediction": boolean

    "browser.defaultUrl": string

    // Simulate slow language server, for debugging
    "debug.fakeLag.languageServer": number | null
    "debug.fakeLag.neovimInput": number | null

    "debug.showNotificationOnError": boolean

    "editor.split.mode": string

    "configuration.editor": string
    "configuration.showReferenceBuffer": boolean

    // - textMateHighlighting
    "editor.textMateHighlighting.enabled": boolean

    // Whether or not the learning pane is available
    "experimental.particles.enabled": boolean
    // Whether or not the sessions sidebar pane is enabled
    "experimental.sessions.enabled": boolean
    // A User specified directory for where Oni session files should be saved
    "experimental.sessions.directory": string
    // Whether Version control sidebar item is enabled
    "experimental.vcs.sidebar": boolean
    // Whether the color highlight layer is enabled
    "experimental.colorHighlight.enabled": boolean
    // Whitelist of extension for the color highlight layer
    "experimental.colorHighlight.filetypes": string[]
    // Whether the indent lines should be shown
    "experimental.indentLines.enabled": boolean
    // Whether or not to skip the first line of indentation
    "experimental.indentLines.skipFirst": boolean
    "experimental.indentLines.color": string
    // Filetypes the indent lines are not shown for
    "experimental.indentLines.bannedFiletypes": string[]
    // Whether or not the vcs blame layer is enabled
    "experimental.vcs.blame.enabled": boolean
    // Whether or not the blame shows up automatically following a timeout or is manually
    // triggered
    "experimental.vcs.blame.mode": "auto" | "manual"
    // Amount of millisenconds to delay before showing blame per line
    "experimental.vcs.blame.timeout": number
    // Whether the markdown preview pane should be shown
    "experimental.markdownPreview.enabled": boolean
    "experimental.markdownPreview.autoScroll": boolean
    "experimental.markdownPreview.syntaxHighlights": boolean
    "experimental.markdownPreview.syntaxTheme": string

    // The transport to use for Neovim
    // Valid values are "stdio" and "pipe"
    "experimental.neovim.transport": string
    "wildmenu.mode": boolean
    "commandline.mode": boolean
    "commandline.icons": boolean

    // Experimental flag for 'generalized preview'
    "experimental.preview.enabled": boolean

    "experimental.welcome.enabled": boolean

    "autoClosingPairs.enabled": boolean
    "autoClosingPairs.default": any

    // Production settings

    // Bell sound effect to use
    // See `:help bell` for instances where the bell sound would be used
    "oni.audio.bellUrl": string

    "autoUpdate.enabled": boolean

    // Set this to `true` to enable additional syntax highlighting
    // from Oni & language integrations
    "oni.enhancedSyntaxHighlighting": boolean

    // The default config is an opinionated, prescribed set of plugins. This is on by default to provide
    // a good out-of-box experience, but will likely conflict with a Vim/Neovim veteran's finely honed config.
    //
    // Set this to 'false' to avoid loading the default config, and load settings from init.vim instead.
    "oni.useDefaultConfig": boolean

    // By default, user's init.vim is not loaded, to avoid conflicts.
    // Set this to `true` to enable loading of init.vim.
    // Set this to a string to override the init.vim path.
    "oni.loadInitVim": string | boolean

    // If true, hide Menu bar by default
    // (can still be activated by pressing 'Alt')
    // If hidden, menu bar is hidden entirely.
    "oni.hideMenu": boolean | "hidden"

    // glob pattern of files to exclude from fuzzy finder (Ctrl-P)
    "oni.exclude": string[]

    // bookmarks to open if opened in install dir
    "oni.bookmarks": string[]

    // Editor settings

    // Setting this to "webgl" switches to the experimental
    // WebGL-based renderer. Please be aware that this might
    // lead to instability or unexpected behavior until it is
    // considered stable.
    "editor.renderer": "canvas" | "webgl"

    "editor.backgroundOpacity": number
    "editor.backgroundImageUrl": string
    "editor.backgroundImageSize": string

    // Setting this to true enables yank integration with Oni
    // When true, and text is yanked / deleted, that text will
    // automatically be put on the clipboard.
    //
    // In addition, this enables <C-v> and <Cmd-v> behavior
    // in paste from clipboard in insert mode.
    "editor.clipboard.enabled": boolean

    // When true (default), and `editor.clipboard.enabled` is `true`,
    // yanks will be sent to the clipboard.
    "editor.clipboard.synchronizeYank": boolean

    // When true (not default), and `editor.clipboard.enabled` is `true`,
    // deletes will be sent to the clipboard.
    "editor.clipboard.synchronizeDelete": boolean

    // Whether the 'go-to definition' language feature is enabled
    "editor.definition.enabled": boolean

    "editor.quickInfo.enabled": boolean
    // Delay (in ms) for showing QuickInfo, when the cursor is on a term
    "editor.quickInfo.delay": number
    "editor.quickOpen.defaultOpenMode": Oni.FileOpenMode
    "editor.quickOpen.alternativeOpenMode": Oni.FileOpenMode
    "editor.quickOpen.showHidden": boolean

    "editor.errors.slideOnFocus": boolean
    "editor.formatting.formatOnSwitchToNormalMode": boolean // TODO: Make this setting reliable. If formatting is slow, it will hose edits... not fun

    // Sets the `popupmenu_external` option in Neovim
    // Valid options are "oni", "native" or "hidden",
    // where "oni" uses the Oni stylised Popups,
    // "native" uses the default Vim ones,
    // and "hidden" disables the automatic pop-ups, but keeps the stylised tabs when invoked.
    //
    // This will override the default UI to show a consistent popupmenu,
    // whether using Oni's completion mechanisms or VIMs
    //
    // Use caution when changing the `menuopt` parameters if using
    // a custom init.vim, as that may cause problematic behavior
    "editor.completions.mode": string

    // If true (default), ligatures are enabled
    "editor.fontLigatures": boolean
    "editor.fontSize": string
    "editor.fontWeight": string
    "editor.fontFamily": string // Platform specific

    // Additional padding between lines
    "editor.linePadding": number

    // Maximum supported file size (by lines)
    // to include language services/completion/syntax highlight/etc
    "editor.maxLinesForLanguageServices": 2500

    // If true (default), the buffer scroll bar will be visible
    "editor.scrollBar.visible": boolean

    // If true (default), the cursor tick will be shown in the scrollbar.
    "editor.scrollBar.cursorTick.visible": boolean

    // Allow overriding token colors for specific textmate scopes
    "editor.tokenColors": TokenColor[]

    // Additional paths to include when launching sub-process from Oni
    // (and available in terminal integration, later)
    "environment.additionalPaths": string[]

    // User configurable array of files for which
    // the image layer opens
    "editor.imageLayerExtensions": string[]
    // Command to list files for 'quick open'
    // For example, to use 'ag': ag --nocolor -l .
    //
    // The command must emit a list of filenames
    //
    // IE, Windows:
    // "editor.quickOpen.execCommand": "dir /s /b"
    "editor.quickOpen.execCommand": string | null

    // The filter strategy to use for processing results
    // Options:
    // - 'fuse' - use the fusejs strategy
    // - 'regex' - use a regex based strategy
    "editor.quickOpen.filterStrategy": string

    // Typing prediction is Oni's implementation of
    // 'zero-latency' mode typing, and increases responsiveness.
    "editor.typingPrediction": boolean

    // Files deleted in the explorer can be persisted for the duration
    // of the session meaning that deletion can be undone is this is set
    // to true
    "explorer.persistDeletedFiles": boolean
    "explorer.maxUndoFileSizeInBytes": number

    "editor.fullScreenOnStart": boolean
    "editor.maximizeScreenOnStart": boolean

    "editor.cursorLine": boolean
    "editor.cursorLineOpacity": number

    "editor.cursorColumn": boolean
    "editor.cursorColumnOpacity": number

    "keyDisplayer.showInInsertMode": boolean

    "learning.enabled": boolean
    "achievements.enabled": boolean

    // Case-sensitivity strategy for menu filtering:
    // - if `true`, is case sensitive
    // - if `false`, is not case sensitive
    // - if `'smart'`, is case sensitive if the query string
    //   contains uppercase characters
    "menu.caseSensitive": string | boolean
    "menu.rowHeight": number
    "menu.maxItemsToShow": number

    "notifications.enabled": boolean

    // Output path to save screenshots and recordings
    "recorder.outputPath": string

    // If this is set to true, the recorder
    // will save screenshots to clipboard instead
    // of saving to file
    "recorder.copyScreenshotToClipboard": boolean

    "sidebar.enabled": boolean
    "sidebar.default.open": boolean
    "sidebar.width": string

    "sidebar.marks.enabled": boolean
    "sidebar.plugins.enabled": boolean

    "oni.plugins.prettier": {
        settings: {
            semi: boolean
            tabWidth: number
            useTabs: boolean
            singleQuote: boolean
            trailingComma: "es5" | "all" | "none"
            bracketSpacing: boolean
            jsxBracketSameLine: boolean
            arrowParens: "avoid" | "always"
            printWidth: number
            [key: string]: number | string | boolean
        }
        formatOnSave: boolean
        enabled: boolean
        allowedFiletypes?: string[]
    }

    "snippets.enabled": boolean
    "snippets.userSnippetFolder": string

    "statusbar.enabled": boolean
    "statusbar.fontSize": string

    "statusbar.priority": {
        "oni.status.filetype": number
        "oni.status.workingDirectory": number
        "oni.status.git": number
        "oni.status.gitHubRepo": number
        "oni.status.linenumber": number
        "oni.status.mode": number
    }

    "tabs.mode": string

    // Height of individual tabs in the tab strip
    "tabs.height": string

    // Whether or not to render a highlight on the top of the tab
    // (mode highlight)
    "tabs.highlight": boolean

    // Maximum width of a tab
    "tabs.maxWidth": string

    // Whether or not to show the index alongside the tab
    "tabs.showIndex": boolean

    // Whether or not tabs should wrap.
    // If `false`, a scrollbar will be shown.
    // If `true`, will wrap the tabs.
    "tabs.wrap": boolean

    // Whether or not the file icon
    // should be shown in the tab
    "tabs.showFileIcon": boolean

    // can be anything the a css color property accepts e.g.:
    // "red", "#112233", "rgb(11,22,33)"
    "tabs.dirtyMarker.userColor": string

    "terminal.shellCommand": string

    "ui.animations.enabled": boolean
    "ui.iconTheme": string
    "ui.colorscheme": string
    "ui.fontFamily": string
    "ui.fontSize": string
    "ui.fontSmoothing": FontSmoothingOptions

    // Path to the default workspace. The default workspace
    // will be opened if no workspace is specified in configuration.
    "workspace.defaultWorkspace": string
    "workspace.autoDetectWorkspace": DetectionSettings
    "workspace.autoDetectRootFiles": string[]

    // Handle other, non-predefined configuration keys
    [configurationKey: string]: any
}
