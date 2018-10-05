interface IArgs<T> {
    data: T
}

type Callback<T> = (args?: T) => void

/**
 * Takes a CPU intensive function
 * passes it off to a dynamically generated WebWorker
 * and returns a promise to resolve the return value of the function
 *
 * limitations: function has to be Pure! -> no external dependencies etc.
 * @name workerize
 * @function
 * @param Callback<T>
 * @param args?: T
 * @returns Promise<R>
 */
export function workerize<T, R>(work: Callback<T>, args?: T) {
    const handleResult = ({ data }: IArgs<T>) => {
        const result = work(data)
        const worker: Worker = self as any
        return worker.postMessage(result)
    }

    // courtesy of this gem -
    // https://stackoverflow.com/questions/42773714/is-async-await-truly-non-blocking-in-the-browser
    // writes the contents of the string passed in to a file and executes it.
    const blob = new Blob([`var work = ${work};\n onmessage = ${handleResult.toString()}`], {
        type: "text/javascript",
    })
    const worker = new Worker(URL.createObjectURL(blob))
    worker.postMessage(args)
    return new Promise<R>(resolve => (worker.onmessage = evt => resolve(evt.data)))
}
