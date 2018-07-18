// tslint:disable
import { configure } from "enzyme"
import * as Adapter from "enzyme-adapter-react-16"

// React 16 Enzyme adapter
configure({ adapter: new Adapter() })

// Make Enzyme functions available in all test files without importing
// ;(global as any).shallow = shallow
// ;(global as any).render = render
// ;(global as any).mount = mount
