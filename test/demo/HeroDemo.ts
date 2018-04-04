/**
 * Script for demo on Oni's website
 */

import * as assert from "assert"
import * as fs from "fs"
import * as shell from "shelljs"
import * as os from "os"
import * as path from "path"
import { execSync } from "child_process"

import * as rimraf from "rimraf"

import { getCompletionElement, getTemporaryFolder } from "./../ci/Common"

import { getDistPath, getRootPath } from "./DemoCommon"

import { remote } from "electron"

const BASEDELAY = 25
const RANDOMDELAY = 15

const EmptyConfigPath = path.join(getTemporaryFolder(), "config.js")

const getProjectRootPath = () => {
    const root = getRoot(__dirname)
    return os.platform() === "win32" ? root : os.homedir()
}

const ReactProjectName = "oni-react-app"

const getRoot = (dir: string): string => {
    const parent = path.dirname(dir)
    if (parent === dir) {
        return parent
    } else {
        return getRoot(parent)
    }
}

const createReactAppProject = oni => {
    const oniReactApp = path.join(getProjectRootPath(), ReactProjectName)

    rimraf.sync(oniReactApp)
    const output = execSync('create-react-app "' + oniReactApp + '"')

    const oniLogoPath = path.join(getRootPath(), "images", "256x256.png")
    const oniLogoDestinationPath = path.join(oniReactApp, "src", "oni.png")

    const oniLogoComponentPath = path.join(oniReactApp, "src", "OniLogo.js")

    fs.writeFileSync(
        oniLogoComponentPath,
        `
import React, { Component } from 'react';
import logo from './oni.png';

export class OniLogo extends Component {
  render() {
    return <img src={logo} className="App-logo" alt="logo" />;
  }
}
    `,
        "utf8",
    )

    // Delete the 'App.test.js' so it doesn't mess up fuzzy find results
    rimraf.sync(path.join(oniReactApp, "src", "App.test.js"))

    shell.cp(oniLogoPath, oniLogoDestinationPath)
    return oniReactApp
}

export const test = async (oni: any) => {
    const reactAppPath = createReactAppProject(oni)

    await oni.automation.waitForEditors()

    oni.workspace.changeDirectory(reactAppPath)

    const isMac = process.platform === "darwin"

    const shortDelay = async () => oni.automation.sleep(BASEDELAY * 25)
    const longDelay = async () => oni.automation.sleep(BASEDELAY * 50)

    const simulateTyping = async (keys: string, baseDelay: number = BASEDELAY) => {
        for (const key of keys) {
            oni.automation.sendKeysV2(key)
            await oni.automation.sleep(baseDelay + Math.random() * RANDOMDELAY)
        }
        await shortDelay()
    }

    const pressEscape = async () => {
        await shortDelay()
        oni.automation.sendKeysV2("<esc>")
        await shortDelay()
    }

    const pressTab = async () => {
        await shortDelay()
        oni.automation.sendKeysV2("<tab>")
        await shortDelay()
    }

    const pressShiftTab = async () => {
        await shortDelay()
        oni.automation.sendKeysV2("<s-tab>")
        await shortDelay()
    }

    const pressEnter = async () => {
        await shortDelay()
        oni.automation.sendKeysV2("<cr>")
        await shortDelay()
    }

    const openCommandPalette = async () => {
        await shortDelay()
        const keys = isMac ? "<m-s-p>" : "<c-s-p>"
        oni.automation.sendKeysV2(keys)
        await shortDelay()
    }

    const openFindInFiles = async () => {
        await shortDelay()
        const keys = isMac ? "<m-s-f>" : "<c-s-f>"
        oni.automation.sendKeysV2(keys)
        await shortDelay()
    }

    const openQuickOpen = async () => {
        await shortDelay()
        const keys = isMac ? "<m-p>" : "<c-p>"
        oni.automation.sendKeysV2(keys)
        await shortDelay()
    }

    const splitHorizontal = async (fileName: string) => {
        await shortDelay()
        oni.automation.sendKeysV2("<c-w>")
        oni.automation.sendKeysV2("<c-s>")
        await shortDelay()
        await simulateTyping(":tabnew VIM.md")
    }

    const waitForCompletion = async () => {
        return oni.automation.waitFor(() => !!getCompletionElement())
    }

    const showWelcomeAchievement = async () => {
        oni.achievements.clearAchievements()

        // Create our own 'mock' achievement, because
        // the welcome one won't be tracked if it has been completed
        oni.achievements.registerAchievement({
            uniqueId: "oni.achievement.automation",
            name: "Welcome to Oni!",
            description: "Launch Oni for the first time",
            goals: [
                {
                    name: null,
                    goalId: "oni.automation.goal",
                    count: 1,
                },
            ],
        })
        oni.achievements.notifyGoal("oni.automation.goal")

        await longDelay()
        await longDelay()
    }

    const intro = async () => {
        await simulateTyping(":tabnew Hello.md")
        await pressEnter()

        await simulateTyping(
            "iOni is a new kind of editor: combining the best of Vim, Atom, and VSCode.",
        )
        await pressEnter()
        await simulateTyping(
            "Built with web tech, featuring a high performance canvas renderer, with (neo)vim handling the heavy lifting.",
        )
        await pressEnter()
        await simulateTyping("Available for Windows, OSX, and Linux.")
        await pressEnter()

        await pressEscape()
    }

    const showKeyboardNavigation = async () => {
        await splitHorizontal("VIM.md")
        await pressEnter()

        await simulateTyping("i")
        await simulateTyping("Use your Vim muscle memory to be productive without a mouse...")

        await pressEscape()

        oni.automation.sendKeysV2("<c-w>")
        oni.automation.sendKeysV2("<c-h>")
        await shortDelay()

        oni.automation.sendKeysV2("G")
        await longDelay()
        oni.automation.sendKeysV2("gg")
        await longDelay()

        oni.automation.sendKeysV2("<c-w>")
        oni.automation.sendKeysV2("<c-h>")
        await shortDelay()

        oni.automation.sendKeysV2("<c-w>")
        oni.automation.sendKeysV2("<c-l>")
        await shortDelay()

        oni.automation.sendKeysV2("<c-w>")
        oni.automation.sendKeysV2("<c-l>")
        await shortDelay()

        oni.automation.sendKeysV2("<c-w>")
        oni.automation.sendKeysV2("<c-j>")
        await shortDelay()

        await simulateTyping("o")
        await simulateTyping("..but enjoy the conveniences of a modern UI editor.")
        await pressEscape()

        await shortDelay()
        oni.automation.sendKeysV2("<c-g>")
        await shortDelay()
        await simulateTyping("a")
        await shortDelay()
        await simulateTyping("c")

        oni.automation.sendKeysV2("<c-g>")
        await shortDelay()
        await simulateTyping("a")
        await shortDelay()
        await simulateTyping("d")
        await shortDelay()

        oni.automation.sendKeysV2("<c-g>")
        await shortDelay()
        await simulateTyping("a")
        await shortDelay()
        await simulateTyping("b")
        await shortDelay()

        oni.automation.sendKeysV2("<esc>")

        await simulateTyping(":qa!")
        oni.automation.sendKeysV2("<cr>")

        await shortDelay()

        oni.automation.sendKeysV2("<esc>")
    }

    const showDevelopment = async () => {
        await pressEscape()

        await openCommandPalette()
        await simulateTyping("brovsp")
        await pressEnter()

        await pressEscape()
        await openCommandPalette()
        await simulateTyping("termhsp")
        await pressEnter()

        await longDelay()

        await simulateTyping("A")
        await simulateTyping("npm run start")
        await pressEnter()

        await pressEscape()

        oni.automation.sendKeysV2("<c-w>")
        oni.automation.sendKeysV2("<c-h>")
        await shortDelay()

        await openQuickOpen()
        await simulateTyping("Appjs")
        await pressEnter()

        oni.automation.sendKeysV2("<c-g>")
        await shortDelay()

        const addressBarSneak = oni.sneak.getSneakMatchingTag("browser.address")
        const triggerKeys = addressBarSneak.triggerKeys as string
        await simulateTyping(triggerKeys)

        await shortDelay()

        await simulateTyping("http://localhost:3000")
        await pressEnter()

        await simulateTyping("10j")
        await shortDelay()
        await simulateTyping("cit")
        await shortDelay()
        await simulateTyping("Welcome to Oni")
        await pressEscape()
        await simulateTyping(":w")
        await pressEnter()
        await shortDelay()

        await simulateTyping("7k")
        await simulateTyping("O")
        await simulateTyping("impsnip")
        await pressEnter()
        await shortDelay()
        await simulateTyping("./Oni")
        await waitForCompletion()
        await pressEnter()

        await pressTab()
        await simulateTyping("Oni")
        await waitForCompletion()
        await pressEnter()
        await pressTab()

        await simulateTyping("7j")
        await simulateTyping("b")
        await simulateTyping("C")
        await simulateTyping("OniLogo />")

        await pressEscape()
        await simulateTyping(":w")
        await pressEnter()
        await shortDelay()

        oni.automation.sendKeysV2("<c-w>")
        oni.automation.sendKeysV2("<c-l>")
        await shortDelay()

        oni.automation.sendKeysV2("<c-w>")
        oni.automation.sendKeysV2("<c-j>")
        await shortDelay()

        await simulateTyping(":q")
        await pressEnter()
        await shortDelay()

        await simulateTyping(":q")
        await pressEnter()
        await shortDelay()
    }

    const showConfig = async () => {
        await pressEscape()
        await openCommandPalette()

        await simulateTyping("configuser")
        await longDelay()
        await pressEnter()

        await longDelay()

        oni.automation.sendKeysV2("/")
        await shortDelay()
        await simulateTyping("fontSize")
        await shortDelay()
        oni.automation.sendKeysV2("<cr>")

        await shortDelay()
        await simulateTyping("gcc")
        await shortDelay
        await simulateTyping("fp")
        await longDelay()
        await simulateTyping("ciw")
        await longDelay()
        await simulateTyping("15px")
        await pressEscape()
        await simulateTyping(":w")
        await pressEscape()

        // HACK - Configuration doesn't use the same file, so we need to set this directly here
        oni.configuration.setValues({ "editor.fontSize": "15px" })

        await longDelay()
        await simulateTyping("b")
        await longDelay()
        await simulateTyping("ciw")
        await longDelay()
        await simulateTyping("12px")
        await pressEscape()
        await simulateTyping(":w")
        await pressEnter()
        oni.configuration.setValues({ "editor.fontSize": "12px" })
        await longDelay()
        await pressEscape()

        await simulateTyping("gg")
        oni.automation.sendKeysV2("/")
        await shortDelay()
        await simulateTyping("activate")
        await pressEnter()
        await simulateTyping("n")

        await simulateTyping("o")
        await pressEnter()
        await simulateTyping("// We can also use Oni's extensibility API here!")
        await pressEnter()
        await simulateTyping("Let's add a status bar item")
        await pressEscape()
        await simulateTyping("o")
        oni.automation.sendKeysV2("<c-w>")
        await pressEnter()

        await simulateTyping("const statusBarItem = oni.s")
        await shortDelay()
        await simulateTyping("tatusBar.c")
        await shortDelay()
        await simulateTyping("reateItem(1)")
        await pressEnter()
        await simulateTyping("statusBarItem.s")
        await shortDelay()
        await simulateTyping("etContents(")
        await shortDelay()
        oni.automation.sendKeys("<lt>")
        await simulateTyping("div>Hello World")
        oni.automation.sendKeys("<lt>")
        await simulateTyping("/div>)")
        await pressEnter()
        await simulateTyping("statusBarItem.")
        await shortDelay()
        await simulateTyping("show()")
        await pressEnter()

        await pressEscape()
        await simulateTyping(":w")
        await pressEnter()

        // const item = oni.statusBar.createItem(1)
        // item.setContents("Hello World")
        // item.show()

        await longDelay()

        await simulateTyping(":q")
        await pressEnter()

        await simulateTyping(":q")
        await pressEnter()
    }

    const showComingSoon = async () => {
        await shortDelay()
        await simulateTyping(":tabnew SOON.md")
        await shortDelay()
        await pressEnter()
        await shortDelay()
        await simulateTyping("i")

        await simulateTyping("This is just the beginning! Lots more to come:")
        await pressEnter()
        await simulateTyping("* Live Preview")
        await pressEnter()
        await simulateTyping("* Plugin Management")
        await pressEnter()
        await simulateTyping("* More tutorials ")
        await pressEnter()
        await simulateTyping("* Debuggers")
        await pressEnter()
        await simulateTyping("* Version Control Integration")
        await longDelay()
        await pressEnter()
        await pressEnter()
        await simulateTyping("Thanks for watching! Download Oni today.")

        await pressEscape()
    }

    const showLanguageServices = async () => {
        await simulateTyping(":tabnew test.js")
        oni.automation.sendKeysV2("<cr>")

        await simulateTyping("i")
        await simulateTyping("// Oni integrates with language servers, and includes several...")
        oni.automation.sendKeysV2("<cr>")
        await simulateTyping("...but you can hook up your own, too!")
        await shortDelay()

        oni.automation.sendKeysV2("<cr>")
        oni.automation.sendKeysV2("<c-w>")
        await shortDelay()
        await simulateTyping("const myArray = [1, 2, 3]")

        await pressEnter()
        await pressEnter()
        await pressEscape()

        await simulateTyping("O")
        await simulateTyping("const newArray = my")
        await waitForCompletion()
        await shortDelay()
        await simulateTyping("Array.")

        await simulateTyping("m")
        await longDelay()
        await simulateTyping("ap(")
        await longDelay()
        await simulateTyping("(val) => val + 1")

        await pressEscape()
        await simulateTyping("o")
        await pressEnter()
        await simulateTyping("// Oni also has snippet support:")
        await pressEnter()
        oni.automation.sendKeysV2("<c-w>")
        await pressEnter()

        await simulateTyping("forsnip")
        await pressEnter()

        await pressTab()
        await pressShiftTab()

        await simulateTyping("idx")
        await pressTab()
        await simulateTyping("myArray")
        await pressTab()
        await pressTab()
        await pressEscape()
    }

    const showTutorials = async () => {
        await oni.editors.activeEditor.neovim.command(":tabnew")
        oni.automation.sendKeysV2("<c-g>")
        await shortDelay()

        await simulateTyping("ad")

        const firstTutorialId = oni.tutorials.getNextTutorialId()
        await oni.tutorials.startTutorial(firstTutorialId)

        await shortDelay()
        await pressEscape()

        await simulateTyping("i")
        await shortDelay()
        await simulateTyping("hello")
        await shortDelay()
        await pressEscape()
        await shortDelay()
        await simulateTyping("o")
        await shortDelay()
        await simulateTyping("world")
        await shortDelay()
        await pressEscape()

        await longDelay()
        await oni.editors.activeEditor.neovim.command(":q!")
    }

    // Prime the typescript language service prior to recording
    await simulateTyping(":tabnew")
    await pressEnter()
    await openQuickOpen()
    await simulateTyping("App.js")
    await pressEnter()

    await simulateTyping("owindow.")
    await waitForCompletion()
    await longDelay()
    await pressEscape()
    await simulateTyping(":q!")
    await pressEnter()

    // Set window size
    remote.getCurrentWindow().setSize(1920, 1080)

    oni.recorder.startRecording()

    await showWelcomeAchievement()

    oni.tutorials.clearProgress()

    oni.commands.executeCommand("keyDisplayer.show")
    oni.configuration.setValues({
        "keyDisplayer.showInInsertMode": false,
        "editor.split.mode": "oni",
        "browser.defaultUrl": "https://github.com/onivim/oni",
    })

    await intro()

    await showKeyboardNavigation()

    await showDevelopment()

    // ---
    await showLanguageServices()
    // ---

    // oni.automation.sendKeysV2("<c-w>")
    // oni.automation.sendKeysV2("<c-k>")

    // await simulateTyping("o")
    // await simulateTyping("...or the embedded file finder.")
    // await shortDelay()

    // await pressEscape()
    // await shortDelay()
    // await openQuickOpen()
    // await simulateTyping("NeovimEditor")
    // await shortDelay()
    // oni.automation.sendKeysV2("<cr>")
    // await longDelay()
    // oni.automation.sendKeysV2("<c-o>")
    // await shortDelay()

    // await simulateTyping("G")
    // await simulateTyping("o")
    // await simulateTyping("...use the built in command palette to discover functionality.")
    // await pressEscape()
    await showTutorials()

    await showConfig()

    await showComingSoon()

    await simulateTyping(":q")
    await longDelay()

    oni.configuration.setValues({ "recorder.outputPath": getDistPath() })
    oni.recorder.stopRecording(`demo-${process.platform}.webm`)

    await pressEscape()
}

export const settings = {
    configPath: EmptyConfigPath,
}
