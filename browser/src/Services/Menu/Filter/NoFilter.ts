// import * as Oni from "oni-api" // TODO: add additionalComponent to Oni.Menu.MenuOption (as optional?)
// TODO: Also might want to merge IMenuOptionWithHighlights as optional fields

import { IMenuOptionWithHighlights } from "../Menu"

function convert(entry: any /*Oni.Menu.MenuOption*/): IMenuOptionWithHighlights {
    return {
        ...entry,
        label: entry.label,
        detail: entry.detail,
        icon: entry.icon,
        pinned: entry.pinned,
        metadata: entry.metadata,
        detailHighlights: [],
        labelHighlights: [],
        additionalComponent: entry.additionalComponent,
    }
}

export function filter(options: any[], searchString: string): IMenuOptionWithHighlights[] {
    return options.map(o => convert(o))
}
