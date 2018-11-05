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
            const ctorName = parsedLine.constructor.name;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVHlwZXNCdW5kbGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiVHlwZXNCdW5kbGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBTUEsTUFBTSxFQUFFLEdBQUcsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQ3pCLE1BQU0sSUFBSSxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQztBQU83QixNQUFNO0FBQ04sTUFBTSxjQUFjO0lBMENuQixNQUFNO0lBQ04sWUFDUyxVQUFrQixFQUNsQixLQUE4QjtRQUQ5QixlQUFVLEdBQVYsVUFBVSxDQUFRO1FBQ2xCLFVBQUssR0FBTCxLQUFLLENBQXlCO0lBQ3JDLENBQUM7SUE1Q0gsTUFBTTtJQUNOLE1BQU0sQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLElBQVk7UUFFN0IsT0FBTyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUVsQixJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsRUFDM0I7WUFDQyxJQUFJLElBQUksQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUM7Z0JBQy9DLElBQUksR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBRTFCLElBQUksSUFBSSxPQUFPLENBQUM7U0FDaEI7UUFFRCxJQUFJLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUM7WUFDeEIsTUFBTSxJQUFJLEdBQUcsbUJBQW1CLENBQUM7UUFFbEMsTUFBTSxDQUFDLFlBQVksRUFBRSxLQUFLLENBQUMsR0FBRyxNQUFNLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUVuRCxJQUFJLEtBQUs7WUFDUixNQUFNLEtBQUssQ0FBQztRQUViLElBQUksWUFBWSxLQUFLLElBQUk7WUFDeEIsT0FBTyxJQUFJLENBQUM7UUFFYixNQUFNLFNBQVMsR0FBRyxZ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QVcsQ0FBQyxDQUFDO1FBQ3hDLGVBQWUsQ0FBQyxJQUFJLENBQUMsR0FBRyxXQUFXLENBQUMsQ0FBQztRQUVyQyxJQUFJLFdBQVcsQ0FBQyxNQUFNO1lBQ3JCLGVBQWUsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7UUFFMUIsS0FBSyxNQUFNLE9BQU8sSUFBSSxRQUFRO1lBQzdCLEVBQUUsQ0FBQyxTQUFTLENBQ1gsYUFBYSxDQUFDLE9BQU8sQ0FBQyxFQUN0QixlQUFlLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUMxQixNQUFNLEVBQ04sQ0FBQyxLQUFZLEVBQUUsRUFBRSxDQUFDLEtBQUssSUFBSSxPQUFPLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7SUFFcEQsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLEVBQUU7UUFFbkIsT0FBTyxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUN2QixDQUFDLENBQUMsQ0FBQztBQUNKLENBQUMsQ0FBQTtBQUVELElBQUksZUFBZTtJQUNsQixPQUFPLE1BQU0sS0FBSyxRQUFRLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxHQUFHLE1BQU0sQ0FBQyxDQUFDOztJQUV4RCxNQUFNLEVBQUUsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIlxuXG4vLyBQb29yIG1hbnMgbm9kZSBkZWZpbml0aW9ucy5cbmRlY2xhcmUgY29uc3QgcHJvY2VzczogYW55O1xuZGVjbGFyZSBjb25zdCByZXF1aXJlOiAobW9kdWxlTmFtZTogc3RyaW5nKSA9PiBhbnk7XG5kZWNsYXJlIGNvbnN0IG1vZHVsZTogYW55O1xuY29uc3QgRnMgPSByZXF1aXJlKFwiZnNcIik7XG5jb25zdCBQYXRoID0gcmVxdWlyZShcInBhdGhcIik7XG5cblxuLyoqICovXG5pbnRlcmZhY2UgTGluZUFycmF5IGV4dGVuZHMgQXJyYXk8TGluZSB8IExpbmVBcnJheT4geyB9XG5cblxuLyoqICovXG5jbGFzcyBEZWZpbml0aW9uRmlsZVxue1xuXHQvKiogKi9cblx0c3RhdGljIGFzeW5jIHJlYWQocGF0aDogc3RyaW5nKVxuXHR7XG5cdFx0Y29uc29sZS5sb2cocGF0aCk7XG5cdFx0XG5cdFx0aWYgKCFwYXRoLmVuZHNXaXRoKFwiLmQudHNcIikpXG5cdFx0e1xuXHRcdFx0aWYgKHBhdGguZW5kc1dpdGgoXCIuanNcIikgfHwgcGF0aC5lbmRzV2l0aChcIi50c1wiKSlcblx0XHRcdFx0cGF0aCA9IHBhdGguc2xpY2UoMCwgLTMpO1xuXHRcdFx0XG5cdFx0XHRwYXRoICs9IFwiLmQudHNcIjtcblx0XHR9XG5cdFx0XG5cdFx0aWYgKCFwYXRoLnN0YXJ0c1dpdGgoXCIvXCIpKVxuXHRcdFx0dGhyb3cgcGF0aCArIFwiIGlzIG5vdCBhYnNvbHV0ZS5cIjtcblx0XHRcblx0XHRjb25zdCBbZmlsZUNvbnRlbnRzLCBlcnJvcl0gPSBhd2FpdCByZWFkRmlsZShwYXRoKTtcblx0XHRcblx0XHRpZiAoZXJyb3IpXG5cdFx0XHR0aHJvdyBlcnJvcjtcblx0XHRcblx0XHRpZiAoZmlsZUNvbnRlbnRzID09PSBudWxsKVxuXHRcdFx0cmV0dXJuIG51bGw7XG5cdFx0XG5cdFx0Y29uc3QgdGV4dExpbmVzID0gZmlsZUNvbnRlbnRzXG5cdFx0XHQuc3BsaXQoLyhcXHIpP1xcbi9nKVxuXHRcdFx0LmZpbHRlcihzID0+ICEhcyAmJiAhIXMudHJpbSgpKTtcblx0XHRcblx0XHRjb25zdCBwYXJzZWRMaW5lczogTGluZVtdID0gW107XG5cdFx0XG5cdFx0Zm9yIChjb25zdCB0ZXh0TGluZSBvZiB0ZXh0TGluZXMpXG5cdFx0e1xuXHRcdFx0Y29uc3QgcGFyc2VkTGluZSA9IExpbmUucGFyc2UodGV4dExpbmUpO1xuXHRcdFx0Y29uc3QgY3Rvck5hbWUgPSBwYXJzZWRMaW5lLmNvbnN0cnVjdG9yLm5hbWU7XG5cdFx0XHRwYXJzZWRMaW5lcy5wdXNoKHBhcnNlZExpbmUpO1xuXHRcdH1cblx0XHRcblx0XHRyZXR1cm4gbmV3IERlZmluaXRpb25GaWxlKHBhdGgsIHBhcnNlZExpbmVzKTtcblx0fVxuXHRcblx0LyoqICovXG5cdHByaXZhdGUgY29uc3RydWN0b3IoXG5cdFx0cHJpdmF0ZSBvcmlnaW5QYXRoOiBzdHJpbmcsXG5cdFx0cHJpdmF0ZSBsaW5lczogKExpbmV8RGVmaW5pdGlvbkZpbGUpW10pXG5cdHsgfVxuXHRcblx0LyoqXG5cdCAqIEdvZXMgdGhyb3VnaCB0aGUgZW50aXJlIGxpbmVzIHByb3BlcnR5IGFuZCByZXBsYWNlc1xuXHQgKiBhbGwgcmUtZXhwb3J0IHN0YXRlbWVudHMgaW50byBEZWZpbml0aW9uRmlsZSBvYmplY3RzLlxuXHQgKi9cblx0YXN5bmMgcmVzb2x2ZSgpXG5cdHtcblx0XHRmb3IgKGxldCBpID0gLTE7ICsraSA8IHRoaXMubGluZXMubGVuZ3RoOylcblx0XHR7XG5cdFx0XHRjb25zdCBjdXJyZW50TGluZSA9IHRoaXMubGluZXNbaV07XG5cdFx0XHRcblx0XHRcdGlmIChjdXJyZW50TGluZSBpbnN0YW5jZW9mIExpbmVzLlJlRXhwb3J0TGluZSlcblx0XHRcdHtcblx0XHRcdFx0Y29uc3Qgb3JpZ2luUGF0aFBhcnNlZCA9IFBhdGgucGFyc2UodGhpcy5vcmlnaW5QYXRoKTtcblx0XHRcdFx0Y29uc3QgdGFyZ2V0UGF0aFBhcnNlZCA9IFBhdGgucGFyc2UoY3VycmVudExpbmUucGF0aCk7XG5cdFx0XHRcdGNvbnN0IHJlc29sdmVkUGF0aCA9IFBhdGgucmVzb2x2ZShvcmlnaW5QYXRoUGFyc2VkLmRpciwgY3VycmVudExpbmUucGF0aCk7XG5cdFx0XHRcdGNvbnN0IG5lc3RlZERlZmluaXRpb25GaWxlID0gYXdhaXQgRGVmaW5pdGlvbkZpbGUucmVhZChyZXNvbHZlZFBhdGgpO1xuXHRcdFx0XHRcblx0XHRcdFx0aWYgKG5lc3RlZERlZmluaXRpb25GaWxlKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0YXdhaXQgbmVzdGVkRGVmaW5pdGlvbkZpbGUucmVzb2x2ZSgpO1xuXHRcdFx0XHRcdHRoaXMubGluZXNbaV0gPSBuZXN0ZWREZWZpbml0aW9uRmlsZTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblx0fVxuXHRcblx0LyoqICovXG5cdGVtaXQobmFtZXNwYWNlPzogc3RyaW5nLCBtb2R1bGVOYW1lPzogc3RyaW5nKVxuXHR7XG5cdFx0Y29uc3QgbGluZU9iamVjdHMgPSB0aGlzLmNvbGxlY3RMaW5lcygpO1xuXHRcdFxuXHRcdGZ1bmN0aW9uKiBlYWNoSWRlbnRpZmllckxpbmUoKVxuXHRcdHtcblx0XHRcdGZvciAoY29uc3QgbGluZU9iamVjdCBvZiBsaW5lT2JqZWN0cylcblx0XHRcdFx0aWYgKGxpbmVPYmplY3QgaW5zdGFuY2VvZiBJZGVudGlmaWVyTGluZSlcblx0XHRcdFx0XHR5aWVsZCBsaW5lT2JqZWN0O1xuXHRcdH1cblx0XHRcblx0XHRjb25zdCBlbWl0TGluZXMgPSAoaW5kZW50ID0gdHJ1ZSkgPT5cblx0XHR7XG5cdFx0XHRmb3IgKGNvbnN0IGxpbmVPYmplY3Qgb2YgbGluZU9iamVjdHMpXG5cdFx0XHR7XG5cdFx0XHRcdGNvbnN0IGVtaXR0ZWQgPSBsaW5lT2JqZWN0LmVtaXQoKTtcblx0XHRcdFx0aWYgKGVtaXR0ZWQgIT09IG51bGwpXG5cdFx0XHRcdFx0bGluZXMucHVzaCgoaW5kZW50ID8gXCJcXHRcIiA6IFwiXCIpICsgZW1pdHRlZCk7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdFxuXHRcdGNvbnN0IGxpbmVzOiBzdHJpbmdbXSA9IFtdO1xuXHRcdFxuXHRcdGlmIChuYW1lc3BhY2UpXG5cdFx0e1xuXHRcdFx0bGluZXMucHVzaChcIlwiKTtcblx0XHRcdGxpbmVzLnVuc2hpZnQoYGRlY2xhcmUgbmFtZXNwYWNlICR7bmFtZXNwYWNlfSB7YCk7XG5cdFx0XHRcblx0XHRcdGVtaXRMaW5lcygpO1xuXHRcdFx0XG5cdFx0XHRsaW5lcy5wdXNoKFwifVwiKTtcblx0XHRcdGxpbmVzLnB1c2goXCJcIik7XG5cdFx0fVxuXHRcdFxuXHRcdGlmIChtb2R1bGVOYW1lKVxuXHRcdHtcblx0XHRcdGxpbmVzLnB1c2goYGRlY2xhcmUgbW9kdWxlIFwiJHttb2R1bGVOYW1lfVwiIHtgKTtcblx0XHRcdFxuXHRcdFx0ZW1pdExpbmVzKCk7XG5cdFx0XHRcblx0XHRcdGxpbmVzLnB1c2goYH1gKTtcblx0XHRcdGxpbmVzLnB1c2goXCJcIik7XG5cdFx0fVxuXHRcdFxuXHRcdGlmICghbmFtZXNwYWNlICYmICFtb2R1bGVOYW1lKVxuXHRcdHtcblx0XHRcdGVtaXRMaW5lcyhmYWxzZSk7XG5cdFx0fVxuXHRcdFxuXHRcdGxpbmVzLnB1c2goXCJcIik7XG5cdFx0cmV0dXJuIGxpbmVzO1xuXHR9XG5cdFxuXHQvKiogKi9cblx0cHJpdmF0ZSBjb2xsZWN0TGluZXMoKVxuXHR7XG5cdFx0Y29uc3QgbGluZXM6IExpbmVbXSA9IFtdO1xuXHRcdFxuXHRcdGZvciAoY29uc3QgaXRlbSBvZiB0aGlzLmxpbmVzKVxuXHRcdHtcblx0XHRcdGlmIChpdGVtIGluc3RhbmNlb2YgTGluZSlcblx0XHRcdFx0bGluZXMucHVzaChpdGVtKTtcblx0XHRcdFxuXHRcdFx0ZWxzZSBpZiAoaXRlbSBpbnN0YW5jZW9mIERlZmluaXRpb25GaWxlKVxuXHRcdFx0XHRsaW5lcy5wdXNoKC4uLml0ZW0uY29sbGVjdExpbmVzKCkpO1xuXHRcdH1cblx0XHRcblx0XHRyZXR1cm4gbGluZXM7XG5cdH1cbn1cblxuLyoqICovXG5jbGFzcyBMaW5lXG57XG5cdC8qKlxuXHQgKiBGYWN0b3J5IG1ldGhvZCB0aGF0IHJldHVybnMgYSBsaW5lIGZyb20gdGhlIHNwZWNpZmllZCB0ZXh0LlxuXHQgKi9cblx0c3RhdGljIHBhcnNlKHRleHQ6IHN0cmluZylcblx0e1xuXHRcdGNvbnN0IHRleHRUcmltbWVkID0gdGV4dC50cmltKCk7XG5cdFx0XG5cdFx0Y29uc3QgbGluZUN0b3I6ICh0eXBlb2YgTGluZSkgfCB1bmRlZmluZWQgPSBMaW5lcy5hbGwoKS5maW5kKGN0b3IgPT5cblx0XHRcdGN0b3IgJiYgXG5cdFx0XHRjdG9yLnBhdHRlcm4gJiZcblx0XHRcdGN0b3IucGF0dGVybiBpbnN0YW5jZW9mIFJlZ0V4cCAmJiBcblx0XHRcdGN0b3IucGF0dGVybi50ZXN0KHRleHRUcmltbWVkKSk7XG5cdFx0XG5cdFx0aWYgKCFsaW5lQ3Rvcilcblx0XHRcdHRocm93IFwiSW50ZXJuYWwgZXJyb3JcIjtcblx0XHRcblx0XHRjb25zdCBsaW5lOiBMaW5lID0gbmV3IGxpbmVDdG9yKHRleHQpO1xuXHRcdGNvbnN0IG1hdGNoT2JqZWN0ID0gPFJlZ0V4cEV4ZWNBcnJheSAmIHsgZ3JvdXBzOiBvYmplY3QgfT5saW5lQ3Rvci5wYXR0ZXJuLmV4ZWModGV4dFRyaW1tZWQpO1xuXHRcdFxuXHRcdGlmIChtYXRjaE9iamVjdCAmJiBtYXRjaE9iamVjdC5ncm91cHMpXG5cdFx0XHRmb3IgKGNvbnN0IGtleSBvZiBPYmplY3Qua2V5cyhtYXRjaE9iamVjdC5ncm91cHMpKVxuXHRcdFx0XHRrZXkgaW4gbGluZSA/XG5cdFx0XHRcdFx0bGluZVtrZXldID0gbWF0Y2hPYmplY3QuZ3JvdXBzW2tleV0gOlxuXHRcdFx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShsaW5lLCBrZXksIHsgdmFsdWU6IG1hdGNoT2JqZWN0Lmdyb3Vwc1trZXldIH0pO1xuXHRcdFxuXHRcdHJldHVybiBsaW5lO1xuXHR9XG5cdFxuXHQvKiogKi9cblx0cHJvdGVjdGVkIGNvbnN0cnVjdG9yKHRleHQ6IHN0cmluZylcblx0e1xuXHRcdHRoaXMubGVhZGluZ1NwYWNlcyA9IHRleHQubGVuZ3RoIC0gdGV4dC5yZXBsYWNlKC9eXFxzKy8sIFwiXCIpLmxlbmd0aDtcblx0XHR0aGlzLnRleHQgPSB0ZXh0LnRyaW0oKTtcblx0fVxuXHRcblx0LyoqICovXG5cdHJlYWRvbmx5IHRleHQ6IHN0cmluZztcblx0XG5cdC8qKiAqL1xuXHRyZWFkb25seSBsZWFkaW5nU3BhY2VzOiBudW1iZXI7XG5cdFxuXHQvKiogKi9cblx0Z2V0IGluZGVudERlcHRoKCkgeyByZXR1cm4gKHRoaXMubGVhZGluZ1NwYWNlcyAvIDQpIHwgMDsgfVxuXHRcblx0LyoqICovXG5cdHN0YXRpYyBnZXQgcGF0dGVybigpIHsgcmV0dXJuIC8uLzsgfVxuXHRcblx0LyoqICovXG5cdGVtaXQoKVxuXHR7XG5cdFx0aWYgKHRoaXMgaW5zdGFuY2VvZiBMaW5lcy5FbXB0eUV4cG9ydExpbmUpXG5cdFx0XHRyZXR1cm4gbnVsbDtcblx0XHRcblx0XHRpZiAodGhpcyBpbnN0YW5jZW9mIExpbmVzLkltcG9ydExpbmUpXG5cdFx0XHRpZiAodGhpcy5hcyA9PT0gXCJYXCIpXG5cdFx0XHRcdHJldHVybiBudWxsO1xuXHRcdFxuXHRcdGNvbnN0IHBhcnRzID0gW1wiXFx0XCIucmVwZWF0KHRoaXMuaW5kZW50RGVwdGgpXTtcblx0XHRcblx0XHRpZiAodGhpcyBpbnN0YW5jZW9mIExpbmVzLkRvY0NvbW1lbnRMaW5lTWlkZGxlKVxuXHRcdFx0cGFydHMucHVzaChcIiBcIik7XG5cdFx0XG5cdFx0cGFydHMucHVzaCh0aGlzLnRleHRcblx0XHRcdC8vIFJlbW92ZSB0aGUgWC4gcmVmZXJlbmNlc1xuXHRcdFx0LnJlcGxhY2UoLzxYXFwuKD89XFx3KS9nLCBcIjxcIilcblx0XHRcdC5yZXBsYWNlKC8gWFxcLig/PVxcdykvZywgXCIgXCIpXG5cdFx0XHQvLyBSZW1vdmUgZGVjbGFyZSBrZXl3b3JkIG9uIG5vbi1leHBvcnRlZCBtZW1iZXJcblx0XHRcdC5yZXBsYWNlKC9eZGVjbGFyZSAoPz1hYnN0cmFjdHxjbGFzc3xuYW1lc3BhY2V8ZnVuY3Rpb258ZW51bXx0eXBlfGNvbnN0fGxldHx2YXIpL2csIFwiXCIpXG5cdFx0XHQvLyBSZW1vdmUgZGVjbGFyZSBrZXl3b3JkIG9uIGV4cG9ydGVkIG1lbWJlclxuXHRcdFx0LnJlcGxhY2UoL15leHBvcnQgZGVjbGFyZSAoPz1hYnN0cmFjdHxjbGFzc3xuYW1lc3BhY2V8ZnVuY3Rpb258ZW51bXx0eXBlfGNvbnN0fGxldHx2YXIpL2csIFwiZXhwb3J0IFwiKSk7XG5cdFx0XG5cdFx0Ly8gQXBwZW5kIGEgc3BhY2UgYWZ0ZXIgdGhlICogdG8gZml4IGVkaXRvciBjb2xvcmluZ1xuXHRcdGlmICh0aGlzIGluc3RhbmNlb2YgTGluZXMuRG9jQ29tbWVudExpbmVNaWRkbGUgJiYgdGhpcy50ZXh0ID09PSBcIipcIilcblx0XHRcdHBhcnRzLnB1c2goXCIgXCIpO1xuXHRcdFxuXHRcdHJldHVybiBwYXJ0cy5qb2luKFwiXCIpO1xuXHR9XG59XG5cblxuLyoqICovXG5leHBvcnQgaW50ZXJmYWNlIElkZW50aWZpZXJEZWNsYXJhdGlvbkxpbmVcbntcblx0aWRlbnRpZmllcjogc3RyaW5nO1xufVxuXG5cbi8qKiAqL1xuYWJzdHJhY3QgY2xhc3MgSWRlbnRpZmllckxpbmUgZXh0ZW5kcyBMaW5lXG57XG5cdHJlYWRvbmx5IGlkZW50aWZpZXI6IHN0cmluZyA9IFwiXCI7XG59XG5cblxubmFtZXNwYWNlIExpbmVzXG57XG5cdC8qKiAqL1xuXHRleHBvcnQgZnVuY3Rpb24gYWxsKCk6ICh0eXBlb2YgTGluZSlbXVxuXHR7XG5cdFx0cmV0dXJuIE9iamVjdC5rZXlzKExpbmVzKS5tYXAoKGN0b3JOYW1lOiBzdHJpbmcpID0+IExpbmVzW2N0b3JOYW1lXSk7XG5cdH1cblx0XG5cdC8qKiAqL1xuXHRleHBvcnQgY2xhc3MgSW1wb3J0TGluZSBleHRlbmRzIExpbmVcblx0e1xuXHRcdHN0YXRpYyBnZXQgcGF0dGVybigpIHsgcmV0dXJuIC9eaW1wb3J0IFxcKiBhcyAoPzxhcz5cXHcrKSBmcm9tICgnfFwiKSg/PHBhdGg+W1xcLlxcL1xcd1xcZF0rKSgnfFwiKTskLzsgfVxuXHRcdFxuXHRcdHJlYWRvbmx5IGFzOiBzdHJpbmcgPSBcIlwiO1xuXHRcdFxuXHRcdHJlYWRvbmx5IHBhdGg6IHN0cmluZyA9IFwiXCI7XG5cdH1cblxuXHQvKiogKi9cblx0ZXhwb3J0IGNsYXNzIFJlRXhwb3J0TGluZSBleHRlbmRzIExpbmVcblx0e1xuXHRcdHN0YXRpYyBnZXQgcGF0dGVybigpIHsgcmV0dXJuIC9eZXhwb3J0IFxcKiBmcm9tICgnfFwiKSg/PHBhdGg+W1xcLlxcL1xcd1xcZF0rKSgnfFwiKTskLzsgfVxuXHRcdFxuXHRcdHJlYWRvbmx5IHBhdGg6IHN0cmluZyA9IFwiXCI7XG5cdH1cblxuXHQvKiogKi9cblx0ZXhwb3J0IGNsYXNzIERvY0NvbW1lbnRMaW5lU2luZ2xlIGV4dGVuZHMgTGluZVxuXHR7XG5cdFx0c3RhdGljIGdldCBwYXR0ZXJuKCkgeyByZXR1cm4gL15cXC9cXCpcXCouKlxcKlxcLyQvOyB9XG5cdH1cblxuXHQvKiogKi9cblx0ZXhwb3J0IGNsYXNzIERvY0NvbW1lbnRMaW5lQmVnaW4gZXh0ZW5kcyBMaW5lXG5cdHtcblx0XHRzdGF0aWMgZ2V0IHBhdHRlcm4oKSB7IHJldHVybiAvXlxcL1xcKlxcKiQvOyB9XG5cdH1cblxuXHQvKiogKi9cblx0ZXhwb3J0IGNsYXNzIERvY0NvbW1lbnRMaW5lTWlkZGxlIGV4dGVuZHMgTGluZVxuXHR7XG5cdFx0c3RhdGljIGdldCBwYXR0ZXJuKCkgeyByZXR1cm4gL15cXCouKiQvOyB9XG5cdH1cblx0XG5cdC8qKiAqL1xuXHRleHBvcnQgY2xhc3MgRG9jQ29tbWVudExpbmVFbmQgZXh0ZW5kcyBMaW5lXG5cdHtcblx0XHRzdGF0aWMgZ2V0IHBhdHRlcm4oKSB7IHJldHVybiAvXi4rXFwqXFwvJC87IH1cblx0fVxuXHRcblx0LyoqICovXG5cdGV4cG9ydCBjbGFzcyBFbXB0eUV4cG9ydExpbmUgZXh0ZW5kcyBMaW5lXG5cdHtcblx0XHRzdGF0aWMgZ2V0IHBhdHRlcm4oKSB7IHJldHVybiAvXmV4cG9ydFxccyp7XFxzKn07JC87IH1cblx0fVxuXHRcblx0LyoqICovXG5cdGV4cG9ydCBjbGFzcyBDbGFzc0RlY2xhcmF0aW9uTGluZSBleHRlbmRzIElkZW50aWZpZXJMaW5lXG5cdHtcblx0XHRzdGF0aWMgZ2V0IHBhdHRlcm4oKSB7IHJldHVybiAvXihleHBvcnQgKT9kZWNsYXJlKGFic3RyYWN0ICk/IGNsYXNzICg/PGlkZW50aWZpZXI+W1xcd10rKSggKGV4dGVuZHN8aW1wbGVtZW50cykgW1xcd1xcLixdKyk/IHskLzsgfVxuXHR9XG5cblx0LyoqICovXG5cdGV4cG9ydCBjbGFzcyBJbnRlcmZhY2VEZWNsYXJhdGlvbkxpbmUgZXh0ZW5kcyBJZGVudGlmaWVyTGluZVxuXHR7XG5cdFx0c3RhdGljIGdldCBwYXR0ZXJuKCkgeyByZXR1cm4gL14oZXhwb3J0ICk/aW50ZXJmYWNlICg/PGlkZW50aWZpZXI+W1xcd10rKShcXHNleHRlbmRzIFtcXHcsXFxzXSspPyB7JC87IH1cblx0fVxuXHRcblx0LyoqICovXG5cdGV4cG9ydCBjbGFzcyBFbnVtRGVjbGFyYXRpb25MaW5lIGV4dGVuZHMgSWRlbnRpZmllckxpbmVcblx0e1xuXHRcdHN0YXRpYyBnZXQgcGF0dGVybigpIHsgcmV0dXJuIC9eKGV4cG9ydCApP2RlY2xhcmUoIGNvbnN0KT8gZW51bSAoPzxpZGVudGlmaWVyPlxcdyspIHskLzsgfVxuXHR9XG5cblx0LyoqICovXG5cdGV4cG9ydCBjbGFzcyBOYW1lc3BhY2VEZWNsYXJhdGlvbkxpbmUgZXh0ZW5kcyBJZGVudGlmaWVyTGluZVxuXHR7XG5cdFx0c3RhdGljIGdldCBwYXR0ZXJuKCkgeyByZXR1cm4gL14oZXhwb3J0ICk/ZGVjbGFyZSBuYW1lc3BhY2UgKD88aWRlbnRpZmllcj5cXHcrKSB7JC87IH1cblx0fVxuXHRcblx0LyoqICovXG5cdGV4cG9ydCBjbGFzcyBUeXBlRGVjbGFyYXRpb25MaW5lIGV4dGVuZHMgSWRlbnRpZmllckxpbmVcblx0e1xuXHRcdHN0YXRpYyBnZXQgcGF0dGVybigpIHsgcmV0dXJuIC9eKGV4cG9ydCApP2RlY2xhcmUgdHlwZSAoPzxpZGVudGlmaWVyPlxcdyspJC87IH1cblx0fVxuXHRcblx0LyoqICovXG5cdGV4cG9ydCBjbGFzcyBDb25zdERlY2xhcmF0aW9uTGluZSBleHRlbmRzIElkZW50aWZpZXJMaW5lXG5cdHtcblx0XHRzdGF0aWMgZ2V0IHBhdHRlcm4oKSB7IHJldHVybiAvXihleHBvcnQgKT9kZWNsYXJlIGNvbnN0ICg/PGlkZW50aWZpZXI+XFx3KykuKiQvOyB9XG5cdH1cblx0XG5cdC8qKiAqL1xuXHRleHBvcnQgY2xhc3MgT3RoZXJMaW5lIGV4dGVuZHMgTGluZVxuXHR7XG5cdFx0c3RhdGljIGdldCBwYXR0ZXJuKCkgeyByZXR1cm4gLy4qLzsgfVxuXHR9XG59XG5cblxuLyoqICovXG5jb25zdCByZWFkRmlsZSA9IChwYXRoOiBzdHJpbmcsIG9wdHMgPSBcInV0ZjhcIikgPT5cblx0bmV3IFByb21pc2U8W3N0cmluZywgRXJyb3IgfCBudWxsXT4oKHJlc29sdmUsIHJlaikgPT5cblx0e1xuXHRcdEZzLnJlYWRGaWxlKHBhdGgsIG9wdHMsIChlcnJvcjogRXJyb3IsIGRhdGE6IHN0cmluZykgPT5cblx0XHR7XG5cdFx0XHRpZiAoZXJyb3IpXG5cdFx0XHRcdHJlc29sdmUoW1wiXCIsIGVycm9yXSk7XG5cdFx0XHRlbHNlXG5cdFx0XHRcdHJlc29sdmUoW2RhdGEsIG51bGxdKTtcblx0XHR9KTtcblx0fSk7XG5cblxuaW50ZXJmYWNlIElCdW5kbGVPcHRpb25zXG57XG5cdGluOiBzdHJpbmc7XG5cdG91dDogc3RyaW5nfHN0cmluZ1tdO1xuXHRuYW1lc3BhY2U6IHN0cmluZztcblx0bW9kdWxlOiBzdHJpbmc7XG5cdGhlYWRlcjogc3RyaW5nfHN0cmluZ1tdO1xuXHRmb290ZXI6IHN0cmluZ3xzdHJpbmdbXTtcbn1cblxuXG4vKiogV2hldGhlciB0aGUgY29kZSBpcyBydW5uaW5nIGFzIGEgcmVxdWlyZSBtb2R1bGUsIG9yIGZyb20gdGhlIGNvbW1hbmQgbGluZS4gKi9cbmNvbnN0IHJ1bm5pbmdBc01vZHVsZSA9ICEhbW9kdWxlLnBhcmVudDtcblxuXG5jb25zdCBidW5kbGUgPSAob3B0aW9ucz86IElCdW5kbGVPcHRpb25zKSA9Plxue1xuXHQvKiogU3RvcmVzIHRoZSBkaXJlY3RvcnkgY29udGFpbmluZyB0aGUgZW50cnkgcG9pbnQgc2NyaXB0LiAqL1xuXHRjb25zdCBzY3JpcHREaXJlY3RvcnkgPSAoKCkgPT5cblx0e1xuXHRcdGlmIChydW5uaW5nQXNNb2R1bGUpXG5cdFx0e1xuXHRcdFx0Y29uc3QgYXJnczogc3RyaW5nW10gPSBwcm9jZXNzLmFyZ3Y7XG5cdFx0XHRcblx0XHRcdGlmIChhcmdzLmxlbmd0aCA8IDIpXG5cdFx0XHRcdHRocm93IFwiVW5wYXJzYWJsZSBjb21tYW5kIGxpbmUgYXJndW1lbnRzXCI7XG5cdFx0XHRcblx0XHRcdGNvbnN0IGpzRmlsZSA9IGFyZ3NbMV07XG5cdFx0XHRpZiAoIWpzRmlsZS5lbmRzV2l0aChcIi5qc1wiKSlcblx0XHRcdFx0dGhyb3cgXCJTZWNvbmQgYXJndW1lbnQgZXhwZWN0ZWQgdG8gYmUgYSBmaWxlIHdpdGggdGhlIC5qcyBleHRlbnNpb24uXCI7XG5cdFx0XHRcblx0XHRcdHJldHVybiBQYXRoLmRpcm5hbWUoanNGaWxlKTtcblx0XHR9XG5cdFx0XG5cdFx0cmV0dXJuIFwiXCI7XG5cdH0pKCk7XG5cdFxuXHQvKiogVHJhbnNsYXRlcyB0aGUgc3BlY2lmaWVkIHBhdGggdG8gYmUgcmVsYXRpdmUgdG8gdGhlIGVudHJ5IHBvaW50IHNjcmlwdC4gKi9cblx0Y29uc3QgdHJhbnNsYXRlUGF0aCA9IChpblBhdGg6IHN0cmluZykgPT4gc2NyaXB0RGlyZWN0b3J5ID9cblx0XHRQYXRoLnJlc29sdmUoc2NyaXB0RGlyZWN0b3J5LCBpblBhdGgpIDogXG5cdFx0UGF0aC5yZXNvbHZlKGluUGF0aCk7XG5cdFxuXHQvKiogUmVhZHMgdGhlIGFyZ3VtZW50IHdpdGggdGhlIHNwZWNpZmllZCBuYW1lIGZyb20gdGhlIHByb2Nlc3MgYXJndW1lbnRzLiAqL1xuXHRjb25zdCByZWFkQXJndW1lbnQgPSAobmFtZToga2V5b2YgSUJ1bmRsZU9wdGlvbnMsIHJlcXVpcmVkID0gZmFsc2UpID0+XG5cdHtcblx0XHRpZiAocnVubmluZ0FzTW9kdWxlKVxuXHRcdHtcblx0XHRcdGlmICghb3B0aW9ucyB8fCB0eXBlb2Ygb3B0aW9ucyAhPT0gXCJvYmplY3RcIilcblx0XHRcdFx0dGhyb3cgYE9wdGlvbnMgb2JqZWN0IG11c3QgYmUgcGFzc2VkIHRvIHRoaXMgZnVuY3Rpb24uYDtcblx0XHRcdFxuXHRcdFx0cmV0dXJuIDxzdHJpbmc+b3B0aW9uc1tuYW1lXTtcblx0XHR9XG5cdFx0ZWxzZVxuXHRcdHtcblx0XHRcdGNvbnN0IHByb2Nlc3NBcmdzOiBzdHJpbmdbXSA9IHByb2Nlc3MuYXJndjtcblx0XHRcdGNvbnN0IHByZWZpeCA9IGAtLSR7bmFtZX09YDtcblx0XHRcdGNvbnN0IGZ1bGxBcmd1bWVudFRleHQgPSBwcm9jZXNzQXJncy5maW5kKGFyZyA9PiBhcmcuc3RhcnRzV2l0aChwcmVmaXgpKTtcblx0XHRcdFxuXHRcdFx0aWYgKGZ1bGxBcmd1bWVudFRleHQpXG5cdFx0XHR7XG5cdFx0XHRcdGNvbnN0IG91dFZhbHVlID0gZnVsbEFyZ3VtZW50VGV4dC5zbGljZShwcmVmaXgubGVuZ3RoKS50cmltKCk7XG5cdFx0XHRcdGlmIChvdXRWYWx1ZSlcblx0XHRcdFx0XHRyZXR1cm4gb3V0VmFsdWU7XG5cdFx0XHRcdFxuXHRcdFx0XHR0aHJvdyBgQXJndW1lbnQgJHtwcmVmaXh9IGNhbm5vdCBiZSBlbXB0eWA7XG5cdFx0XHR9XG5cdFx0XHRlbHNlIGlmIChyZXF1aXJlZClcblx0XHRcdHtcblx0XHRcdFx0dGhyb3cgYE1pc3NpbmcgcmVxdWlyZWQgYXJndW1lbnQgJHtwcmVmaXh9KS5gO1xuXHRcdFx0fVxuXHRcdH1cblx0fVxuXHRcblx0KGFzeW5jICgpID0+XG5cdHtcblx0XHRjb25zdCBpbkFyZ3VtZW50ID0gcmVhZEFyZ3VtZW50KFwiaW5cIiwgdHJ1ZSk7XG5cdFx0Y29uc3Qgb3V0QXJndW1lbnQgPSByZWFkQXJndW1lbnQoXCJvdXRcIiwgdHJ1ZSk7XG5cdFx0Y29uc3QgbnNBcmd1bWVudCA9IHJlYWRBcmd1bWVudChcIm5hbWVzcGFjZVwiKTtcblx0XHRjb25zdCBtb2RBcmd1bWVudCA9IHJlYWRBcmd1bWVudChcIm1vZHVsZVwiKTtcblx0XHRjb25zdCBoZWFkZXJBcmd1bWVudCA9IHJlYWRBcmd1bWVudChcImhlYWRlclwiKTtcblx0XHRjb25zdCBmb290ZXJBcmd1bWVudCA9IHJlYWRBcmd1bWVudChcImZvb3RlclwiKTtcblx0XHRcblx0XHRjb25zdCBvdXRGaWxlczogc3RyaW5nW10gPSBBcnJheS5pc0FycmF5KG91dEFyZ3VtZW50KSA/XG5cdFx0XHRvdXRBcmd1bWVudCA6IFtvdXRBcmd1bWVudF07XG5cdFx0XG5cdFx0Y29uc3QgaGVhZGVyTGluZXM6IHN0cmluZ1tdID0gQXJyYXkuaXNBcnJheShoZWFkZXJBcmd1bWVudCkgPyBcblx0XHRcdGhlYWRlckFyZ3VtZW50IDogW2hlYWRlckFyZ3VtZW50XTtcblx0XHRcblx0XHRjb25zdCBmb290ZXJMaW5lczogc3RyaW5nW10gPSBBcnJheS5pc0FycmF5KGZvb3RlckFyZ3VtZW50KSA/XG5cdFx0XHRmb290ZXJBcmd1bWVudCA6IFtmb290ZXJBcmd1bWVudF07XG5cdFx0XG5cdFx0Y29uc3QgaG9tZURlZmluaXRpb25GaWxlID0gYXdhaXQgRGVmaW5pdGlvbkZpbGUucmVhZCh0cmFuc2xhdGVQYXRoKGluQXJndW1lbnQpKTtcblx0XHRpZiAoIWhvbWVEZWZpbml0aW9uRmlsZSlcblx0XHRcdHRocm93IFwiTm8gZGVmaW5pdGlvbiBmaWxlIGZvdW5kIGF0OiBcIiArIGluQXJndW1lbnQ7XG5cdFx0XG5cdFx0YXdhaXQgaG9tZURlZmluaXRpb25GaWxlLnJlc29sdmUoKTtcblx0XHRcblx0XHRjb25zdCBkZWZpbml0aW9uTGluZXMgPSBob21lRGVmaW5pdGlvbkZpbGUuZW1pdChuc0FyZ3VtZW50LCBtb2RBcmd1bWVudCk7XG5cdFx0ZGVmaW5pdGlvbkxpbmVzLnVuc2hpZnQoLi4uaGVhZGVyTGluZXMpO1xuXHRcdGRlZmluaXRpb25MaW5lcy5wdXNoKC4uLmZvb3RlckxpbmVzKTtcblx0XHRcblx0XHRpZiAoZm9vdGVyTGluZXMubGVuZ3RoKVxuXHRcdFx0ZGVmaW5pdGlvbkxpbmVzLnB1c2goXCJcIik7XG5cdFx0XG5cdFx0Zm9yIChjb25zdCBvdXRGaWxlIG9mIG91dEZpbGVzKVxuXHRcdFx0RnMud3JpdGVGaWxlKFxuXHRcdFx0XHR0cmFuc2xhdGVQYXRoKG91dEZpbGUpLCBcblx0XHRcdFx0ZGVmaW5pdGlvbkxpbmVzLmpvaW4oXCJcXG5cIiksIFxuXHRcdFx0XHRcInV0ZjhcIiwgXG5cdFx0XHRcdChlcnJvcjogRXJyb3IpID0+IGVycm9yICYmIGNvbnNvbGUuZXJyb3IoZXJyb3IpKTtcblx0XG5cdH0pKCkuY2F0Y2gocmVhc29uID0+XG5cdHtcblx0XHRjb25zb2xlLmVycm9yKHJlYXNvbik7XG5cdH0pO1xufVxuXG5pZiAocnVubmluZ0FzTW9kdWxlKVxuXHR0eXBlb2YgbW9kdWxlID09PSBcIm9iamVjdFwiICYmIChtb2R1bGUuZXhwb3J0cyA9IGJ1bmRsZSk7XG5lbHNlXG5cdGJ1bmRsZSgpO1xuIl19