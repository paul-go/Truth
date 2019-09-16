const fs = require("fs");

const reflexPath = "../Reflex/ReflexCore/build/source/reflex-core.js";
const reflexSource = fs.readFileSync(reflexPath, "utf-8");
const finalSource = reflexSource + "\n module.exports = Reflex";
fs.writeFileSync("./build/reflex-core.js", finalSource);

global.Truth = require("truth-compiler");
global.Reflex = require("./build/reflex-core");
require("./build/talk");

require("./Main");
