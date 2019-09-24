// Just a workaround to run TruthTalk in Node.

if (typeof module === "object") 
{
	eval("Reflex = global.Reflex;");
	module.exports = Reflex;
}
