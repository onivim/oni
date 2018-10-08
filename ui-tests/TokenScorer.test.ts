import { TokenScorer } from "./../browser/src/Services/SyntaxHighlighting/TokenScorer"
import { TokenColor } from "./../browser/src/Services/TokenColors"
import TokenColorsTrie from "./../browser/src/Services/TokenColorsTrie"

const getTokenTree = (tokens: TokenColor[]) => {
    const tree = new TokenColorsTrie()
    tree.setTokens(tokens)
    return tree
}

describe("TokenScorer Tests", () => {
    const ranker = new TokenScorer()
    const theme: TokenColor[] = [
        {
            scope: ["entity"],
            settings: {
                foreground: "blue",
                background: "red",
                fontStyle: "italic",
            },
        },
        {
            scope: ["entity.name"],
            settings: {
                foreground: "blue",
                background: "red",
                fontStyle: "italic",
            },
        },
        {
            scope: ["entity.name.interface"],
            settings: {
                foreground: "blue",
                background: "red",
                fontStyle: "italic",
            },
        },
        {
            scope: ["entity.name.interface.golang"],
            settings: {
                foreground: "blue",
                background: "red",
                fontStyle: "italic",
            },
        },
    ]
    const tree = getTokenTree(theme)
    it("should correctly rank tokens based on how deep in the syntax tree they are", () => {
        const scopes = ["entity.name", "entity.name.interface", "entity.name.interface.golang"]
        const highest = ranker.rankTokenScopes(scopes, tree)
        expect(highest).toEqual({
            scope: ["entity.name.interface.golang"],
            settings: {
                foreground: "blue",
                background: "red",
                fontStyle: "italic",
            },
        })
    })

    it("should only return a token that is included in the theme aka one that can be highlighted", () => {
        const scopes = [
            "entity.name",
            "entity.name.interface",
            "entity.name.interface.golang",
            "item.class.component.element.object",
        ]
        const highest = ranker.rankTokenScopes(scopes, tree)
        expect(highest.scope).toEqual(["entity.name.interface.golang"])
    })

    it('should correctly prioritise fields with higher scope priorities like "support" ', () => {
        const scopes = [
            "entity.name",
            "entity.name.interface",
            "entity.name.interface.golang",
            "support.class.component.element",
        ]
        const supportTree = getTokenTree([
            ...theme,
            {
                scope: ["support.class.component.element"],
                settings: {
                    foreground: "blue",
                    background: "red",
                    fontStyle: "italic",
                },
            },
        ])

        const highest = ranker.rankTokenScopes(scopes, supportTree)
        expect(highest).toEqual({
            scope: ["support.class.component.element"],
            settings: {
                foreground: "blue",
                background: "red",
                fontStyle: "italic",
            },
        })
    })

    it("should return null if none of the scopes it is passed have any matches", () => {
        const highest = ranker.rankTokenScopes(["testing.failure"], tree)
        expect(highest).toBeFalsy()
    })

    it("should ignore banned scopes like meta", () => {
        const highest = ranker.rankTokenScopes(
            ["meta.long.token.name", "source.other.long.name"],
            tree,
        )
        expect(highest).toBeFalsy()
    })
})
