"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Fs = require("fs");
const Path = require("path");
/** */
class DefinitionFile {
    /** */
    constructor(originPath, lines) {
        this.originPath = originPath;
        this.lines = lines;
    }
    /** */
    static async read(path) {
        if (!path.endsWith(".d.ts")) {
            if (path.endsWith(".js") || path.endsWith(".ts"))
                path = path.slice(0, -3);
            path += ".d.ts";
        }
        if (!path.startsWith("/"))
            throw path + " is not absolute.";
        const [fileContents, error] = await readFile(path);
        if (error)
            throw error;
        if (fileContents === null)
            return null;
        const textLines = fileContents
            .split(/(\r)?\n/g)
            .filter(s => !!s && !!s.trim());
        const parsedLines = [];
        for (const textLine of textLines) {
            const parsedLine = Line.parse(textLine);
            parsedLines.push(parsedLine);
        }
        return new DefinitionFile(path, parsedLines);
    }
    /**
     * Goes through the entire lines property and replaces
     * all re-export statements into DefinitionFile objects.
     */
    async resolve() {
        for (let i = -1; ++i < this.lines.length;) {
            const currentLine = this.lines[i];
            if (currentLine instanceof Lines.ReExportLine) {
                const originPathParsed = Path.parse(this.originPath);
                const targetPathParsed = Path.parse(currentLine.path);
                const resolvedPath = Path.resolve(originPathParsed.dir, currentLine.path);
                const nestedDefinitionFile = await DefinitionFile.read(resolvedPath);
                if (nestedDefinitionFile) {
                    await nestedDefinitionFile.resolve();
                    this.lines[i] = nestedDefinitionFile;
                }
            }
        }
    }
    /** */
    emit(moduleName, namespace, globalize) {
        const lineObjects = this.collectLines();
        function* eachIdentifierLine() {
            for (const lineObject of lineObjects)
                if (lineObject instanceof IdentifierLine)
                    yield lineObject;
        }
        const emitLines = (indent = true) => {
            for (const lineObject of lineObjects) {
                const emitted = lineObject.emit();
                if (emitted !== null)
                    lines.push((indent ? "\t" : "") + emitted);
            }
        };
        const lines = [];
        if (namespace) {
            lines.push("");
            if (globalize) {
                lines.push("declare global {");
                lines.push(`namespace ${namespace} {`);
            }
            else {
                lines.push(`declare namespace ${namespace} {`);
            }
            emitLines();
            lines.push("}");
            if (globalize) {
                lines.push("}");
                lines.push("export { }");
            }
            lines.push("");
        }
        if (moduleName) {
            lines.push(`declare module "${moduleName}" {`);
            emitLines();
            lines.push(`}`);
            lines.push("");
        }
        if (!namespace && !moduleName) {
            emitLines(false);
            lines.push("");
        }
        return lines;
    }
    /** */
    collectLines() {
        const lines = [];
        for (const item of this.lines) {
            if (item instanceof Line)
                lines.push(item);
            else if (item instanceof DefinitionFile)
                lines.push(...item.collectLines());
        }
        return lines;
    }
}
/** */
class Line {
    /**
     * Factory method that returns a line from the specified text.
     */
    static parse(text) {
        const textTrimmed = text.trim();
        const lineCtor = Lines.all().find(ctor => ctor &&
            ctor.pattern &&
            ctor.pattern instanceof RegExp &&
            ctor.pattern.test(textTrimmed));
        if (!lineCtor)
            throw "Internal error";
        const line = new lineCtor(text);
        const matchObject = lineCtor.pattern.exec(textTrimmed);
        if (matchObject && matchObject.groups)
            for (const key of Object.keys(matchObject.groups))
                key in line ?
                    line[key] = matchObject.groups[key] :
                    Object.defineProperty(line, key, { value: matchObject.groups[key] });
        return line;
    }
    /** */
    constructor(text) {
        this.leadingSpaces = text.length - text.replace(/^\s+/, "").length;
        this.text = text.trim();
    }
    /** */
    get indentDepth() { return (this.leadingSpaces / 4) | 0; }
    /** */
    static get pattern() { return /./; }
    /** */
    emit() {
        if (this instanceof Lines.EmptyExportLine)
            return null;
        if (this instanceof Lines.ImportLine)
            if (this.as === "X")
                return null;
        const parts = ["\t".repeat(this.indentDepth)];
        if (this instanceof Lines.DocCommentLineMiddle)
            parts.push(" ");
        parts.push(this.text
            // Remove the X. references
            .replace(/<X\.(?=\w)/g, "<")
            .replace(/\(X\.(?=\w)/g, "(")
            .replace(/ X\.(?=\w)/g, " ")
            // Remove declare keyword on non-exported member
            .replace(/^declare (?=abstract|class|namespace|function|enum|type|const|let|var)/g, "")
            // Remove declare keyword on exported member
            .replace(/^export declare (?=abstract|class|namespace|function|enum|type|const|let|var)/g, "export "));
        // Append a space after the * to fix editor coloring
        if (this instanceof Lines.DocCommentLineMiddle && this.text === "*")
            parts.push(" ");
        return parts.join("");
    }
}
/** */
class IdentifierLine extends Line {
    constructor() {
        super(...arguments);
        this.identifier = "";
    }
}
var Lines;
(function (Lines) {
    /** */
    function all() {
        return Object.keys(Lines).map((ctorName) => Lines[ctorName]);
    }
    Lines.all = all;
    /** */
    class ImportLine extends Line {
        constructor() {
            super(...arguments);
            this.as = "";
            this.path = "";
        }
        static get pattern() { return /^import \* as (?<as>\w+) from ('|")(?<path>[\.\/\w\d]+)('|");$/; }
    }
    Lines.ImportLine = ImportLine;
    /** */
    class ReExportLine extends Line {
        constructor() {
            super(...arguments);
            this.path = "";
        }
        static get pattern() { return /^export \* from ('|")(?<path>[\.\/\w\d]+)('|");$/; }
    }
    Lines.ReExportLine = ReExportLine;
    /** */
    class DocCommentLineSingle extends Line {
        static get pattern() { return /^\/\*\*.*\*\/$/; }
    }
    Lines.DocCommentLineSingle = DocCommentLineSingle;
    /** */
    class DocCommentLineBegin extends Line {
        static get pattern() { return /^\/\*\*$/; }
    }
    Lines.DocCommentLineBegin = DocCommentLineBegin;
    /** */
    class DocCommentLineMiddle extends Line {
        static get pattern() { return /^\*.*$/; }
    }
    Lines.DocCommentLineMiddle = DocCommentLineMiddle;
    /** */
    class DocCommentLineEnd extends Line {
        static get pattern() { return /^.+\*\/$/; }
    }
    Lines.DocCommentLineEnd = DocCommentLineEnd;
    /** */
    class EmptyExportLine extends Line {
        static get pattern() { return /^export\s*{\s*};$/; }
    }
    Lines.EmptyExportLine = EmptyExportLine;
    /** */
    class ClassDeclarationLine extends IdentifierLine {
        static get pattern() { return /^(export )?declare(abstract )? class (?<identifier>[\w]+)( (extends|implements) [\w\.,]+)? {$/; }
    }
    Lines.ClassDeclarationLine = ClassDeclarationLine;
    /** */
    class InterfaceDeclarationLine extends IdentifierLine {
        static get pattern() { return /^(export )?interface (?<identifier>[\w]+)(\sextends [\w,\s]+)? {$/; }
    }
    Lines.InterfaceDeclarationLine = InterfaceDeclarationLine;
    /** */
    class EnumDeclarationLine extends IdentifierLine {
        static get pattern() { return /^(export )?declare( const)? enum (?<identifier>\w+) {$/; }
    }
    Lines.EnumDeclarationLine = EnumDeclarationLine;
    /** */
    class NamespaceDeclarationLine extends IdentifierLine {
        static get pattern() { return /^(export )?declare namespace (?<identifier>\w+) {$/; }
    }
    Lines.NamespaceDeclarationLine = NamespaceDeclarationLine;
    /** */
    class TypeDeclarationLine extends IdentifierLine {
        static get pattern() { return /^(export )?declare type (?<identifier>\w+)$/; }
    }
    Lines.TypeDeclarationLine = TypeDeclarationLine;
    /** */
    class ConstDeclarationLine extends IdentifierLine {
        static get pattern() { return /^(export )?declare const (?<identifier>\w+).*$/; }
    }
    Lines.ConstDeclarationLine = ConstDeclarationLine;
    /** */
    class OtherLine extends Line {
        static get pattern() { return /.*/; }
    }
    Lines.OtherLine = OtherLine;
})(Lines || (Lines = {}));
/** */
const readFile = (path, opts = "utf8") => new Promise((resolve, rej) => {
    Fs.readFile(path, opts, (error, data) => {
        if (error)
            resolve(["", error]);
        else
            resolve([data, null]);
    });
});
/** Whether the code is running as a require module, or from the command line. */
const runningAsModule = !!module.parent;
async function bundle(options) {
    /** Stores the directory containing the entry point script. */
    const scriptDirectory = (() => {
        if (runningAsModule) {
            const args = process.argv;
            if (args.length < 2)
                throw "Unparsable command line arguments";
            const jsFile = args[1];
            if (!jsFile.endsWith(".js"))
                throw "Second argument expected to be a file with the .js extension.";
            return Path.dirname(jsFile);
        }
        return "";
    })();
    /** Translates the specified path to be relative to the entry point script. */
    const translatePath = (inPath) => scriptDirectory ?
        Path.resolve(scriptDirectory, inPath) :
        Path.resolve(inPath);
    /** Reads the argument with the specified name from the process arguments. */
    function readArgument(name, required = false) {
        if (runningAsModule) {
            if (!options || typeof options !== "object")
                throw `Options object must be passed to this function.`;
            return options[name];
        }
        else {
            const processArgs = process.argv;
            const prefix = `--${name}=`;
            const fullArgumentText = processArgs.find(arg => arg.startsWith(prefix));
            if (fullArgumentText) {
                const outValue = fullArgumentText.slice(prefix.length).trim();
                if (outValue)
                    return outValue;
                throw `Argument ${prefix} cannot be empty`;
            }
            else if (required) {
                throw `Missing required argument ${prefix}).`;
            }
        }
    }
    const inArgument = readArgument("in", true);
    const outArgument = readArgument("out", true);
    const nsArgument = readArgument("namespace");
    const globalize = readArgument("globalize");
    const modArgument = readArgument("module");
    const headerArgument = readArgument("header");
    const footerArgument = readArgument("footer");
    const outFiles = Array.isArray(outArgument) ?
        outArgument : [outArgument];
    const headerLines = Array.isArray(headerArgument) ?
        headerArgument : [headerArgument];
    const footerLines = Array.isArray(footerArgument) ?
        footerArgument : [footerArgument];
    const homeDefinitionFile = await DefinitionFile.read(translatePath(inArgument));
    if (!homeDefinitionFile)
        throw "No definition file found at: " + inArgument;
    await homeDefinitionFile.resolve();
    const definitionLines = homeDefinitionFile.emit(modArgument, nsArgument, globalize);
    definitionLines.unshift(...headerLines);
    definitionLines.push(...footerLines);
    if (footerLines.length)
        definitionLines.push("");
    for (const outFile of outFiles) {
        Fs.writeFileSync(translatePath(outFile), definitionLines.join("\n"), "utf8");
    }
}
if (runningAsModule)
    typeof module === "object" && (module.exports = bundle);
else
    bundle();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVHlwZXNCdW5kbGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiVHlwZXNCdW5kbGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBS0EsTUFBTSxFQUFFLEdBQUcsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQ3pCLE1BQU0sSUFBSSxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQztBQU83QixNQUFNO0FBQ04sTUFBTSxjQUFjO0lBdUNuQixNQUFNO0lBQ04sWUFDUyxVQUFrQixFQUNsQixLQUE4QjtRQUQ5QixlQUFVLEdBQVYsVUFBVSxDQUFRO1FBQ2xCLFVBQUssR0FBTCxLQUFLLENBQXlCO0lBQ3JDLENBQUM7SUF6Q0gsTUFBTTtJQUNOLE1BQU0sQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLElBQVk7UUFFN0IsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLEVBQzNCO1lBQ0MsSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxJQUFJLElBQUksQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDO2dCQUMvQyxJQUFJLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUUxQixJQUFJLElBQUksT0FBTyxDQUFDO1NBQ2hCO1FBRUQsSUFBSSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDO1lBQ3hCLE1BQU0sSUFBSSxHQUFHLG1CQUFtQixDQUFDO1FBRWxDLE1BQU0sQ0FBQyxZQUFZLEVBQUUsS0FBSyxDQUFDLEdBQUcsTUFBTSxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUM7UUFFbkQsSUFBSSxLQUFLO1lBQ1IsTUFBTSxLQUFLLENBQUM7UUFFYixJQUFJLFlBQVksS0FBSyxJQUFJO1lBQ3hCLE9BQU8sSUFBSSxDQUFDO1FBRWIsTUFBTSxTQUFTLEdBQUcsWUFBWTthQUM1QixLQUFLLENBQUMsVUFBVSxDQUFDO2FBQ2pCLE1BQU0s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QUFJLENBQUMsa0JBQWtCO1FBQ3RCLE1BQU0sK0JBQStCLEdBQUcsVUFBVSxDQUFDO0lBRXBELE1BQU0sa0JBQWtCLENBQUMsT0FBTyxFQUFFLENBQUM7SUFFbkMsTUFBTSxlQUFlLEdBQUcsa0JBQWtCLENBQUMsSUFBSSxDQUM5QyxXQUFXLEVBQ1gsVUFBVSxFQUNWLFNBQVMsQ0FBQyxDQUFDO0lBRVosZUFBZSxDQUFDLE9BQU8sQ0FBQyxHQUFHLFdBQVcsQ0FBQyxDQUFDO0lBQ3hDLGVBQWUsQ0FBQyxJQUFJLENBQUMsR0FBRyxXQUFXLENBQUMsQ0FBQztJQUVyQyxJQUFJLFdBQVcsQ0FBQyxNQUFNO1FBQ3JCLGVBQWUsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7SUFFMUIsS0FBSyxNQUFNLE9BQU8sSUFBSSxRQUFRLEVBQzlCO1FBQ0MsRUFBRSxDQUFDLGFBQWEsQ0FDZixhQUFhLENBQUMsT0FBTyxDQUFDLEVBQ3RCLGVBQWUsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQzFCLE1BQU0sQ0FBQyxDQUFDO0tBQ1Q7QUFDRixDQUFDO0FBRUQsSUFBSSxlQUFlO0lBQ2xCLE9BQU8sTUFBTSxLQUFLLFFBQVEsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLEdBQUcsTUFBTSxDQUFDLENBQUM7O0lBRXhELE1BQU0sRUFBRSxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiXG4vLyBQb29yIG1hbnMgbm9kZSBkZWZpbml0aW9ucy5cbmRlY2xhcmUgY29uc3QgcHJvY2VzczogYW55O1xuZGVjbGFyZSBjb25zdCByZXF1aXJlOiAobW9kdWxlTmFtZTogc3RyaW5nKSA9PiBhbnk7XG5kZWNsYXJlIGNvbnN0IG1vZHVsZTogYW55O1xuY29uc3QgRnMgPSByZXF1aXJlKFwiZnNcIik7XG5jb25zdCBQYXRoID0gcmVxdWlyZShcInBhdGhcIik7XG5cblxuLyoqICovXG5pbnRlcmZhY2UgTGluZUFycmF5IGV4dGVuZHMgQXJyYXk8TGluZSB8IExpbmVBcnJheT4geyB9XG5cblxuLyoqICovXG5jbGFzcyBEZWZpbml0aW9uRmlsZVxue1xuXHQvKiogKi9cblx0c3RhdGljIGFzeW5jIHJlYWQocGF0aDogc3RyaW5nKVxuXHR7XG5cdFx0aWYgKCFwYXRoLmVuZHNXaXRoKFwiLmQudHNcIikpXG5cdFx0e1xuXHRcdFx0aWYgKHBhdGguZW5kc1dpdGgoXCIuanNcIikgfHwgcGF0aC5lbmRzV2l0aChcIi50c1wiKSlcblx0XHRcdFx0cGF0aCA9IHBhdGguc2xpY2UoMCwgLTMpO1xuXHRcdFx0XG5cdFx0XHRwYXRoICs9IFwiLmQudHNcIjtcblx0XHR9XG5cdFx0XG5cdFx0aWYgKCFwYXRoLnN0YXJ0c1dpdGgoXCIvXCIpKVxuXHRcdFx0dGhyb3cgcGF0aCArIFwiIGlzIG5vdCBhYnNvbHV0ZS5cIjtcblx0XHRcblx0XHRjb25zdCBbZmlsZUNvbnRlbnRzLCBlcnJvcl0gPSBhd2FpdCByZWFkRmlsZShwYXRoKTtcblx0XHRcblx0XHRpZiAoZXJyb3IpXG5cdFx0XHR0aHJvdyBlcnJvcjtcblx0XHRcblx0XHRpZiAoZmlsZUNvbnRlbnRzID09PSBudWxsKVxuXHRcdFx0cmV0dXJuIG51bGw7XG5cdFx0XG5cdFx0Y29uc3QgdGV4dExpbmVzID0gZmlsZUNvbnRlbnRzXG5cdFx0XHQuc3BsaXQoLyhcXHIpP1xcbi9nKVxuXHRcdFx0LmZpbHRlcihzID0+ICEhcyAmJiAhIXMudHJpbSgpKTtcblx0XHRcblx0XHRjb25zdCBwYXJzZWRMaW5lczogTGluZVtdID0gW107XG5cdFx0XG5cdFx0Zm9yIChjb25zdCB0ZXh0TGluZSBvZiB0ZXh0TGluZXMpXG5cdFx0e1xuXHRcdFx0Y29uc3QgcGFyc2VkTGluZSA9IExpbmUucGFyc2UodGV4dExpbmUpO1xuXHRcdFx0cGFyc2VkTGluZXMucHVzaChwYXJzZWRMaW5lKTtcblx0XHR9XG5cdFx0XG5cdFx0cmV0dXJuIG5ldyBEZWZpbml0aW9uRmlsZShwYXRoLCBwYXJzZWRMaW5lcyk7XG5cdH1cblx0XG5cdC8qKiAqL1xuXHRwcml2YXRlIGNvbnN0cnVjdG9yKFxuXHRcdHByaXZhdGUgb3JpZ2luUGF0aDogc3RyaW5nLFxuXHRcdHByaXZhdGUgbGluZXM6IChMaW5lfERlZmluaXRpb25GaWxlKVtdKVxuXHR7IH1cblx0XG5cdC8qKlxuXHQgKiBHb2VzIHRocm91Z2ggdGhlIGVudGlyZSBsaW5lcyBwcm9wZXJ0eSBhbmQgcmVwbGFjZXNcblx0ICogYWxsIHJlLWV4cG9ydCBzdGF0ZW1lbnRzIGludG8gRGVmaW5pdGlvbkZpbGUgb2JqZWN0cy5cblx0ICovXG5cdGFzeW5jIHJlc29sdmUoKVxuXHR7XG5cdFx0Zm9yIChsZXQgaSA9IC0xOyArK2kgPCB0aGlzLmxpbmVzLmxlbmd0aDspXG5cdFx0e1xuXHRcdFx0Y29uc3QgY3VycmVudExpbmUgPSB0aGlzLmxpbmVzW2ldO1xuXHRcdFx0XG5cdFx0XHRpZiAoY3VycmVudExpbmUgaW5zdGFuY2VvZiBMaW5lcy5SZUV4cG9ydExpbmUpXG5cdFx0XHR7XG5cdFx0XHRcdGNvbnN0IG9yaWdpblBhdGhQYXJzZWQgPSBQYXRoLnBhcnNlKHRoaXMub3JpZ2luUGF0aCk7XG5cdFx0XHRcdGNvbnN0IHRhcmdldFBhdGhQYXJzZWQgPSBQYXRoLnBhcnNlKGN1cnJlbnRMaW5lLnBhdGgpO1xuXHRcdFx0XHRjb25zdCByZXNvbHZlZFBhdGggPSBQYXRoLnJlc29sdmUob3JpZ2luUGF0aFBhcnNlZC5kaXIsIGN1cnJlbnRMaW5lLnBhdGgpO1xuXHRcdFx0XHRjb25zdCBuZXN0ZWREZWZpbml0aW9uRmlsZSA9IGF3YWl0IERlZmluaXRpb25GaWxlLnJlYWQocmVzb2x2ZWRQYXRoKTtcblx0XHRcdFx0XG5cdFx0XHRcdGlmIChuZXN0ZWREZWZpbml0aW9uRmlsZSlcblx0XHRcdFx0e1xuXHRcdFx0XHRcdGF3YWl0IG5lc3RlZERlZmluaXRpb25GaWxlLnJlc29sdmUoKTtcblx0XHRcdFx0XHR0aGlzLmxpbmVzW2ldID0gbmVzdGVkRGVmaW5pdGlvbkZpbGU7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cdH1cblx0XG5cdC8qKiAqL1xuXHRlbWl0KG1vZHVsZU5hbWU/OiBzdHJpbmcsIG5hbWVzcGFjZT86IHN0cmluZywgZ2xvYmFsaXplPzogYm9vbGVhbilcblx0e1xuXHRcdGNvbnN0IGxpbmVPYmplY3RzID0gdGhpcy5jb2xsZWN0TGluZXMoKTtcblx0XHRcblx0XHRmdW5jdGlvbiogZWFjaElkZW50aWZpZXJMaW5lKClcblx0XHR7XG5cdFx0XHRmb3IgKGNvbnN0IGxpbmVPYmplY3Qgb2YgbGluZU9iamVjdHMpXG5cdFx0XHRcdGlmIChsaW5lT2JqZWN0IGluc3RhbmNlb2YgSWRlbnRpZmllckxpbmUpXG5cdFx0XHRcdFx0eWllbGQgbGluZU9iamVjdDtcblx0XHR9XG5cdFx0XG5cdFx0Y29uc3QgZW1pdExpbmVzID0gKGluZGVudCA9IHRydWUpID0+XG5cdFx0e1xuXHRcdFx0Zm9yIChjb25zdCBsaW5lT2JqZWN0IG9mIGxpbmVPYmplY3RzKVxuXHRcdFx0e1xuXHRcdFx0XHRjb25zdCBlbWl0dGVkID0gbGluZU9iamVjdC5lbWl0KCk7XG5cdFx0XHRcdGlmIChlbWl0dGVkICE9PSBudWxsKVxuXHRcdFx0XHRcdGxpbmVzLnB1c2goKGluZGVudCA/IFwiXFx0XCIgOiBcIlwiKSArIGVtaXR0ZWQpO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRcblx0XHRjb25zdCBsaW5lczogc3RyaW5nW10gPSBbXTtcblx0XHRcblx0XHRpZiAobmFtZXNwYWNlKVxuXHRcdHtcblx0XHRcdGxpbmVzLnB1c2goXCJcIik7XG5cdFx0XHRcblx0XHRcdGlmIChnbG9iYWxpemUpXG5cdFx0XHR7XG5cdFx0XHRcdGxpbmVzLnB1c2goXCJkZWNsYXJlIGdsb2JhbCB7XCIpO1xuXHRcdFx0XHRsaW5lcy5wdXNoKGBuYW1lc3BhY2UgJHtuYW1lc3BhY2V9IHtgKTtcblx0XHRcdH1cblx0XHRcdGVsc2Vcblx0XHRcdHtcblx0XHRcdFx0bGluZXMucHVzaChgZGVjbGFyZSBuYW1lc3BhY2UgJHtuYW1lc3BhY2V9IHtgKTtcblx0XHRcdH1cblx0XHRcdFxuXHRcdFx0ZW1pdExpbmVzKCk7XG5cdFx0XHRsaW5lcy5wdXNoKFwifVwiKTtcblx0XHRcdFxuXHRcdFx0aWYgKGdsb2JhbGl6ZSlcblx0XHRcdHtcblx0XHRcdFx0bGluZXMucHVzaChcIn1cIik7XG5cdFx0XHRcdGxpbmVzLnB1c2goXCJleHBvcnQgeyB9XCIpO1xuXHRcdFx0fVxuXHRcdFx0XG5cdFx0XHRsaW5lcy5wdXNoKFwiXCIpO1xuXHRcdH1cblx0XHRcblx0XHRpZiAobW9kdWxlTmFtZSlcblx0XHR7XG5cdFx0XHRsaW5lcy5wdXNoKGBkZWNsYXJlIG1vZHVsZSBcIiR7bW9kdWxlTmFtZX1cIiB7YCk7XG5cdFx0XHRlbWl0TGluZXMoKTtcblx0XHRcdGxpbmVzLnB1c2goYH1gKTtcblx0XHRcdGxpbmVzLnB1c2goXCJcIik7XG5cdFx0fVxuXHRcdFxuXHRcdGlmICghbmFtZXNwYWNlICYmICFtb2R1bGVOYW1lKVxuXHRcdHtcblx0XHRcdGVtaXRMaW5lcyhmYWxzZSk7XG5cdFx0XHRsaW5lcy5wdXNoKFwiXCIpO1xuXHRcdH1cblx0XHRcblx0XHRyZXR1cm4gbGluZXM7XG5cdH1cblx0XG5cdC8qKiAqL1xuXHRwcml2YXRlIGNvbGxlY3RMaW5lcygpXG5cdHtcblx0XHRjb25zdCBsaW5lczogTGluZVtdID0gW107XG5cdFx0XG5cdFx0Zm9yIChjb25zdCBpdGVtIG9mIHRoaXMubGluZXMpXG5cdFx0e1xuXHRcdFx0aWYgKGl0ZW0gaW5zdGFuY2VvZiBMaW5lKVxuXHRcdFx0XHRsaW5lcy5wdXNoKGl0ZW0pO1xuXHRcdFx0XG5cdFx0XHRlbHNlIGlmIChpdGVtIGluc3RhbmNlb2YgRGVmaW5pdGlvbkZpbGUpXG5cdFx0XHRcdGxpbmVzLnB1c2goLi4uaXRlbS5jb2xsZWN0TGluZXMoKSk7XG5cdFx0fVxuXHRcdFxuXHRcdHJldHVybiBsaW5lcztcblx0fVxufVxuXG4vKiogKi9cbmNsYXNzIExpbmVcbntcblx0LyoqXG5cdCAqIEZhY3RvcnkgbWV0aG9kIHRoYXQgcmV0dXJucyBhIGxpbmUgZnJvbSB0aGUgc3BlY2lmaWVkIHRleHQuXG5cdCAqL1xuXHRzdGF0aWMgcGFyc2UodGV4dDogc3RyaW5nKVxuXHR7XG5cdFx0Y29uc3QgdGV4dFRyaW1tZWQgPSB0ZXh0LnRyaW0oKTtcblx0XHRcblx0XHRjb25zdCBsaW5lQ3RvcjogKHR5cGVvZiBMaW5lKSB8IHVuZGVmaW5lZCA9IExpbmVzLmFsbCgpLmZpbmQoY3RvciA9PlxuXHRcdFx0Y3RvciAmJiBcblx0XHRcdGN0b3IucGF0dGVybiAmJlxuXHRcdFx0Y3Rvci5wYXR0ZXJuIGluc3RhbmNlb2YgUmVnRXhwICYmIFxuXHRcdFx0Y3Rvci5wYXR0ZXJuLnRlc3QodGV4dFRyaW1tZWQpKTtcblx0XHRcblx0XHRpZiAoIWxpbmVDdG9yKVxuXHRcdFx0dGhyb3cgXCJJbnRlcm5hbCBlcnJvclwiO1xuXHRcdFxuXHRcdGNvbnN0IGxpbmU6IExpbmUgPSBuZXcgbGluZUN0b3IodGV4dCk7XG5cdFx0Y29uc3QgbWF0Y2hPYmplY3QgPSA8UmVnRXhwRXhlY0FycmF5ICYgeyBncm91cHM6IG9iamVjdCB9PmxpbmVDdG9yLnBhdHRlcm4uZXhlYyh0ZXh0VHJpbW1lZCk7XG5cdFx0XG5cdFx0aWYgKG1hdGNoT2JqZWN0ICYmIG1hdGNoT2JqZWN0Lmdyb3Vwcylcblx0XHRcdGZvciAoY29uc3Qga2V5IG9mIE9iamVjdC5rZXlzKG1hdGNoT2JqZWN0Lmdyb3VwcykpXG5cdFx0XHRcdGtleSBpbiBsaW5lID9cblx0XHRcdFx0XHRsaW5lW2tleV0gPSBtYXRjaE9iamVjdC5ncm91cHNba2V5XSA6XG5cdFx0XHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGxpbmUsIGtleSwgeyB2YWx1ZTogbWF0Y2hPYmplY3QuZ3JvdXBzW2tleV0gfSk7XG5cdFx0XG5cdFx0cmV0dXJuIGxpbmU7XG5cdH1cblx0XG5cdC8qKiAqL1xuXHRwcm90ZWN0ZWQgY29uc3RydWN0b3IodGV4dDogc3RyaW5nKVxuXHR7XG5cdFx0dGhpcy5sZWFkaW5nU3BhY2VzID0gdGV4dC5sZW5ndGggLSB0ZXh0LnJlcGxhY2UoL15cXHMrLywgXCJcIikubGVuZ3RoO1xuXHRcdHRoaXMudGV4dCA9IHRleHQudHJpbSgpO1xuXHR9XG5cdFxuXHQvKiogKi9cblx0cmVhZG9ubHkgdGV4dDogc3RyaW5nO1xuXHRcblx0LyoqICovXG5cdHJlYWRvbmx5IGxlYWRpbmdTcGFjZXM6IG51bWJlcjtcblx0XG5cdC8qKiAqL1xuXHRnZXQgaW5kZW50RGVwdGgoKSB7IHJldHVybiAodGhpcy5sZWFkaW5nU3BhY2VzIC8gNCkgfCAwOyB9XG5cdFxuXHQvKiogKi9cblx0c3RhdGljIGdldCBwYXR0ZXJuKCkgeyByZXR1cm4gLy4vOyB9XG5cdFxuXHQvKiogKi9cblx0ZW1pdCgpXG5cdHtcblx0XHRpZiAodGhpcyBpbnN0YW5jZW9mIExpbmVzLkVtcHR5RXhwb3J0TGluZSlcblx0XHRcdHJldHVybiBudWxsO1xuXHRcdFxuXHRcdGlmICh0aGlzIGluc3RhbmNlb2YgTGluZXMuSW1wb3J0TGluZSlcblx0XHRcdGlmICh0aGlzLmFzID09PSBcIlhcIilcblx0XHRcdFx0cmV0dXJuIG51bGw7XG5cdFx0XG5cdFx0Y29uc3QgcGFydHMgPSBbXCJcXHRcIi5yZXBlYXQodGhpcy5pbmRlbnREZXB0aCldO1xuXHRcdFxuXHRcdGlmICh0aGlzIGluc3RhbmNlb2YgTGluZXMuRG9jQ29tbWVudExpbmVNaWRkbGUpXG5cdFx0XHRwYXJ0cy5wdXNoKFwiIFwiKTtcblx0XHRcblx0XHRwYXJ0cy5wdXNoKHRoaXMudGV4dFxuXHRcdFx0Ly8gUmVtb3ZlIHRoZSBYLiByZWZlcmVuY2VzXG5cdFx0XHQucmVwbGFjZSgvPFhcXC4oPz1cXHcpL2csIFwiPFwiKVxuXHRcdFx0LnJlcGxhY2UoL1xcKFhcXC4oPz1cXHcpL2csIFwiKFwiKVxuXHRcdFx0LnJlcGxhY2UoLyBYXFwuKD89XFx3KS9nLCBcIiBcIilcblx0XHRcdC8vIFJlbW92ZSBkZWNsYXJlIGtleXdvcmQgb24gbm9uLWV4cG9ydGVkIG1lbWJlclxuXHRcdFx0LnJlcGxhY2UoL15kZWNsYXJlICg/PWFic3RyYWN0fGNsYXNzfG5hbWVzcGFjZXxmdW5jdGlvbnxlbnVtfHR5cGV8Y29uc3R8bGV0fHZhcikvZywgXCJcIilcblx0XHRcdC8vIFJlbW92ZSBkZWNsYXJlIGtleXdvcmQgb24gZXhwb3J0ZWQgbWVtYmVyXG5cdFx0XHQucmVwbGFjZSgvXmV4cG9ydCBkZWNsYXJlICg/PWFic3RyYWN0fGNsYXNzfG5hbWVzcGFjZXxmdW5jdGlvbnxlbnVtfHR5cGV8Y29uc3R8bGV0fHZhcikvZywgXCJleHBvcnQgXCIpKTtcblx0XHRcblx0XHQvLyBBcHBlbmQgYSBzcGFjZSBhZnRlciB0aGUgKiB0byBmaXggZWRpdG9yIGNvbG9yaW5nXG5cdFx0aWYgKHRoaXMgaW5zdGFuY2VvZiBMaW5lcy5Eb2NDb21tZW50TGluZU1pZGRsZSAmJiB0aGlzLnRleHQgPT09IFwiKlwiKVxuXHRcdFx0cGFydHMucHVzaChcIiBcIik7XG5cdFx0XG5cdFx0cmV0dXJuIHBhcnRzLmpvaW4oXCJcIik7XG5cdH1cbn1cblxuXG4vKiogKi9cbmV4cG9ydCBpbnRlcmZhY2UgSWRlbnRpZmllckRlY2xhcmF0aW9uTGluZVxue1xuXHRpZGVudGlmaWVyOiBzdHJpbmc7XG59XG5cblxuLyoqICovXG5hYnN0cmFjdCBjbGFzcyBJZGVudGlmaWVyTGluZSBleHRlbmRzIExpbmVcbntcblx0cmVhZG9ubHkgaWRlbnRpZmllcjogc3RyaW5nID0gXCJcIjtcbn1cblxuXG5uYW1lc3BhY2UgTGluZXNcbntcblx0LyoqICovXG5cdGV4cG9ydCBmdW5jdGlvbiBhbGwoKTogKHR5cGVvZiBMaW5lKVtdXG5cdHtcblx0XHRyZXR1cm4gT2JqZWN0LmtleXMoTGluZXMpLm1hcCgoY3Rvck5hbWU6IHN0cmluZykgPT4gTGluZXNbY3Rvck5hbWVdKTtcblx0fVxuXHRcblx0LyoqICovXG5cdGV4cG9ydCBjbGFzcyBJbXBvcnRMaW5lIGV4dGVuZHMgTGluZVxuXHR7XG5cdFx0c3RhdGljIGdldCBwYXR0ZXJuKCkgeyByZXR1cm4gL15pbXBvcnQgXFwqIGFzICg/PGFzPlxcdyspIGZyb20gKCd8XCIpKD88cGF0aD5bXFwuXFwvXFx3XFxkXSspKCd8XCIpOyQvOyB9XG5cdFx0XG5cdFx0cmVhZG9ubHkgYXM6IHN0cmluZyA9IFwiXCI7XG5cdFx0XG5cdFx0cmVhZG9ubHkgcGF0aDogc3RyaW5nID0gXCJcIjtcblx0fVxuXG5cdC8qKiAqL1xuXHRleHBvcnQgY2xhc3MgUmVFeHBvcnRMaW5lIGV4dGVuZHMgTGluZVxuXHR7XG5cdFx0c3RhdGljIGdldCBwYXR0ZXJuKCkgeyByZXR1cm4gL15leHBvcnQgXFwqIGZyb20gKCd8XCIpKD88cGF0aD5bXFwuXFwvXFx3XFxkXSspKCd8XCIpOyQvOyB9XG5cdFx0XG5cdFx0cmVhZG9ubHkgcGF0aDogc3RyaW5nID0gXCJcIjtcblx0fVxuXG5cdC8qKiAqL1xuXHRleHBvcnQgY2xhc3MgRG9jQ29tbWVudExpbmVTaW5nbGUgZXh0ZW5kcyBMaW5lXG5cdHtcblx0XHRzdGF0aWMgZ2V0IHBhdHRlcm4oKSB7IHJldHVybiAvXlxcL1xcKlxcKi4qXFwqXFwvJC87IH1cblx0fVxuXG5cdC8qKiAqL1xuXHRleHBvcnQgY2xhc3MgRG9jQ29tbWVudExpbmVCZWdpbiBleHRlbmRzIExpbmVcblx0e1xuXHRcdHN0YXRpYyBnZXQgcGF0dGVybigpIHsgcmV0dXJuIC9eXFwvXFwqXFwqJC87IH1cblx0fVxuXG5cdC8qKiAqL1xuXHRleHBvcnQgY2xhc3MgRG9jQ29tbWVudExpbmVNaWRkbGUgZXh0ZW5kcyBMaW5lXG5cdHtcblx0XHRzdGF0aWMgZ2V0IHBhdHRlcm4oKSB7IHJldHVybiAvXlxcKi4qJC87IH1cblx0fVxuXHRcblx0LyoqICovXG5cdGV4cG9ydCBjbGFzcyBEb2NDb21tZW50TGluZUVuZCBleHRlbmRzIExpbmVcblx0e1xuXHRcdHN0YXRpYyBnZXQgcGF0dGVybigpIHsgcmV0dXJuIC9eLitcXCpcXC8kLzsgfVxuXHR9XG5cdFxuXHQvKiogKi9cblx0ZXhwb3J0IGNsYXNzIEVtcHR5RXhwb3J0TGluZSBleHRlbmRzIExpbmVcblx0e1xuXHRcdHN0YXRpYyBnZXQgcGF0dGVybigpIHsgcmV0dXJuIC9eZXhwb3J0XFxzKntcXHMqfTskLzsgfVxuXHR9XG5cdFxuXHQvKiogKi9cblx0ZXhwb3J0IGNsYXNzIENsYXNzRGVjbGFyYXRpb25MaW5lIGV4dGVuZHMgSWRlbnRpZmllckxpbmVcblx0e1xuXHRcdHN0YXRpYyBnZXQgcGF0dGVybigpIHsgcmV0dXJuIC9eKGV4cG9ydCApP2RlY2xhcmUoYWJzdHJhY3QgKT8gY2xhc3MgKD88aWRlbnRpZmllcj5bXFx3XSspKCAoZXh0ZW5kc3xpbXBsZW1lbnRzKSBbXFx3XFwuLF0rKT8geyQvOyB9XG5cdH1cblxuXHQvKiogKi9cblx0ZXhwb3J0IGNsYXNzIEludGVyZmFjZURlY2xhcmF0aW9uTGluZSBleHRlbmRzIElkZW50aWZpZXJMaW5lXG5cdHtcblx0XHRzdGF0aWMgZ2V0IHBhdHRlcm4oKSB7IHJldHVybiAvXihleHBvcnQgKT9pbnRlcmZhY2UgKD88aWRlbnRpZmllcj5bXFx3XSspKFxcc2V4dGVuZHMgW1xcdyxcXHNdKyk/IHskLzsgfVxuXHR9XG5cdFxuXHQvKiogKi9cblx0ZXhwb3J0IGNsYXNzIEVudW1EZWNsYXJhdGlvbkxpbmUgZXh0ZW5kcyBJZGVudGlmaWVyTGluZVxuXHR7XG5cdFx0c3RhdGljIGdldCBwYXR0ZXJuKCkgeyByZXR1cm4gL14oZXhwb3J0ICk/ZGVjbGFyZSggY29uc3QpPyBlbnVtICg/PGlkZW50aWZpZXI+XFx3KykgeyQvOyB9XG5cdH1cblxuXHQvKiogKi9cblx0ZXhwb3J0IGNsYXNzIE5hbWVzcGFjZURlY2xhcmF0aW9uTGluZSBleHRlbmRzIElkZW50aWZpZXJMaW5lXG5cdHtcblx0XHRzdGF0aWMgZ2V0IHBhdHRlcm4oKSB7IHJldHVybiAvXihleHBvcnQgKT9kZWNsYXJlIG5hbWVzcGFjZSAoPzxpZGVudGlmaWVyPlxcdyspIHskLzsgfVxuXHR9XG5cdFxuXHQvKiogKi9cblx0ZXhwb3J0IGNsYXNzIFR5cGVEZWNsYXJhdGlvbkxpbmUgZXh0ZW5kcyBJZGVudGlmaWVyTGluZVxuXHR7XG5cdFx0c3RhdGljIGdldCBwYXR0ZXJuKCkgeyByZXR1cm4gL14oZXhwb3J0ICk/ZGVjbGFyZSB0eXBlICg/PGlkZW50aWZpZXI+XFx3KykkLzsgfVxuXHR9XG5cdFxuXHQvKiogKi9cblx0ZXhwb3J0IGNsYXNzIENvbnN0RGVjbGFyYXRpb25MaW5lIGV4dGVuZHMgSWRlbnRpZmllckxpbmVcblx0e1xuXHRcdHN0YXRpYyBnZXQgcGF0dGVybigpIHsgcmV0dXJuIC9eKGV4cG9ydCApP2RlY2xhcmUgY29uc3QgKD88aWRlbnRpZmllcj5cXHcrKS4qJC87IH1cblx0fVxuXHRcblx0LyoqICovXG5cdGV4cG9ydCBjbGFzcyBPdGhlckxpbmUgZXh0ZW5kcyBMaW5lXG5cdHtcblx0XHRzdGF0aWMgZ2V0IHBhdHRlcm4oKSB7IHJldHVybiAvLiovOyB9XG5cdH1cbn1cblxuXG4vKiogKi9cbmNvbnN0IHJlYWRGaWxlID0gKHBhdGg6IHN0cmluZywgb3B0cyA9IFwidXRmOFwiKSA9PlxuXHRuZXcgUHJvbWlzZTxbc3RyaW5nLCBFcnJvciB8IG51bGxdPigocmVzb2x2ZSwgcmVqKSA9PlxuXHR7XG5cdFx0RnMucmVhZEZpbGUocGF0aCwgb3B0cywgKGVycm9yOiBFcnJvciwgZGF0YTogc3RyaW5nKSA9PlxuXHRcdHtcblx0XHRcdGlmIChlcnJvcilcblx0XHRcdFx0cmVzb2x2ZShbXCJcIiwgZXJyb3JdKTtcblx0XHRcdGVsc2Vcblx0XHRcdFx0cmVzb2x2ZShbZGF0YSwgbnVsbF0pO1xuXHRcdH0pO1xuXHR9KTtcblxuXG5pbnRlcmZhY2UgSUJ1bmRsZU9wdGlvbnNcbntcblx0aW46IHN0cmluZztcblx0b3V0OiBzdHJpbmd8c3RyaW5nW107XG5cdG5hbWVzcGFjZTogc3RyaW5nO1xuXHRnbG9iYWxpemU6IGJvb2xlYW47XG5cdG1vZHVsZTogc3RyaW5nO1xuXHRoZWFkZXI6IHN0cmluZ3xzdHJpbmdbXTtcblx0Zm9vdGVyOiBzdHJpbmd8c3RyaW5nW107XG59XG5cblxuLyoqIFdoZXRoZXIgdGhlIGNvZGUgaXMgcnVubmluZyBhcyBhIHJlcXVpcmUgbW9kdWxlLCBvciBmcm9tIHRoZSBjb21tYW5kIGxpbmUuICovXG5jb25zdCBydW5uaW5nQXNNb2R1bGUgPSAhIW1vZHVsZS5wYXJlbnQ7XG5cblxuYXN5bmMgZnVuY3Rpb24gYnVuZGxlKG9wdGlvbnM/OiBJQnVuZGxlT3B0aW9ucylcbntcblx0LyoqIFN0b3JlcyB0aGUgZGlyZWN0b3J5IGNvbnRhaW5pbmcgdGhlIGVudHJ5IHBvaW50IHNjcmlwdC4gKi9cblx0Y29uc3Qgc2NyaXB0RGlyZWN0b3J5ID0gKCgpID0+XG5cdHtcblx0XHRpZiAocnVubmluZ0FzTW9kdWxlKVxuXHRcdHtcblx0XHRcdGNvbnN0IGFyZ3M6IHN0cmluZ1tdID0gcHJvY2Vzcy5hcmd2O1xuXHRcdFx0XG5cdFx0XHRpZiAoYXJncy5sZW5ndGggPCAyKVxuXHRcdFx0XHR0aHJvdyBcIlVucGFyc2FibGUgY29tbWFuZCBsaW5lIGFyZ3VtZW50c1wiO1xuXHRcdFx0XG5cdFx0XHRjb25zdCBqc0ZpbGUgPSBhcmdzWzFdO1xuXHRcdFx0aWYgKCFqc0ZpbGUuZW5kc1dpdGgoXCIuanNcIikpXG5cdFx0XHRcdHRocm93IFwiU2Vjb25kIGFyZ3VtZW50IGV4cGVjdGVkIHRvIGJlIGEgZmlsZSB3aXRoIHRoZSAuanMgZXh0ZW5zaW9uLlwiO1xuXHRcdFx0XG5cdFx0XHRyZXR1cm4gUGF0aC5kaXJuYW1lKGpzRmlsZSk7XG5cdFx0fVxuXHRcdFxuXHRcdHJldHVybiBcIlwiO1xuXHR9KSgpO1xuXHRcblx0LyoqIFRyYW5zbGF0ZXMgdGhlIHNwZWNpZmllZCBwYXRoIHRvIGJlIHJlbGF0aXZlIHRvIHRoZSBlbnRyeSBwb2ludCBzY3JpcHQuICovXG5cdGNvbnN0IHRyYW5zbGF0ZVBhdGggPSAoaW5QYXRoOiBzdHJpbmcpID0+IHNjcmlwdERpcmVjdG9yeSA/XG5cdFx0UGF0aC5yZXNvbHZlKHNjcmlwdERpcmVjdG9yeSwgaW5QYXRoKSA6IFxuXHRcdFBhdGgucmVzb2x2ZShpblBhdGgpO1xuXHRcblx0LyoqIFJlYWRzIHRoZSBhcmd1bWVudCB3aXRoIHRoZSBzcGVjaWZpZWQgbmFtZSBmcm9tIHRoZSBwcm9jZXNzIGFyZ3VtZW50cy4gKi9cblx0ZnVuY3Rpb24gcmVhZEFyZ3VtZW50PFQgPSBzdHJpbmc+KG5hbWU6IGtleW9mIElCdW5kbGVPcHRpb25zLCByZXF1aXJlZCA9IGZhbHNlKTogVFxuXHR7XG5cdFx0aWYgKHJ1bm5pbmdBc01vZHVsZSlcblx0XHR7XG5cdFx0XHRpZiAoIW9wdGlvbnMgfHwgdHlwZW9mIG9wdGlvbnMgIT09IFwib2JqZWN0XCIpXG5cdFx0XHRcdHRocm93IGBPcHRpb25zIG9iamVjdCBtdXN0IGJlIHBhc3NlZCB0byB0aGlzIGZ1bmN0aW9uLmA7XG5cdFx0XHRcblx0XHRcdHJldHVybiA8VD48YW55Pm9wdGlvbnNbbmFtZV07XG5cdFx0fVxuXHRcdGVsc2Vcblx0XHR7XG5cdFx0XHRjb25zdCBwcm9jZXNzQXJnczogc3RyaW5nW10gPSBwcm9jZXNzLmFyZ3Y7XG5cdFx0XHRjb25zdCBwcmVmaXggPSBgLS0ke25hbWV9PWA7XG5cdFx0XHRjb25zdCBmdWxsQXJndW1lbnRUZXh0ID0gcHJvY2Vzc0FyZ3MuZmluZChhcmcgPT4gYXJnLnN0YXJ0c1dpdGgocHJlZml4KSk7XG5cdFx0XHRcblx0XHRcdGlmIChmdWxsQXJndW1lbnRUZXh0KVxuXHRcdFx0e1xuXHRcdFx0XHRjb25zdCBvdXRWYWx1ZSA9IGZ1bGxBcmd1bWVudFRleHQuc2xpY2UocHJlZml4Lmxlbmd0aCkudHJpbSgpO1xuXHRcdFx0XHRpZiAob3V0VmFsdWUpXG5cdFx0XHRcdFx0cmV0dXJuIDxUPjxhbnk+b3V0VmFsdWU7XG5cdFx0XHRcdFxuXHRcdFx0XHR0aHJvdyBgQXJndW1lbnQgJHtwcmVmaXh9IGNhbm5vdCBiZSBlbXB0eWA7XG5cdFx0XHR9XG5cdFx0XHRlbHNlIGlmIChyZXF1aXJlZClcblx0XHRcdHtcblx0XHRcdFx0dGhyb3cgYE1pc3NpbmcgcmVxdWlyZWQgYXJndW1lbnQgJHtwcmVmaXh9KS5gO1xuXHRcdFx0fVxuXHRcdH1cblx0fVxuXHRcblx0Y29uc3QgaW5Bcmd1bWVudCA9IHJlYWRBcmd1bWVudChcImluXCIsIHRydWUpO1xuXHRjb25zdCBvdXRBcmd1bWVudCA9IHJlYWRBcmd1bWVudChcIm91dFwiLCB0cnVlKTtcblx0Y29uc3QgbnNBcmd1bWVudCA9IHJlYWRBcmd1bWVudChcIm5hbWVzcGFjZVwiKTtcblx0Y29uc3QgZ2xvYmFsaXplID0gcmVhZEFyZ3VtZW50PGJvb2xlYW4+KFwiZ2xvYmFsaXplXCIpO1xuXHRjb25zdCBtb2RBcmd1bWVudCA9IHJlYWRBcmd1bWVudChcIm1vZHVsZVwiKTtcblx0Y29uc3QgaGVhZGVyQXJndW1lbnQgPSByZWFkQXJndW1lbnQoXCJoZWFkZXJcIik7XG5cdGNvbnN0IGZvb3RlckFyZ3VtZW50ID0gcmVhZEFyZ3VtZW50KFwiZm9vdGVyXCIpO1xuXHRcblx0Y29uc3Qgb3V0RmlsZXM6IHN0cmluZ1tdID0gQXJyYXkuaXNBcnJheShvdXRBcmd1bWVudCkgP1xuXHRcdG91dEFyZ3VtZW50IDogW291dEFyZ3VtZW50XTtcblx0XG5cdGNvbnN0IGhlYWRlckxpbmVzOiBzdHJpbmdbXSA9IEFycmF5LmlzQXJyYXkoaGVhZGVyQXJndW1lbnQpID8gXG5cdFx0aGVhZGVyQXJndW1lbnQgOiBbaGVhZGVyQXJndW1lbnRdO1xuXHRcblx0Y29uc3QgZm9vdGVyTGluZXM6IHN0cmluZ1tdID0gQXJyYXkuaXNBcnJheShmb290ZXJBcmd1bWVudCkgP1xuXHRcdGZvb3RlckFyZ3VtZW50IDogW2Zvb3RlckFyZ3VtZW50XTtcblx0XG5cdGNvbnN0IGhvbWVEZWZpbml0aW9uRmlsZSA9IGF3YWl0IERlZmluaXRpb25GaWxlLnJlYWQodHJhbnNsYXRlUGF0aChpbkFyZ3VtZW50KSk7XG5cdGlmICghaG9tZURlZmluaXRpb25GaWxlKVxuXHRcdHRocm93IFwiTm8gZGVmaW5pdGlvbiBmaWxlIGZvdW5kIGF0OiBcIiArIGluQXJndW1lbnQ7XG5cdFxuXHRhd2FpdCBob21lRGVmaW5pdGlvbkZpbGUucmVzb2x2ZSgpO1xuXHRcblx0Y29uc3QgZGVmaW5pdGlvbkxpbmVzID0gaG9tZURlZmluaXRpb25GaWxlLmVtaXQoXG5cdFx0bW9kQXJndW1lbnQsXG5cdFx0bnNBcmd1bWVudCxcblx0XHRnbG9iYWxpemUpO1xuXHRcblx0ZGVmaW5pdGlvbkxpbmVzLnVuc2hpZnQoLi4uaGVhZGVyTGluZXMpO1xuXHRkZWZpbml0aW9uTGluZXMucHVzaCguLi5mb290ZXJMaW5lcyk7XG5cdFxuXHRpZiAoZm9vdGVyTGluZXMubGVuZ3RoKVxuXHRcdGRlZmluaXRpb25MaW5lcy5wdXNoKFwiXCIpO1xuXHRcblx0Zm9yIChjb25zdCBvdXRGaWxlIG9mIG91dEZpbGVzKVxuXHR7XG5cdFx0RnMud3JpdGVGaWxlU3luYyhcblx0XHRcdHRyYW5zbGF0ZVBhdGgob3V0RmlsZSksIFxuXHRcdFx0ZGVmaW5pdGlvbkxpbmVzLmpvaW4oXCJcXG5cIiksIFxuXHRcdFx0XCJ1dGY4XCIpO1xuXHR9XG59XG5cbmlmIChydW5uaW5nQXNNb2R1bGUpXG5cdHR5cGVvZiBtb2R1bGUgPT09IFwib2JqZWN0XCIgJiYgKG1vZHVsZS5leHBvcnRzID0gYnVuZGxlKTtcbmVsc2Vcblx0YnVuZGxlKCk7XG4iXX0=