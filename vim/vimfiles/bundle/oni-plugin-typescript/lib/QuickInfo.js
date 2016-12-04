"use strict";
var QuickInfo = (function () {
    function QuickInfo(oni, host) {
        this._oni = oni;
        this._host = host;
        // this._errorManager = errorManager;
    }
    QuickInfo.prototype.showQuickInfo = function (fullBufferPath, line, col) {
        var _this = this;
        this._host.getQuickInfo(fullBufferPath, line, col).then(function (val) {
            console.log("Quick info: " + JSON.stringify(val)); // tslint:disable-line no-console
            // Truncate display string if over 100 characters
            _this._oni.showQuickInfo(val.displayString, val.documentation);
        });
    };
    return QuickInfo;
}());
exports.QuickInfo = QuickInfo;
//# sourceMappingURL=QuickInfo.js.map