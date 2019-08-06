
namespace make
{
	/**
	 * Converts the specified JavaScript file to a CommonJS-compatible
	 * module file.
	 */
	export function modulize(path: string, exportExpression: string)
	{
		const insertCode = `\n;typeof module === "object" && (module.exports = ${exportExpression});`;
		const originalCode = Fs.readFileSync(path).toString("utf8");
		let newCode = "";
		
		let sourceMapPos = originalCode.indexOf("\n//# sourceMappingURL=");
		newCode = sourceMapPos < 0 ?
			originalCode + insertCode :
			originalCode.slice(0, sourceMapPos) + 
			insertCode +
			originalCode.slice(sourceMapPos);
		
		Fs.writeFileSync(path, newCode);
	}
}
