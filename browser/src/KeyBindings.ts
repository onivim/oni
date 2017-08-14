import * as cloneDeep from "lodash/cloneDeep"
import * as path from "path"

import { AbstractConfig, ITypeValues } from "./AbstractConfig"

export interface IKeybindingsValues extends ITypeValues {
    // Opened menu keys
    "keybindings.openedMenu.nextMenuItem": string[],
    "keybindings.openedMenu.previousMenuItem": string[],
    "keybindings.openedMenu.select": string[],
    "keybindings.openedMenu.selectVertical": string[],
    "keybindings.openedMenu.selectHorizontal": string[],
    "keybindings.openedMenu.close": string[],

    // AutoCompletion keys
    "keybindings.autoCompletion.nextMenuItem": string[],
    "keybindings.autoCompletion.previousMenuItem": string[],
    "keybindings.autoCompletion.select": string[],
    "keybindings.autoCompletion.close": string[],

    // Formatter keys
    "keybindings.formatter.formatBuffer": string[],

    // Oni editor keys
    "keybindings.oni.gotoDefinition": string[],
    "keybindings.oni.showQuickOpen": string[],
    "keybindings.oni.showTasks": string[],
    "keybindings.oni.focusPreviousInstance": string[],
    "keybindings.oni.focusNextInstance": string[],
}

export class KeyBindings extends AbstractConfig {

    public userJsConfig = path.join(super.getUserFolder(), "keybindings.js")

    protected configFileName: string = "keybindings.js"
    protected configEventName: string = "keybindings-change"
    protected performanceName: string = "keybindings"
    protected ConfigValue: IKeybindingsValues = null
    protected DefaultPlatformConfig: Partial<IKeybindingsValues> = {}
    protected DefaultConfig: IKeybindingsValues = {
        // Opened menu keys
        "keybindings.openedMenu.nextMenuItem"         : ["<C-n>", "<C-j>", "<down>"],
        "keybindings.openedMenu.previousMenuItem"     : ["<C-p>", "<C-k>", "<up>"],
        "keybindings.openedMenu.select"               : ["<enter>"],
        "keybindings.openedMenu.close"                : ["<esc>", "<C-c>"],
        "keybindings.openedMenu.selectVertical"       : ["<c-v>"],
        "keybindings.openedMenu.selectHorizontal"     : ["<c-s>"],

        // AutoCompletion keys
        "keybindings.autoCompletion.nextMenuItem"     : ["<C-n>, <C-j>, <down>"],
        "keybindings.autoCompletion.previousMenuItem" : ["<C-p>, <C-k>, <up>"],
        "keybindings.autoCompletion.select"           : ["<enter>, <tab>"],
        "keybindings.autoCompletion.close"            : ["<esc>", "<C-c>"],

        // Formatter keys
        "keybindings.formatter.formatBuffer"          : ["<f3>"],

        // Oni editor keys
        "keybindings.oni.gotoDefinition"              : ["<f12>"],
        "keybindings.oni.showQuickOpen"               : ["<C-p>"],
        "keybindings.oni.showTasks"                   : ["<C-P>"],
        "keybindings.oni.focusPreviousInstance"       : ["<C-pageup>"],
        "keybindings.oni.focusNextInstance"           : ["<C-pagedown>"],

        // Tab keys
    }

    constructor() {
        super()
        this.loadConfig()
    }

    public hasValue(configValue: keyof IKeybindingsValues): boolean {
        return !!this.getValue(configValue)
    }

    public getValue<K extends keyof IKeybindingsValues>(configValue: K) {
        return this.ConfigValue[configValue]
    }

    public getValues(): IKeybindingsValues {
        return cloneDeep(this.ConfigValue)
    }

    public isAny<K extends keyof IKeybindingsValues>(configValue: K, key: string): boolean {
        return this.ConfigValue[configValue].some((element: string) => {
            return element === key
        })
    }
}

const _keybindings = new KeyBindings()
export const instance = () => _keybindings
