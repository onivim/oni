// Custom type definitions for classnames master branch
// Project: https://github.com/JedWatson/classnames

type ClassValue = string | number | ClassDictionary | ClassValue[] | undefined | null | false

interface ClassDictionary {
    [id: string]: boolean | undefined | null
}

declare function classNames(...classes: ClassValue[]): string

declare module "classnames" {
    export default classNames
}
