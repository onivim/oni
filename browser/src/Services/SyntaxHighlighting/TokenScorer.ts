import { TokenColor } from "./../TokenColors"
import TokenColorsTrie from "./../TokenColorsTrie"

interface TokenRanking {
    depth: number
    highestRankedToken: TokenColor
    parentScopes: string
    numberOfParents: number
}

/**
 * Determines the correct token to render for a particular item
 * in a line based on textmate highlighting rules
 * @name TokenScorer
 * @class
 */
export class TokenScorer {
    /**
     * meta tokens are not intended for syntax highlighting but for other types of plugins
     * however vscode seems to accept styles for these so for the purposes of interop we
     * also allow meta token styling
     * source is a token that All items are given effectively giving it no value from the
     * point of view of syntax highlighting as it distinguishes nothing
     *
     * see: https://www.sublimetext.com/docs/3/scope_naming.html
     */
    private _BANNED_TOKENS = ["source"]
    private readonly _SCOPE_PRIORITIES = {
        support: 1,
        meta: -1,
    }

    /**
     * rankTokenScopes
     *  If more than one scope selector matches the current scope then they are ranked
     *  according to how “good” a match they each are. The winner is the scope selector
     *  which (in order of precedence):
     *  1. Match the element deepest down in the scope e.g.
     *    string wins over source.php when the scope is source.php string.quoted.
     *  2. Match most of the deepest element e.g. string.quoted wins over string.
     *  3. Rules 1 and 2 applied again to the scope selector when removing the deepest element
     *    (in the case of a tie), e.g. text source string wins over source string.
     *
     * Reference: https://macromates.com/manual/en/scope_selectors
     *
     * @name rankTokenScopes
     * @function
     * @param {string[]} scopes
     * @param {TokenColorsTrie} tokenTree
     * @returns {TokenColor}
     */
    public rankTokenScopes(
        scopes: string[],
        tokenTree: TokenColorsTrie,
        fileExtension: string,
    ): TokenColor {
        const initialRanking: TokenRanking = {
            depth: null,
            parentScopes: null,
            numberOfParents: 0,
            highestRankedToken: null,
        }

        const { highestRankedToken } = scopes.reduce((highestSoFar, scope) => {
            if (this._isBannedScope(scope)) {
                return highestSoFar
            }

            // themes can specify a parent scope which would not be present in the tokenization
            // css var.indentifier -> the css is parent scope and the var.identifier is the child scope
            const { childScope, parentScopes } = tokenTree.separateParentAndChildScopes(scope)
            const count = parentScopes.length
            const node = tokenTree.match(childScope, parentScopes)
            const matchingToken = node && node.asTokenColor()

            if (!matchingToken) {
                return highestSoFar
            }

            const depth = childScope.split(".").length

            if (depth === highestSoFar.depth) {
                // if there is a parent scope e.g. css var.indentifier.scss versus var.template.other
                // as they have the same degree of specificity but the former has the parent scope
                // of css, so the token with the parent selector should win out
                // if a scope has more parents it also increases its specificty
                if (
                    parentScopes &&
                    (!highestSoFar.parentScopes || highestSoFar.numberOfParents < count)
                ) {
                    return {
                        highestRankedToken: matchingToken,
                        depth,
                        parentScopes,
                        numberOfParents: count,
                    }
                }
                const highestPrecedence = this._determinePrecedence(
                    matchingToken,
                    highestSoFar.highestRankedToken,
                )
                return { ...highestSoFar, highestRankedToken: highestPrecedence, depth }
            }
            if (depth > highestSoFar.depth) {
                return { ...highestSoFar, highestRankedToken: matchingToken, depth }
            }
            return highestSoFar
        }, initialRanking)

        return highestRankedToken
    }

    private _isBannedScope = (scope: string) => {
        return this._BANNED_TOKENS.some(token => scope.includes(token))
    }

    private _getPriority = (token: TokenColor) => {
        const priorities = Object.keys(this._SCOPE_PRIORITIES)
        return priorities.reduce(
            (acc, priority) =>
                token.scope.includes(priority) && this._SCOPE_PRIORITIES[priority] < acc.priority
                    ? { priority: this._SCOPE_PRIORITIES[priority], token }
                    : acc,
            { priority: 0, token },
        )
    }

    /**
     * Assign each token a priority based on `SCOPE_PRIORITIES` and then
     * sort by priority take the first aka the highest priority one
     *
     * @name _determinePrecedence
     * @function
     * @param {TokenColor[]} ...tokens
     * @returns {TokenColor}
     */
    private _determinePrecedence(...tokens: TokenColor[]): TokenColor {
        const [{ token }] = tokens
            .map(this._getPriority)
            .sort((prev, next) => next.priority - prev.priority)
        return token
    }
}
