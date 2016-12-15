import * as fs from "fs"

export function parseJsonFromFile<T>(file: string): T {
    return JSON.parse(fs.readFileSync(file, "utf8"))
}
