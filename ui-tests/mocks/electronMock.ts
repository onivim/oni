export const remote = {
    dialog: {
        // replace the showOpenDialog function with a spy which returns a value
        showOpenDialog: jest.fn().mockReturnValue("path/to/output folder"),
    },
    require: (module: string) => ({}),
}
