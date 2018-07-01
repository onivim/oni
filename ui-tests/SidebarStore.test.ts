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
    it("Should return the last value if the user input is too big", () => {
        const newSize = increaseWidth("50em", "15em")
        expect(newSize).toBe("50em")
    })

    it("Should return the last value if the user input is too small", () => {
        const newSize = decreaseWidth("1em", "15em")
        expect(newSize).toBe("1em")
    })

    it("Should decrease a value if at top limit", () => {
        const newSize = decreaseWidth("50em", null)
        expect(newSize).toBe("49em")
    })

    it("Should increase a value if at bottom limit", () => {
        const newSize = increaseWidth("1em", null)
        expect(newSize).toBe("2em")
    })

    it("Should use a default unit if the user passes an invalid unit value", () => {
        const newSize = decreaseWidth("15apples", "12em")
        expect(newSize).toBe("14em")
    })
    it("Should use default unit if the value passed in does not have any units", () => {
        const newSize = increaseWidth("15", "11em")
        expect(newSize).toBe("16em")
    })
})
