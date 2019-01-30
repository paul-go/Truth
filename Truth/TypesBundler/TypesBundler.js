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
        console.log(path);
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
    emit(namespace, moduleName) {
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
            lines.unshift(`declare namespace ${namespace} {`);
            emitLines();
            lines.push("}");
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
        }
        lines.push("");
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
const bundle = (options) => {
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
    const readArgument = (name, required = false) => {
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
    };
    (async () => {
        const inArgument = readArgument("in", true);
        const outArgument = readArgument("out", true);
        const nsArgument = readArgument("namespace");
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
        const definitionLines = homeDefinitionFile.emit(nsArgument, modArgument);
        definitionLines.unshift(...headerLines);
        definitionLines.push(...footerLines);
        if (footerLines.length)
            definitionLines.push("");
        for (const outFile of outFiles)
            Fs.writeFile(translatePath(outFile), definitionLines.join("\n"), "utf8", (error) => error && console.error(error));
    })().catch(reason => {
        console.error(reason);
    });
};
if (runningAsModule)
    typeof module === "object" && (module.exports = bundle);
else
    bundle();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVHlwZXNCdW5kbGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiVHlwZXNCdW5kbGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBTUEsTUFBTSxFQUFFLEdBQUcsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQ3pCLE1BQU0sSUFBSSxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQztBQU83QixNQUFNO0FBQ04sTUFBTSxjQUFjO0lBeUNuQixNQUFNO0lBQ04sWUFDUyxVQUFrQixFQUNsQixLQUE4QjtRQUQ5QixlQUFVLEdBQVYsVUFBVSxDQUFRO1FBQ2xCLFVBQUssR0FBTCxLQUFLLENBQXlCO0lBQ3JDLENBQUM7SUEzQ0gsTUFBTTtJQUNOLE1BQU0sQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLElBQVk7UUFFN0IsT0FBTyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUVsQixJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsRUFDM0I7WUFDQyxJQUFJLElBQUksQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUM7Z0JBQy9DLElBQUksR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBRTFCLElBQUksSUFBSSxPQUFPLENBQUM7U0FDaEI7UUFFRCxJQUFJLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUM7WUFDeEIsTUFBTSxJQUFJLEdBQUcsbUJBQW1CLENBQUM7UUFFbEMsTUFBTSxDQUFDLFlBQVksRUFBRSxLQUFLLENBQUMsR0FBRyxNQUFNLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUVuRCxJQUFJLEtBQUs7WUFDUixNQUFNLEtBQUssQ0FBQztRQUViLElBQUksWUFBWSxLQUFLLElBQUk7WUFDeEIsT0FBTyxJQUFJLENBQUM7UUFFYixNQUFNLFNBQVMsR0FBRyxZ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Q3hDLGVBQWUsQ0FBQyxJQUFJLENBQUMsR0FBRyxXQUFXLENBQUMsQ0FBQztRQUVyQyxJQUFJLFdBQVcsQ0FBQyxNQUFNO1lBQ3JCLGVBQWUsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7UUFFMUIsS0FBSyxNQUFNLE9BQU8sSUFBSSxRQUFRO1lBQzdCLEVBQUUsQ0FBQyxTQUFTLENBQ1gsYUFBYSxDQUFDLE9BQU8sQ0FBQyxFQUN0QixlQUFlLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUMxQixNQUFNLEVBQ04sQ0FBQyxLQUFZLEVBQUUsRUFBRSxDQUFDLEtBQUssSUFBSSxPQUFPLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7SUFFcEQsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLEVBQUU7UUFFbkIsT0FBTyxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUN2QixDQUFDLENBQUMsQ0FBQztBQUNKLENBQUMsQ0FBQTtBQUVELElBQUksZUFBZTtJQUNsQixPQUFPLE1BQU0sS0FBSyxRQUFRLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxHQUFHLE1BQU0sQ0FBQyxDQUFDOztJQUV4RCxNQUFNLEVBQUUsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIlxuXG4vLyBQb29yIG1hbnMgbm9kZSBkZWZpbml0aW9ucy5cbmRlY2xhcmUgY29uc3QgcHJvY2VzczogYW55O1xuZGVjbGFyZSBjb25zdCByZXF1aXJlOiAobW9kdWxlTmFtZTogc3RyaW5nKSA9PiBhbnk7XG5kZWNsYXJlIGNvbnN0IG1vZHVsZTogYW55O1xuY29uc3QgRnMgPSByZXF1aXJlKFwiZnNcIik7XG5jb25zdCBQYXRoID0gcmVxdWlyZShcInBhdGhcIik7XG5cblxuLyoqICovXG5pbnRlcmZhY2UgTGluZUFycmF5IGV4dGVuZHMgQXJyYXk8TGluZSB8IExpbmVBcnJheT4geyB9XG5cblxuLyoqICovXG5jbGFzcyBEZWZpbml0aW9uRmlsZVxue1xuXHQvKiogKi9cblx0c3RhdGljIGFzeW5jIHJlYWQocGF0aDogc3RyaW5nKVxuXHR7XG5cdFx0Y29uc29sZS5sb2cocGF0aCk7XG5cdFx0XG5cdFx0aWYgKCFwYXRoLmVuZHNXaXRoKFwiLmQudHNcIikpXG5cdFx0e1xuXHRcdFx0aWYgKHBhdGguZW5kc1dpdGgoXCIuanNcIikgfHwgcGF0aC5lbmRzV2l0aChcIi50c1wiKSlcblx0XHRcdFx0cGF0aCA9IHBhdGguc2xpY2UoMCwgLTMpO1xuXHRcdFx0XG5cdFx0XHRwYXRoICs9IFwiLmQudHNcIjtcblx0XHR9XG5cdFx0XG5cdFx0aWYgKCFwYXRoLnN0YXJ0c1dpdGgoXCIvXCIpKVxuXHRcdFx0dGhyb3cgcGF0aCArIFwiIGlzIG5vdCBhYnNvbHV0ZS5cIjtcblx0XHRcblx0XHRjb25zdCBbZmlsZUNvbnRlbnRzLCBlcnJvcl0gPSBhd2FpdCByZWFkRmlsZShwYXRoKTtcblx0XHRcblx0XHRpZiAoZXJyb3IpXG5cdFx0XHR0aHJvdyBlcnJvcjtcblx0XHRcblx0XHRpZiAoZmlsZUNvbnRlbnRzID09PSBudWxsKVxuXHRcdFx0cmV0dXJuIG51bGw7XG5cdFx0XG5cdFx0Y29uc3QgdGV4dExpbmVzID0gZmlsZUNvbnRlbnRzXG5cdFx0XHQuc3BsaXQoLyhcXHIpP1xcbi9nKVxuXHRcdFx0LmZpbHRlcihzID0+ICEhcyAmJiAhIXMudHJpbSgpKTtcblx0XHRcblx0XHRjb25zdCBwYXJzZWRMaW5lczogTGluZVtdID0gW107XG5cdFx0XG5cdFx0Zm9yIChjb25zdCB0ZXh0TGluZSBvZiB0ZXh0TGluZXMpXG5cdFx0e1xuXHRcdFx0Y29uc3QgcGFyc2VkTGluZSA9IExpbmUucGFyc2UodGV4dExpbmUpO1xuXHRcdFx0cGFyc2VkTGluZXMucHVzaChwYXJzZWRMaW5lKTtcblx0XHR9XG5cdFx0XG5cdFx0cmV0dXJuIG5ldyBEZWZpbml0aW9uRmlsZShwYXRoLCBwYXJzZWRMaW5lcyk7XG5cdH1cblx0XG5cdC8qKiAqL1xuXHRwcml2YXRlIGNvbnN0cnVjdG9yKFxuXHRcdHByaXZhdGUgb3JpZ2luUGF0aDogc3RyaW5nLFxuXHRcdHByaXZhdGUgbGluZXM6IChMaW5lfERlZmluaXRpb25GaWxlKVtdKVxuXHR7IH1cblx0XG5cdC8qKlxuXHQgKiBHb2VzIHRocm91Z2ggdGhlIGVudGlyZSBsaW5lcyBwcm9wZXJ0eSBhbmQgcmVwbGFjZXNcblx0ICogYWxsIHJlLWV4cG9ydCBzdGF0ZW1lbnRzIGludG8gRGVmaW5pdGlvbkZpbGUgb2JqZWN0cy5cblx0ICovXG5cdGFzeW5jIHJlc29sdmUoKVxuXHR7XG5cdFx0Zm9yIChsZXQgaSA9IC0xOyArK2kgPCB0aGlzLmxpbmVzLmxlbmd0aDspXG5cdFx0e1xuXHRcdFx0Y29uc3QgY3VycmVudExpbmUgPSB0aGlzLmxpbmVzW2ldO1xuXHRcdFx0XG5cdFx0XHRpZiAoY3VycmVudExpbmUgaW5zdGFuY2VvZiBMaW5lcy5SZUV4cG9ydExpbmUpXG5cdFx0XHR7XG5cdFx0XHRcdGNvbnN0IG9yaWdpblBhdGhQYXJzZWQgPSBQYXRoLnBhcnNlKHRoaXMub3JpZ2luUGF0aCk7XG5cdFx0XHRcdGNvbnN0IHRhcmdldFBhdGhQYXJzZWQgPSBQYXRoLnBhcnNlKGN1cnJlbnRMaW5lLnBhdGgpO1xuXHRcdFx0XHRjb25zdCByZXNvbHZlZFBhdGggPSBQYXRoLnJlc29sdmUob3JpZ2luUGF0aFBhcnNlZC5kaXIsIGN1cnJlbnRMaW5lLnBhdGgpO1xuXHRcdFx0XHRjb25zdCBuZXN0ZWREZWZpbml0aW9uRmlsZSA9IGF3YWl0IERlZmluaXRpb25GaWxlLnJlYWQocmVzb2x2ZWRQYXRoKTtcblx0XHRcdFx0XG5cdFx0XHRcdGlmIChuZXN0ZWREZWZpbml0aW9uRmlsZSlcblx0XHRcdFx0e1xuXHRcdFx0XHRcdGF3YWl0IG5lc3RlZERlZmluaXRpb25GaWxlLnJlc29sdmUoKTtcblx0XHRcdFx0XHR0aGlzLmxpbmVzW2ldID0gbmVzdGVkRGVmaW5pdGlvbkZpbGU7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cdH1cblx0XG5cdC8qKiAqL1xuXHRlbWl0KG5hbWVzcGFjZT86IHN0cmluZywgbW9kdWxlTmFtZT86IHN0cmluZylcblx0e1xuXHRcdGNvbnN0IGxpbmVPYmplY3RzID0gdGhpcy5jb2xsZWN0TGluZXMoKTtcblx0XHRcblx0XHRmdW5jdGlvbiogZWFjaElkZW50aWZpZXJMaW5lKClcblx0XHR7XG5cdFx0XHRmb3IgKGNvbnN0IGxpbmVPYmplY3Qgb2YgbGluZU9iamVjdHMpXG5cdFx0XHRcdGlmIChsaW5lT2JqZWN0IGluc3RhbmNlb2YgSWRlbnRpZmllckxpbmUpXG5cdFx0XHRcdFx0eWllbGQgbGluZU9iamVjdDtcblx0XHR9XG5cdFx0XG5cdFx0Y29uc3QgZW1pdExpbmVzID0gKGluZGVudCA9IHRydWUpID0+XG5cdFx0e1xuXHRcdFx0Zm9yIChjb25zdCBsaW5lT2JqZWN0IG9mIGxpbmVPYmplY3RzKVxuXHRcdFx0e1xuXHRcdFx0XHRjb25zdCBlbWl0dGVkID0gbGluZU9iamVjdC5lbWl0KCk7XG5cdFx0XHRcdGlmIChlbWl0dGVkICE9PSBudWxsKVxuXHRcdFx0XHRcdGxpbmVzLnB1c2goKGluZGVudCA/IFwiXFx0XCIgOiBcIlwiKSArIGVtaXR0ZWQpO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRcblx0XHRjb25zdCBsaW5lczogc3RyaW5nW10gPSBbXTtcblx0XHRcblx0XHRpZiAobmFtZXNwYWNlKVxuXHRcdHtcblx0XHRcdGxpbmVzLnB1c2goXCJcIik7XG5cdFx0XHRsaW5lcy51bnNoaWZ0KGBkZWNsYXJlIG5hbWVzcGFjZSAke25hbWVzcGFjZX0ge2ApO1xuXHRcdFx0XG5cdFx0XHRlbWl0TGluZXMoKTtcblx0XHRcdFxuXHRcdFx0bGluZXMucHVzaChcIn1cIik7XG5cdFx0XHRsaW5lcy5wdXNoKFwiXCIpO1xuXHRcdH1cblx0XHRcblx0XHRpZiAobW9kdWxlTmFtZSlcblx0XHR7XG5cdFx0XHRsaW5lcy5wdXNoKGBkZWNsYXJlIG1vZHVsZSBcIiR7bW9kdWxlTmFtZX1cIiB7YCk7XG5cdFx0XHRcblx0XHRcdGVtaXRMaW5lcygpO1xuXHRcdFx0XG5cdFx0XHRsaW5lcy5wdXNoKGB9YCk7XG5cdFx0XHRsaW5lcy5wdXNoKFwiXCIpO1xuXHRcdH1cblx0XHRcblx0XHRpZiAoIW5hbWVzcGFjZSAmJiAhbW9kdWxlTmFtZSlcblx0XHR7XG5cdFx0XHRlbWl0TGluZXMoZmFsc2UpO1xuXHRcdH1cblx0XHRcblx0XHRsaW5lcy5wdXNoKFwiXCIpO1xuXHRcdHJldHVybiBsaW5lcztcblx0fVxuXHRcblx0LyoqICovXG5cdHByaXZhdGUgY29sbGVjdExpbmVzKClcblx0e1xuXHRcdGNvbnN0IGxpbmVzOiBMaW5lW10gPSBbXTtcblx0XHRcblx0XHRmb3IgKGNvbnN0IGl0ZW0gb2YgdGhpcy5saW5lcylcblx0XHR7XG5cdFx0XHRpZiAoaXRlbSBpbnN0YW5jZW9mIExpbmUpXG5cdFx0XHRcdGxpbmVzLnB1c2goaXRlbSk7XG5cdFx0XHRcblx0XHRcdGVsc2UgaWYgKGl0ZW0gaW5zdGFuY2VvZiBEZWZpbml0aW9uRmlsZSlcblx0XHRcdFx0bGluZXMucHVzaCguLi5pdGVtLmNvbGxlY3RMaW5lcygpKTtcblx0XHR9XG5cdFx0XG5cdFx0cmV0dXJuIGxpbmVzO1xuXHR9XG59XG5cbi8qKiAqL1xuY2xhc3MgTGluZVxue1xuXHQvKipcblx0ICogRmFjdG9yeSBtZXRob2QgdGhhdCByZXR1cm5zIGEgbGluZSBmcm9tIHRoZSBzcGVjaWZpZWQgdGV4dC5cblx0ICovXG5cdHN0YXRpYyBwYXJzZSh0ZXh0OiBzdHJpbmcpXG5cdHtcblx0XHRjb25zdCB0ZXh0VHJpbW1lZCA9IHRleHQudHJpbSgpO1xuXHRcdFxuXHRcdGNvbnN0IGxpbmVDdG9yOiAodHlwZW9mIExpbmUpIHwgdW5kZWZpbmVkID0gTGluZXMuYWxsKCkuZmluZChjdG9yID0+XG5cdFx0XHRjdG9yICYmIFxuXHRcdFx0Y3Rvci5wYXR0ZXJuICYmXG5cdFx0XHRjdG9yLnBhdHRlcm4gaW5zdGFuY2VvZiBSZWdFeHAgJiYgXG5cdFx0XHRjdG9yLnBhdHRlcm4udGVzdCh0ZXh0VHJpbW1lZCkpO1xuXHRcdFxuXHRcdGlmICghbGluZUN0b3IpXG5cdFx0XHR0aHJvdyBcIkludGVybmFsIGVycm9yXCI7XG5cdFx0XG5cdFx0Y29uc3QgbGluZTogTGluZSA9IG5ldyBsaW5lQ3Rvcih0ZXh0KTtcblx0XHRjb25zdCBtYXRjaE9iamVjdCA9IDxSZWdFeHBFeGVjQXJyYXkgJiB7IGdyb3Vwczogb2JqZWN0IH0+bGluZUN0b3IucGF0dGVybi5leGVjKHRleHRUcmltbWVkKTtcblx0XHRcblx0XHRpZiAobWF0Y2hPYmplY3QgJiYgbWF0Y2hPYmplY3QuZ3JvdXBzKVxuXHRcdFx0Zm9yIChjb25zdCBrZXkgb2YgT2JqZWN0LmtleXMobWF0Y2hPYmplY3QuZ3JvdXBzKSlcblx0XHRcdFx0a2V5IGluIGxpbmUgP1xuXHRcdFx0XHRcdGxpbmVba2V5XSA9IG1hdGNoT2JqZWN0Lmdyb3Vwc1trZXldIDpcblx0XHRcdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkobGluZSwga2V5LCB7IHZhbHVlOiBtYXRjaE9iamVjdC5ncm91cHNba2V5XSB9KTtcblx0XHRcblx0XHRyZXR1cm4gbGluZTtcblx0fVxuXHRcblx0LyoqICovXG5cdHByb3RlY3RlZCBjb25zdHJ1Y3Rvcih0ZXh0OiBzdHJpbmcpXG5cdHtcblx0XHR0aGlzLmxlYWRpbmdTcGFjZXMgPSB0ZXh0Lmxlbmd0aCAtIHRleHQucmVwbGFjZSgvXlxccysvLCBcIlwiKS5sZW5ndGg7XG5cdFx0dGhpcy50ZXh0ID0gdGV4dC50cmltKCk7XG5cdH1cblx0XG5cdC8qKiAqL1xuXHRyZWFkb25seSB0ZXh0OiBzdHJpbmc7XG5cdFxuXHQvKiogKi9cblx0cmVhZG9ubHkgbGVhZGluZ1NwYWNlczogbnVtYmVyO1xuXHRcblx0LyoqICovXG5cdGdldCBpbmRlbnREZXB0aCgpIHsgcmV0dXJuICh0aGlzLmxlYWRpbmdTcGFjZXMgLyA0KSB8IDA7IH1cblx0XG5cdC8qKiAqL1xuXHRzdGF0aWMgZ2V0IHBhdHRlcm4oKSB7IHJldHVybiAvLi87IH1cblx0XG5cdC8qKiAqL1xuXHRlbWl0KClcblx0e1xuXHRcdGlmICh0aGlzIGluc3RhbmNlb2YgTGluZXMuRW1wdHlFeHBvcnRMaW5lKVxuXHRcdFx0cmV0dXJuIG51bGw7XG5cdFx0XG5cdFx0aWYgKHRoaXMgaW5zdGFuY2VvZiBMaW5lcy5JbXBvcnRMaW5lKVxuXHRcdFx0aWYgKHRoaXMuYXMgPT09IFwiWFwiKVxuXHRcdFx0XHRyZXR1cm4gbnVsbDtcblx0XHRcblx0XHRjb25zdCBwYXJ0cyA9IFtcIlxcdFwiLnJlcGVhdCh0aGlzLmluZGVudERlcHRoKV07XG5cdFx0XG5cdFx0aWYgKHRoaXMgaW5zdGFuY2VvZiBMaW5lcy5Eb2NDb21tZW50TGluZU1pZGRsZSlcblx0XHRcdHBhcnRzLnB1c2goXCIgXCIpO1xuXHRcdFxuXHRcdHBhcnRzLnB1c2godGhpcy50ZXh0XG5cdFx0XHQvLyBSZW1vdmUgdGhlIFguIHJlZmVyZW5jZXNcblx0XHRcdC5yZXBsYWNlKC88WFxcLig/PVxcdykvZywgXCI8XCIpXG5cdFx0XHQucmVwbGFjZSgvXFwoWFxcLig/PVxcdykvZywgXCIoXCIpXG5cdFx0XHQucmVwbGFjZSgvIFhcXC4oPz1cXHcpL2csIFwiIFwiKVxuXHRcdFx0Ly8gUmVtb3ZlIGRlY2xhcmUga2V5d29yZCBvbiBub24tZXhwb3J0ZWQgbWVtYmVyXG5cdFx0XHQucmVwbGFjZSgvXmRlY2xhcmUgKD89YWJzdHJhY3R8Y2xhc3N8bmFtZXNwYWNlfGZ1bmN0aW9ufGVudW18dHlwZXxjb25zdHxsZXR8dmFyKS9nLCBcIlwiKVxuXHRcdFx0Ly8gUmVtb3ZlIGRlY2xhcmUga2V5d29yZCBvbiBleHBvcnRlZCBtZW1iZXJcblx0XHRcdC5yZXBsYWNlKC9eZXhwb3J0IGRlY2xhcmUgKD89YWJzdHJhY3R8Y2xhc3N8bmFtZXNwYWNlfGZ1bmN0aW9ufGVudW18dHlwZXxjb25zdHxsZXR8dmFyKS9nLCBcImV4cG9ydCBcIikpO1xuXHRcdFxuXHRcdC8vIEFwcGVuZCBhIHNwYWNlIGFmdGVyIHRoZSAqIHRvIGZpeCBlZGl0b3IgY29sb3Jpbmdcblx0XHRpZiAodGhpcyBpbnN0YW5jZW9mIExpbmVzLkRvY0NvbW1lbnRMaW5lTWlkZGxlICYmIHRoaXMudGV4dCA9PT0gXCIqXCIpXG5cdFx0XHRwYXJ0cy5wdXNoKFwiIFwiKTtcblx0XHRcblx0XHRyZXR1cm4gcGFydHMuam9pbihcIlwiKTtcblx0fVxufVxuXG5cbi8qKiAqL1xuZXhwb3J0IGludGVyZmFjZSBJZGVudGlmaWVyRGVjbGFyYXRpb25MaW5lXG57XG5cdGlkZW50aWZpZXI6IHN0cmluZztcbn1cblxuXG4vKiogKi9cbmFic3RyYWN0IGNsYXNzIElkZW50aWZpZXJMaW5lIGV4dGVuZHMgTGluZVxue1xuXHRyZWFkb25seSBpZGVudGlmaWVyOiBzdHJpbmcgPSBcIlwiO1xufVxuXG5cbm5hbWVzcGFjZSBMaW5lc1xue1xuXHQvKiogKi9cblx0ZXhwb3J0IGZ1bmN0aW9uIGFsbCgpOiAodHlwZW9mIExpbmUpW11cblx0e1xuXHRcdHJldHVybiBPYmplY3Qua2V5cyhMaW5lcykubWFwKChjdG9yTmFtZTogc3RyaW5nKSA9PiBMaW5lc1tjdG9yTmFtZV0pO1xuXHR9XG5cdFxuXHQvKiogKi9cblx0ZXhwb3J0IGNsYXNzIEltcG9ydExpbmUgZXh0ZW5kcyBMaW5lXG5cdHtcblx0XHRzdGF0aWMgZ2V0IHBhdHRlcm4oKSB7IHJldHVybiAvXmltcG9ydCBcXCogYXMgKD88YXM+XFx3KykgZnJvbSAoJ3xcIikoPzxwYXRoPltcXC5cXC9cXHdcXGRdKykoJ3xcIik7JC87IH1cblx0XHRcblx0XHRyZWFkb25seSBhczogc3RyaW5nID0gXCJcIjtcblx0XHRcblx0XHRyZWFkb25seSBwYXRoOiBzdHJpbmcgPSBcIlwiO1xuXHR9XG5cblx0LyoqICovXG5cdGV4cG9ydCBjbGFzcyBSZUV4cG9ydExpbmUgZXh0ZW5kcyBMaW5lXG5cdHtcblx0XHRzdGF0aWMgZ2V0IHBhdHRlcm4oKSB7IHJldHVybiAvXmV4cG9ydCBcXCogZnJvbSAoJ3xcIikoPzxwYXRoPltcXC5cXC9cXHdcXGRdKykoJ3xcIik7JC87IH1cblx0XHRcblx0XHRyZWFkb25seSBwYXRoOiBzdHJpbmcgPSBcIlwiO1xuXHR9XG5cblx0LyoqICovXG5cdGV4cG9ydCBjbGFzcyBEb2NDb21tZW50TGluZVNpbmdsZSBleHRlbmRzIExpbmVcblx0e1xuXHRcdHN0YXRpYyBnZXQgcGF0dGVybigpIHsgcmV0dXJuIC9eXFwvXFwqXFwqLipcXCpcXC8kLzsgfVxuXHR9XG5cblx0LyoqICovXG5cdGV4cG9ydCBjbGFzcyBEb2NDb21tZW50TGluZUJlZ2luIGV4dGVuZHMgTGluZVxuXHR7XG5cdFx0c3RhdGljIGdldCBwYXR0ZXJuKCkgeyByZXR1cm4gL15cXC9cXCpcXCokLzsgfVxuXHR9XG5cblx0LyoqICovXG5cdGV4cG9ydCBjbGFzcyBEb2NDb21tZW50TGluZU1pZGRsZSBleHRlbmRzIExpbmVcblx0e1xuXHRcdHN0YXRpYyBnZXQgcGF0dGVybigpIHsgcmV0dXJuIC9eXFwqLiokLzsgfVxuXHR9XG5cdFxuXHQvKiogKi9cblx0ZXhwb3J0IGNsYXNzIERvY0NvbW1lbnRMaW5lRW5kIGV4dGVuZHMgTGluZVxuXHR7XG5cdFx0c3RhdGljIGdldCBwYXR0ZXJuKCkgeyByZXR1cm4gL14uK1xcKlxcLyQvOyB9XG5cdH1cblx0XG5cdC8qKiAqL1xuXHRleHBvcnQgY2xhc3MgRW1wdHlFeHBvcnRMaW5lIGV4dGVuZHMgTGluZVxuXHR7XG5cdFx0c3RhdGljIGdldCBwYXR0ZXJuKCkgeyByZXR1cm4gL15leHBvcnRcXHMqe1xccyp9OyQvOyB9XG5cdH1cblx0XG5cdC8qKiAqL1xuXHRleHBvcnQgY2xhc3MgQ2xhc3NEZWNsYXJhdGlvbkxpbmUgZXh0ZW5kcyBJZGVudGlmaWVyTGluZVxuXHR7XG5cdFx0c3RhdGljIGdldCBwYXR0ZXJuKCkgeyByZXR1cm4gL14oZXhwb3J0ICk/ZGVjbGFyZShhYnN0cmFjdCApPyBjbGFzcyAoPzxpZGVudGlmaWVyPltcXHddKykoIChleHRlbmRzfGltcGxlbWVudHMpIFtcXHdcXC4sXSspPyB7JC87IH1cblx0fVxuXG5cdC8qKiAqL1xuXHRleHBvcnQgY2xhc3MgSW50ZXJmYWNlRGVjbGFyYXRpb25MaW5lIGV4dGVuZHMgSWRlbnRpZmllckxpbmVcblx0e1xuXHRcdHN0YXRpYyBnZXQgcGF0dGVybigpIHsgcmV0dXJuIC9eKGV4cG9ydCApP2ludGVyZmFjZSAoPzxpZGVudGlmaWVyPltcXHddKykoXFxzZXh0ZW5kcyBbXFx3LFxcc10rKT8geyQvOyB9XG5cdH1cblx0XG5cdC8qKiAqL1xuXHRleHBvcnQgY2xhc3MgRW51bURlY2xhcmF0aW9uTGluZSBleHRlbmRzIElkZW50aWZpZXJMaW5lXG5cdHtcblx0XHRzdGF0aWMgZ2V0IHBhdHRlcm4oKSB7IHJldHVybiAvXihleHBvcnQgKT9kZWNsYXJlKCBjb25zdCk/IGVudW0gKD88aWRlbnRpZmllcj5cXHcrKSB7JC87IH1cblx0fVxuXG5cdC8qKiAqL1xuXHRleHBvcnQgY2xhc3MgTmFtZXNwYWNlRGVjbGFyYXRpb25MaW5lIGV4dGVuZHMgSWRlbnRpZmllckxpbmVcblx0e1xuXHRcdHN0YXRpYyBnZXQgcGF0dGVybigpIHsgcmV0dXJuIC9eKGV4cG9ydCApP2RlY2xhcmUgbmFtZXNwYWNlICg/PGlkZW50aWZpZXI+XFx3KykgeyQvOyB9XG5cdH1cblx0XG5cdC8qKiAqL1xuXHRleHBvcnQgY2xhc3MgVHlwZURlY2xhcmF0aW9uTGluZSBleHRlbmRzIElkZW50aWZpZXJMaW5lXG5cdHtcblx0XHRzdGF0aWMgZ2V0IHBhdHRlcm4oKSB7IHJldHVybiAvXihleHBvcnQgKT9kZWNsYXJlIHR5cGUgKD88aWRlbnRpZmllcj5cXHcrKSQvOyB9XG5cdH1cblx0XG5cdC8qKiAqL1xuXHRleHBvcnQgY2xhc3MgQ29uc3REZWNsYXJhdGlvbkxpbmUgZXh0ZW5kcyBJZGVudGlmaWVyTGluZVxuXHR7XG5cdFx0c3RhdGljIGdldCBwYXR0ZXJuKCkgeyByZXR1cm4gL14oZXhwb3J0ICk/ZGVjbGFyZSBjb25zdCAoPzxpZGVudGlmaWVyPlxcdyspLiokLzsgfVxuXHR9XG5cdFxuXHQvKiogKi9cblx0ZXhwb3J0IGNsYXNzIE90aGVyTGluZSBleHRlbmRzIExpbmVcblx0e1xuXHRcdHN0YXRpYyBnZXQgcGF0dGVybigpIHsgcmV0dXJuIC8uKi87IH1cblx0fVxufVxuXG5cbi8qKiAqL1xuY29uc3QgcmVhZEZpbGUgPSAocGF0aDogc3RyaW5nLCBvcHRzID0gXCJ1dGY4XCIpID0+XG5cdG5ldyBQcm9taXNlPFtzdHJpbmcsIEVycm9yIHwgbnVsbF0+KChyZXNvbHZlLCByZWopID0+XG5cdHtcblx0XHRGcy5yZWFkRmlsZShwYXRoLCBvcHRzLCAoZXJyb3I6IEVycm9yLCBkYXRhOiBzdHJpbmcpID0+XG5cdFx0e1xuXHRcdFx0aWYgKGVycm9yKVxuXHRcdFx0XHRyZXNvbHZlKFtcIlwiLCBlcnJvcl0pO1xuXHRcdFx0ZWxzZVxuXHRcdFx0XHRyZXNvbHZlKFtkYXRhLCBudWxsXSk7XG5cdFx0fSk7XG5cdH0pO1xuXG5cbmludGVyZmFjZSBJQnVuZGxlT3B0aW9uc1xue1xuXHRpbjogc3RyaW5nO1xuXHRvdXQ6IHN0cmluZ3xzdHJpbmdbXTtcblx0bmFtZXNwYWNlOiBzdHJpbmc7XG5cdG1vZHVsZTogc3RyaW5nO1xuXHRoZWFkZXI6IHN0cmluZ3xzdHJpbmdbXTtcblx0Zm9vdGVyOiBzdHJpbmd8c3RyaW5nW107XG59XG5cblxuLyoqIFdoZXRoZXIgdGhlIGNvZGUgaXMgcnVubmluZyBhcyBhIHJlcXVpcmUgbW9kdWxlLCBvciBmcm9tIHRoZSBjb21tYW5kIGxpbmUuICovXG5jb25zdCBydW5uaW5nQXNNb2R1bGUgPSAhIW1vZHVsZS5wYXJlbnQ7XG5cblxuY29uc3QgYnVuZGxlID0gKG9wdGlvbnM/OiBJQnVuZGxlT3B0aW9ucykgPT5cbntcblx0LyoqIFN0b3JlcyB0aGUgZGlyZWN0b3J5IGNvbnRhaW5pbmcgdGhlIGVudHJ5IHBvaW50IHNjcmlwdC4gKi9cblx0Y29uc3Qgc2NyaXB0RGlyZWN0b3J5ID0gKCgpID0+XG5cdHtcblx0XHRpZiAocnVubmluZ0FzTW9kdWxlKVxuXHRcdHtcblx0XHRcdGNvbnN0IGFyZ3M6IHN0cmluZ1tdID0gcHJvY2Vzcy5hcmd2O1xuXHRcdFx0XG5cdFx0XHRpZiAoYXJncy5sZW5ndGggPCAyKVxuXHRcdFx0XHR0aHJvdyBcIlVucGFyc2FibGUgY29tbWFuZCBsaW5lIGFyZ3VtZW50c1wiO1xuXHRcdFx0XG5cdFx0XHRjb25zdCBqc0ZpbGUgPSBhcmdzWzFdO1xuXHRcdFx0aWYgKCFqc0ZpbGUuZW5kc1dpdGgoXCIuanNcIikpXG5cdFx0XHRcdHRocm93IFwiU2Vjb25kIGFyZ3VtZW50IGV4cGVjdGVkIHRvIGJlIGEgZmlsZSB3aXRoIHRoZSAuanMgZXh0ZW5zaW9uLlwiO1xuXHRcdFx0XG5cdFx0XHRyZXR1cm4gUGF0aC5kaXJuYW1lKGpzRmlsZSk7XG5cdFx0fVxuXHRcdFxuXHRcdHJldHVybiBcIlwiO1xuXHR9KSgpO1xuXHRcblx0LyoqIFRyYW5zbGF0ZXMgdGhlIHNwZWNpZmllZCBwYXRoIHRvIGJlIHJlbGF0aXZlIHRvIHRoZSBlbnRyeSBwb2ludCBzY3JpcHQuICovXG5cdGNvbnN0IHRyYW5zbGF0ZVBhdGggPSAoaW5QYXRoOiBzdHJpbmcpID0+IHNjcmlwdERpcmVjdG9yeSA/XG5cdFx0UGF0aC5yZXNvbHZlKHNjcmlwdERpcmVjdG9yeSwgaW5QYXRoKSA6IFxuXHRcdFBhdGgucmVzb2x2ZShpblBhdGgpO1xuXHRcblx0LyoqIFJlYWRzIHRoZSBhcmd1bWVudCB3aXRoIHRoZSBzcGVjaWZpZWQgbmFtZSBmcm9tIHRoZSBwcm9jZXNzIGFyZ3VtZW50cy4gKi9cblx0Y29uc3QgcmVhZEFyZ3VtZW50ID0gKG5hbWU6IGtleW9mIElCdW5kbGVPcHRpb25zLCByZXF1aXJlZCA9IGZhbHNlKSA9PlxuXHR7XG5cdFx0aWYgKHJ1bm5pbmdBc01vZHVsZSlcblx0XHR7XG5cdFx0XHRpZiAoIW9wdGlvbnMgfHwgdHlwZW9mIG9wdGlvbnMgIT09IFwib2JqZWN0XCIpXG5cdFx0XHRcdHRocm93IGBPcHRpb25zIG9iamVjdCBtdXN0IGJlIHBhc3NlZCB0byB0aGlzIGZ1bmN0aW9uLmA7XG5cdFx0XHRcblx0XHRcdHJldHVybiA8c3RyaW5nPm9wdGlvbnNbbmFtZV07XG5cdFx0fVxuXHRcdGVsc2Vcblx0XHR7XG5cdFx0XHRjb25zdCBwcm9jZXNzQXJnczogc3RyaW5nW10gPSBwcm9jZXNzLmFyZ3Y7XG5cdFx0XHRjb25zdCBwcmVmaXggPSBgLS0ke25hbWV9PWA7XG5cdFx0XHRjb25zdCBmdWxsQXJndW1lbnRUZXh0ID0gcHJvY2Vzc0FyZ3MuZmluZChhcmcgPT4gYXJnLnN0YXJ0c1dpdGgocHJlZml4KSk7XG5cdFx0XHRcblx0XHRcdGlmIChmdWxsQXJndW1lbnRUZXh0KVxuXHRcdFx0e1xuXHRcdFx0XHRjb25zdCBvdXRWYWx1ZSA9IGZ1bGxBcmd1bWVudFRleHQuc2xpY2UocHJlZml4Lmxlbmd0aCkudHJpbSgpO1xuXHRcdFx0XHRpZiAob3V0VmFsdWUpXG5cdFx0XHRcdFx0cmV0dXJuIG91dFZhbHVlO1xuXHRcdFx0XHRcblx0XHRcdFx0dGhyb3cgYEFyZ3VtZW50ICR7cHJlZml4fSBjYW5ub3QgYmUgZW1wdHlgO1xuXHRcdFx0fVxuXHRcdFx0ZWxzZSBpZiAocmVxdWlyZWQpXG5cdFx0XHR7XG5cdFx0XHRcdHRocm93IGBNaXNzaW5nIHJlcXVpcmVkIGFyZ3VtZW50ICR7cHJlZml4fSkuYDtcblx0XHRcdH1cblx0XHR9XG5cdH1cblx0XG5cdChhc3luYyAoKSA9PlxuXHR7XG5cdFx0Y29uc3QgaW5Bcmd1bWVudCA9IHJlYWRBcmd1bWVudChcImluXCIsIHRydWUpO1xuXHRcdGNvbnN0IG91dEFyZ3VtZW50ID0gcmVhZEFyZ3VtZW50KFwib3V0XCIsIHRydWUpO1xuXHRcdGNvbnN0IG5zQXJndW1lbnQgPSByZWFkQXJndW1lbnQoXCJuYW1lc3BhY2VcIik7XG5cdFx0Y29uc3QgbW9kQXJndW1lbnQgPSByZWFkQXJndW1lbnQoXCJtb2R1bGVcIik7XG5cdFx0Y29uc3QgaGVhZGVyQXJndW1lbnQgPSByZWFkQXJndW1lbnQoXCJoZWFkZXJcIik7XG5cdFx0Y29uc3QgZm9vdGVyQXJndW1lbnQgPSByZWFkQXJndW1lbnQoXCJmb290ZXJcIik7XG5cdFx0XG5cdFx0Y29uc3Qgb3V0RmlsZXM6IHN0cmluZ1tdID0gQXJyYXkuaXNBcnJheShvdXRBcmd1bWVudCkgP1xuXHRcdFx0b3V0QXJndW1lbnQgOiBbb3V0QXJndW1lbnRdO1xuXHRcdFxuXHRcdGNvbnN0IGhlYWRlckxpbmVzOiBzdHJpbmdbXSA9IEFycmF5LmlzQXJyYXkoaGVhZGVyQXJndW1lbnQpID8gXG5cdFx0XHRoZWFkZXJBcmd1bWVudCA6IFtoZWFkZXJBcmd1bWVudF07XG5cdFx0XG5cdFx0Y29uc3QgZm9vdGVyTGluZXM6IHN0cmluZ1tdID0gQXJyYXkuaXNBcnJheShmb290ZXJBcmd1bWVudCkgP1xuXHRcdFx0Zm9vdGVyQXJndW1lbnQgOiBbZm9vdGVyQXJndW1lbnRdO1xuXHRcdFxuXHRcdGNvbnN0IGhvbWVEZWZpbml0aW9uRmlsZSA9IGF3YWl0IERlZmluaXRpb25GaWxlLnJlYWQodHJhbnNsYXRlUGF0aChpbkFyZ3VtZW50KSk7XG5cdFx0aWYgKCFob21lRGVmaW5pdGlvbkZpbGUpXG5cdFx0XHR0aHJvdyBcIk5vIGRlZmluaXRpb24gZmlsZSBmb3VuZCBhdDogXCIgKyBpbkFyZ3VtZW50O1xuXHRcdFxuXHRcdGF3YWl0IGhvbWVEZWZpbml0aW9uRmlsZS5yZXNvbHZlKCk7XG5cdFx0XG5cdFx0Y29uc3QgZGVmaW5pdGlvbkxpbmVzID0gaG9tZURlZmluaXRpb25GaWxlLmVtaXQobnNBcmd1bWVudCwgbW9kQXJndW1lbnQpO1xuXHRcdGRlZmluaXRpb25MaW5lcy51bnNoaWZ0KC4uLmhlYWRlckxpbmVzKTtcblx0XHRkZWZpbml0aW9uTGluZXMucHVzaCguLi5mb290ZXJMaW5lcyk7XG5cdFx0XG5cdFx0aWYgKGZvb3RlckxpbmVzLmxlbmd0aClcblx0XHRcdGRlZmluaXRpb25MaW5lcy5wdXNoKFwiXCIpO1xuXHRcdFxuXHRcdGZvciAoY29uc3Qgb3V0RmlsZSBvZiBvdXRGaWxlcylcblx0XHRcdEZzLndyaXRlRmlsZShcblx0XHRcdFx0dHJhbnNsYXRlUGF0aChvdXRGaWxlKSwgXG5cdFx0XHRcdGRlZmluaXRpb25MaW5lcy5qb2luKFwiXFxuXCIpLCBcblx0XHRcdFx0XCJ1dGY4XCIsIFxuXHRcdFx0XHQoZXJyb3I6IEVycm9yKSA9PiBlcnJvciAmJiBjb25zb2xlLmVycm9yKGVycm9yKSk7XG5cdFxuXHR9KSgpLmNhdGNoKHJlYXNvbiA9PlxuXHR7XG5cdFx0Y29uc29sZS5lcnJvcihyZWFzb24pO1xuXHR9KTtcbn1cblxuaWYgKHJ1bm5pbmdBc01vZHVsZSlcblx0dHlwZW9mIG1vZHVsZSA9PT0gXCJvYmplY3RcIiAmJiAobW9kdWxlLmV4cG9ydHMgPSBidW5kbGUpO1xuZWxzZVxuXHRidW5kbGUoKTtcbiJdfQ==