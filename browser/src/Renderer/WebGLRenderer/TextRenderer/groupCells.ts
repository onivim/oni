import { ICell } from "../../../neovim"
import { CellGroup } from "./CellGroup"

export const groupCells = (
    columnCount: number,
    rowIndex: number,
    getCell: (columnIndex: number, rowIndex: number) => ICell,
) => {
    const cellGroups: CellGroup[] = []
    for (let columnIndex = 0; columnIndex < columnCount; columnIndex++) {
        const currentCell = getCell(columnIndex, rowIndex)
        const currentCharacter = currentCell.character
        const currentCellGroup = cellGroups.length && cellGroups[cellGroups.length - 1]

        if (!currentCharacter || currentCharacter === " ") {
            continue
        } else if (
            currentCellGroup &&
            cellStyleMatchesCellGroup(currentCell, currentCellGroup) &&
            columnComesDirectlyAfterCellGroup(columnIndex, currentCellGroup)
        ) {
            currentCellGroup.characters.push(currentCharacter)
        } else {
            const newCellGroup = createNewCellGroup(columnIndex, currentCell)
            cellGroups.push(newCellGroup)
        }
    }
    return cellGroups
}

const cellStyleMatchesCellGroup = (cell: ICell, cellGroup: CellGroup) =>
    cellGroup.foregroundColor === cell.foregroundColor &&
    cellGroup.backgroundColor === cell.backgroundColor && // Maybe this isn't necessary; should we still group different backgrounds?
    cellGroup.bold === cell.bold &&
    cellGroup.italic === cell.italic &&
    cellGroup.underline === cell.underline

const columnComesDirectlyAfterCellGroup = (columnIndex: number, cellGroup: CellGroup) =>
    columnIndex === cellGroup.startColumnIndex + cellGroup.characters.length

const createNewCellGroup = (startColumnIndex: number, startingCell: ICell) => {
    const { character, foregroundColor, backgroundColor, bold, italic, underline } = startingCell
    return {
        startColumnIndex,
        characters: [character],
        foregroundColor,
        backgroundColor,
        bold,
        italic,
        underline,
    }
}
