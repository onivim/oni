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
