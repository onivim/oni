import {
    GitVersionControlProvider as Git,
    VersionControlProvider,
} from "../../Services/VersionControl"

export class Services {
    public get git(): VersionControlProvider {
        return Git
    }
}
