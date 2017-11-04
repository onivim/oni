/**
 * IConfigurationValues
 * - Set of configuration values that Oni relies on
 *
 * NOTE: This may not be the complete set of configuration values,
 * because dependent packages or plugins may have their own set of configuration
 */

export interface IConfigurationValues {

    "activate": (oni: Oni.Plugin.Api) => void
    "deactivate": () => void

    // Debug settings
    "debug.fixedSize": {
        rows: number,
        columns: number,
    } | null

    // Option to override neovim path. Used for testing new versions before bringing them in.
    "debug.neovimPath": string | null

    "debug.persistOnNeovimExit": boolean
    "debug.detailedSessionLogging": boolean

    // Simulate slow language server, for debugging
    "debug.fakeLag.languageServer": number

    // Experimental feature flags

    // Production settings

    // Bell sound effect to use
    // See `:help bell` for instances where the bell sound would be used
    "oni.audio.bellUrl": string

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

    // Sets the `popupmenu_external` option in Neovim
    // This will override the default UI to show a consistent popupmenu,
    // whether using Oni's completion mechanisms or VIMs
    //
    // Use caution when changing the `menuopt` parameters if using
    // a custom init.vim, as that may cause problematic behavior
    "oni.useExternalPopupMenu": boolean

    // If true, hide Menu bar by default
    // (can still be activated by pressing 'Alt')
    "oni.hideMenu": boolean

    // glob pattern of files to exclude from fuzzy finder (Ctrl-P)
    "oni.exclude": string[]

    // bookmarks to open if opened in install dir
    "oni.bookmarks": string[]

    // Editor settings

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

    "editor.quickInfo.enabled": boolean
    // Delay (in ms) for showing QuickInfo, when the cursor is on a term
    "editor.quickInfo.delay": number

    "editor.completions.enabled": boolean
    "editor.errors.slideOnFocus": boolean
    "editor.formatting.formatOnSwitchToNormalMode": boolean // TODO: Make this setting reliable. If formatting is slow, it will hose edits... not fun

    // If true (default), ligatures are enabled
    "editor.fontLigatures": boolean
    "editor.fontSize": string
    "editor.fontFamily": string // Platform specific

    // Additional padding between lines
    "editor.linePadding": number

    // If true (default), the buffer scroll bar will be visible
    "editor.scrollBar.visible": boolean

    // Additional paths to include when launching sub-process from Oni
    // (and available in terminal integration, later)
    "environment.additionalPaths": string[]

    // Command to list files for 'quick open'
    // For example, to use 'ag': ag --nocolor -l .
    //
    // The command must emit a list of filenames
    //
    // IE, Windows:
    // "editor.quickOpen.execCommand": "dir /s /b"
    "editor.quickOpen.execCommand": string | null

    "editor.fullScreenOnStart": boolean
    "editor.maximizeScreenOnStart": boolean

    "editor.cursorLine": boolean
    "editor.cursorLineOpacity": number

    "editor.cursorColumn": boolean
    "editor.cursorColumnOpacity": number

    // Case-sensitivity strategy for menu filtering:
    // - if `true`, is case sensitive
    // - if `false`, is not case sensitive
    // - if `'smart'`, is case sensitive if the query string
    //   contains uppercase characters
    "menu.caseSensitive": string | boolean

    // Output path to save screenshots and recordings
    "recorder.outputPath": string

    // If this is set to true, the recorder
    // will save screenshots to clipboard instead
    // of saving to file
    "recorder.copyScreenshotToClipboard": boolean

    "statusbar.enabled": boolean
    "statusbar.fontSize": string

    "tabs.enabled": boolean
    "tabs.showVimTabs": boolean

    // Height of individual tabs in the tab strip
    "tabs.height": string

    // Maximum width of a tab
    "tabs.maxWidth": string

    // Whether or not tabs should wrap.
    // If `false`, a scrollbar will be shown.
    // If `true`, will wrap the tabs.
    "tabs.wrap": boolean

    // Handle other, non-predefined configuration keys
    [configurationKey: string]: any
}
