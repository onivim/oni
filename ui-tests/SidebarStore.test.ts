import {
    decreaseWidth,
    increaseWidth,
    sidebarReducer,
} from "./../browser/src/Services/Sidebar/SidebarStore"

describe("Change size function", () => {
    it("Should correctly return an increased size", () => {
        const newSize = increaseWidth("12em")
        expect(newSize).toBe("13em")
    })

    it("Should correctly return an decreased size", () => {
        const newSize = decreaseWidth("12em")
        expect(newSize).toBe("11em")
    })
})
