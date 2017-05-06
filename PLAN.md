- Set up initialization path to differentiate between a node script starting and a shell executable
- Need configuration variables to be passed to plugin?


interface ServerOptions {
    shellCmd?: string
    module?: string
    args?: string[]
}
