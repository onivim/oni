import * as assert from "assert"
import * as fs from "fs"
import * as path from "path"

import { WorkspaceConfiguration } from "./../../../src/Services/Workspace"

import * as Mocks from "./../../Mocks"
import * as TestHelpers from "./../../TestHelpers"

const MemoryFileSystem = require("memory-fs")

describe("WorkspaceConfiguration", () => {

    let mockConfiguration: Mocks.MockConfiguration
    let mockWorkspace: Mocks.MockWorkspace
    let fileSystem: typeof fs | any

    let workspaceWithNoConfigPath: string
    let workspace1WithConfigPath: string
    let workspace2WithConfigPath: string
    let workspace1ConfigFilePath: string
    // let workspace2ConfigFilePath: string

    beforeEach(() => {
        fileSystem = new MemoryFileSystem()

        workspaceWithNoConfigPath = path.join(TestHelpers.getRootDirectory(), "workspace_noconfig")
        workspace1WithConfigPath = path.join(TestHelpers.getRootDirectory(), "workspace1")
        workspace2WithConfigPath = path.join(TestHelpers.getRootDirectory(), "workspace2")

        let dirsToCreate = [workspace1WithConfigPath, workspace2WithConfigPath, workspaceWithNoConfigPath]
        dirsToCreate.forEach((p) => fileSystem.mkdirpSync(p))

        const createConfig = (workspacePath: string): string => {
            const configFolderPath = path.join(workspacePath, ".oni")
            const configFilePath = path.join(configFolderPath, "config.js")
            fileSystem.mkdirpSync(configFolderPath)
            fileSystem.writeFileSync(configFilePath, " ")
            return configFilePath
        }

        workspace1ConfigFilePath = createConfig(workspace1WithConfigPath)
        // workspace2ConfigFilePath = createConfig(workspace2WithConfigPath)

        mockConfiguration =  new Mocks.MockConfiguration()
        mockWorkspace = new Mocks.MockWorkspace()

    })

    it("setting directory before WorkspaceConfiguration is initialized loads configuration", () => {
        mockWorkspace.changeDirectory(workspace1WithConfigPath)

        const ws = new WorkspaceConfiguration(mockConfiguration as any, mockWorkspace, fileSystem)
        assert.strictEqual(ws.activeWorkspaceConfiguration, workspace1ConfigFilePath, "Validate correct workspace is picked up")
        assert.deepEqual(mockConfiguration.currentConfigurationFiles, [workspace1ConfigFilePath], "Validate configuration file was added")
    })

    it("changing from one workspace to another causes first config to be removed", () => {
        assert.ok(false)
    })

    it("changing directory causes new config to be loaded", () => {
        const ws = new WorkspaceConfiguration(mockConfiguration as any, mockWorkspace, fileSystem)

        mockWorkspace.changeDirectory(workspace1WithConfigPath)

        assert.strictEqual(ws.activeWorkspaceConfiguration, workspace1ConfigFilePath, "Validate correct workspace is picked up")
        assert.deepEqual(mockConfiguration.currentConfigurationFiles, [workspace1ConfigFilePath], "Validate configuration file was added")
    })
})
