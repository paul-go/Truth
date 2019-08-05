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
        let filePath = path;
        if (!filePath.endsWith(".d.ts")) {
            if (filePath.endsWith(".js") || filePath.endsWith(".ts"))
                filePath = filePath.slice(0, -3);
            filePath += ".d.ts";
        }
        if (!filePath.startsWith("/"))
            throw new Error(filePath + " is not absolute.");
        const [fileContents, error] = await readFile(filePath);
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
        return new DefinitionFile(filePath, parsedLines);
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
            lines.push("}");
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
            throw new Error("Internal error");
        // eslint-disable-next-line new-cap
        const line = new lineCtor(text);
        const matchObject = lineCtor.pattern.exec(textTrimmed);
        if (matchObject && matchObject.groups) {
            for (const key of Object.keys(matchObject.groups)) {
                if (key in line)
                    line[key] = matchObject.groups[key];
                else
                    Object.defineProperty(line, key, { value: matchObject.groups[key] });
            }
        }
        return line;
    }
    /** */
    constructor(text) {
        this.leadingSpaces = text.length - text.replace(/^\s+/, "").length;
        this.text = text.trim();
    }
    /** */
    get indentDepth() { return this.leadingSpaces / 4 | 0; }
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
                throw new Error("Unparsable command line arguments");
            const jsFile = args[1];
            if (!jsFile.endsWith(".js"))
                throw new Error("Second argument expected to be a " +
                    "file with the .js extension.");
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
                throw new Error("Options object must be passed to this function.");
            return options[name];
        }
        const processArgs = process.argv;
        const prefix = `--${name}=`;
        const fullArgumentText = processArgs.find(arg => arg.startsWith(prefix));
        if (fullArgumentText) {
            const outValue = fullArgumentText.slice(prefix.length).trim();
            if (outValue)
                return outValue;
            throw new Error(`Argument ${prefix} cannot be empty`);
        }
        if (required)
            throw new Error(`Missing required argument ${prefix}).`);
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
        throw new Error("No definition file found at: " + inArgument);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVHlwZXNCdW5kbGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiVHlwZXNCdW5kbGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBS0EsTUFBTSxFQUFFLEdBQUcsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQ3pCLE1BQU0sSUFBSSxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQztBQU83QixNQUFNO0FBQ04sTUFBTSxjQUFjO0lBeUNuQixNQUFNO0lBQ04sWUFDUyxVQUFrQixFQUNsQixLQUE4QjtRQUQ5QixlQUFVLEdBQVYsVUFBVSxDQUFRO1FBQ2xCLFVBQUssR0FBTCxLQUFLLENBQXlCO0lBQ3JDLENBQUM7SUEzQ0gsTUFBTTtJQUNOLE1BQU0sQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLElBQVk7UUFFN0IsSUFBSSxRQUFRLEdBQUcsSUFBSSxDQUFDO1FBRXBCLElBQUksQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxFQUMvQjtZQUNDLElBQUksUUFBUSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsSUFBSSxRQUFRLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQztnQkFDdkQsUUFBUSxHQUFHLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFFbEMsUUFBUSxJQUFJLE9BQU8sQ0FBQztTQUNwQjtRQUVELElBQUksQ0FBQyxRQUFRLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQztZQUM1QixNQUFNLElBQUksS0FBSyxDQUFDLFFBQVEsR0FBRyxtQkFBbUIsQ0FBQyxDQUFDO1FBRWpELE1BQU0sQ0FBQyxZQUFZLEVBQUUsS0FBSyxDQUFDLEdBQUcsTUFBTSxRQUFRLENBQUMsUUFBUSxDQUFDLENBQUM7UUFFdkQsSUFBSSxLQUFLO1lBQ1IsTUFBTSxLQUFLLENBQUM7UUFFYixJQUFJLFlBQVksS0FBSyxJQUFJO1lBQ3hCLE9BQU8sSUFBSSxDQUFDO1FBRWIsTUFBTSxTQUFTLEdBQUcsWUFBWTthQUM1QixLQUFLLENBQUMsVUFBVSxDQUFDO2FBQ2pCLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDO1FBRWpDLE1BQU0sV0FBVyxHQUFXLEVBQUUsQ0FBQztRQUUvQixLQUFLLE1BQU0sUUFBUSxJQUFJLFNBQVMsRUFDaEM7WUFDQyxNQUFNLFVBQVUsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBQ3hDLFdBQVcsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUM7U0FDN0I7UUFFRCxPQUFPLElBQUksY0FBYyxDQUFDLFFBQVEsRUFBRSxXQUFXLENBQUMsQ0FBQztJQUNsRCxDQUFDO0lBUUQ7OztPQUdHO0lBQ0gsS0FBSyxDQUFDLE9BQU87UUFFWixLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxHQUN4QztZQUNDLE1BQU0sV0FBVyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFFbEMsSUFBSSxXQUFXLFlBQVksS0FBSyxDQUFDLFlBQVksRUFDN0M7Z0JBQ0MsTUFBTSxnQkFBZ0IsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQztnQkFDckQsTUFBTSxnQkFBZ0IsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsQ0FBQztnQkFDdEQsTUFBTSxZQUFZLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQyxHQUFHLEVBQUUsV0FBVyxDQUFDLElBQUksQ0FBQyxDQUFDO2dCQUMxRSxNQUFNLG9CQUFvQixHQUFHLE1BQU0sY0FBYyxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQztnQkFFckUsSUFBSSxvQkFBb0IsRUFDeEI7b0JBQ0MsTUFBTSxvQkFBb0IsQ0FBQyxPQUFPLEVBQUUsQ0FBQztvQkFDckMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsR0FBRyxvQkFBb0IsQ0FBQztpQkFDckM7YUFDRDtTQUNEO0lBQ0YsQ0FBQztJQUVELE1BQU07SUFDTixJQUFJLENBQUMsVUFBbUIsRUFBRSxTQUFrQixFQUFFLFNBQW1CO1FBRWhFLE1BQU0sV0FBVyxHQUFHLElBQUksQ0FBQyxZQUFZLEVBQUUsQ0FBQztRQUV4QyxRQUFTLENBQUMsQ0FBQSxrQkFBa0I7WUFFM0IsS0FBSyxNQUFNLFVBQVUsSUFBSSxXQUFXO2dCQUNuQyxJQUFJLFVBQVUsWUFBWSxjQUFjO29CQUN2QyxNQUFNLFVBQVUsQ0FBQztRQUNwQixDQUFDO1FBRUQsTUFBTSxTQUFTLEdBQUcsQ0FBQyxNQUFNLEdBQUcsSUFBSSxFQUFFLEVBQUU7WUFFbkMsS0FBSyxNQUFNLFVBQVUsSUFBSSxXQUFXLEVBQ3BDO2dCQUNDLE1BQU0sT0FBTyxHQUFHLFVBQVUsQ0FBQyxJQUFJLEVBQUUsQ0FBQztnQkFDbEMsSUFBSSxPQUFPLEtBQUssSUFBSTtvQkFDbkIsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsR0FBRyxPQUFPLENBQUMsQ0FBQzthQUM1QztRQUNGLENBQUMsQ0FBQztRQUVGLE1BQU0sS0FBSyxHQUFhLEVBQUUsQ0FBQztRQUUzQixJQUFJLFNBQVMsRUFDYjtZQUNDLEtBQUssQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7WUFFZixJQUFJLFNBQVMsRUFDYjtnQkFDQyxLQUFLLENBQUMsSUFBSSxDQUFDLGtCQUFrQixDQUFDLENBQUM7Z0JBQy9CLEtBQUssQ0FBQyxJQUFJLENBQUMsYUFBYSxTQUFTLElBQUksQ0FBQyxDQUFDO2FBQ3ZDO2lCQUVEO2dCQUNDLEtBQUssQ0FBQyxJQUFJLENBQUMscUJBQXFCLFNBQVMsSUFBSSxDQUFDLENBQUM7YUFDL0M7WUFFRCxTQUFTLEVBQUUsQ0FBQztZQUNaLEtBQUssQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7WUFFaEIsSUFBSSxTQUFTLEVBQ2I7Z0JBQ0MsS0FBSyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztnQkFDaEIsS0FBSyxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQzthQUN6QjtZQUVELEtBQUssQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7U0FDZjtRQUVELElBQUksVUFBVSxFQUNkO1lBQ0MsS0FBSyxDQUFDLElBQUksQ0FBQyxtQkFBbUIsVUFBVSxLQUFLLENBQUMsQ0FBQztZQUMvQyxTQUFTLEVBQUUsQ0FBQztZQUNaLEtBQUssQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDaEIsS0FBSyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQztTQUNmO1FBRUQsSUFBSSxDQUFDLFNBQVMsSUFBSSxDQUFDLFVBQVUsRUFDN0I7WUFDQyxTQUFTLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDakIsS0FBSyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQztTQUNmO1FBRUQsT0FBTyxLQUFLLENBQUM7SUFDZCxDQUFDO0lBRUQsTUFBTTtJQUNFLFlBQVk7UUFFbkIsTUFBTSxLQUFLLEdBQVcsRUFBRSxDQUFDO1FBRXpCLEtBQUssTUFBTSxJQUFJLElBQUksSUFBSSxDQUFDLEtBQUssRUFDN0I7WUFDQyxJQUFJLElBQUksWUFBWSxJQUFJO2dCQUN2QixLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO2lCQUViLElBQUksSUFBSSxZQUFZLGNBQWM7Z0JBQ3RDLEtBQUssQ0FBQyxJQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsWUFBWSxFQUFFLENBQUMsQ0FBQztTQUNwQztRQUVELE9BQU8sS0FBSyxDQUFDO0lBQ2QsQ0FBQztDQUNEO0FBRUQsTUFBTTtBQUNOLE1BQU0sSUFBSTtJQUVUOztPQUVHO0lBQ0gsTUFBTSxDQUFDLEtBQUssQ0FBQyxJQUFZO1FBRXhCLE1BQU0sV0FBVyxHQUFHLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUVoQyxNQUFNLFFBQVEsR0FBOEIsS0FBSyxDQUFDLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUNuRSxJQUFJO1lBQ0osSUFBSSxDQUFDLE9BQU87WUFDWixJQUFJLENBQUMsT0FBTyxZQUFZLE1BQU07WUFDOUIsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQztRQUVqQyxJQUFJLENBQUMsUUFBUTtZQUNaLE1BQU0sSUFBSSxLQUFLLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztRQUVuQyxtQ0FBbUM7UUFDbkMsTUFBTSxJQUFJLEdBQVMsSUFBSSxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDdEMsTUFBTSxXQUFXLEdBQXlDLFFBQVEsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDO1FBRTdGLElBQUksV0FBVyxJQUFJLFdBQVcsQ0FBQyxNQUFNLEVBQ3JDO1lBQ0MsS0FBSyxNQUFNLEdBQUcsSUFBSSxNQUFNLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxNQUFNLENBQUMsRUFDakQ7Z0JBQ0MsSUFBSSxHQUFHLElBQUksSUFBSTtvQkFDZCxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsV0FBVyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQzs7b0JBRXBDLE1BQU0sQ0FBQyxjQUFjLENBQUMsSUFBSSxFQUFFLEdBQUcsRUFBRSxFQUFFLEtBQUssRUFBRSxXQUFXLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQzthQUN0RTtTQUNEO1FBRUQsT0FBTyxJQUFJLENBQUM7SUFDYixDQUFDO0lBRUQsTUFBTTtJQUNOLFlBQXNCLElBQVk7UUFFakMsSUFBSSxDQUFDLGFBQWEsR0FBRyxJQUFJLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxFQUFFLEVBQUUsQ0FBQyxDQUFDLE1BQU0sQ0FBQztRQUNuRSxJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQztJQUN6QixDQUFDO0lBUUQsTUFBTTtJQUNOLElBQUksV0FBVyxLQUFLLE9BQU8sSUFBSSxDQUFDLGFBQWEsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUV4RCxNQUFNO0lBQ04sTUFBTSxLQUFLLE9BQU8sS0FBSyxPQUFPLEdBQUcsQ0FBQyxDQUFDLENBQUM7SUFFcEMsTUFBTTtJQUNOLElBQUk7UUFFSCxJQUFJLElBQUksWUFBWSxLQUFLLENBQUMsZUFBZTtZQUN4QyxPQUFPLElBQUksQ0FBQztRQUViLElBQUksSUFBSSxZQUFZLEtBQUssQ0FBQyxVQUFVO1lBQ25DLElBQUksSUFBSSxDQUFDLEVBQUUsS0FBSyxHQUFHO2dCQUNsQixPQUFPLElBQUksQ0FBQztRQUVkLE1BQU0sS0FBSyxHQUFHLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQztRQUU5QyxJQUFJLElBQUksWUFBWSxLQUFLLENBQUMsb0JBQW9CO1lBQzdDLEtBQUssQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7UUFFakIsS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSTtZQUNuQiwyQkFBMkI7YUFDMUIsT0FBTyxDQUFDLGFBQWEsRUFBRSxHQUFHLENBQUM7YUFDM0IsT0FBTyxDQUFDLGNBQWMsRUFBRSxHQUFHLENBQUM7YUFDNUIsT0FBTyxDQUFDLGFBQWEsRUFBRSxHQUFHLENBQUM7WUFDNUIsZ0RBQWdEO2FBQy9DLE9BQU8sQ0FBQyx5RUFBeUUsRUFBRSxFQUFFLENBQUM7WUFDdkYsNENBQTRDO2FBQzNDLE9BQU8sQ0FBQyxnRkFBZ0YsRUFBRSxTQUFTLENBQUMsQ0FBQyxDQUFDO1FBRXhHLG9EQUFvRDtRQUNwRCxJQUFJLElBQUksWUFBWSxLQUFLLENBQUMsb0JBQW9CLElBQUksSUFBSSxDQUFDLElBQUksS0FBSyxHQUFHO1lBQ2xFLEtBQUssQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7UUFFakIsT0FBTyxLQUFLLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0lBQ3ZCLENBQUM7Q0FDRDtBQVVELE1BQU07QUFDTixNQUFlLGNBQWUsU0FBUSxJQUFJO0lBQTFDOztRQUVVLGVBQVUsR0FBVyxFQUFFLENBQUM7SUFDbEMsQ0FBQztDQUFBO0FBR0QsSUFBVSxLQUFLLENBaUdkO0FBakdELFdBQVUsS0FBSztJQUVkLE1BQU07SUFDTixTQUFnQixHQUFHO1FBRWxCLE9BQU8sTUFBTSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxRQUFnQixFQUFFLEVBQUUsQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQztJQUN0RSxDQUFDO0lBSGUsU0FBRyxNQUdsQixDQUFBO0lBRUQsTUFBTTtJQUNOLE1BQWEsVUFBVyxTQUFRLElBQUk7UUFBcEM7O1lBSVUsT0FBRSxHQUFXLEVBQUUsQ0FBQztZQUVoQixTQUFJLEdBQVcsRUFBRSxDQUFDO1FBQzVCLENBQUM7UUFMQSxNQUFNLEtBQUssT0FBTyxLQUFLLE9BQU8sZ0VBQWdFLENBQUMsQ0FBQyxDQUFDO0tBS2pHO0lBUFksZ0JBQVUsYUFPdEIsQ0FBQTtJQUVELE1BQU07SUFDTixNQUFhLFlBQWEsU0FBUSxJQUFJO1FBQXRDOztZQUlVLFNBQUksR0FBVyxFQUFFLENBQUM7UUFDNUIsQ0FBQztRQUhBLE1BQU0sS0FBSyxPQUFPLEtBQUssT0FBTyxrREFBa0QsQ0FBQyxDQUFDLENBQUM7S0FHbkY7SUFMWSxrQkFBWSxlQUt4QixDQUFBO0lBRUQsTUFBTTtJQUNOLE1BQWEsb0JBQXFCLFNBQVEsSUFBSTtRQUU3QyxNQUFNLEtBQUssT0FBTyxLQUFLLE9BQU8sZ0JBQWdCLENBQUMsQ0FBQyxDQUFDO0tBQ2pEO0lBSFksMEJBQW9CLHVCQUdoQyxDQUFBO0lBRUQsTUFBTTtJQUNOLE1BQWEsbUJBQW9CLFNBQVEsSUFBSTtRQUU1QyxNQUFNLEtBQUssT0FBTyxLQUFLLE9BQU8sVUFBVSxDQUFDLENBQUMsQ0FBQztLQUMzQztJQUhZLHlCQUFtQixzQkFHL0IsQ0FBQTtJQUVELE1BQU07SUFDTixNQUFhLG9CQUFxQixTQUFRLElBQUk7UUFFN0MsTUFBTSxLQUFLLE9BQU8sS0FBSyxPQUFPLFFBQVEsQ0FBQyxDQUFDLENBQUM7S0FDekM7SUFIWSwwQkFBb0IsdUJBR2hDLENBQUE7SUFFRCxNQUFNO0lBQ04sTUFBYSxpQkFBa0IsU0FBUSxJQUFJO1FBRTFDLE1BQU0sS0FBSyxPQUFPLEtBQUssT0FBTyxVQUFVLENBQUMsQ0FBQyxDQUFDO0tBQzNDO0lBSFksdUJBQWlCLG9CQUc3QixDQUFBO0lBRUQsTUFBTTtJQUNOLE1BQWEsZUFBZ0IsU0FBUSxJQUFJO1FBRXhDLE1BQU0sS0FBSyxPQUFPLEtBQUssT0FBTyxtQkFBbUIsQ0FBQyxDQUFDLENBQUM7S0FDcEQ7SUFIWSxxQkFBZSxrQkFHM0IsQ0FBQTtJQUVELE1BQU07SUFDTixNQUFhLG9CQUFxQixTQUFRLGNBQWM7UUFFdkQsTUFBTSxLQUFLLE9BQU8sS0FBSyxPQUFPLCtGQUErRixDQUFDLENBQUMsQ0FBQztLQUNoSTtJQUhZLDBCQUFvQix1QkFHaEMsQ0FBQTtJQUVELE1BQU07SUFDTixNQUFhLHdCQUF5QixTQUFRLGNBQWM7UUFFM0QsTUFBTSxLQUFLLE9BQU8sS0FBSyxPQUFPLG1FQUFtRSxDQUFDLENBQUMsQ0FBQztLQUNwRztJQUhZLDhCQUF3QiwyQkFHcEMsQ0FBQTtJQUVELE1BQU07SUFDTixNQUFhLG1CQUFvQixTQUFRLGNBQWM7UUFFdEQsTUFBTSxLQUFLLE9BQU8sS0FBSyxPQUFPLHdEQUF3RCxDQUFDLENBQUMsQ0FBQztLQUN6RjtJQUhZLHlCQUFtQixzQkFHL0IsQ0FBQTtJQUVELE1BQU07SUFDTixNQUFhLHdCQUF5QixTQUFRLGNBQWM7UUFFM0QsTUFBTSxLQUFLLE9BQU8sS0FBSyxPQUFPLG9EQUFvRCxDQUFDLENBQUMsQ0FBQztLQUNyRjtJQUhZLDhCQUF3QiwyQkFHcEMsQ0FBQTtJQUVELE1BQU07SUFDTixNQUFhLG1CQUFvQixTQUFRLGNBQWM7UUFFdEQsTUFBTSxLQUFLLE9BQU8sS0FBSyxPQUFPLDZDQUE2QyxDQUFDLENBQUMsQ0FBQztLQUM5RTtJQUhZLHlCQUFtQixzQkFHL0IsQ0FBQTtJQUVELE1BQU07SUFDTixNQUFhLG9CQUFxQixTQUFRLGNBQWM7UUFFdkQsTUFBTSxLQUFLLE9BQU8sS0FBSyxPQUFPLGdEQUFnRCxDQUFDLENBQUMsQ0FBQztLQUNqRjtJQUhZLDBCQUFvQix1QkFHaEMsQ0FBQTtJQUVELE1BQU07SUFDTixNQUFhLFNBQVUsU0FBUSxJQUFJO1FBRWxDLE1BQU0sS0FBSyxPQUFPLEtBQUssT0FBTyxJQUFJLENBQUMsQ0FBQyxDQUFDO0tBQ3JDO0lBSFksZUFBUyxZQUdyQixDQUFBO0FBQ0YsQ0FBQyxFQWpHUyxLQUFLLEtBQUwsS0FBSyxRQWlHZDtBQUdELE1BQU07QUFDTixNQUFNLFFBQVEsR0FBRyxDQUFDLElBQVksRUFBRSxJQUFJLEdBQUcsTUFBTSxFQUFFLEVBQUUsQ0FDaEQsSUFBSSxPQUFPLENBQXlCLENBQUMsT0FBTyxFQUFFLEdBQUcsRUFBRSxFQUFFO0lBRXBELEVBQUUsQ0FBQyxRQUFRLENBQUMsSUFBSSxFQUFFLElBQUksRUFBRSxDQUFDLEtBQVksRUFBRSxJQUFZLEVBQUUsRUFBRTtRQUV0RCxJQUFJLEtBQUs7WUFDUixPQUFPLENBQUMsQ0FBQyxFQUFFLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQzs7WUFFckIsT0FBTyxDQUFDLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUM7SUFDeEIsQ0FBQyxDQUFDLENBQUM7QUFDSixDQUFDLENBQUMsQ0FBQztBQWVKLGlGQUFpRjtBQUNqRixNQUFNLGVBQWUsR0FBRyxDQUFDLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQztBQUd4QyxLQUFLLFVBQVUsTUFBTSxDQUFDLE9BQXdCO0lBRTdDLDhEQUE4RDtJQUM5RCxNQUFNLGVBQWUsR0FBRyxDQUFDLEdBQUcsRUFBRTtRQUU3QixJQUFJLGVBQWUsRUFDbkI7WUFDQyxNQUFNLElBQUksR0FBYSxPQUFPLENBQUMsSUFBSSxDQUFDO1lBRXBDLElBQUksSUFBSSxDQUFDLE1BQU0sR0FBRyxDQUFDO2dCQUNsQixNQUFNLElBQUksS0FBSyxDQUFDLG1DQUFtQyxDQUFDLENBQUM7WUFFdEQsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3ZCLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQztnQkFDMUIsTUFBTSxJQUFJLEtBQUssQ0FDZCxtQ0FBbUM7b0JBQ25DLDhCQUE4QixDQUFDLENBQUM7WUFFbEMsT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1NBQzVCO1FBRUQsT0FBTyxFQUFFLENBQUM7SUFDWCxDQUFDLENBQUMsRUFBRSxDQUFDO0lBRUwsOEVBQThFO0lBQzlFLE1BQU0sYUFBYSxHQUFHLENBQUMsTUFBYyxFQUFFLEVBQUUsQ0FBQyxlQUFlLENBQUMsQ0FBQztRQUMxRCxJQUFJLENBQUMsT0FBTyxDQUFDLGVBQWUsRUFBRSxNQUFNLENBQUMsQ0FBQyxDQUFDO1FBQ3ZDLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUM7SUFFdEIsNkVBQTZFO0lBQzdFLFNBQVMsWUFBWSxDQUFhLElBQTBCLEVBQUUsUUFBUSxHQUFHLEtBQUs7UUFFN0UsSUFBSSxlQUFlLEVBQ25CO1lBQ0MsSUFBSSxDQUFDLE9BQU8sSUFBSSxPQUFPLE9BQU8sS0FBSyxRQUFRO2dCQUMxQyxNQUFNLElBQUksS0FBSyxDQUFDLGlEQUFpRCxDQUFDLENBQUM7WUFFcEUsT0FBbUIsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO1NBQ2pDO1FBRUQsTUFBTSxXQUFXLEdBQWEsT0FBTyxDQUFDLElBQUksQ0FBQztRQUMzQyxNQUFNLE1BQU0sR0FBRyxLQUFLLElBQUksR0FBRyxDQUFDO1FBQzVCLE1BQU0sZ0JBQWdCLEdBQUcsV0FBVyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztRQUV6RSxJQUFJLGdCQUFnQixFQUNwQjtZQUNDLE1BQU0sUUFBUSxHQUFHLGdCQUFnQixDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUM7WUFDOUQsSUFBSSxRQUFRO2dCQUNYLE9BQW1CLFFBQVEsQ0FBQztZQUU3QixNQUFNLElBQUksS0FBSyxDQUFDLFlBQVksTUFBTSxrQkFBa0IsQ0FBQyxDQUFDO1NBQ3REO1FBRUQsSUFBSSxRQUFRO1lBQ1gsTUFBTSxJQUFJLEtBQUssQ0FBQyw2QkFBNkIsTUFBTSxJQUFJLENBQUMsQ0FBQztJQUMzRCxDQUFDO0lBRUQsTUFBTSxVQUFVLEdBQUcsWUFBWSxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQztJQUM1QyxNQUFNLFdBQVcsR0FBRyxZQUFZLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxDQUFDO0lBQzlDLE1BQU0sVUFBVSxHQUFHLFlBQVksQ0FBQyxXQUFXLENBQUMsQ0FBQztJQUM3QyxNQUFNLFNBQVMsR0FBRyxZQUFZLENBQVUsV0FBVyxDQUFDLENBQUM7SUFDckQsTUFBTSxXQUFXLEdBQUcsWUFBWSxDQUFDLFFBQVEsQ0FBQyxDQUFDO0lBQzNDLE1BQU0sY0FBYyxHQUFHLFlBQVksQ0FBQyxRQUFRLENBQUMsQ0FBQztJQUM5QyxNQUFNLGNBQWMsR0FBRyxZQUFZLENBQUMsUUFBUSxDQUFDLENBQUM7SUFFOUMsTUFBTSxRQUFRLEdBQWEsS0FBSyxDQUFDLE9BQU8sQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDO1FBQ3RELFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxXQUFXLENBQUMsQ0FBQztJQUU3QixNQUFNLFdBQVcsR0FBYSxLQUFLLENBQUMsT0FBTyxDQUFDLGNBQWMsQ0FBQyxDQUFDLENBQUM7UUFDNUQsY0FBYyxDQUFDLENBQUMsQ0FBQyxDQUFDLGNBQWMsQ0FBQyxDQUFDO0lBRW5DLE1BQU0sV0FBVyxHQUFhLEtBQUssQ0FBQyxPQUFPLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQztRQUM1RCxjQUFjLENBQUMsQ0FBQyxDQUFDLENBQUMsY0FBYyxDQUFDLENBQUM7SUFFbkMsTUFBTSxrQkFBa0IsR0FBRyxNQUFNLGNBQWMsQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUM7SUFDaEYsSUFBSSxDQUFDLGtCQUFrQjtRQUN0QixNQUFNLElBQUksS0FBSyxDQUFDLCtCQUErQixHQUFHLFVBQVUsQ0FBQyxDQUFDO0lBRS9ELE1BQU0sa0JBQWtCLENBQUMsT0FBTyxFQUFFLENBQUM7SUFFbkMsTUFBTSxlQUFlLEdBQUcsa0JBQWtCLENBQUMsSUFBSSxDQUM5QyxXQUFXLEVBQ1gsVUFBVSxFQUNWLFNBQVMsQ0FBQyxDQUFDO0lBRVosZUFBZSxDQUFDLE9BQU8sQ0FBQyxHQUFHLFdBQVcsQ0FBQyxDQUFDO0lBQ3hDLGVBQWUsQ0FBQyxJQUFJLENBQUMsR0FBRyxXQUFXLENBQUMsQ0FBQztJQUVyQyxJQUFJLFdBQVcsQ0FBQyxNQUFNO1FBQ3JCLGVBQWUsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7SUFFMUIsS0FBSyxNQUFNLE9BQU8sSUFBSSxRQUFRLEVBQzlCO1FBQ0MsRUFBRSxDQUFDLGFBQWEsQ0FDZixhQUFhLENBQUMsT0FBTyxDQUFDLEVBQ3RCLGVBQWUsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQzFCLE1BQU0sQ0FBQyxDQUFDO0tBQ1Q7QUFDRixDQUFDO0FBRUQsSUFBSSxlQUFlO0lBQ2xCLE9BQU8sTUFBTSxLQUFLLFFBQVEsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLEdBQUcsTUFBTSxDQUFDLENBQUM7O0lBRXhELE1BQU0sRUFBRSxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiXG4vLyBQb29yIG1hbnMgbm9kZSBkZWZpbml0aW9ucy5cbmRlY2xhcmUgY29uc3QgcHJvY2VzczogYW55O1xuZGVjbGFyZSBjb25zdCByZXF1aXJlOiAobW9kdWxlTmFtZTogc3RyaW5nKSA9PiBhbnk7XG5kZWNsYXJlIGNvbnN0IG1vZHVsZTogYW55O1xuY29uc3QgRnMgPSByZXF1aXJlKFwiZnNcIik7XG5jb25zdCBQYXRoID0gcmVxdWlyZShcInBhdGhcIik7XG5cblxuLyoqICovXG5pbnRlcmZhY2UgTGluZUFycmF5IGV4dGVuZHMgQXJyYXk8TGluZSB8IExpbmVBcnJheT4geyB9XG5cblxuLyoqICovXG5jbGFzcyBEZWZpbml0aW9uRmlsZVxue1xuXHQvKiogKi9cblx0c3RhdGljIGFzeW5jIHJlYWQocGF0aDogc3RyaW5nKVxuXHR7XG5cdFx0bGV0IGZpbGVQYXRoID0gcGF0aDtcblx0XHRcblx0XHRpZiAoIWZpbGVQYXRoLmVuZHNXaXRoKFwiLmQudHNcIikpXG5cdFx0e1xuXHRcdFx0aWYgKGZpbGVQYXRoLmVuZHNXaXRoKFwiLmpzXCIpIHx8IGZpbGVQYXRoLmVuZHNXaXRoKFwiLnRzXCIpKVxuXHRcdFx0XHRmaWxlUGF0aCA9IGZpbGVQYXRoLnNsaWNlKDAsIC0zKTtcblx0XHRcdFxuXHRcdFx0ZmlsZVBhdGggKz0gXCIuZC50c1wiO1xuXHRcdH1cblx0XHRcblx0XHRpZiAoIWZpbGVQYXRoLnN0YXJ0c1dpdGgoXCIvXCIpKVxuXHRcdFx0dGhyb3cgbmV3IEVycm9yKGZpbGVQYXRoICsgXCIgaXMgbm90IGFic29sdXRlLlwiKTtcblx0XHRcblx0XHRjb25zdCBbZmlsZUNvbnRlbnRzLCBlcnJvcl0gPSBhd2FpdCByZWFkRmlsZShmaWxlUGF0aCk7XG5cdFx0XG5cdFx0aWYgKGVycm9yKVxuXHRcdFx0dGhyb3cgZXJyb3I7XG5cdFx0XG5cdFx0aWYgKGZpbGVDb250ZW50cyA9PT0gbnVsbClcblx0XHRcdHJldHVybiBudWxsO1xuXHRcdFxuXHRcdGNvbnN0IHRleHRMaW5lcyA9IGZpbGVDb250ZW50c1xuXHRcdFx0LnNwbGl0KC8oXFxyKT9cXG4vZylcblx0XHRcdC5maWx0ZXIocyA9PiAhIXMgJiYgISFzLnRyaW0oKSk7XG5cdFx0XG5cdFx0Y29uc3QgcGFyc2VkTGluZXM6IExpbmVbXSA9IFtdO1xuXHRcdFxuXHRcdGZvciAoY29uc3QgdGV4dExpbmUgb2YgdGV4dExpbmVzKVxuXHRcdHtcblx0XHRcdGNvbnN0IHBhcnNlZExpbmUgPSBMaW5lLnBhcnNlKHRleHRMaW5lKTtcblx0XHRcdHBhcnNlZExpbmVzLnB1c2gocGFyc2VkTGluZSk7XG5cdFx0fVxuXHRcdFxuXHRcdHJldHVybiBuZXcgRGVmaW5pdGlvbkZpbGUoZmlsZVBhdGgsIHBhcnNlZExpbmVzKTtcblx0fVxuXHRcblx0LyoqICovXG5cdHByaXZhdGUgY29uc3RydWN0b3IoXG5cdFx0cHJpdmF0ZSBvcmlnaW5QYXRoOiBzdHJpbmcsXG5cdFx0cHJpdmF0ZSBsaW5lczogKExpbmV8RGVmaW5pdGlvbkZpbGUpW10pXG5cdHsgfVxuXHRcblx0LyoqXG5cdCAqIEdvZXMgdGhyb3VnaCB0aGUgZW50aXJlIGxpbmVzIHByb3BlcnR5IGFuZCByZXBsYWNlc1xuXHQgKiBhbGwgcmUtZXhwb3J0IHN0YXRlbWVudHMgaW50byBEZWZpbml0aW9uRmlsZSBvYmplY3RzLlxuXHQgKi9cblx0YXN5bmMgcmVzb2x2ZSgpXG5cdHtcblx0XHRmb3IgKGxldCBpID0gLTE7ICsraSA8IHRoaXMubGluZXMubGVuZ3RoOylcblx0XHR7XG5cdFx0XHRjb25zdCBjdXJyZW50TGluZSA9IHRoaXMubGluZXNbaV07XG5cdFx0XHRcblx0XHRcdGlmIChjdXJyZW50TGluZSBpbnN0YW5jZW9mIExpbmVzLlJlRXhwb3J0TGluZSlcblx0XHRcdHtcblx0XHRcdFx0Y29uc3Qgb3JpZ2luUGF0aFBhcnNlZCA9IFBhdGgucGFyc2UodGhpcy5vcmlnaW5QYXRoKTtcblx0XHRcdFx0Y29uc3QgdGFyZ2V0UGF0aFBhcnNlZCA9IFBhdGgucGFyc2UoY3VycmVudExpbmUucGF0aCk7XG5cdFx0XHRcdGNvbnN0IHJlc29sdmVkUGF0aCA9IFBhdGgucmVzb2x2ZShvcmlnaW5QYXRoUGFyc2VkLmRpciwgY3VycmVudExpbmUucGF0aCk7XG5cdFx0XHRcdGNvbnN0IG5lc3RlZERlZmluaXRpb25GaWxlID0gYXdhaXQgRGVmaW5pdGlvbkZpbGUucmVhZChyZXNvbHZlZFBhdGgpO1xuXHRcdFx0XHRcblx0XHRcdFx0aWYgKG5lc3RlZERlZmluaXRpb25GaWxlKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0YXdhaXQgbmVzdGVkRGVmaW5pdGlvbkZpbGUucmVzb2x2ZSgpO1xuXHRcdFx0XHRcdHRoaXMubGluZXNbaV0gPSBuZXN0ZWREZWZpbml0aW9uRmlsZTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblx0fVxuXHRcblx0LyoqICovXG5cdGVtaXQobW9kdWxlTmFtZT86IHN0cmluZywgbmFtZXNwYWNlPzogc3RyaW5nLCBnbG9iYWxpemU/OiBib29sZWFuKVxuXHR7XG5cdFx0Y29uc3QgbGluZU9iamVjdHMgPSB0aGlzLmNvbGxlY3RMaW5lcygpO1xuXHRcdFxuXHRcdGZ1bmN0aW9uICplYWNoSWRlbnRpZmllckxpbmUoKVxuXHRcdHtcblx0XHRcdGZvciAoY29uc3QgbGluZU9iamVjdCBvZiBsaW5lT2JqZWN0cylcblx0XHRcdFx0aWYgKGxpbmVPYmplY3QgaW5zdGFuY2VvZiBJZGVudGlmaWVyTGluZSlcblx0XHRcdFx0XHR5aWVsZCBsaW5lT2JqZWN0O1xuXHRcdH1cblx0XHRcblx0XHRjb25zdCBlbWl0TGluZXMgPSAoaW5kZW50ID0gdHJ1ZSkgPT5cblx0XHR7XG5cdFx0XHRmb3IgKGNvbnN0IGxpbmVPYmplY3Qgb2YgbGluZU9iamVjdHMpXG5cdFx0XHR7XG5cdFx0XHRcdGNvbnN0IGVtaXR0ZWQgPSBsaW5lT2JqZWN0LmVtaXQoKTtcblx0XHRcdFx0aWYgKGVtaXR0ZWQgIT09IG51bGwpXG5cdFx0XHRcdFx0bGluZXMucHVzaCgoaW5kZW50ID8gXCJcXHRcIiA6IFwiXCIpICsgZW1pdHRlZCk7XG5cdFx0XHR9XG5cdFx0fTtcblx0XHRcblx0XHRjb25zdCBsaW5lczogc3RyaW5nW10gPSBbXTtcblx0XHRcblx0XHRpZiAobmFtZXNwYWNlKVxuXHRcdHtcblx0XHRcdGxpbmVzLnB1c2goXCJcIik7XG5cdFx0XHRcblx0XHRcdGlmIChnbG9iYWxpemUpXG5cdFx0XHR7XG5cdFx0XHRcdGxpbmVzLnB1c2goXCJkZWNsYXJlIGdsb2JhbCB7XCIpO1xuXHRcdFx0XHRsaW5lcy5wdXNoKGBuYW1lc3BhY2UgJHtuYW1lc3BhY2V9IHtgKTtcblx0XHRcdH1cblx0XHRcdGVsc2Vcblx0XHRcdHtcblx0XHRcdFx0bGluZXMucHVzaChgZGVjbGFyZSBuYW1lc3BhY2UgJHtuYW1lc3BhY2V9IHtgKTtcblx0XHRcdH1cblx0XHRcdFxuXHRcdFx0ZW1pdExpbmVzKCk7XG5cdFx0XHRsaW5lcy5wdXNoKFwifVwiKTtcblx0XHRcdFxuXHRcdFx0aWYgKGdsb2JhbGl6ZSlcblx0XHRcdHtcblx0XHRcdFx0bGluZXMucHVzaChcIn1cIik7XG5cdFx0XHRcdGxpbmVzLnB1c2goXCJleHBvcnQgeyB9XCIpO1xuXHRcdFx0fVxuXHRcdFx0XG5cdFx0XHRsaW5lcy5wdXNoKFwiXCIpO1xuXHRcdH1cblx0XHRcblx0XHRpZiAobW9kdWxlTmFtZSlcblx0XHR7XG5cdFx0XHRsaW5lcy5wdXNoKGBkZWNsYXJlIG1vZHVsZSBcIiR7bW9kdWxlTmFtZX1cIiB7YCk7XG5cdFx0XHRlbWl0TGluZXMoKTtcblx0XHRcdGxpbmVzLnB1c2goXCJ9XCIpO1xuXHRcdFx0bGluZXMucHVzaChcIlwiKTtcblx0XHR9XG5cdFx0XG5cdFx0aWYgKCFuYW1lc3BhY2UgJiYgIW1vZHVsZU5hbWUpXG5cdFx0e1xuXHRcdFx0ZW1pdExpbmVzKGZhbHNlKTtcblx0XHRcdGxpbmVzLnB1c2goXCJcIik7XG5cdFx0fVxuXHRcdFxuXHRcdHJldHVybiBsaW5lcztcblx0fVxuXHRcblx0LyoqICovXG5cdHByaXZhdGUgY29sbGVjdExpbmVzKClcblx0e1xuXHRcdGNvbnN0IGxpbmVzOiBMaW5lW10gPSBbXTtcblx0XHRcblx0XHRmb3IgKGNvbnN0IGl0ZW0gb2YgdGhpcy5saW5lcylcblx0XHR7XG5cdFx0XHRpZiAoaXRlbSBpbnN0YW5jZW9mIExpbmUpXG5cdFx0XHRcdGxpbmVzLnB1c2goaXRlbSk7XG5cdFx0XHRcblx0XHRcdGVsc2UgaWYgKGl0ZW0gaW5zdGFuY2VvZiBEZWZpbml0aW9uRmlsZSlcblx0XHRcdFx0bGluZXMucHVzaCguLi5pdGVtLmNvbGxlY3RMaW5lcygpKTtcblx0XHR9XG5cdFx0XG5cdFx0cmV0dXJuIGxpbmVzO1xuXHR9XG59XG5cbi8qKiAqL1xuY2xhc3MgTGluZVxue1xuXHQvKipcblx0ICogRmFjdG9yeSBtZXRob2QgdGhhdCByZXR1cm5zIGEgbGluZSBmcm9tIHRoZSBzcGVjaWZpZWQgdGV4dC5cblx0ICovXG5cdHN0YXRpYyBwYXJzZSh0ZXh0OiBzdHJpbmcpXG5cdHtcblx0XHRjb25zdCB0ZXh0VHJpbW1lZCA9IHRleHQudHJpbSgpO1xuXHRcdFxuXHRcdGNvbnN0IGxpbmVDdG9yOiAodHlwZW9mIExpbmUpIHwgdW5kZWZpbmVkID0gTGluZXMuYWxsKCkuZmluZChjdG9yID0+XG5cdFx0XHRjdG9yICYmIFxuXHRcdFx0Y3Rvci5wYXR0ZXJuICYmXG5cdFx0XHRjdG9yLnBhdHRlcm4gaW5zdGFuY2VvZiBSZWdFeHAgJiYgXG5cdFx0XHRjdG9yLnBhdHRlcm4udGVzdCh0ZXh0VHJpbW1lZCkpO1xuXHRcdFxuXHRcdGlmICghbGluZUN0b3IpXG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJJbnRlcm5hbCBlcnJvclwiKTtcblx0XHRcblx0XHQvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbmV3LWNhcFxuXHRcdGNvbnN0IGxpbmU6IExpbmUgPSBuZXcgbGluZUN0b3IodGV4dCk7XG5cdFx0Y29uc3QgbWF0Y2hPYmplY3QgPSA8UmVnRXhwRXhlY0FycmF5ICYgeyBncm91cHM6IG9iamVjdCB9PmxpbmVDdG9yLnBhdHRlcm4uZXhlYyh0ZXh0VHJpbW1lZCk7XG5cdFx0XG5cdFx0aWYgKG1hdGNoT2JqZWN0ICYmIG1hdGNoT2JqZWN0Lmdyb3Vwcylcblx0XHR7XG5cdFx0XHRmb3IgKGNvbnN0IGtleSBvZiBPYmplY3Qua2V5cyhtYXRjaE9iamVjdC5ncm91cHMpKVxuXHRcdFx0e1xuXHRcdFx0XHRpZiAoa2V5IGluIGxpbmUpXG5cdFx0XHRcdFx0bGluZVtrZXldID0gbWF0Y2hPYmplY3QuZ3JvdXBzW2tleV07XG5cdFx0XHRcdGVsc2Vcblx0XHRcdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkobGluZSwga2V5LCB7IHZhbHVlOiBtYXRjaE9iamVjdC5ncm91cHNba2V5XSB9KTtcblx0XHRcdH1cblx0XHR9XG5cdFx0XG5cdFx0cmV0dXJuIGxpbmU7XG5cdH1cblx0XG5cdC8qKiAqL1xuXHRwcm90ZWN0ZWQgY29uc3RydWN0b3IodGV4dDogc3RyaW5nKVxuXHR7XG5cdFx0dGhpcy5sZWFkaW5nU3BhY2VzID0gdGV4dC5sZW5ndGggLSB0ZXh0LnJlcGxhY2UoL15cXHMrLywgXCJcIikubGVuZ3RoO1xuXHRcdHRoaXMudGV4dCA9IHRleHQudHJpbSgpO1xuXHR9XG5cdFxuXHQvKiogKi9cblx0cmVhZG9ubHkgdGV4dDogc3RyaW5nO1xuXHRcblx0LyoqICovXG5cdHJlYWRvbmx5IGxlYWRpbmdTcGFjZXM6IG51bWJlcjtcblx0XG5cdC8qKiAqL1xuXHRnZXQgaW5kZW50RGVwdGgoKSB7IHJldHVybiB0aGlzLmxlYWRpbmdTcGFjZXMgLyA0IHwgMDsgfVxuXHRcblx0LyoqICovXG5cdHN0YXRpYyBnZXQgcGF0dGVybigpIHsgcmV0dXJuIC8uLzsgfVxuXHRcblx0LyoqICovXG5cdGVtaXQoKVxuXHR7XG5cdFx0aWYgKHRoaXMgaW5zdGFuY2VvZiBMaW5lcy5FbXB0eUV4cG9ydExpbmUpXG5cdFx0XHRyZXR1cm4gbnVsbDtcblx0XHRcblx0XHRpZiAodGhpcyBpbnN0YW5jZW9mIExpbmVzLkltcG9ydExpbmUpXG5cdFx0XHRpZiAodGhpcy5hcyA9PT0gXCJYXCIpXG5cdFx0XHRcdHJldHVybiBudWxsO1xuXHRcdFxuXHRcdGNvbnN0IHBhcnRzID0gW1wiXFx0XCIucmVwZWF0KHRoaXMuaW5kZW50RGVwdGgpXTtcblx0XHRcblx0XHRpZiAodGhpcyBpbnN0YW5jZW9mIExpbmVzLkRvY0NvbW1lbnRMaW5lTWlkZGxlKVxuXHRcdFx0cGFydHMucHVzaChcIiBcIik7XG5cdFx0XG5cdFx0cGFydHMucHVzaCh0aGlzLnRleHRcblx0XHRcdC8vIFJlbW92ZSB0aGUgWC4gcmVmZXJlbmNlc1xuXHRcdFx0LnJlcGxhY2UoLzxYXFwuKD89XFx3KS9nLCBcIjxcIilcblx0XHRcdC5yZXBsYWNlKC9cXChYXFwuKD89XFx3KS9nLCBcIihcIilcblx0XHRcdC5yZXBsYWNlKC8gWFxcLig/PVxcdykvZywgXCIgXCIpXG5cdFx0XHQvLyBSZW1vdmUgZGVjbGFyZSBrZXl3b3JkIG9uIG5vbi1leHBvcnRlZCBtZW1iZXJcblx0XHRcdC5yZXBsYWNlKC9eZGVjbGFyZSAoPz1hYnN0cmFjdHxjbGFzc3xuYW1lc3BhY2V8ZnVuY3Rpb258ZW51bXx0eXBlfGNvbnN0fGxldHx2YXIpL2csIFwiXCIpXG5cdFx0XHQvLyBSZW1vdmUgZGVjbGFyZSBrZXl3b3JkIG9uIGV4cG9ydGVkIG1lbWJlclxuXHRcdFx0LnJlcGxhY2UoL15leHBvcnQgZGVjbGFyZSAoPz1hYnN0cmFjdHxjbGFzc3xuYW1lc3BhY2V8ZnVuY3Rpb258ZW51bXx0eXBlfGNvbnN0fGxldHx2YXIpL2csIFwiZXhwb3J0IFwiKSk7XG5cdFx0XG5cdFx0Ly8gQXBwZW5kIGEgc3BhY2UgYWZ0ZXIgdGhlICogdG8gZml4IGVkaXRvciBjb2xvcmluZ1xuXHRcdGlmICh0aGlzIGluc3RhbmNlb2YgTGluZXMuRG9jQ29tbWVudExpbmVNaWRkbGUgJiYgdGhpcy50ZXh0ID09PSBcIipcIilcblx0XHRcdHBhcnRzLnB1c2goXCIgXCIpO1xuXHRcdFxuXHRcdHJldHVybiBwYXJ0cy5qb2luKFwiXCIpO1xuXHR9XG59XG5cblxuLyoqICovXG5leHBvcnQgaW50ZXJmYWNlIElkZW50aWZpZXJEZWNsYXJhdGlvbkxpbmVcbntcblx0aWRlbnRpZmllcjogc3RyaW5nO1xufVxuXG5cbi8qKiAqL1xuYWJzdHJhY3QgY2xhc3MgSWRlbnRpZmllckxpbmUgZXh0ZW5kcyBMaW5lXG57XG5cdHJlYWRvbmx5IGlkZW50aWZpZXI6IHN0cmluZyA9IFwiXCI7XG59XG5cblxubmFtZXNwYWNlIExpbmVzXG57XG5cdC8qKiAqL1xuXHRleHBvcnQgZnVuY3Rpb24gYWxsKCk6ICh0eXBlb2YgTGluZSlbXVxuXHR7XG5cdFx0cmV0dXJuIE9iamVjdC5rZXlzKExpbmVzKS5tYXAoKGN0b3JOYW1lOiBzdHJpbmcpID0+IExpbmVzW2N0b3JOYW1lXSk7XG5cdH1cblx0XG5cdC8qKiAqL1xuXHRleHBvcnQgY2xhc3MgSW1wb3J0TGluZSBleHRlbmRzIExpbmVcblx0e1xuXHRcdHN0YXRpYyBnZXQgcGF0dGVybigpIHsgcmV0dXJuIC9eaW1wb3J0IFxcKiBhcyAoPzxhcz5cXHcrKSBmcm9tICgnfFwiKSg/PHBhdGg+W1xcLlxcL1xcd1xcZF0rKSgnfFwiKTskLzsgfVxuXHRcdFxuXHRcdHJlYWRvbmx5IGFzOiBzdHJpbmcgPSBcIlwiO1xuXHRcdFxuXHRcdHJlYWRvbmx5IHBhdGg6IHN0cmluZyA9IFwiXCI7XG5cdH1cblxuXHQvKiogKi9cblx0ZXhwb3J0IGNsYXNzIFJlRXhwb3J0TGluZSBleHRlbmRzIExpbmVcblx0e1xuXHRcdHN0YXRpYyBnZXQgcGF0dGVybigpIHsgcmV0dXJuIC9eZXhwb3J0IFxcKiBmcm9tICgnfFwiKSg/PHBhdGg+W1xcLlxcL1xcd1xcZF0rKSgnfFwiKTskLzsgfVxuXHRcdFxuXHRcdHJlYWRvbmx5IHBhdGg6IHN0cmluZyA9IFwiXCI7XG5cdH1cblxuXHQvKiogKi9cblx0ZXhwb3J0IGNsYXNzIERvY0NvbW1lbnRMaW5lU2luZ2xlIGV4dGVuZHMgTGluZVxuXHR7XG5cdFx0c3RhdGljIGdldCBwYXR0ZXJuKCkgeyByZXR1cm4gL15cXC9cXCpcXCouKlxcKlxcLyQvOyB9XG5cdH1cblxuXHQvKiogKi9cblx0ZXhwb3J0IGNsYXNzIERvY0NvbW1lbnRMaW5lQmVnaW4gZXh0ZW5kcyBMaW5lXG5cdHtcblx0XHRzdGF0aWMgZ2V0IHBhdHRlcm4oKSB7IHJldHVybiAvXlxcL1xcKlxcKiQvOyB9XG5cdH1cblxuXHQvKiogKi9cblx0ZXhwb3J0IGNsYXNzIERvY0NvbW1lbnRMaW5lTWlkZGxlIGV4dGVuZHMgTGluZVxuXHR7XG5cdFx0c3RhdGljIGdldCBwYXR0ZXJuKCkgeyByZXR1cm4gL15cXCouKiQvOyB9XG5cdH1cblx0XG5cdC8qKiAqL1xuXHRleHBvcnQgY2xhc3MgRG9jQ29tbWVudExpbmVFbmQgZXh0ZW5kcyBMaW5lXG5cdHtcblx0XHRzdGF0aWMgZ2V0IHBhdHRlcm4oKSB7IHJldHVybiAvXi4rXFwqXFwvJC87IH1cblx0fVxuXHRcblx0LyoqICovXG5cdGV4cG9ydCBjbGFzcyBFbXB0eUV4cG9ydExpbmUgZXh0ZW5kcyBMaW5lXG5cdHtcblx0XHRzdGF0aWMgZ2V0IHBhdHRlcm4oKSB7IHJldHVybiAvXmV4cG9ydFxccyp7XFxzKn07JC87IH1cblx0fVxuXHRcblx0LyoqICovXG5cdGV4cG9ydCBjbGFzcyBDbGFzc0RlY2xhcmF0aW9uTGluZSBleHRlbmRzIElkZW50aWZpZXJMaW5lXG5cdHtcblx0XHRzdGF0aWMgZ2V0IHBhdHRlcm4oKSB7IHJldHVybiAvXihleHBvcnQgKT9kZWNsYXJlKGFic3RyYWN0ICk/IGNsYXNzICg/PGlkZW50aWZpZXI+W1xcd10rKSggKGV4dGVuZHN8aW1wbGVtZW50cykgW1xcd1xcLixdKyk/IHskLzsgfVxuXHR9XG5cblx0LyoqICovXG5cdGV4cG9ydCBjbGFzcyBJbnRlcmZhY2VEZWNsYXJhdGlvbkxpbmUgZXh0ZW5kcyBJZGVudGlmaWVyTGluZVxuXHR7XG5cdFx0c3RhdGljIGdldCBwYXR0ZXJuKCkgeyByZXR1cm4gL14oZXhwb3J0ICk/aW50ZXJmYWNlICg/PGlkZW50aWZpZXI+W1xcd10rKShcXHNleHRlbmRzIFtcXHcsXFxzXSspPyB7JC87IH1cblx0fVxuXHRcblx0LyoqICovXG5cdGV4cG9ydCBjbGFzcyBFbnVtRGVjbGFyYXRpb25MaW5lIGV4dGVuZHMgSWRlbnRpZmllckxpbmVcblx0e1xuXHRcdHN0YXRpYyBnZXQgcGF0dGVybigpIHsgcmV0dXJuIC9eKGV4cG9ydCApP2RlY2xhcmUoIGNvbnN0KT8gZW51bSAoPzxpZGVudGlmaWVyPlxcdyspIHskLzsgfVxuXHR9XG5cblx0LyoqICovXG5cdGV4cG9ydCBjbGFzcyBOYW1lc3BhY2VEZWNsYXJhdGlvbkxpbmUgZXh0ZW5kcyBJZGVudGlmaWVyTGluZVxuXHR7XG5cdFx0c3RhdGljIGdldCBwYXR0ZXJuKCkgeyByZXR1cm4gL14oZXhwb3J0ICk/ZGVjbGFyZSBuYW1lc3BhY2UgKD88aWRlbnRpZmllcj5cXHcrKSB7JC87IH1cblx0fVxuXHRcblx0LyoqICovXG5cdGV4cG9ydCBjbGFzcyBUeXBlRGVjbGFyYXRpb25MaW5lIGV4dGVuZHMgSWRlbnRpZmllckxpbmVcblx0e1xuXHRcdHN0YXRpYyBnZXQgcGF0dGVybigpIHsgcmV0dXJuIC9eKGV4cG9ydCApP2RlY2xhcmUgdHlwZSAoPzxpZGVudGlmaWVyPlxcdyspJC87IH1cblx0fVxuXHRcblx0LyoqICovXG5cdGV4cG9ydCBjbGFzcyBDb25zdERlY2xhcmF0aW9uTGluZSBleHRlbmRzIElkZW50aWZpZXJMaW5lXG5cdHtcblx0XHRzdGF0aWMgZ2V0IHBhdHRlcm4oKSB7IHJldHVybiAvXihleHBvcnQgKT9kZWNsYXJlIGNvbnN0ICg/PGlkZW50aWZpZXI+XFx3KykuKiQvOyB9XG5cdH1cblx0XG5cdC8qKiAqL1xuXHRleHBvcnQgY2xhc3MgT3RoZXJMaW5lIGV4dGVuZHMgTGluZVxuXHR7XG5cdFx0c3RhdGljIGdldCBwYXR0ZXJuKCkgeyByZXR1cm4gLy4qLzsgfVxuXHR9XG59XG5cblxuLyoqICovXG5jb25zdCByZWFkRmlsZSA9IChwYXRoOiBzdHJpbmcsIG9wdHMgPSBcInV0ZjhcIikgPT5cblx0bmV3IFByb21pc2U8W3N0cmluZywgRXJyb3IgfCBudWxsXT4oKHJlc29sdmUsIHJlaikgPT5cblx0e1xuXHRcdEZzLnJlYWRGaWxlKHBhdGgsIG9wdHMsIChlcnJvcjogRXJyb3IsIGRhdGE6IHN0cmluZykgPT5cblx0XHR7XG5cdFx0XHRpZiAoZXJyb3IpXG5cdFx0XHRcdHJlc29sdmUoW1wiXCIsIGVycm9yXSk7XG5cdFx0XHRlbHNlXG5cdFx0XHRcdHJlc29sdmUoW2RhdGEsIG51bGxdKTtcblx0XHR9KTtcblx0fSk7XG5cblxuaW50ZXJmYWNlIElCdW5kbGVPcHRpb25zXG57XG5cdGluOiBzdHJpbmc7XG5cdG91dDogc3RyaW5nfHN0cmluZ1tdO1xuXHRuYW1lc3BhY2U6IHN0cmluZztcblx0Z2xvYmFsaXplOiBib29sZWFuO1xuXHRtb2R1bGU6IHN0cmluZztcblx0aGVhZGVyOiBzdHJpbmd8c3RyaW5nW107XG5cdGZvb3Rlcjogc3RyaW5nfHN0cmluZ1tdO1xufVxuXG5cbi8qKiBXaGV0aGVyIHRoZSBjb2RlIGlzIHJ1bm5pbmcgYXMgYSByZXF1aXJlIG1vZHVsZSwgb3IgZnJvbSB0aGUgY29tbWFuZCBsaW5lLiAqL1xuY29uc3QgcnVubmluZ0FzTW9kdWxlID0gISFtb2R1bGUucGFyZW50O1xuXG5cbmFzeW5jIGZ1bmN0aW9uIGJ1bmRsZShvcHRpb25zPzogSUJ1bmRsZU9wdGlvbnMpXG57XG5cdC8qKiBTdG9yZXMgdGhlIGRpcmVjdG9yeSBjb250YWluaW5nIHRoZSBlbnRyeSBwb2ludCBzY3JpcHQuICovXG5cdGNvbnN0IHNjcmlwdERpcmVjdG9yeSA9ICgoKSA9PlxuXHR7XG5cdFx0aWYgKHJ1bm5pbmdBc01vZHVsZSlcblx0XHR7XG5cdFx0XHRjb25zdCBhcmdzOiBzdHJpbmdbXSA9IHByb2Nlc3MuYXJndjtcblx0XHRcdFxuXHRcdFx0aWYgKGFyZ3MubGVuZ3RoIDwgMilcblx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKFwiVW5wYXJzYWJsZSBjb21tYW5kIGxpbmUgYXJndW1lbnRzXCIpO1xuXHRcdFx0XG5cdFx0XHRjb25zdCBqc0ZpbGUgPSBhcmdzWzFdO1xuXHRcdFx0aWYgKCFqc0ZpbGUuZW5kc1dpdGgoXCIuanNcIikpXG5cdFx0XHRcdHRocm93IG5ldyBFcnJvcihcblx0XHRcdFx0XHRcIlNlY29uZCBhcmd1bWVudCBleHBlY3RlZCB0byBiZSBhIFwiICtcblx0XHRcdFx0XHRcImZpbGUgd2l0aCB0aGUgLmpzIGV4dGVuc2lvbi5cIik7XG5cdFx0XHRcblx0XHRcdHJldHVybiBQYXRoLmRpcm5hbWUoanNGaWxlKTtcblx0XHR9XG5cdFx0XG5cdFx0cmV0dXJuIFwiXCI7XG5cdH0pKCk7XG5cdFxuXHQvKiogVHJhbnNsYXRlcyB0aGUgc3BlY2lmaWVkIHBhdGggdG8gYmUgcmVsYXRpdmUgdG8gdGhlIGVudHJ5IHBvaW50IHNjcmlwdC4gKi9cblx0Y29uc3QgdHJhbnNsYXRlUGF0aCA9IChpblBhdGg6IHN0cmluZykgPT4gc2NyaXB0RGlyZWN0b3J5ID9cblx0XHRQYXRoLnJlc29sdmUoc2NyaXB0RGlyZWN0b3J5LCBpblBhdGgpIDogXG5cdFx0UGF0aC5yZXNvbHZlKGluUGF0aCk7XG5cdFxuXHQvKiogUmVhZHMgdGhlIGFyZ3VtZW50IHdpdGggdGhlIHNwZWNpZmllZCBuYW1lIGZyb20gdGhlIHByb2Nlc3MgYXJndW1lbnRzLiAqL1xuXHRmdW5jdGlvbiByZWFkQXJndW1lbnQ8VCA9IHN0cmluZz4obmFtZToga2V5b2YgSUJ1bmRsZU9wdGlvbnMsIHJlcXVpcmVkID0gZmFsc2UpOiBUXG5cdHtcblx0XHRpZiAocnVubmluZ0FzTW9kdWxlKVxuXHRcdHtcblx0XHRcdGlmICghb3B0aW9ucyB8fCB0eXBlb2Ygb3B0aW9ucyAhPT0gXCJvYmplY3RcIilcblx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKFwiT3B0aW9ucyBvYmplY3QgbXVzdCBiZSBwYXNzZWQgdG8gdGhpcyBmdW5jdGlvbi5cIik7XG5cdFx0XHRcblx0XHRcdHJldHVybiA8VD48dW5rbm93bj5vcHRpb25zW25hbWVdO1xuXHRcdH1cblx0XHRcblx0XHRjb25zdCBwcm9jZXNzQXJnczogc3RyaW5nW10gPSBwcm9jZXNzLmFyZ3Y7XG5cdFx0Y29uc3QgcHJlZml4ID0gYC0tJHtuYW1lfT1gO1xuXHRcdGNvbnN0IGZ1bGxBcmd1bWVudFRleHQgPSBwcm9jZXNzQXJncy5maW5kKGFyZyA9PiBhcmcuc3RhcnRzV2l0aChwcmVmaXgpKTtcblx0XHRcblx0XHRpZiAoZnVsbEFyZ3VtZW50VGV4dClcblx0XHR7XG5cdFx0XHRjb25zdCBvdXRWYWx1ZSA9IGZ1bGxBcmd1bWVudFRleHQuc2xpY2UocHJlZml4Lmxlbmd0aCkudHJpbSgpO1xuXHRcdFx0aWYgKG91dFZhbHVlKVxuXHRcdFx0XHRyZXR1cm4gPFQ+PHVua25vd24+b3V0VmFsdWU7XG5cdFx0XHRcblx0XHRcdHRocm93IG5ldyBFcnJvcihgQXJndW1lbnQgJHtwcmVmaXh9IGNhbm5vdCBiZSBlbXB0eWApO1xuXHRcdH1cblx0XHRcblx0XHRpZiAocmVxdWlyZWQpXG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IoYE1pc3NpbmcgcmVxdWlyZWQgYXJndW1lbnQgJHtwcmVmaXh9KS5gKTtcblx0fVxuXHRcblx0Y29uc3QgaW5Bcmd1bWVudCA9IHJlYWRBcmd1bWVudChcImluXCIsIHRydWUpO1xuXHRjb25zdCBvdXRBcmd1bWVudCA9IHJlYWRBcmd1bWVudChcIm91dFwiLCB0cnVlKTtcblx0Y29uc3QgbnNBcmd1bWVudCA9IHJlYWRBcmd1bWVudChcIm5hbWVzcGFjZVwiKTtcblx0Y29uc3QgZ2xvYmFsaXplID0gcmVhZEFyZ3VtZW50PGJvb2xlYW4+KFwiZ2xvYmFsaXplXCIpO1xuXHRjb25zdCBtb2RBcmd1bWVudCA9IHJlYWRBcmd1bWVudChcIm1vZHVsZVwiKTtcblx0Y29uc3QgaGVhZGVyQXJndW1lbnQgPSByZWFkQXJndW1lbnQoXCJoZWFkZXJcIik7XG5cdGNvbnN0IGZvb3RlckFyZ3VtZW50ID0gcmVhZEFyZ3VtZW50KFwiZm9vdGVyXCIpO1xuXHRcblx0Y29uc3Qgb3V0RmlsZXM6IHN0cmluZ1tdID0gQXJyYXkuaXNBcnJheShvdXRBcmd1bWVudCkgP1xuXHRcdG91dEFyZ3VtZW50IDogW291dEFyZ3VtZW50XTtcblx0XG5cdGNvbnN0IGhlYWRlckxpbmVzOiBzdHJpbmdbXSA9IEFycmF5LmlzQXJyYXkoaGVhZGVyQXJndW1lbnQpID8gXG5cdFx0aGVhZGVyQXJndW1lbnQgOiBbaGVhZGVyQXJndW1lbnRdO1xuXHRcblx0Y29uc3QgZm9vdGVyTGluZXM6IHN0cmluZ1tdID0gQXJyYXkuaXNBcnJheShmb290ZXJBcmd1bWVudCkgP1xuXHRcdGZvb3RlckFyZ3VtZW50IDogW2Zvb3RlckFyZ3VtZW50XTtcblx0XG5cdGNvbnN0IGhvbWVEZWZpbml0aW9uRmlsZSA9IGF3YWl0IERlZmluaXRpb25GaWxlLnJlYWQodHJhbnNsYXRlUGF0aChpbkFyZ3VtZW50KSk7XG5cdGlmICghaG9tZURlZmluaXRpb25GaWxlKVxuXHRcdHRocm93IG5ldyBFcnJvcihcIk5vIGRlZmluaXRpb24gZmlsZSBmb3VuZCBhdDogXCIgKyBpbkFyZ3VtZW50KTtcblx0XG5cdGF3YWl0IGhvbWVEZWZpbml0aW9uRmlsZS5yZXNvbHZlKCk7XG5cdFxuXHRjb25zdCBkZWZpbml0aW9uTGluZXMgPSBob21lRGVmaW5pdGlvbkZpbGUuZW1pdChcblx0XHRtb2RBcmd1bWVudCxcblx0XHRuc0FyZ3VtZW50LFxuXHRcdGdsb2JhbGl6ZSk7XG5cdFxuXHRkZWZpbml0aW9uTGluZXMudW5zaGlmdCguLi5oZWFkZXJMaW5lcyk7XG5cdGRlZmluaXRpb25MaW5lcy5wdXNoKC4uLmZvb3RlckxpbmVzKTtcblx0XG5cdGlmIChmb290ZXJMaW5lcy5sZW5ndGgpXG5cdFx0ZGVmaW5pdGlvbkxpbmVzLnB1c2goXCJcIik7XG5cdFxuXHRmb3IgKGNvbnN0IG91dEZpbGUgb2Ygb3V0RmlsZXMpXG5cdHtcblx0XHRGcy53cml0ZUZpbGVTeW5jKFxuXHRcdFx0dHJhbnNsYXRlUGF0aChvdXRGaWxlKSwgXG5cdFx0XHRkZWZpbml0aW9uTGluZXMuam9pbihcIlxcblwiKSwgXG5cdFx0XHRcInV0ZjhcIik7XG5cdH1cbn1cblxuaWYgKHJ1bm5pbmdBc01vZHVsZSlcblx0dHlwZW9mIG1vZHVsZSA9PT0gXCJvYmplY3RcIiAmJiAobW9kdWxlLmV4cG9ydHMgPSBidW5kbGUpO1xuZWxzZVxuXHRidW5kbGUoKTtcbiJdfQ==