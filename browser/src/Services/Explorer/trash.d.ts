declare module "trash" {
    export function trash(
        input: string[],
        opts?: {
            glob: boolean
        },
    ): Promise<void>
}
