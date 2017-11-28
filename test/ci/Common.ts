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

export const getElementByClassName = (className: string) => {

    const elements = document.body.getElementsByClassName(className)

    if (!elements || !elements.length) {
        return null
    } else {
        return elements[0]
    }
}
