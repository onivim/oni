/**
 * Test scripts for QuickOpen
 */

export const getCompletionElement = () => {
    return getElementByClassName("autocompletion")
}

export const getElementByClassName = (className: string) => {

    const elements = document.body.getElementsByClassName(className)

    if (!elements || !elements.length) {
        return null
    } else {
        return elements[0]
    }
}
