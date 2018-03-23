/**
 * Entry point for 'sneak integration' + Oni augmentations in the browser
 *
 * This script is a 'preload' script for the webview. You can see more info here:
 * https://electronjs.org/docs/api/webview-tag#preload
 */

;(() => {
    const __oni_win: any = window

    interface Rectangle {
        x: number
        y: number
        width: number
        height: number
    }

    const createRectangle = (x: number, y: number, width: number, height: number): Rectangle => ({
        x,
        y,
        width,
        height,
    })

    interface OniTagInfo {
        id: string
        callback: () => void
        rectangle: Rectangle
    }

    let _tags: OniTagInfo[] = []

    // Note that this name must be in sync with 'BrowserView.tsx'
    __oni_win["__oni_sneak_collector__"] = () => {
        _tags = []
        let idx = 0

        const width = window.innerWidth
        const height = window.innerHeight

        const addElement = (element: HTMLElement): void => {
            idx++
            const clientRect = element.getBoundingClientRect()

            if (clientRect.width === 0 || clientRect.height === 0) {
                return
            }

            const isInBounds =
                clientRect.top >= 0 &&
                clientRect.left >= 0 &&
                clientRect.top <= height &&
                clientRect.left <= width

            if (!isInBounds) {
                return
            }

            const callback = (elem: HTMLElement) => () => {
                if (elem && elem.click) {
                    elem.click()
                }
            }

            _tags.push({
                rectangle: createRectangle(
                    clientRect.left,
                    clientRect.top,
                    clientRect.width,
                    clientRect.height,
                ),
                id: idx.toString(),
                callback: callback(element),
            })
        }

        const tagsToCollect = ["a"]

        tagsToCollect.forEach(tag => {
            const elems = document.getElementsByTagName("a")

            for (let i = 0; i < elems.length; i++) {
                addElement(elems[i])
            }
        })

        const ret = _tags.map(tag => ({
            id: tag.id,
            rectangle: tag.rectangle,
        }))
        return ret
    }

    __oni_win["__oni_sneak_execute__"] = (id: string) => {
        const matchingTags = _tags.filter(t => t.id === id)

        if (matchingTags.length > 0) {
            const match = matchingTags[0]
            match.callback()
        }
    }
})()
