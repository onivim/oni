import { Notifications } from "./../../browser/src/Services/Notifications"

const MockNotifications = jest.fn<Notifications>().mockImplementation(() => ({}))
export default MockNotifications
