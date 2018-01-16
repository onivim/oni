import * as Git from "../../Services/Git"

export class Services {
    public get git(): Git.GitFunctions {
        return Git
    }
}
