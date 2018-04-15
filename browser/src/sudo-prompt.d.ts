type Callback = (err: Error, stdout: string, stderr: string) => any

declare module "sudo-prompt" {
    const exec = (command: string, options: any, cb: Callback) => any
}
