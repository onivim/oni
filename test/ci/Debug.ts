/**
 * Debugging utilities
 */

export function inspect(obj: any, name: string): string {
    if (obj === null) {
        return name + " is null"
    } else if (obj === undefined) {
        return name + " is undefined"
    } else {
        return name + " has properties: { " + Object.getOwnPropertyNames(obj).join(", ") + " }"
    }
}
