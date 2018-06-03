import { shallow } from "enzyme"
import { shallowToJson } from "enzyme-to-json"
import * as React from "react"

import { DragAndDrop } from "./../browser/src/Services/DragAndDrop"
import { ExplorerNode } from "./../browser/src/Services/Explorer/ExplorerSelectors"
import { NodeView, NodeWrapper } from "./../browser/src/Services/Explorer/ExplorerView"
import { TextInputView } from "./../browser/src/UI/components/LightweightText"

describe("<NodeView />", () => {
    const testNode = {
        id: "2",
        filePath: "/test/a/file.txt",
        type: "file",
        modified: false,
        name: "file.txt",
        indentationLevel: 2,
    } as ExplorerNode

    const Node = (
        <NodeView
            yanked={[] as string[]}
            measure={() => null}
            isCreating={false}
            isRenaming={testNode}
            moveFileOrFolder={() => ({})}
            node={testNode}
            isSelected={false}
            onClick={() => ({})}
            onCancelRename={() => ({})}
            onCompleteRename={() => ({})}
        />
    )
    it("Should render without crashing", () => {
        const wrapper = shallow(Node)
        expect(wrapper.length).toEqual(1)
    })

    it("Should render and input element if the selected element is renaming", () => {
        const wrapper = shallow(
            <NodeView
                yanked={[] as string[]}
                measure={() => null}
                isCreating={false}
                isRenaming={testNode}
                moveFileOrFolder={() => ({})}
                node={testNode}
                isSelected={true}
                onClick={() => ({})}
                onCancelRename={() => ({})}
                onCompleteRename={() => ({})}
            />,
        )

        const input = wrapper.find(TextInputView)
        expect(input.length).toEqual(1)
    })

    it("Should render the node if the selected element is not renaming", () => {
        const wrapper = shallow(Node)
        expect(
            wrapper
                .find(NodeWrapper)
                .dive()
                .find(DragAndDrop),
        ).toHaveLength(1)
    })

    it("Should match the snapshot", () => {
        const wrapper = shallow(Node)
        expect(shallowToJson(wrapper)).toMatchSnapshot()
    })
})
