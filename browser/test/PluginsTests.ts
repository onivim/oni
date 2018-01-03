import * as path from "path"

import { PluginManager } from "./../src/Plugins/PluginManager"
import { Configuration } from "./../src/Services/Configuration"

import { MockPerformance } from "./Mocks/Performance"

const config = new Configuration(new MockPerformance())
config.start()

const pluginManager = new PluginManager(config, path.join(__dirname, '..', '..', '..'))
pluginManager.discoverPlugins()

for (let plugin of pluginManager.plugins) {
    if (plugin.hasTest()) {
        describe(`PLUGIN ${plugin.name}`, () => {
            plugin.test()
        })
    }
}
