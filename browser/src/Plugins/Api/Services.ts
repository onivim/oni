import Git, { VersionControlProvider } from "../../Services/Git"

export class Services {
    public get git(): VersionControlProvider {
        return Git
    }
}
