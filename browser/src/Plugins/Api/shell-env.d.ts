declare module "shell-env" {
    export function sync(shell?: string): NodeJS.ProcessEnv
    export default function(shell?: string): Promise<NodeJS.ProcessEnv>
}
