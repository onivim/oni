/**
 * Test scripts for QuickOpen
 */

export const getCompletionElement = () => {

    const elements = document.body.getElementsByClassName("autocompletion")

    if (!elements || !elements.length) {
        return null
    } else {
        return elements[0]
    }
}
