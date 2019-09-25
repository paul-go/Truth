"use strict";
exports.__esModule = true;
var CLI_1 = require("../Core/CLI");
/**
 * Public CLI Manager for Unified Truth JSON Generator
 */
var JSONCLI = /** @class */ (function () {
    function JSONCLI(Config) {
        console.log(Config);
    }
    return JSONCLI;
}());
exports["default"] = JSONCLI;
CLI_1.InitializeCLI(JSONCLI);
