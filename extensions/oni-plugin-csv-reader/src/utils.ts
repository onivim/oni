import * as Papa from "papaparse"

/**
 * Converts CSV to HTML Table
 *
 */

export function parseCsvToRowsAndColumn(csvText: string, csvColumnDelimiter = "\t") {
    const rows = csvText.split("\n")
    const rowsWithColumns = rows.map(row => {
        return row.split(csvColumnDelimiter)
    })

    return rowsWithColumns
}

export function parseCsvString(csvString: string) {
    return new Promise<Papa.ParseResult>((resolve, reject) => {
        const result = Papa.parse(csvString, {
            header: true,
            skipEmptyLines: true,
            complete: results => {
                resolve(results)
            },
            error(error) {
                reject(error)
            },
        })
    })
}
