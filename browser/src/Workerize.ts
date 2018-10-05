interface IArgs<T> {
    data: T
}

interface IContext {
    [key: string]: any
}

type Callback<T> = (args?: T) => void

/**
 * Takes a CPU intensive function
 * passes it off to a dynamically generated WebWorker
 * and returns a promise to resolve the return value of the function
 *
 * @name workerize
 * @function
 * @param Callback<T>
 * @param args?: T
 * @param context?: any
 * @returns Promise<R>
 */
export function workerize<T, R>(work: Callback<T>, args?: T, context?: IContext) {
    const handleResult = ({ data }: IArgs<T>) => {
        const result = work(data)
        const worker: Worker = self as any
        return worker.postMessage(result)
    }

    const globalVars = createContextVars(context)
    // courtesy of this gem -
    // https://stackoverflow.com/questions/42773714/is-async-await-truly-non-blocking-in-the-browser
    // writes the contents of the string passed in to a file and executes it.
    const blob = new Blob(
        [`var work = ${work};\n ${globalVars} onmessage = ${handleResult.toString()}`],
        {
            type: "text/javascript",
        },
    )
    const worker = new Worker(URL.createObjectURL(blob))
    worker.postMessage(args)
    return new Promise<R>(resolve => (worker.onmessage = evt => resolve(evt.data)))
}

const createContextVars = (context: IContext) => {
    if (!context) {
        return ""
    }
    return Object.keys(context).reduce((acc, key) => {
        acc += `var ${key} = ${context[key]};\n`
        return acc
    }, "")
}
