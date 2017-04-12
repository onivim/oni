export type NotificationType = "success" | "info" | "warning" | "error" | "fatal"
export interface INotification {
    type: NotificationType
    message: string
    details: string[] | null
}
