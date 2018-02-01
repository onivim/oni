/**
 * Search/index.tsx
 *
 * Entry point for search-related features
 */

import { SidebarManager } from "./../Sidebar"

export class SearchPane {
    public get id(): string {
        return "oni.sidebar.search"
    }

    public get title(): string {
        return "Search"
    }

    public enter(): void {
        console.log("entering pane")
    }

    public leave(): void {
        console.log("leaving pane")
    }

    public render(): JSX.Element {
        return <div>Hello World</div>
    }
}

export const activate = (sidebarManager: SidebarManager) => {
    sidebarManager.add("search", new SearchPane())
}
