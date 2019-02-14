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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVHlwZXNCdW5kbGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiVHlwZXNCdW5kbGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBTUEsTUFBTSxFQUFFLEdBQUcsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQ3pCLE1BQU0sSUFBSSxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQztBQU83QixNQUFNO0FBQ04sTUFBTSxjQUFjO0lBdUNuQixNQUFNO0lBQ04sWUFDUyxVQUFrQixFQUNsQixLQUE4QjtRQUQ5QixlQUFVLEdBQVYsVUFBVSxDQUFRO1FBQ2xCLFVBQUssR0FBTCxLQUFLLENBQXlCO0lBQ3JDLENBQUM7SUF6Q0gsTUFBTTtJQUNOLE1BQU0sQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLElBQVk7UUFFN0IsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLEVBQzNCO1lBQ0MsSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxJQUFJLElBQUksQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDO2dCQUMvQyxJQUFJLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUUxQixJQUFJLElBQUksT0FBTyxDQUFDO1NBQ2hCO1FBRUQsSUFBSSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDO1lBQ3hCLE1BQU0sSUFBSSxHQUFHLG1CQUFtQixDQUFDO1FBRWxDLE1BQU0sQ0FBQyxZQUFZLEVBQUUsS0FBSyxDQUFDLEdBQUcsTUFBTSxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUM7UUFFbkQsSUFBSSxLQUFLO1lBQ1IsTUFBTSxLQUFLLENBQUM7UUFFYixJQUFJLFlBQVksS0FBSyxJQUFJO1lBQ3hCLE9BQU8sSUFBSSxDQUFDO1FBRWIsTUFBTSxTQUFTLEdBQUcsWUFBWTthQUM1QixLQUFLLENBQUMsVUFBVSxDQUFDO2FBQ2pCLE1BQU0s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QUM7UUFFckMsSUFBSSxXQUFXLENBQUMsTUFBTTtZQUNyQixlQUFlLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBRTFCLEtBQUssTUFBTSxPQUFPLElBQUksUUFBUTtZQUM3QixFQUFFLENBQUMsU0FBUyxDQUNYLGFBQWEsQ0FBQyxPQUFPLENBQUMsRUFDdEIsZUFBZSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsRUFDMUIsTUFBTSxFQUNOLENBQUMsS0FBWSxFQUFFLEVBQUUsQ0FBQyxLQUFLLElBQUksT0FBTyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO0lBRXBELENBQUMsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxFQUFFO1FBRW5CLE9BQU8sQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUM7SUFDdkIsQ0FBQyxDQUFDLENBQUM7QUFDSixDQUFDLENBQUE7QUFFRCxJQUFJLGVBQWU7SUFDbEIsT0FBTyxNQUFNLEtBQUssUUFBUSxJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sR0FBRyxNQUFNLENBQUMsQ0FBQzs7SUFFeEQsTUFBTSxFQUFFLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJcblxuLy8gUG9vciBtYW5zIG5vZGUgZGVmaW5pdGlvbnMuXG5kZWNsYXJlIGNvbnN0IHByb2Nlc3M6IGFueTtcbmRlY2xhcmUgY29uc3QgcmVxdWlyZTogKG1vZHVsZU5hbWU6IHN0cmluZykgPT4gYW55O1xuZGVjbGFyZSBjb25zdCBtb2R1bGU6IGFueTtcbmNvbnN0IEZzID0gcmVxdWlyZShcImZzXCIpO1xuY29uc3QgUGF0aCA9IHJlcXVpcmUoXCJwYXRoXCIpO1xuXG5cbi8qKiAqL1xuaW50ZXJmYWNlIExpbmVBcnJheSBleHRlbmRzIEFycmF5PExpbmUgfCBMaW5lQXJyYXk+IHsgfVxuXG5cbi8qKiAqL1xuY2xhc3MgRGVmaW5pdGlvbkZpbGVcbntcblx0LyoqICovXG5cdHN0YXRpYyBhc3luYyByZWFkKHBhdGg6IHN0cmluZylcblx0e1xuXHRcdGlmICghcGF0aC5lbmRzV2l0aChcIi5kLnRzXCIpKVxuXHRcdHtcblx0XHRcdGlmIChwYXRoLmVuZHNXaXRoKFwiLmpzXCIpIHx8IHBhdGguZW5kc1dpdGgoXCIudHNcIikpXG5cdFx0XHRcdHBhdGggPSBwYXRoLnNsaWNlKDAsIC0zKTtcblx0XHRcdFxuXHRcdFx0cGF0aCArPSBcIi5kLnRzXCI7XG5cdFx0fVxuXHRcdFxuXHRcdGlmICghcGF0aC5zdGFydHNXaXRoKFwiL1wiKSlcblx0XHRcdHRocm93IHBhdGggKyBcIiBpcyBub3QgYWJzb2x1dGUuXCI7XG5cdFx0XG5cdFx0Y29uc3QgW2ZpbGVDb250ZW50cywgZXJyb3JdID0gYXdhaXQgcmVhZEZpbGUocGF0aCk7XG5cdFx0XG5cdFx0aWYgKGVycm9yKVxuXHRcdFx0dGhyb3cgZXJyb3I7XG5cdFx0XG5cdFx0aWYgKGZpbGVDb250ZW50cyA9PT0gbnVsbClcblx0XHRcdHJldHVybiBudWxsO1xuXHRcdFxuXHRcdGNvbnN0IHRleHRMaW5lcyA9IGZpbGVDb250ZW50c1xuXHRcdFx0LnNwbGl0KC8oXFxyKT9cXG4vZylcblx0XHRcdC5maWx0ZXIocyA9PiAhIXMgJiYgISFzLnRyaW0oKSk7XG5cdFx0XG5cdFx0Y29uc3QgcGFyc2VkTGluZXM6IExpbmVbXSA9IFtdO1xuXHRcdFxuXHRcdGZvciAoY29uc3QgdGV4dExpbmUgb2YgdGV4dExpbmVzKVxuXHRcdHtcblx0XHRcdGNvbnN0IHBhcnNlZExpbmUgPSBMaW5lLnBhcnNlKHRleHRMaW5lKTtcblx0XHRcdHBhcnNlZExpbmVzLnB1c2gocGFyc2VkTGluZSk7XG5cdFx0fVxuXHRcdFxuXHRcdHJldHVybiBuZXcgRGVmaW5pdGlvbkZpbGUocGF0aCwgcGFyc2VkTGluZXMpO1xuXHR9XG5cdFxuXHQvKiogKi9cblx0cHJpdmF0ZSBjb25zdHJ1Y3Rvcihcblx0XHRwcml2YXRlIG9yaWdpblBhdGg6IHN0cmluZyxcblx0XHRwcml2YXRlIGxpbmVzOiAoTGluZXxEZWZpbml0aW9uRmlsZSlbXSlcblx0eyB9XG5cdFxuXHQvKipcblx0ICogR29lcyB0aHJvdWdoIHRoZSBlbnRpcmUgbGluZXMgcHJvcGVydHkgYW5kIHJlcGxhY2VzXG5cdCAqIGFsbCByZS1leHBvcnQgc3RhdGVtZW50cyBpbnRvIERlZmluaXRpb25GaWxlIG9iamVjdHMuXG5cdCAqL1xuXHRhc3luYyByZXNvbHZlKClcblx0e1xuXHRcdGZvciAobGV0IGkgPSAtMTsgKytpIDwgdGhpcy5saW5lcy5sZW5ndGg7KVxuXHRcdHtcblx0XHRcdGNvbnN0IGN1cnJlbnRMaW5lID0gdGhpcy5saW5lc1tpXTtcblx0XHRcdFxuXHRcdFx0aWYgKGN1cnJlbnRMaW5lIGluc3RhbmNlb2YgTGluZXMuUmVFeHBvcnRMaW5lKVxuXHRcdFx0e1xuXHRcdFx0XHRjb25zdCBvcmlnaW5QYXRoUGFyc2VkID0gUGF0aC5wYXJzZSh0aGlzLm9yaWdpblBhdGgpO1xuXHRcdFx0XHRjb25zdCB0YXJnZXRQYXRoUGFyc2VkID0gUGF0aC5wYXJzZShjdXJyZW50TGluZS5wYXRoKTtcblx0XHRcdFx0Y29uc3QgcmVzb2x2ZWRQYXRoID0gUGF0aC5yZXNvbHZlKG9yaWdpblBhdGhQYXJzZWQuZGlyLCBjdXJyZW50TGluZS5wYXRoKTtcblx0XHRcdFx0Y29uc3QgbmVzdGVkRGVmaW5pdGlvbkZpbGUgPSBhd2FpdCBEZWZpbml0aW9uRmlsZS5yZWFkKHJlc29sdmVkUGF0aCk7XG5cdFx0XHRcdFxuXHRcdFx0XHRpZiAobmVzdGVkRGVmaW5pdGlvbkZpbGUpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRhd2FpdCBuZXN0ZWREZWZpbml0aW9uRmlsZS5yZXNvbHZlKCk7XG5cdFx0XHRcdFx0dGhpcy5saW5lc1tpXSA9IG5lc3RlZERlZmluaXRpb25GaWxlO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cdFxuXHQvKiogKi9cblx0ZW1pdChuYW1lc3BhY2U/OiBzdHJpbmcsIG1vZHVsZU5hbWU/OiBzdHJpbmcpXG5cdHtcblx0XHRjb25zdCBsaW5lT2JqZWN0cyA9IHRoaXMuY29sbGVjdExpbmVzKCk7XG5cdFx0XG5cdFx0ZnVuY3Rpb24qIGVhY2hJZGVudGlmaWVyTGluZSgpXG5cdFx0e1xuXHRcdFx0Zm9yIChjb25zdCBsaW5lT2JqZWN0IG9mIGxpbmVPYmplY3RzKVxuXHRcdFx0XHRpZiAobGluZU9iamVjdCBpbnN0YW5jZW9mIElkZW50aWZpZXJMaW5lKVxuXHRcdFx0XHRcdHlpZWxkIGxpbmVPYmplY3Q7XG5cdFx0fVxuXHRcdFxuXHRcdGNvbnN0IGVtaXRMaW5lcyA9IChpbmRlbnQgPSB0cnVlKSA9PlxuXHRcdHtcblx0XHRcdGZvciAoY29uc3QgbGluZU9iamVjdCBvZiBsaW5lT2JqZWN0cylcblx0XHRcdHtcblx0XHRcdFx0Y29uc3QgZW1pdHRlZCA9IGxpbmVPYmplY3QuZW1pdCgpO1xuXHRcdFx0XHRpZiAoZW1pdHRlZCAhPT0gbnVsbClcblx0XHRcdFx0XHRsaW5lcy5wdXNoKChpbmRlbnQgPyBcIlxcdFwiIDogXCJcIikgKyBlbWl0dGVkKTtcblx0XHRcdH1cblx0XHR9XG5cdFx0XG5cdFx0Y29uc3QgbGluZXM6IHN0cmluZ1tdID0gW107XG5cdFx0XG5cdFx0aWYgKG5hbWVzcGFjZSlcblx0XHR7XG5cdFx0XHRsaW5lcy5wdXNoKFwiXCIpO1xuXHRcdFx0bGluZXMudW5zaGlmdChgZGVjbGFyZSBuYW1lc3BhY2UgJHtuYW1lc3BhY2V9IHtgKTtcblx0XHRcdFxuXHRcdFx0ZW1pdExpbmVzKCk7XG5cdFx0XHRcblx0XHRcdGxpbmVzLnB1c2goXCJ9XCIpO1xuXHRcdFx0bGluZXMucHVzaChcIlwiKTtcblx0XHR9XG5cdFx0XG5cdFx0aWYgKG1vZHVsZU5hbWUpXG5cdFx0e1xuXHRcdFx0bGluZXMucHVzaChgZGVjbGFyZSBtb2R1bGUgXCIke21vZHVsZU5hbWV9XCIge2ApO1xuXHRcdFx0XG5cdFx0XHRlbWl0TGluZXMoKTtcblx0XHRcdFxuXHRcdFx0bGluZXMucHVzaChgfWApO1xuXHRcdFx0bGluZXMucHVzaChcIlwiKTtcblx0XHR9XG5cdFx0XG5cdFx0aWYgKCFuYW1lc3BhY2UgJiYgIW1vZHVsZU5hbWUpXG5cdFx0e1xuXHRcdFx0ZW1pdExpbmVzKGZhbHNlKTtcblx0XHR9XG5cdFx0XG5cdFx0bGluZXMucHVzaChcIlwiKTtcblx0XHRyZXR1cm4gbGluZXM7XG5cdH1cblx0XG5cdC8qKiAqL1xuXHRwcml2YXRlIGNvbGxlY3RMaW5lcygpXG5cdHtcblx0XHRjb25zdCBsaW5lczogTGluZVtdID0gW107XG5cdFx0XG5cdFx0Zm9yIChjb25zdCBpdGVtIG9mIHRoaXMubGluZXMpXG5cdFx0e1xuXHRcdFx0aWYgKGl0ZW0gaW5zdGFuY2VvZiBMaW5lKVxuXHRcdFx0XHRsaW5lcy5wdXNoKGl0ZW0pO1xuXHRcdFx0XG5cdFx0XHRlbHNlIGlmIChpdGVtIGluc3RhbmNlb2YgRGVmaW5pdGlvbkZpbGUpXG5cdFx0XHRcdGxpbmVzLnB1c2goLi4uaXRlbS5jb2xsZWN0TGluZXMoKSk7XG5cdFx0fVxuXHRcdFxuXHRcdHJldHVybiBsaW5lcztcblx0fVxufVxuXG4vKiogKi9cbmNsYXNzIExpbmVcbntcblx0LyoqXG5cdCAqIEZhY3RvcnkgbWV0aG9kIHRoYXQgcmV0dXJucyBhIGxpbmUgZnJvbSB0aGUgc3BlY2lmaWVkIHRleHQuXG5cdCAqL1xuXHRzdGF0aWMgcGFyc2UodGV4dDogc3RyaW5nKVxuXHR7XG5cdFx0Y29uc3QgdGV4dFRyaW1tZWQgPSB0ZXh0LnRyaW0oKTtcblx0XHRcblx0XHRjb25zdCBsaW5lQ3RvcjogKHR5cGVvZiBMaW5lKSB8IHVuZGVmaW5lZCA9IExpbmVzLmFsbCgpLmZpbmQoY3RvciA9PlxuXHRcdFx0Y3RvciAmJiBcblx0XHRcdGN0b3IucGF0dGVybiAmJlxuXHRcdFx0Y3Rvci5wYXR0ZXJuIGluc3RhbmNlb2YgUmVnRXhwICYmIFxuXHRcdFx0Y3Rvci5wYXR0ZXJuLnRlc3QodGV4dFRyaW1tZWQpKTtcblx0XHRcblx0XHRpZiAoIWxpbmVDdG9yKVxuXHRcdFx0dGhyb3cgXCJJbnRlcm5hbCBlcnJvclwiO1xuXHRcdFxuXHRcdGNvbnN0IGxpbmU6IExpbmUgPSBuZXcgbGluZUN0b3IodGV4dCk7XG5cdFx0Y29uc3QgbWF0Y2hPYmplY3QgPSA8UmVnRXhwRXhlY0FycmF5ICYgeyBncm91cHM6IG9iamVjdCB9PmxpbmVDdG9yLnBhdHRlcm4uZXhlYyh0ZXh0VHJpbW1lZCk7XG5cdFx0XG5cdFx0aWYgKG1hdGNoT2JqZWN0ICYmIG1hdGNoT2JqZWN0Lmdyb3Vwcylcblx0XHRcdGZvciAoY29uc3Qga2V5IG9mIE9iamVjdC5rZXlzKG1hdGNoT2JqZWN0Lmdyb3VwcykpXG5cdFx0XHRcdGtleSBpbiBsaW5lID9cblx0XHRcdFx0XHRsaW5lW2tleV0gPSBtYXRjaE9iamVjdC5ncm91cHNba2V5XSA6XG5cdFx0XHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGxpbmUsIGtleSwgeyB2YWx1ZTogbWF0Y2hPYmplY3QuZ3JvdXBzW2tleV0gfSk7XG5cdFx0XG5cdFx0cmV0dXJuIGxpbmU7XG5cdH1cblx0XG5cdC8qKiAqL1xuXHRwcm90ZWN0ZWQgY29uc3RydWN0b3IodGV4dDogc3RyaW5nKVxuXHR7XG5cdFx0dGhpcy5sZWFkaW5nU3BhY2VzID0gdGV4dC5sZW5ndGggLSB0ZXh0LnJlcGxhY2UoL15cXHMrLywgXCJcIikubGVuZ3RoO1xuXHRcdHRoaXMudGV4dCA9IHRleHQudHJpbSgpO1xuXHR9XG5cdFxuXHQvKiogKi9cblx0cmVhZG9ubHkgdGV4dDogc3RyaW5nO1xuXHRcblx0LyoqICovXG5cdHJlYWRvbmx5IGxlYWRpbmdTcGFjZXM6IG51bWJlcjtcblx0XG5cdC8qKiAqL1xuXHRnZXQgaW5kZW50RGVwdGgoKSB7IHJldHVybiAodGhpcy5sZWFkaW5nU3BhY2VzIC8gNCkgfCAwOyB9XG5cdFxuXHQvKiogKi9cblx0c3RhdGljIGdldCBwYXR0ZXJuKCkgeyByZXR1cm4gLy4vOyB9XG5cdFxuXHQvKiogKi9cblx0ZW1pdCgpXG5cdHtcblx0XHRpZiAodGhpcyBpbnN0YW5jZW9mIExpbmVzLkVtcHR5RXhwb3J0TGluZSlcblx0XHRcdHJldHVybiBudWxsO1xuXHRcdFxuXHRcdGlmICh0aGlzIGluc3RhbmNlb2YgTGluZXMuSW1wb3J0TGluZSlcblx0XHRcdGlmICh0aGlzLmFzID09PSBcIlhcIilcblx0XHRcdFx0cmV0dXJuIG51bGw7XG5cdFx0XG5cdFx0Y29uc3QgcGFydHMgPSBbXCJcXHRcIi5yZXBlYXQodGhpcy5pbmRlbnREZXB0aCldO1xuXHRcdFxuXHRcdGlmICh0aGlzIGluc3RhbmNlb2YgTGluZXMuRG9jQ29tbWVudExpbmVNaWRkbGUpXG5cdFx0XHRwYXJ0cy5wdXNoKFwiIFwiKTtcblx0XHRcblx0XHRwYXJ0cy5wdXNoKHRoaXMudGV4dFxuXHRcdFx0Ly8gUmVtb3ZlIHRoZSBYLiByZWZlcmVuY2VzXG5cdFx0XHQucmVwbGFjZSgvPFhcXC4oPz1cXHcpL2csIFwiPFwiKVxuXHRcdFx0LnJlcGxhY2UoL1xcKFhcXC4oPz1cXHcpL2csIFwiKFwiKVxuXHRcdFx0LnJlcGxhY2UoLyBYXFwuKD89XFx3KS9nLCBcIiBcIilcblx0XHRcdC8vIFJlbW92ZSBkZWNsYXJlIGtleXdvcmQgb24gbm9uLWV4cG9ydGVkIG1lbWJlclxuXHRcdFx0LnJlcGxhY2UoL15kZWNsYXJlICg/PWFic3RyYWN0fGNsYXNzfG5hbWVzcGFjZXxmdW5jdGlvbnxlbnVtfHR5cGV8Y29uc3R8bGV0fHZhcikvZywgXCJcIilcblx0XHRcdC8vIFJlbW92ZSBkZWNsYXJlIGtleXdvcmQgb24gZXhwb3J0ZWQgbWVtYmVyXG5cdFx0XHQucmVwbGFjZSgvXmV4cG9ydCBkZWNsYXJlICg/PWFic3RyYWN0fGNsYXNzfG5hbWVzcGFjZXxmdW5jdGlvbnxlbnVtfHR5cGV8Y29uc3R8bGV0fHZhcikvZywgXCJleHBvcnQgXCIpKTtcblx0XHRcblx0XHQvLyBBcHBlbmQgYSBzcGFjZSBhZnRlciB0aGUgKiB0byBmaXggZWRpdG9yIGNvbG9yaW5nXG5cdFx0aWYgKHRoaXMgaW5zdGFuY2VvZiBMaW5lcy5Eb2NDb21tZW50TGluZU1pZGRsZSAmJiB0aGlzLnRleHQgPT09IFwiKlwiKVxuXHRcdFx0cGFydHMucHVzaChcIiBcIik7XG5cdFx0XG5cdFx0cmV0dXJuIHBhcnRzLmpvaW4oXCJcIik7XG5cdH1cbn1cblxuXG4vKiogKi9cbmV4cG9ydCBpbnRlcmZhY2UgSWRlbnRpZmllckRlY2xhcmF0aW9uTGluZVxue1xuXHRpZGVudGlmaWVyOiBzdHJpbmc7XG59XG5cblxuLyoqICovXG5hYnN0cmFjdCBjbGFzcyBJZGVudGlmaWVyTGluZSBleHRlbmRzIExpbmVcbntcblx0cmVhZG9ubHkgaWRlbnRpZmllcjogc3RyaW5nID0gXCJcIjtcbn1cblxuXG5uYW1lc3BhY2UgTGluZXNcbntcblx0LyoqICovXG5cdGV4cG9ydCBmdW5jdGlvbiBhbGwoKTogKHR5cGVvZiBMaW5lKVtdXG5cdHtcblx0XHRyZXR1cm4gT2JqZWN0LmtleXMoTGluZXMpLm1hcCgoY3Rvck5hbWU6IHN0cmluZykgPT4gTGluZXNbY3Rvck5hbWVdKTtcblx0fVxuXHRcblx0LyoqICovXG5cdGV4cG9ydCBjbGFzcyBJbXBvcnRMaW5lIGV4dGVuZHMgTGluZVxuXHR7XG5cdFx0c3RhdGljIGdldCBwYXR0ZXJuKCkgeyByZXR1cm4gL15pbXBvcnQgXFwqIGFzICg/PGFzPlxcdyspIGZyb20gKCd8XCIpKD88cGF0aD5bXFwuXFwvXFx3XFxkXSspKCd8XCIpOyQvOyB9XG5cdFx0XG5cdFx0cmVhZG9ubHkgYXM6IHN0cmluZyA9IFwiXCI7XG5cdFx0XG5cdFx0cmVhZG9ubHkgcGF0aDogc3RyaW5nID0gXCJcIjtcblx0fVxuXG5cdC8qKiAqL1xuXHRleHBvcnQgY2xhc3MgUmVFeHBvcnRMaW5lIGV4dGVuZHMgTGluZVxuXHR7XG5cdFx0c3RhdGljIGdldCBwYXR0ZXJuKCkgeyByZXR1cm4gL15leHBvcnQgXFwqIGZyb20gKCd8XCIpKD88cGF0aD5bXFwuXFwvXFx3XFxkXSspKCd8XCIpOyQvOyB9XG5cdFx0XG5cdFx0cmVhZG9ubHkgcGF0aDogc3RyaW5nID0gXCJcIjtcblx0fVxuXG5cdC8qKiAqL1xuXHRleHBvcnQgY2xhc3MgRG9jQ29tbWVudExpbmVTaW5nbGUgZXh0ZW5kcyBMaW5lXG5cdHtcblx0XHRzdGF0aWMgZ2V0IHBhdHRlcm4oKSB7IHJldHVybiAvXlxcL1xcKlxcKi4qXFwqXFwvJC87IH1cblx0fVxuXG5cdC8qKiAqL1xuXHRleHBvcnQgY2xhc3MgRG9jQ29tbWVudExpbmVCZWdpbiBleHRlbmRzIExpbmVcblx0e1xuXHRcdHN0YXRpYyBnZXQgcGF0dGVybigpIHsgcmV0dXJuIC9eXFwvXFwqXFwqJC87IH1cblx0fVxuXG5cdC8qKiAqL1xuXHRleHBvcnQgY2xhc3MgRG9jQ29tbWVudExpbmVNaWRkbGUgZXh0ZW5kcyBMaW5lXG5cdHtcblx0XHRzdGF0aWMgZ2V0IHBhdHRlcm4oKSB7IHJldHVybiAvXlxcKi4qJC87IH1cblx0fVxuXHRcblx0LyoqICovXG5cdGV4cG9ydCBjbGFzcyBEb2NDb21tZW50TGluZUVuZCBleHRlbmRzIExpbmVcblx0e1xuXHRcdHN0YXRpYyBnZXQgcGF0dGVybigpIHsgcmV0dXJuIC9eLitcXCpcXC8kLzsgfVxuXHR9XG5cdFxuXHQvKiogKi9cblx0ZXhwb3J0IGNsYXNzIEVtcHR5RXhwb3J0TGluZSBleHRlbmRzIExpbmVcblx0e1xuXHRcdHN0YXRpYyBnZXQgcGF0dGVybigpIHsgcmV0dXJuIC9eZXhwb3J0XFxzKntcXHMqfTskLzsgfVxuXHR9XG5cdFxuXHQvKiogKi9cblx0ZXhwb3J0IGNsYXNzIENsYXNzRGVjbGFyYXRpb25MaW5lIGV4dGVuZHMgSWRlbnRpZmllckxpbmVcblx0e1xuXHRcdHN0YXRpYyBnZXQgcGF0dGVybigpIHsgcmV0dXJuIC9eKGV4cG9ydCApP2RlY2xhcmUoYWJzdHJhY3QgKT8gY2xhc3MgKD88aWRlbnRpZmllcj5bXFx3XSspKCAoZXh0ZW5kc3xpbXBsZW1lbnRzKSBbXFx3XFwuLF0rKT8geyQvOyB9XG5cdH1cblxuXHQvKiogKi9cblx0ZXhwb3J0IGNsYXNzIEludGVyZmFjZURlY2xhcmF0aW9uTGluZSBleHRlbmRzIElkZW50aWZpZXJMaW5lXG5cdHtcblx0XHRzdGF0aWMgZ2V0IHBhdHRlcm4oKSB7IHJldHVybiAvXihleHBvcnQgKT9pbnRlcmZhY2UgKD88aWRlbnRpZmllcj5bXFx3XSspKFxcc2V4dGVuZHMgW1xcdyxcXHNdKyk/IHskLzsgfVxuXHR9XG5cdFxuXHQvKiogKi9cblx0ZXhwb3J0IGNsYXNzIEVudW1EZWNsYXJhdGlvbkxpbmUgZXh0ZW5kcyBJZGVudGlmaWVyTGluZVxuXHR7XG5cdFx0c3RhdGljIGdldCBwYXR0ZXJuKCkgeyByZXR1cm4gL14oZXhwb3J0ICk/ZGVjbGFyZSggY29uc3QpPyBlbnVtICg/PGlkZW50aWZpZXI+XFx3KykgeyQvOyB9XG5cdH1cblxuXHQvKiogKi9cblx0ZXhwb3J0IGNsYXNzIE5hbWVzcGFjZURlY2xhcmF0aW9uTGluZSBleHRlbmRzIElkZW50aWZpZXJMaW5lXG5cdHtcblx0XHRzdGF0aWMgZ2V0IHBhdHRlcm4oKSB7IHJldHVybiAvXihleHBvcnQgKT9kZWNsYXJlIG5hbWVzcGFjZSAoPzxpZGVudGlmaWVyPlxcdyspIHskLzsgfVxuXHR9XG5cdFxuXHQvKiogKi9cblx0ZXhwb3J0IGNsYXNzIFR5cGVEZWNsYXJhdGlvbkxpbmUgZXh0ZW5kcyBJZGVudGlmaWVyTGluZVxuXHR7XG5cdFx0c3RhdGljIGdldCBwYXR0ZXJuKCkgeyByZXR1cm4gL14oZXhwb3J0ICk/ZGVjbGFyZSB0eXBlICg/PGlkZW50aWZpZXI+XFx3KykkLzsgfVxuXHR9XG5cdFxuXHQvKiogKi9cblx0ZXhwb3J0IGNsYXNzIENvbnN0RGVjbGFyYXRpb25MaW5lIGV4dGVuZHMgSWRlbnRpZmllckxpbmVcblx0e1xuXHRcdHN0YXRpYyBnZXQgcGF0dGVybigpIHsgcmV0dXJuIC9eKGV4cG9ydCApP2RlY2xhcmUgY29uc3QgKD88aWRlbnRpZmllcj5cXHcrKS4qJC87IH1cblx0fVxuXHRcblx0LyoqICovXG5cdGV4cG9ydCBjbGFzcyBPdGhlckxpbmUgZXh0ZW5kcyBMaW5lXG5cdHtcblx0XHRzdGF0aWMgZ2V0IHBhdHRlcm4oKSB7IHJldHVybiAvLiovOyB9XG5cdH1cbn1cblxuXG4vKiogKi9cbmNvbnN0IHJlYWRGaWxlID0gKHBhdGg6IHN0cmluZywgb3B0cyA9IFwidXRmOFwiKSA9PlxuXHRuZXcgUHJvbWlzZTxbc3RyaW5nLCBFcnJvciB8IG51bGxdPigocmVzb2x2ZSwgcmVqKSA9PlxuXHR7XG5cdFx0RnMucmVhZEZpbGUocGF0aCwgb3B0cywgKGVycm9yOiBFcnJvciwgZGF0YTogc3RyaW5nKSA9PlxuXHRcdHtcblx0XHRcdGlmIChlcnJvcilcblx0XHRcdFx0cmVzb2x2ZShbXCJcIiwgZXJyb3JdKTtcblx0XHRcdGVsc2Vcblx0XHRcdFx0cmVzb2x2ZShbZGF0YSwgbnVsbF0pO1xuXHRcdH0pO1xuXHR9KTtcblxuXG5pbnRlcmZhY2UgSUJ1bmRsZU9wdGlvbnNcbntcblx0aW46IHN0cmluZztcblx0b3V0OiBzdHJpbmd8c3RyaW5nW107XG5cdG5hbWVzcGFjZTogc3RyaW5nO1xuXHRtb2R1bGU6IHN0cmluZztcblx0aGVhZGVyOiBzdHJpbmd8c3RyaW5nW107XG5cdGZvb3Rlcjogc3RyaW5nfHN0cmluZ1tdO1xufVxuXG5cbi8qKiBXaGV0aGVyIHRoZSBjb2RlIGlzIHJ1bm5pbmcgYXMgYSByZXF1aXJlIG1vZHVsZSwgb3IgZnJvbSB0aGUgY29tbWFuZCBsaW5lLiAqL1xuY29uc3QgcnVubmluZ0FzTW9kdWxlID0gISFtb2R1bGUucGFyZW50O1xuXG5cbmNvbnN0IGJ1bmRsZSA9IChvcHRpb25zPzogSUJ1bmRsZU9wdGlvbnMpID0+XG57XG5cdC8qKiBTdG9yZXMgdGhlIGRpcmVjdG9yeSBjb250YWluaW5nIHRoZSBlbnRyeSBwb2ludCBzY3JpcHQuICovXG5cdGNvbnN0IHNjcmlwdERpcmVjdG9yeSA9ICgoKSA9PlxuXHR7XG5cdFx0aWYgKHJ1bm5pbmdBc01vZHVsZSlcblx0XHR7XG5cdFx0XHRjb25zdCBhcmdzOiBzdHJpbmdbXSA9IHByb2Nlc3MuYXJndjtcblx0XHRcdFxuXHRcdFx0aWYgKGFyZ3MubGVuZ3RoIDwgMilcblx0XHRcdFx0dGhyb3cgXCJVbnBhcnNhYmxlIGNvbW1hbmQgbGluZSBhcmd1bWVudHNcIjtcblx0XHRcdFxuXHRcdFx0Y29uc3QganNGaWxlID0gYXJnc1sxXTtcblx0XHRcdGlmICghanNGaWxlLmVuZHNXaXRoKFwiLmpzXCIpKVxuXHRcdFx0XHR0aHJvdyBcIlNlY29uZCBhcmd1bWVudCBleHBlY3RlZCB0byBiZSBhIGZpbGUgd2l0aCB0aGUgLmpzIGV4dGVuc2lvbi5cIjtcblx0XHRcdFxuXHRcdFx0cmV0dXJuIFBhdGguZGlybmFtZShqc0ZpbGUpO1xuXHRcdH1cblx0XHRcblx0XHRyZXR1cm4gXCJcIjtcblx0fSkoKTtcblx0XG5cdC8qKiBUcmFuc2xhdGVzIHRoZSBzcGVjaWZpZWQgcGF0aCB0byBiZSByZWxhdGl2ZSB0byB0aGUgZW50cnkgcG9pbnQgc2NyaXB0LiAqL1xuXHRjb25zdCB0cmFuc2xhdGVQYXRoID0gKGluUGF0aDogc3RyaW5nKSA9PiBzY3JpcHREaXJlY3RvcnkgP1xuXHRcdFBhdGgucmVzb2x2ZShzY3JpcHREaXJlY3RvcnksIGluUGF0aCkgOiBcblx0XHRQYXRoLnJlc29sdmUoaW5QYXRoKTtcblx0XG5cdC8qKiBSZWFkcyB0aGUgYXJndW1lbnQgd2l0aCB0aGUgc3BlY2lmaWVkIG5hbWUgZnJvbSB0aGUgcHJvY2VzcyBhcmd1bWVudHMuICovXG5cdGNvbnN0IHJlYWRBcmd1bWVudCA9IChuYW1lOiBrZXlvZiBJQnVuZGxlT3B0aW9ucywgcmVxdWlyZWQgPSBmYWxzZSkgPT5cblx0e1xuXHRcdGlmIChydW5uaW5nQXNNb2R1bGUpXG5cdFx0e1xuXHRcdFx0aWYgKCFvcHRpb25zIHx8IHR5cGVvZiBvcHRpb25zICE9PSBcIm9iamVjdFwiKVxuXHRcdFx0XHR0aHJvdyBgT3B0aW9ucyBvYmplY3QgbXVzdCBiZSBwYXNzZWQgdG8gdGhpcyBmdW5jdGlvbi5gO1xuXHRcdFx0XG5cdFx0XHRyZXR1cm4gPHN0cmluZz5vcHRpb25zW25hbWVdO1xuXHRcdH1cblx0XHRlbHNlXG5cdFx0e1xuXHRcdFx0Y29uc3QgcHJvY2Vzc0FyZ3M6IHN0cmluZ1tdID0gcHJvY2Vzcy5hcmd2O1xuXHRcdFx0Y29uc3QgcHJlZml4ID0gYC0tJHtuYW1lfT1gO1xuXHRcdFx0Y29uc3QgZnVsbEFyZ3VtZW50VGV4dCA9IHByb2Nlc3NBcmdzLmZpbmQoYXJnID0+IGFyZy5zdGFydHNXaXRoKHByZWZpeCkpO1xuXHRcdFx0XG5cdFx0XHRpZiAoZnVsbEFyZ3VtZW50VGV4dClcblx0XHRcdHtcblx0XHRcdFx0Y29uc3Qgb3V0VmFsdWUgPSBmdWxsQXJndW1lbnRUZXh0LnNsaWNlKHByZWZpeC5sZW5ndGgpLnRyaW0oKTtcblx0XHRcdFx0aWYgKG91dFZhbHVlKVxuXHRcdFx0XHRcdHJldHVybiBvdXRWYWx1ZTtcblx0XHRcdFx0XG5cdFx0XHRcdHRocm93IGBBcmd1bWVudCAke3ByZWZpeH0gY2Fubm90IGJlIGVtcHR5YDtcblx0XHRcdH1cblx0XHRcdGVsc2UgaWYgKHJlcXVpcmVkKVxuXHRcdFx0e1xuXHRcdFx0XHR0aHJvdyBgTWlzc2luZyByZXF1aXJlZCBhcmd1bWVudCAke3ByZWZpeH0pLmA7XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cdFxuXHQoYXN5bmMgKCkgPT5cblx0e1xuXHRcdGNvbnN0IGluQXJndW1lbnQgPSByZWFkQXJndW1lbnQoXCJpblwiLCB0cnVlKTtcblx0XHRjb25zdCBvdXRBcmd1bWVudCA9IHJlYWRBcmd1bWVudChcIm91dFwiLCB0cnVlKTtcblx0XHRjb25zdCBuc0FyZ3VtZW50ID0gcmVhZEFyZ3VtZW50KFwibmFtZXNwYWNlXCIpO1xuXHRcdGNvbnN0IG1vZEFyZ3VtZW50ID0gcmVhZEFyZ3VtZW50KFwibW9kdWxlXCIpO1xuXHRcdGNvbnN0IGhlYWRlckFyZ3VtZW50ID0gcmVhZEFyZ3VtZW50KFwiaGVhZGVyXCIpO1xuXHRcdGNvbnN0IGZvb3RlckFyZ3VtZW50ID0gcmVhZEFyZ3VtZW50KFwiZm9vdGVyXCIpO1xuXHRcdFxuXHRcdGNvbnN0IG91dEZpbGVzOiBzdHJpbmdbXSA9IEFycmF5LmlzQXJyYXkob3V0QXJndW1lbnQpID9cblx0XHRcdG91dEFyZ3VtZW50IDogW291dEFyZ3VtZW50XTtcblx0XHRcblx0XHRjb25zdCBoZWFkZXJMaW5lczogc3RyaW5nW10gPSBBcnJheS5pc0FycmF5KGhlYWRlckFyZ3VtZW50KSA/IFxuXHRcdFx0aGVhZGVyQXJndW1lbnQgOiBbaGVhZGVyQXJndW1lbnRdO1xuXHRcdFxuXHRcdGNvbnN0IGZvb3RlckxpbmVzOiBzdHJpbmdbXSA9IEFycmF5LmlzQXJyYXkoZm9vdGVyQXJndW1lbnQpID9cblx0XHRcdGZvb3RlckFyZ3VtZW50IDogW2Zvb3RlckFyZ3VtZW50XTtcblx0XHRcblx0XHRjb25zdCBob21lRGVmaW5pdGlvbkZpbGUgPSBhd2FpdCBEZWZpbml0aW9uRmlsZS5yZWFkKHRyYW5zbGF0ZVBhdGgoaW5Bcmd1bWVudCkpO1xuXHRcdGlmICghaG9tZURlZmluaXRpb25GaWxlKVxuXHRcdFx0dGhyb3cgXCJObyBkZWZpbml0aW9uIGZpbGUgZm91bmQgYXQ6IFwiICsgaW5Bcmd1bWVudDtcblx0XHRcblx0XHRhd2FpdCBob21lRGVmaW5pdGlvbkZpbGUucmVzb2x2ZSgpO1xuXHRcdFxuXHRcdGNvbnN0IGRlZmluaXRpb25MaW5lcyA9IGhvbWVEZWZpbml0aW9uRmlsZS5lbWl0KG5zQXJndW1lbnQsIG1vZEFyZ3VtZW50KTtcblx0XHRkZWZpbml0aW9uTGluZXMudW5zaGlmdCguLi5oZWFkZXJMaW5lcyk7XG5cdFx0ZGVmaW5pdGlvbkxpbmVzLnB1c2goLi4uZm9vdGVyTGluZXMpO1xuXHRcdFxuXHRcdGlmIChmb290ZXJMaW5lcy5sZW5ndGgpXG5cdFx0XHRkZWZpbml0aW9uTGluZXMucHVzaChcIlwiKTtcblx0XHRcblx0XHRmb3IgKGNvbnN0IG91dEZpbGUgb2Ygb3V0RmlsZXMpXG5cdFx0XHRGcy53cml0ZUZpbGUoXG5cdFx0XHRcdHRyYW5zbGF0ZVBhdGgob3V0RmlsZSksIFxuXHRcdFx0XHRkZWZpbml0aW9uTGluZXMuam9pbihcIlxcblwiKSwgXG5cdFx0XHRcdFwidXRmOFwiLCBcblx0XHRcdFx0KGVycm9yOiBFcnJvcikgPT4gZXJyb3IgJiYgY29uc29sZS5lcnJvcihlcnJvcikpO1xuXHRcblx0fSkoKS5jYXRjaChyZWFzb24gPT5cblx0e1xuXHRcdGNvbnNvbGUuZXJyb3IocmVhc29uKTtcblx0fSk7XG59XG5cbmlmIChydW5uaW5nQXNNb2R1bGUpXG5cdHR5cGVvZiBtb2R1bGUgPT09IFwib2JqZWN0XCIgJiYgKG1vZHVsZS5leHBvcnRzID0gYnVuZGxlKTtcbmVsc2Vcblx0YnVuZGxlKCk7XG4iXX0=