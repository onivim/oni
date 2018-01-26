/**
 * WindowDock.ts
 */

export interface IWindowDock {
    splits: Oni.IWindowSplit[]

    onSplitsChanged: IEvent<void>

    addSplit(split: Oni.IWindowSplit): void
    removeSplit(split: Oni.IWindowSplit): void
}

export class WindowDock implements IWindowDock {
    private _splits: Oni.IWindowSplit[] = []
    private _onSplitsChangedEvent: Event<void> = new Event<void>()

    public get splits(): Oni.IWindowSplit[] {
        return this._splits
    }

    public get onSplitsChanged(): IEvent<void> {
        return this._onSplitsChangedEvent
    }

    public contains(split: Oni.IWindowSplit): boolean {
        return this._splits.indexOf(split) >= 0
    }

    public split(startSplit: Oni.IWindowSplit, splitDirection: SplitDirection): boolean {
        this.addSplit(startSplit)
        return true
    }

    public move(startSplit: Oni.IWindowSplit, direction: Direction): Oni.IWindowSplit {
        const currentIndex = this._splits.indexOf(startSplit)

        if (currentIndex === -1) {
            if (direction === "left") {
                return this._splits[this._splits.length - 1]
            } else if (direction === "right") {
                return this._splits[0]
            } else {
                return null
            }
        }

        // TODO: Generalize this - this is baked for a 'left dock' case right now
        const newIndex = direction === "left" ? currentIndex - 1 : currentIndex + 1

        if (newIndex >= 0 && newIndex < this._splits.length) {
            return this._splits[newIndex]
        } else {
            return null
        }
    }

    public addSplit(split: Oni.IWindowSplit): void {
        this._splits = [...this._splits, split]
        this._onSplitsChangedEvent.dispatch()
    }

    public close(split: Oni.IWindowSplit): boolean {
        this.removeSplit(split)
        return true
    }

    public removeSplit(split: Oni.IWindowSplit): void {
        this._splits = this._splits.filter(s => s !== split)
        this._onSplitsChangedEvent.dispatch()
    }
}
