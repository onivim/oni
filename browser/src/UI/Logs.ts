export type LogType = "success" | "info" | "warning" | "error" | "fatal"
export interface ILog {
    type: LogType
    message: string
    details: string[] | null
}
