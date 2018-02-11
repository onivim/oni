process.env.NODE_ENV = "test"
// tslint:disable
require("babel-register")()
require.extensions[".less"] = () => null
global["window"] = document.defaultView
// tslint:enable
