import { getInstance, VersionControlManager } from "./../../Services/VersionControl"

export class Services {
    public get vcs(): VersionControlManager {
        return getInstance()
    }
}
