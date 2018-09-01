import { mount, ReactWrapper } from "enzyme"
import toJson from "enzyme-to-json"
import * as React from "react"

import {
    ContextMenuItem,
    ContextMenuView,
    Detail,
    IContextMenuItem,
    IContextMenuItemProps,
    Label,
} from "./../browser/src/Services/ContextMenu/ContextMenuComponent"

describe("<ContextMenuView />", () => {
    it("shows less than 10 items", () => {
        const itemsToRender: IContextMenuItem[] = createItems(8)

        const wrapper = mount(
            <ContextMenuView visible={true} base={""} entries={itemsToRender} selectedIndex={5} />,
        )

        // expect(wrapper.html()).toEqual("")
        const renderedItems = wrapper.find(ContextMenuItem)
        expect(renderedItems).toHaveLength(8)

        expectRenderedItem(renderedItems.at(0), false, "label_0", "detail of item 0")
        expectRenderedItem(renderedItems.at(1), false, "label_1", "detail of item 1")
        expectRenderedItem(renderedItems.at(2), false, "label_2", "detail of item 2")
        expectRenderedItem(renderedItems.at(3), false, "label_3", "detail of item 3")
        expectRenderedItem(renderedItems.at(4), false, "label_4", "detail of item 4")
        expectRenderedItem(renderedItems.at(5), true, "label_5", "detail of item 5")
        expectRenderedItem(renderedItems.at(6), false, "label_6", "detail of item 6")
        expectRenderedItem(renderedItems.at(7), false, "label_7", "detail of item 7")
    })

    it("scrolls when displaying more than 10 items", () => {
        const itemsToRender: IContextMenuItem[] = createItems(18)

        const wrapper = mount(
            <ContextMenuView visible={true} base={""} entries={itemsToRender} selectedIndex={14} />,
        )

        const renderedItems = wrapper.find(ContextMenuItem)
        expect(renderedItems).toHaveLength(10)

        expectRenderedItem(renderedItems.at(0), false, "label_5", "detail of item 5")
        expectRenderedItem(renderedItems.at(1), false, "label_6", "detail of item 6")
        expectRenderedItem(renderedItems.at(2), false, "label_7", "detail of item 7")
        expectRenderedItem(renderedItems.at(3), false, "label_8", "detail of item 8")
        expectRenderedItem(renderedItems.at(4), false, "label_9", "detail of item 9")
        expectRenderedItem(renderedItems.at(5), false, "label_10", "detail of item 10")
        expectRenderedItem(renderedItems.at(6), false, "label_11", "detail of item 11")
        expectRenderedItem(renderedItems.at(7), false, "label_12", "detail of item 12")
        expectRenderedItem(renderedItems.at(8), false, "label_13", "detail of item 13")
        expectRenderedItem(renderedItems.at(9), true, "label_14", "detail of item 14")
    })
})

function createItems(count: number): IContextMenuItem[] {
    const items: IContextMenuItem[] = []

    for (let i = 0; i < count; i++) {
        items.push({
            label: "label_" + i,
            detail: "detail of item " + i,
        })
    }

    return items
}

function expectRenderedItem(
    item: ReactWrapper<IContextMenuItemProps, any>,
    selected: boolean,
    label: string,
    detail: string,
) {
    expect(item.prop("isSelected")).toBe(selected)
    expect(
        item
            .find(Label)
            .first()
            .text(),
    ).toEqual(label)
    expect(
        item
            .find(Detail)
            .first()
            .text(),
    ).toEqual(detail)
}
