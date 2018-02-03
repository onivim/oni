export class ConfigurationBookmarksProvider implements IBookmarksProvider {
    private _bookmarks: IBookmark[] = []
    private _onBookmarksUpdatedEvent = new Event<void>()

    public get bookmarks(): IBookmark[] {
        return this._bookmarks
    }

    public get onBookmarksUpdated(): IEvent<void> {
        return this._onBookmarksUpdatedEvent
    }

    constructor(private _configuration: Configuration) {
        this._configuration.onConfigurationChanged.subscribe(newValues => {
            if (newValues["oni.bookmarks"]) {
                this._updateFromConfiguration(newValues["oni.bookmarks"])
            }
        })

        const currentBookmarks = this._configuration.getValue("oni.bookmarks")
        this._updateFromConfiguration(currentBookmarks)
    }

    private _updateBookmarks(bookmarks: IBookmark[]): void {
        this._bookmarks = bookmarks
        this._onBookmarksUpdatedEvent.dispatch()
    }

    private _updateFromConfiguration(bookmarks: string[]): void {
        if (!bookmarks || !bookmarks.length) {
            this._updateBookmarks([])
            return
        }

        try {
            const newBookmarks = bookmarks.filter(bm => fs.existsSync(bm)).map(bm => {
                const stat = fs.statSync(bm)

                if (stat.isDirectory()) {
                    return {
                        command: "oni.openFolder",
                        arguments: [bm],
                        group: "Workspaces",
                    }
                } else {
                    return {
                        command: "oni.openFile",
                        arguments: [bm],
                        group: "Files",
                    }
                }
            })

            this._updateBookmarks(newBookmarks)
        } catch (e) {
            Log.warn("Error loading bookmarks: " + e)
        }
    }
}
