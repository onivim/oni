declare module "shell-env" {
    export namespace shellEnv {
        export function sync(shell?: string): NodeJS.Env
        export default function(shell?: string): Promise<NodeJS.Env>
    }
}
