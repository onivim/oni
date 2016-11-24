import * as os from "os"

export const isMac = () => os.platform() === "darwin"
export const isWindows = () => os.platform() === "win32"

export const getUserHome = () => {
    return isWindows() ? process.env["USERPROFILE"] : process.env["HOME"]
}
