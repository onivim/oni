import { mount, shallow } from "enzyme"
import { shallowToJson } from "enzyme-to-json"
import * as React from "react"

import { ExplorerNode } from "./../browser/src/Services/Explorer/ExplorerSelectors"
import { NodeView } from "./../browser/src/Services/Explorer/ExplorerView"

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
            isRenaming={null as ExplorerNode}
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
})
