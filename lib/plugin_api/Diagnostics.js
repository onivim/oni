"use strict";
const Sender = require("./Sender");
/**
 * API instance for interacting with Oni (and vim)
 */
class Diagnostics {
    setErrors(key, fileName, errors, color) {
        Sender.send("set-errors", {
            key: key,
            fileName: fileName,
            errors: errors,
            color: color
        });
    }
    clearErrors(key) {
        Sender.send("clear-errors", {
            key: key
        });
    }
}
exports.Diagnostics = Diagnostics;
//# sourceMappingURL=Diagnostics.js.map