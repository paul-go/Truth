import * as fs from "fs";
import * as path from "path";

const reflexPath = path.join(
	__dirname,
	"../../../Reflex/ReflexCore/build/source/reflex-core.js"
);

const reflexSource = fs.readFileSync(reflexPath, "utf-8");
const finalSource = reflexSource + "\n module.exports = Reflex";
fs.writeFileSync(path.join(__dirname, "../reflex-core.js"), finalSource);

const g = global as any;
g.Truth = require("truth-compiler");
g.Reflex = require("../reflex-core");
require("../talk");
g.Talk = Reflex.Talk;
g.tt = Reflex.Talk.tt;

// Import tests
import "./Operations";
