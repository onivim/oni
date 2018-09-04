import { TokenColor } from "./../TokenColors"

interface TokenRanking {
    depth: number
    highestRankedToken: TokenColor
}

/**
 * Determines which syntax highlighting token should render for a given item
 * @name TokenScorer
 * @function
 */
export class TokenScorer {
    // meta tokens are not intended for syntax highlighting but for other types of plugins
    // source is a token that All tokens are given effectively giving it no value from the
    // point of view of syntax highlighting as it distinguishes nothing
    // see: https://www.sublimetext.com/docs/3/scope_naming.html
    private _BANNED_TOKENS = ["meta", "source"]
    private readonly _SCOPE_PRIORITIES = {
        support: 1,
    }

    /**
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
     */
    public rankTokenScopes(scopes: string[], themeColors: TokenColor[]): TokenColor {
        const initialRanking: TokenRanking = { highestRankedToken: null, depth: null }
        const { highestRankedToken } = scopes.reduce((highestSoFar, scope) => {
            if (this._isBannedScope(scope)) {
                return highestSoFar
            }

            const matchingToken = this._getMatchingToken(scope, themeColors)

            if (!matchingToken) {
                return highestSoFar
            }

            const depth = scope.split(".").length
            if (depth === highestSoFar.depth) {
                const highestPrecedence = this._determinePrecedence(
                    matchingToken,
                    highestSoFar.highestRankedToken,
                )
                return { highestRankedToken: highestPrecedence, depth }
            }
            if (depth > highestSoFar.depth) {
                return { highestRankedToken: matchingToken, depth }
            }
            return highestSoFar
        }, initialRanking)
        return highestRankedToken || null
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

    // Assign each token a priority based on `SCOPE_PRIORITIES` and then sort by priority
    // take the first aka the highest priority one
    private _determinePrecedence(...tokens: TokenColor[]): TokenColor {
        const [{ token }] = tokens
            .map(this._getPriority)
            .sort((prev, next) => next.priority - prev.priority)
        return token
    }

    // if the lowest scope level doesn't match then we go up one level
    // i.e. constant.numeric.special -> constant.numeric
    // and search the theme colors for a match
    private _getMatchingToken(scope: string, theme: TokenColor[]): TokenColor {
        const parts = scope.split(".")
        if (parts.length < 2) {
            return null
        }
        const matchingToken = theme.find(color => color.scope === scope)
        if (matchingToken) {
            return matchingToken
        }
        const currentScope = parts.slice(0, parts.length - 1).join(".")
        return this._getMatchingToken(currentScope, theme)
    }
}
