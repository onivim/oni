import {
    decreaseWidth,
    increaseWidth,
    sidebarReducer,
} from "./../browser/src/Services/Sidebar/SidebarStore"

describe("Change size function", () => {
    it("Should correctly return an increased size", () => {
        const newSize = increaseWidth("12em", null)
        expect(newSize).toBe("13em")
    })

    it("Should correctly return an decreased size", () => {
        const newSize = decreaseWidth("12em", null)
        expect(newSize).toBe("11em")
    })

    it("Should return the original size if passed an invalid value", () => {
        const newSize = increaseWidth("appleem", "15em")
        expect(newSize).toBe("15em")
    })
})
