/**
 * Utility.ts
 *
 * Grab bag for functions that don't have another home.
 */

import * as fs from "fs"
import * as minimatch from "minimatch"
import * as path from "path"

import * as find from "lodash/find"
import * as isEqual from "lodash/isEqual"
import * as reduce from "lodash/reduce"

import { Observable } from "rxjs/Observable"
import { Subject } from "rxjs/Subject"

import * as JSON5 from "json5"
import { IDisposable, IEvent } from "oni-types"

import * as types from "vscode-languageserver-types"

export class Disposable implements IDisposable {
    private _disposables: IDisposable[] = []
    private _isDisposed: boolean = false

    public get isDisposed(): boolean {
        return this._isDisposed
    }

    public dispose(): void {
        if (!this.isDisposed) {
            this._isDisposed = true
            this._disposables.forEach(disposable => disposable.dispose())
            this._disposables = null
        }
    }

    protected trackDisposable(disposable: IDisposable) {
        this._disposables.push(disposable)
    }
}

export const asObservable = <T>(event: IEvent<T>): Observable<T> => {
    const subject = new Subject<T>()

    event.subscribe((val: T) => subject.next(val))

    return subject
}

/**
 * Use a `node` require instead of a `webpack` require
 * The difference is that `webpack` require will bake the javascript
 * into the module. For most modules, we want the webpack behavior,
 * but for some (like node modules), we want to explicitly require them.
 */

export function nodeRequire(moduleName: string): any {
    return window["require"](moduleName) // tslint:disable-line
}

export const EmptyArray: any[] = []
export const noop = () => {} // tslint:disable-line

export const normalizePath = (fileName: string) => fileName.split("\\").join("/")

// String methods

// ReplaceAll adapted from SO:
// https://stackoverflow.com/questions/15604140/replace-multiple-strings-with-multiple-other-strings
export const replaceAll = (str: string, wordsToReplace: { [key: string]: string }) => {
    const re = new RegExp(Object.keys(wordsToReplace).join("|"), "gi")

    return str.replace(re, matched => wordsToReplace[matched.toLowerCase()])
}

export const flatMap = <T, U>(xs: T[], f: (item: T) => U[]): U[] =>
    xs.reduce((x: U[], y: T) => [...x, ...f(y)], [])

export const diff = (newObject: any, oldObject: any) => {
    // Return changed properties between newObject and oldObject
    const updatedProperties = reduce(
        newObject,
        (result, value, key) => {
            return isEqual(value, oldObject[key]) ? result : [...result, key]
        },
        [],
    )

    const keysInNewObject = Object.keys(newObject)
    const deletedProperties = Object.keys(oldObject).filter(
        key => keysInNewObject.indexOf(key) === -1,
    )

    return [...updatedProperties, ...deletedProperties]
}

export const delay = (timeoutInMs: number = 100): Promise<void> => {
    return new Promise<void>(r => window.setTimeout(() => r(), timeoutInMs))
}

export const doesFileNameMatchGlobPatterns = (
    fileName: string,
    globPatterns: string[],
): boolean => {
    if (!fileName) {
        return false
    }

    if (!globPatterns || !globPatterns.length) {
        return false
    }

    for (const filePattern of globPatterns) {
        if (minimatch(fileName, filePattern)) {
            return true
        }
    }

    return false
}

export const getRootProjectFileFunc = (patternsToMatch: string[]) => {
    const getFilesForDirectory = (fullPath: string): Promise<string[]> => {
        return new Promise((res, rej) => {
            fs.readdir(fullPath, (err, files) => {
                if (err) {
                    rej(err)
                } else {
                    res(files)
                }
            })
        })
    }

    const getRootProjectFile = async (fullPath: string): Promise<string> => {
        const parentDir = path.dirname(fullPath)

        // Test for root folder
        if (parentDir === fullPath) {
            return Promise.reject("Unable to find root csproj file")
        }

        const files = await getFilesForDirectory(fullPath)
        const proj = find(files, f => doesFileNameMatchGlobPatterns(f, patternsToMatch))

        if (proj) {
            return fullPath
        } else {
            return getRootProjectFile(path.dirname(fullPath))
        }
    }

    return getRootProjectFile
}

export const requestIdleCallback = (fn: () => void): number => {
    // tslint:disable-next-line
    return window["requestIdleCallback"](fn)
}

export const isInRange = (line: number, column: number, range: types.Range): boolean => {
    return (
        line >= range.start.line &&
        column >= range.start.character &&
        line <= range.end.line &&
        column <= range.end.character
    )
}

export const sleep = async (timeInMilliseconds: number): Promise<void> => {
    return new Promise<void>(res => {
        window.setTimeout(() => res(), timeInMilliseconds)
    })
}

export interface ICompletablePromise<T> {
    promise: Promise<T>
    resolve: (value?: T) => void
    reject: (err?: Error) => void
}

export const createCompletablePromise = <T>(): ICompletablePromise<T> => {
    let resolve = null
    let reject = null

    const promise = new Promise<T>((res, rej) => {
        resolve = res
        reject = rej
    })

    return {
        promise,
        resolve,
        reject,
    }
}

export const normalizeNewLines = (str: string): string => {
    return str.split("\r\n").join("\n")
}

/**
 * Helper function to ignore incoming values while a promise is waiting to complete
 * This is lossy, in that any input that comes in will be dropped while the promise
 * is in-progress.
 */
export function ignoreWhilePendingPromise<T, U>(
    observable$: Observable<T>,
    promiseFunction: (input: T) => Promise<U>,
): Observable<U> {
    // There must be a more 'RxJS' way to do this with `buffer` and `switchMap`,
    // but I'm still amateur with this :)

    const ret = new Subject<U>()

    let pendingInputs: T[] = []
    let isPromiseInFlight = false

    const promiseExecutor = () => {
        if (pendingInputs.length > 0) {
            const latestValue = pendingInputs[pendingInputs.length - 1]
            pendingInputs = []

            isPromiseInFlight = true
            promiseFunction(latestValue).then(
                v => {
                    ret.next(v)

                    isPromiseInFlight = false
                    promiseExecutor()
                },
                err => {
                    isPromiseInFlight = false
                    promiseExecutor()
                    throw err
                },
            )
        }
    }

    observable$.subscribe(
        (val: T) => {
            pendingInputs.push(val)

            if (!isPromiseInFlight) {
                promiseExecutor()
            }
        },
        err => ret.error(err),
        () => ret.complete(),
    )

    return ret
}

export const parseJson5 = <T>(text: string): T => {
    return JSON5.parse(text) as T
}

export const formatDate = (dateStr: string) => {
    const options: Intl.DateTimeFormatOptions = {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "numeric",
        minute: "numeric",
    }
    const date = new Date(dateStr)
    return date.toLocaleDateString("en-US", options)
}
