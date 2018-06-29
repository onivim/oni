declare module "trash" {
    interface Options {
        glob: boolean
    }

    export default function trash(input: string[], opts?: Options): Promise<void>
}
