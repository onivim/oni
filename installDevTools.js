const electronDevtoolsInstaller = require("electron-devtools-installer")

electronDevtoolsInstaller.default(electronDevtoolsInstaller.REACT_DEVELOPER_TOOLS)
    .then((name) => console.log(`Added extension: ${name}`))
    .catch((err) => console.log(`An error occurred: ${err}`))

electronDevtoolsInstaller.default(electronDevtoolsInstaller.REDUX_DEVTOOLS)
    .then((name) => console.log(`Added extension: ${name}`))
    .catch((err) => console.log(`An error occurred: ${err}`))
