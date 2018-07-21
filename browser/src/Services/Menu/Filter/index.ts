// import * as Oni from "oni-api"
import * as OniNext from "../../../Plugins/Api/Oni"

import { filter as fuseFilter } from "./FuseFilter"
import { filter as noFilter } from "./NoFilter"
import { filter as RegExFilter } from "./RegExFilter"
import { filter as vscodeFilter } from "./VSCodeFilter"

class Filters implements OniNext.IMenuFilters {
    private _filters = new Map<string, OniNext.IMenuFilter>()

    constructor() {
        this._filters
            .set("default", noFilter)
            .set("none", noFilter)
            .set("fuse", fuseFilter)
            .set("regex", RegExFilter)
            .set("vscode", vscodeFilter)
    }

    public getDefault(): OniNext.IMenuFilter {
        return this.getByName("default")
    }

    public getByName(name: string): OniNext.IMenuFilter {
        return this._filters.has(name) ? this._filters.get(name) : this.getDefault()
    }

    // TODO: Add register & unregister for plugins
}

const _instance = new Filters()

export function getInstance(owner: string): OniNext.IMenuFilters {
    return _instance
}
