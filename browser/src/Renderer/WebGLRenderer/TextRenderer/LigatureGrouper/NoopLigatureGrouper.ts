import { ILigatureGrouper } from "./ILigatureGrouper"

export class NoopLigatureGrouper implements ILigatureGrouper {
    public getLigatureGroups(characters: string[]) {
        return characters
    }
}
