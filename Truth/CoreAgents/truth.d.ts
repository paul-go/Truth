
declare namespace Truth {

	/**
	 * A class that encapsulates CRC functionality.
	 */
	export class Crc {
		private constructor();
		/**
		 * Calculates a numeric CRC from the specified string, and returns the
		 * code as a 4-character ASCII byte string.
		 */
		static calculate(text: string): string;
		/**
		 * Calculates a numeric CRC from the specified string, and returns the
		 * code as a 4-number byte array.
		 */
		static calculate(text: string, type: typeof Number): number[];
	}
	/**
	 * A class that provides various higher-order functions
	 * across data structures.
	 */
	export abstract class HigherOrder {
		/**
		 * @returns A readonly copy of the specified array, set, or list.
		 */
		static copy<T>(array: ReadonlyArray<T>): ReadonlyArray<T>;
		static copy<T>(set: ReadonlySet<T>): ReadonlySet<T>;
		static copy<K, V>(map: ReadonlyMap<K, V>): ReadonlyMap<K, V>;
		private constructor();
	}
	/**
	 * Utility class for performing basic guarding.
	 */
	export class Guard {
		/** */
		static notNull<T>(param: T): NotNull<T>;
		/** */
		static defined<T>(param: T): NotUndefined<T>;
		/** */
		static nullable<T>(param: T): NotNull<T> | NotUndefined<T>;
	}
	type NotNull<T> = T extends null ? never : T;
	type NotUndefined<T> = T extends undefined ? never : T;
	/**
	 * A general parsing utility class that provides consumption
	 * methods that operate over a given input.
	 */
	export class Parser {
		/**
		 * Constructs a new Parser object that operates over
		 * the specified input string, optionally starting at the
		 * specified position.
		 */
		constructor(input: string);
		/**
		 * Attempts to read the specified token immediately
		 * following the cursor.
		 * 
		 * @returns The content read. In the case when no
		 * match could be found, an empty string is returned.
		 */
		read(token?: string): string;
		/**
		 * Reads any whitespace characters and floating
		 * escape characters.
		 * 
		 * @returns The number of whitespace characters
		 * read.
		 */
		readWhitespace(): number;
		/**
		 * Attempts to read a single stream-level grapheme from the
		 * parse stream, using unicode-aware extraction method.
		 * If the parse stream specifies a unicode escape sequence,
		 * such as \uFFFF, these are seen as 6 individual graphemes.
		 * 
		 * @returns The read grapheme, or an empty string in the case
		 * when there is no more content in the parse stream.
		 */
		readGrapheme(): string;
		/**
		 * Reads graphemes from the parse stream, until either
		 * the cursor reaches one of the specified quit tokens,
		 * or the parse stream terminates.
		 */
		readUntil(...quitTokens: string[]): string;
		/**
		 * Attempts to read the specified token from the parse stream,
		 * if and only if it's at the end of the parse stream.
		 */
		readThenTerminal(token: string): string;
		/**
		 * @returns A boolean value that indicates whether the
		 * specified string exists immediately at the position of
		 * the cursor.
		 */
		peek(token: string): boolean;
		/**
		 * @returns A boolean value that indicates whether the
		 * specified string exists immediately at the position of
		 * the cursor, and following this token is the end of the
		 * parse stream.
		 */
		peekThenTerminal(token: string): boolean;
		/**
		 * @returns A boolean value that indicates whether
		 * there are more characters to read in the input.
		 */
		more(): boolean;
		/**
		 * Gets or sets the position of the cursor from where
		 * reading takes place in the cursor.
		 */
		position: number;
		private _position;
		/** */
		private readonly input;
		/**
		 * 
		 */
		private atRealBackslash;
		/**
		 * @deprecated
		 * @returns A boolean value that indicates whether an
		 * escape character exists behind the current character.
		 * The algorithm used is respective of sequences of
		 * multiple escape characters.
		 */
		private escaped;
	}
	/**
	 * Stores the maximum character code in the unicode set.
	 */
	export const UnicodeMax = 65536;
	/**
	 * Stores a map of the names of all unicode blocks,
	 * and their character ranges.
	 */
	export const UnicodeBlocks: Readonly<Map<string, [number, number]>>;
	/**
	 * Stores unsorted general utility methods.
	 */
	export class Misc {
		/**
		 * Counts incrementally through numbers, using the specified
		 * radix sequence. For example, if the radixes [2, 2, 2] were to
		 * be specified, this would result in binary counting starting at
		 * [0, 0, 0] and ending at [1, 1, 1].
		 */
		static variableRadixCounter(radixes: number[]): IterableIterator<number[]>;
		/**
		 * 
		 */
		static calculatePowerset<T>(array: T[]): T[][];
		/**
		 * @returns Whether the items of the first set object form
		 * a subset (not a proper subset) of the items of the second
		 * set.
		 */
		static isSubset(sourceSet: ReadonlySet<any>, possibleSubset: ReadonlySet<any>): boolean;
		/**
		 * @returns Whether the items of the first set object form
		 * a superset (not a proper superset) of the items of the
		 * second set.
		 */
		static isSuperset(sourceSet: ReadonlySet<any>, possibleSuperset: ReadonlySet<any>): boolean;
		/**
		 * @returns The number of items that are missing
		 * from the second set that exist in the first set.
		 */
		static computeSubsetFactor(a: ReadonlyArray<any>, b: ReadonlyArray<any>): number;
		private constructor();
	}
	/**
	 * The top-level object that manages Truth documents.
	 */
	export class Program {
		/**
		 * Creates a new Program, into which Documents may
		 * be added, and verified.
		 * 
		 * @param autoVerify Indicates whether verification should
		 * occur after every edit cycle, and reports faults to this
		 * Program's .faults field.
		 */
		constructor(autoVerify?: boolean);
		/** */
		readonly hooks: HookTypesInstance;
		/** */
		readonly agents: Agents;
		/** */
		readonly documents: DocumentGraph;
		/**  */
		readonly faults: FaultService;
		/** */
		readonly version: VersionStamp;
		private _version;
		/** */
		private readonly indentCheckService;
		/**
		 * Stores an object that allows type analysis to be performed on
		 * this Program. It is reset at the beginning of every edit cycle.
		 */
		private currentProgramScanner;
		/**
		 * Performs a full verification of all documents loaded into the program.
		 * This Program's .faults field is populated with any faults generated as
		 * a result of the verification. If no documents loaded into this program
		 * has been edited since the last verification, verification is not re-attempted.
		 * 
		 * @returns An entrypoint into performing analysis of the Types that
		 * have been defined in this program.
		 */
		scan(): ProgramScanner;
		/**
		 * @returns A fully constructed Type instance that corresponds to
		 * the type path specified. In the case when no type could be found
		 * at the specified location, null is returned.
		 * 
		 * @param document An instance of a Document that specifies
		 * where to begin the query.
		 * 
		 * @param typePath The type path to query within the the specified
		 * Document.
		 */
		query(document: Document, ...typePath: string[]): Type | null;
		/**
		 * @returns An array that contains the root-level types defined
		 * in the specified Document.
		 */
		queryRoots(document: Document): ReadonlyArray<Type>;
		/**
		 * Begin inspecting a document loaded
		 * into this program, a specific location.
		 */
		inspect(document: Document, line: number, offset: number): ProgramInspectionResult;
	}
	/**
	 * Stores the details about a precise location in a Document.
	 */
	export class ProgramInspectionResult {
		/**
		 * Stores the compilation object that most closely represents
		 * what was found at the specified location. Stores null in the
		 * case when the specified location contains an object that
		 * has been marked as cruft (the statement and span fields
		 * are still populated in this case).
		 */
		readonly result: Document | Type[] | null;
		/**
		 * Stores the Statement found at the specified location.
		 */
		readonly statement: Statement;
		/**
		 * Stores the Span found at the specified location, or
		 * null in the case when no Span was found, such as if
		 * the specified location is whitespace or a comment.
		 */
		readonly span: Span | null;
	}
	/**
	 * Provides an entry point for enumeration through
	 * the types defined in a program.
	 */
	export class ProgramScanner {
		private program;
		/**
		 * Enumerate through all visible types defined in the Program.
		 */
		enumerate(filterDocument?: Document): IterableIterator<{
			type: Type;
			document: Document;
		}>;
		/** */
		private readonly roots;
	}
	/**
	 * A cache that stores all agents loaded by the compiler.
	 */
	export class Agents {
		/**
		 * Constructs an agent from the specified file, or from
		 * a cache if the specified file has already been read.
		 * @returns A reference to the added agent.
		 */
		add(sourceUri: Uri | string): Promise<Agent | null>;
		/**
		 * Removes the agent from the system having the specified source file path.
		 * @returns A boolean indicating whether an agent was deleted.
		 */
		delete(sourceUri: Uri | string): boolean;
		/** Stores a map of agent build functions, indexed by their absolute URI. */
		private readonly buildFunctionCache;
		/** Stores a set of all agents added to the system. */
		private readonly agentCacheObject;
	}
	/** */
	export class Agent {
		/** Stores an array of documents that reference this Agent. */
		readonly referencingDocuments: Document[];
		/** Stores the absolute path to the JavaScript file that contains the agent source code. */
		readonly sourceUri: Uri;
		/** Store the built-in hooks, as well as the hooks specified in the document. */
		readonly hooks: HookTypesInstance;
	}
	/**
	 * 
	 */
	export abstract class HookType<TIn extends object | void = object, TOut extends object | void = void> {
		private readonly router;
		private readonly agent;
		/**
		 * Adds a hook contributor function that executes in
		 * response to the running of hooks of the containing type.
		 */
		contribute(fn: (hookIn: Readonly<TIn>) => TOut | void): void;
		/**
		 * Adds a hook capturer function that runs after the hook contributors
		 * have returned their results. Hook capturer functions are passed an
		 * array containing the produced results of all the contributor functions.
		 */
		capture(fn: (hookIn: Readonly<TIn>) => void): void;
		/**
		 * Runs all hook contributor functions whose constructor matches the
		 * containing hook type. Then, all matching hook capturer functions are
		 * called, passing the return values generated by the contributor functions.
		 * @param hook An instance of the Hook to run.
		 */
		run(hookIn: TIn): TOut[];
	}
	/**
	 * Stores all of the hook types used across the entire system.
	 */
	export namespace HookTypes {
		/** A hooks that runs immediate after a document has been created. */
		class DocumentCreated extends HookType<DocumentParam> {
		}
		/** A hooks that runs immediately before a document is removed from the program. */
		class DocumentDeleted extends HookType<DocumentParam> {
		}
		/** A hook that runs when a document's file name changes. */
		class DocumentRenamed extends HookType<DocumentRenameParam> {
		}
		/** A base class for a hook that is run during type resolution events. */
		class Resolution extends HookType<ResolutionParam, ResolutionResult> {
		}
		/** A hook that runs before the core is about to resolve a term. */
		class BeforeResolve extends HookTypes.Resolution {
		}
		/** A hook that runs after the core has resolved a term. */
		class AfterResolve extends HookTypes.Resolution {
		}
		/** A hook that runs when the core is unable to resolve a particular term. */
		class NotResolved extends HookTypes.Resolution {
		}
		/** A base class for a hook that performs editor navigations. */
		class Navigation extends HookType<NavigationParam> {
		}
		/** A hook that runs when a "Find References" operation has been requested. */
		class FindReferences extends HookTypes.Navigation {
		}
		/** A hook that runs when a "Find Fragments" operation has been requested. */
		class FindFragments extends HookTypes.Navigation {
		}
		/** A hook that runs when a "Find Declarations" operation has been requested. */
		class FindDeclarations extends HookTypes.Navigation {
		}
		/** A hook that runs when a quick fix operation is requested. Not implemented. */
		class Fix<TIn extends object> extends HookType<TIn> {
		}
		/** A hook that runs when checking whether a rename operation can be executed. */
		class CanRename extends HookType<CanParam, CanResult> {
		}
		/** A hook that runs when a rename operation should be executed. */
		class DoRename extends HookType<DoRenameParam> {
		}
		/** A hook that runs when a dialog should be displayed. Not implemented. */
		class Dialog extends HookType<void> {
		}
		/** A hook that runs when completion. */
		class Completion extends HookType<CompletionParam, CompletionResult> {
		}
		/** */
		class Invalidate extends HookType<InvalidateParam> {
		}
		/** */
		class Revalidate extends HookType<RevalidateParam> {
		}
		/**
		 * A hook that runs when a document edit transaction has completed.
		 */
		class EditComplete extends HookType<DocumentParam> {
		}
		/**
		 * A hook that runs when a URI reference is added to a document,
		 * but before it resolves to a resource.
		 */
		class UriReferenceAdded extends HookType<UriReferenceParam, UriReferenceResult> {
		}
		/**
		 * A hook that runs when a URI reference is removed from a document.
		 */
		class UriReferenceRemoved extends HookType<UriReferenceParam> {
		}
		/** A hook that runs when a fault has been detected in a document. */
		class FaultReported extends HookType<FaultParam> {
		}
		/** A hook that runs when a fault has been rectified, and should be eliminated. */
		class FaultRectified extends HookType<FaultParam> {
		}
	}
	/** */
	export class DocumentParam {
		readonly document: Document;
		constructor(document: Document);
	}
	/** Input parameters for documents being renamed. */
	export class DocumentRenameParam {
		readonly document: Document;
		readonly oldUri: Uri;
		constructor(document: Document, oldUri: Uri);
	}
	/**
	 * 
	 */
	export class InvalidateParam {
		/**
		 * A reference to the Document object in which the Invalidation occured.
		 */
		readonly document: Document;
		/**
		 * An array of statements whose descendants should be invalidated.
		 * If the array is empty, the entire document should be invalidated.
		 */
		readonly parents: ReadonlyArray<Statement>;
		/**
		 * An array of indexes whose length is the same as the parents field,
		 * that represents the index of each parent within the document.
		 */
		readonly indexes: ReadonlyArray<number>;
		constructor(
		/**
		 * A reference to the Document object in which the Invalidation occured.
		 */
		document: Document,
		/**
		 * An array of statements whose descendants should be invalidated.
		 * If the array is empty, the entire document should be invalidated.
		 */
		parents: ReadonlyArray<Statement>,
		/**
		 * An array of indexes whose length is the same as the parents field,
		 * that represents the index of each parent within the document.
		 */
		indexes: ReadonlyArray<number>);
	}
	/**
	 * 
	 */
	export class RevalidateParam {
		/**
		 * A reference to the Document object in which the Revalidation will occur.
		 */
		readonly document: Document;
		/**
		 * An array of statements whose descendants should be revalidated.
		 */
		readonly parents: ReadonlyArray<Statement>;
		/**
		 * An array of indexes whose length is the same as the parents field,
		 * that represents the index of each parent within the document.
		 */
		readonly indexes: ReadonlyArray<number>;
		constructor(
		/**
		 * A reference to the Document object in which the Revalidation will occur.
		 */
		document: Document,
		/**
		 * An array of statements whose descendants should be revalidated.
		 */
		parents: ReadonlyArray<Statement>,
		/**
		 * An array of indexes whose length is the same as the parents field,
		 * that represents the index of each parent within the document.
		 */
		indexes: ReadonlyArray<number>);
	}
	/**
	 * Generic class that stores the inputs of a "Can" hook.
	 * "Can" hooks are hooks where the system needs to perform
	 * a pre-flight check to see if the command can be run at
	 * a certain position within a document.
	 */
	export class CanParam {
		readonly document: Document;
		readonly span: Span;
		constructor(document: Document, span: Span);
	}
	/** Generic class that stores the output of a "Can" hook. */
	export class CanResult {
		readonly value: boolean;
		constructor(value: boolean);
	}
	/** Input parameters for resolution hooks */
	export class ResolutionParam {
		readonly program: Program;
		readonly spine: Spine;
		constructor(program: Program, spine: Spine);
	}
	/** Output for resolution hooks */
	export class ResolutionResult {
		resolves: boolean;
	}
	/** Input parameters for navigation hooks. */
	export class NavigationParam {
		readonly document: Document;
		readonly initiatingSubject: Subject;
		constructor(document: Document, initiatingSubject: Subject);
	}
	/** */
	export class DoRenameParam {
		readonly document: Document;
		readonly span: Span;
		constructor(document: Document, span: Span);
	}
	/** Input parameters for completion hooks. */
	export class CompletionParam {
		readonly document: Document;
		readonly line: number;
		readonly offset: number;
		constructor(document: Document, line: number, offset: number);
	}
	/** Output for completion hooks. */
	export class CompletionResult {
		readonly items: LanguageServer.CompletionItem[];
		constructor(items: LanguageServer.CompletionItem[]);
	}
	/** */
	export class FillParam {
		readonly document: Document;
		constructor(document: Document);
	}
	/** */
	export class UriReferenceParam {
		readonly document: Document;
		readonly statement: Statement;
		readonly uri: Uri;
		constructor(document: Document, statement: Statement, uri: Uri);
	}
	/** */
	export class UriReferenceResult {
		readonly accepted: boolean;
		constructor(accepted: boolean);
	}
	/** */
	export class FaultParam {
		readonly document: Document;
		readonly fault: Fault;
		constructor(document: Document, fault: Fault);
	}
	/** Defines an instantatiated version of the HookTypes namespace. */
	export type HookTypesInstance = {
		[P in keyof typeof HookTypes]: Readonly<InstanceType<typeof HookTypes[P]>>;
	};
	/**
	 * An enumeration that lists all availble protocols
	 * supported by the system. The list can be enumerated
	 * via Uri.eachProtocol()
	 */
	export enum UriProtocol {
		none = "",
		unknown = "?",
		file = "file:",
		https = "https:",
		http = "http:",
		internal = "system-internal:"
	}
	/**
	 * A class that represents a Truth URI.
	 * A Truth URI can point to a truth file, or an agent through a variety of
	 * different protocols, just like a normal URI. However, a Truth URI that
	 * points to a Truth file can also point to declarations within that file
	 * directly in the URI, using the double slash syntax. For example:
	 * 
	 * //domain.com/File.truth//Path/To/Declaration
	 */
	export class Uri {
		/**
		 * Stores a reference to the protocol used by the URI.
		 */
		readonly protocol: UriProtocol;
		/**
		 * Stores the file name specified in the URI, if one exists.
		 */
		readonly fileName: string;
		/**
		 * Stores the fully qualified path to the file, and the file
		 * name itself, but without any protocol.
		 */
		readonly ioPath: ReadonlyArray<string>;
		/**
		 * Stores the contents of any type path specified in the URI.
		 */
		readonly typePath: ReadonlyArray<string>;
		/**
		 * Enumerates through the list of available
		 * protocols supported by the system.
		 */
		static eachProtocol(): IterableIterator<UriProtocol>;
		/**
		 * @param uriText A string containing the URI to parse
		 * @param relativeFallback A URI that identifies the origin
		 * of the URI being parsed, used in the case when the
		 * uriText parameter is a relative path.
		 */
		static parse(uriText: string, relativeFallback?: Uri): Uri | null;
		/**
		 * Creates a new Uri from the specified input.
		 * 
		 * @param from If the parameter is omited,
		 * a unique internal URI is generated.
		 */
		static create(from?: Spine | Uri): Uri;
		/** */
		protected constructor(
		/**
		 * Stores a reference to the protocol used by the URI.
		 */
		protocol: UriProtocol,
		/**
		 * Stores the file name specified in the URI, if one exists.
		 */
		fileName: string,
		/**
		 * Stores the fully qualified path to the file, and the file
		 * name itself, but without any protocol.
		 */
		ioPath: ReadonlyArray<string>,
		/**
		 * Stores the contents of any type path specified in the URI.
		 */
		typePath: ReadonlyArray<string>);
		/**
		 * Converts the URI to a fully-qualified path including the file name.
		 * 
		 * @param includeProtocol Whether the protocol portion of the URI
		 * should be included in the final string. Defaults to true.
		 * 
		 * @param includeTypePath Whether the typePath portion of the URI
		 * should be included in the final string. Defaults to false.
		 */
		toString(includeProtocol?: boolean, includeTypePath?: boolean): string;
		/**
		 * @returns A value indicating whether two URIs point to the same resource.
		 */
		equals(uri: Uri | string, compareTypePaths?: boolean): boolean;
		/**
		 * Creates a new Uri, whose typePath and ioPath
		 * fields are retracted by the specified levels of
		 * depth.
		 * 
		 * @returns A new Uri that is otherwise a copy of this
		 * one, but with it's IO path and type path peeled
		 * back by the specified number of levels.
		 */
		retract(ioRetraction?: number, typeRetraction?: number): Uri;
		/**
		 * Creates a new Uri, whose typePath field is
		 * retracted to the specified level of depth.
		 */
		retractTo(typePathLength: number): Uri;
		/**
		 * @returns A new Uri, whose typePath and ioPath
		 * fields are extended with the specified segments.
		 */
		extend(ioSegments: string | string[], typeSegments: string | string[]): Uri;
	}
	/** */
	export class UriReader {
		/**
		 * Attempts to read the contents of the given URI.
		 * If an error is generated while trying to read a file
		 * at the specified location, the errors is returned.
		 */
		static tryRead(uri: Uri): Promise<string | Error>;
	}
	/**
	 * An enumeration that stores language syntax tokens.
	 */
	export const enum Syntax {
		tab = "\t",
		space = " ",
		terminal = "\n",
		combinator = ",",
		joint = ":",
		list = "...",
		escapeChar = "\\",
		comment = "//",
		typePathSeparator = "//",
		truthExtension = "truth",
		agentExtension = "js"
	}
	/**
	 * An enumeration that stores the escape sequences
	 * that only match a single kind of character. "Sign" in
	 * this case refers to the fact that these are escape
	 * sequences that refer to another character.
	 */
	export enum RegexSyntaxSign {
		tab = "\\t",
		lineFeed = "\\n",
		carriageReturn = "\\r",
		escapedFinalizer = "\\/",
		backslash = "\\\\"
	}
	export namespace RegexSyntaxSign {
		/**
		 * @returns A RegexSyntaxSign member from the
		 * specified sign literal (ex: "\t") or raw signable
		 * character (ex: "	").
		 */
		function resolve(value: string): RegexSyntaxSign | null;
		/** */
		function unescape(value: string): string;
	}
	/**
	 * An enumeration that stores the escape sequences
	 * that can match more than one kind of character.
	 */
	export enum RegexSyntaxKnownSet {
		digit = "\\d",
		digitNon = "\\D",
		alphanumeric = "\\w",
		alphanumericNon = "\\W",
		whitespace = "\\s",
		whitespaceNon = "\\S",
		wild = "."
	}
	export namespace RegexSyntaxKnownSet {
		function resolve(value: string): RegexSyntaxKnownSet | null;
	}
	/**
	 * An enumeration that stores the delimiters available
	 * in the system's regular expression flavor.
	 */
	export const enum RegexSyntaxDelimiter {
		main = "/",
		utf16GroupStart = "\\u{",
		utf16GroupEnd = "}",
		groupStart = "(",
		groupEnd = ")",
		alternator = "|",
		setStart = "[",
		setEnd = "]",
		quantifierStart = "{",
		quantifierEnd = "}",
		quantifierSeparator = ",",
		range = "-"
	}
	/**
	 * An enumeration that stores miscellaneous regular
	 * expression special characters that don't fit into
	 * the other enumerations.
	 */
	export const enum RegexSyntaxMisc {
		star = "*",
		plus = "+",
		negate = "^",
		restrained = "?",
		boundary = "\\b",
		boundaryNon = "\\B"
	}
	/**
	 * An enumeration that stores the delimiters available
	 * in the infix syntax.
	 */
	export const enum InfixSyntax {
		start = "<",
		end = ">",
		nominalStart = "<<",
		nominalEnd = ">>",
		patternStart = "</",
		patternEnd = "/>"
	}
	/**
	 * A class that manages the diagnostics that have been
	 * reported for the current state of the program.
	 */
	export class FaultService {
		private readonly program;
		/** */
		constructor(program: Program);
		/**
		 * Reports a fault. If a similar Fault on the same area
		 * of the document hasn't been reported, the method
		 * runs the FaultReported hook.
		 */
		report(fault: Fault): void;
		/**
		 * Gets a number representing the number of
		 * unrectified faults retained by this FaultService.
		 */
		readonly count: number;
		/**
		 * @returns A boolean value indicating whether this
		 * FaultService retains a fault that is similar to the specified
		 * fault (meaning that it has the same code and source).
		 */
		has(similarFault: Fault): boolean;
		/**
		 * @returns An array of Fault objects that have been reported
		 * at the specified source. If the source has no faults, an empty
		 * array is returned.
		 */
		check<TSource extends object>(source: TSource): Fault<TSource>[];
		/**
		 * Enumerates through the unrectified faults retained
		 * by this FaultService.
		 */
		each(): IterableIterator<Fault<TFaultSource>>;
		/**
		 * Broadcasts all reports stored in activeContext,
		 * and creates a new activeContext.
		 */
		private broadcastReports;
		/** */
		private inEditTransaction;
		/**
		 * A rolling, mutable field that is used as the build target of the
		 * faults found in the current frame.
		 */
		private activeContext;
	}
	/**
	 * A type that describes the possible objects within a document
	 * that may be responsible for the generation of a fault.
	 */
	export type TFaultSource = Statement | Span | InfixSpan;
	/**
	 * 
	 */
	export class Fault<TSource = TFaultSource> {
		/** */
		readonly type: FaultType<TSource>;
		/** The document object that caused the fault to be reported. */
		readonly source: TSource;
		constructor(
		/** */
		type: FaultType<TSource>,
		/** The document object that caused the fault to be reported. */
		source: TSource);
	}
	/**
	 * 
	 */
	export class FaultType<TSource = TFaultSource> {
		/**
		 * An error code, useful for reference purposes, or display in a user interface.
		 */
		readonly code: number;
		/**
		 * A human-readable description of the fault.
		 */
		readonly message: string;
		/**
		 * 
		 */
		readonly severity: FaultSeverity;
		constructor(
		/**
		 * An error code, useful for reference purposes, or display in a user interface.
		 */
		code: number,
		/**
		 * A human-readable description of the fault.
		 */
		message: string,
		/**
		 * 
		 */
		severity: FaultSeverity);
		/**
		 * Creates a fault of this type.
		 */
		create(source: TSource): Fault<TSource>;
	}
	/**
	 * 
	 */
	export const enum FaultSeverity {
		/**
		 * Indicates the severity of a fault is "error", which means that
		 * the associated object will be ignored during type analysis.
		 */
		error = 1,
		/**
		 * Indicates the severity of a fault is "warning", which means that
		 * the associated object will still be processed during type analysis.
		 */
		warning = 2
	}
	/**
	 * 
	 */
	export const Faults: Readonly<{
		/** */
		each(): IterableIterator<FaultType<object>>;
		/**
		 * @returns An object containing the FaultType instance
		 * associated with the fault with the specified code, as
		 * well as the name of the instance. In the case when the
		 * faultCode was not found, null is returned.
		 */
		nameOf(faultCode: number): string;
		/** */
		UnresolvedResource: Readonly<FaultType<Statement>>;
		/** */
		CircularResourceReference: Readonly<FaultType<Statement>>;
		/** */
		InsecureResourceReference: Readonly<FaultType<Statement>>;
		/** */
		UnresolvedAnnotationFault: Readonly<FaultType<Span>>;
		/** */
		CircularTypeReference: Readonly<FaultType<Span>>;
		/** */
		ContractViolation: Readonly<FaultType<Span>>;
		/** */
		TypeCannotBeRefreshed: Readonly<FaultType<Statement>>;
		/** */
		IgnoredAnnotation: Readonly<FaultType<Span>>;
		/** */
		IgnoredAlias: Readonly<FaultType<Span>>;
		/** */
		TypeSelfReferential: Readonly<FaultType<Span>>;
		/** */
		AnonymousInListIntrinsicType: Readonly<FaultType<Statement>>;
		/** */
		ListContractViolation: Readonly<FaultType<Span>>;
		/** */
		ListIntrinsicExtendingList: Readonly<FaultType<Span>>;
		/** */
		ListExtrinsicExtendingNonList: Readonly<FaultType<Span>>;
		/** */
		ListDimensionalDiscrepancyFault: Readonly<FaultType<Span>>;
		/** */
		PatternInvalid: Readonly<FaultType<Statement>>;
		/** */
		PatternWithoutAnnotation: Readonly<FaultType<Statement>>;
		/** */
		PatternCanMatchEmpty: Readonly<FaultType<Statement>>;
		/** */
		PatternMatchingTypesAlreadyExists: Readonly<FaultType<Statement>>;
		/** */
		PatternMatchingList: Readonly<FaultType<Span>>;
		/** */
		PatternCanMatchWhitespaceOnly: Readonly<FaultType<Statement>>;
		/** */
		PatternAcceptsLeadingWhitespace: Readonly<FaultType<Statement>>;
		/** */
		PatternRequiresLeadingWhitespace: Readonly<FaultType<Statement>>;
		/** */
		PatternAcceptsTrailingWhitespace: Readonly<FaultType<Statement>>;
		/** */
		PatternRequiresTrailingWhitespace: Readonly<FaultType<Statement>>;
		/** */
		PatternNonCovariant: Readonly<FaultType<Statement>>;
		/** */
		PatternPartialWithCombinator: Readonly<FaultType<Statement>>;
		/** */
		DiscrepantUnion: Readonly<FaultType<Span>>;
		/** */
		InfixHasQuantifier: Readonly<FaultType<Statement>>;
		/** */
		InfixHasDuplicateIdentifier: Readonly<FaultType<InfixSpan>>;
		/** */
		InfixHasSelfReferentialType: Readonly<FaultType<InfixSpan>>;
		/** */
		InfixNonConvariant: Readonly<FaultType<InfixSpan>>;
		/** */
		InfixCannotDefineNewTypes: Readonly<FaultType<InfixSpan>>;
		/** */
		InfixReferencedTypeMustHavePattern: Readonly<FaultType<InfixSpan>>;
		/** */
		InfixReferencedTypeCannotBeRecursive: Readonly<FaultType<InfixSpan>>;
		/** */
		InfixContractViolation: Readonly<FaultType<InfixSpan>>;
		/** */
		InfixPopulationChaining: Readonly<FaultType<InfixSpan>>;
		/** */
		InfixUsingListOperator: Readonly<FaultType<InfixSpan>>;
		/** */
		InfixReferencingList: Readonly<FaultType<InfixSpan>>;
		/** */
		PortabilityInfixHasMultipleDefinitions: Readonly<FaultType<InfixSpan>>;
		/** */
		PopulationInfixHasMultipleDefinitions: Readonly<FaultType<InfixSpan>>;
		/** */
		NominalInfixMustSubtype: Readonly<FaultType<Span>>;
		/** */
		StatementBeginsWithComma: Readonly<FaultType<Statement>>;
		/** */
		StatementBeginsWithEllipsis: Readonly<FaultType<Statement>>;
		/** */
		StatementBeginsWithEscapedSpace: Readonly<FaultType<Statement>>;
		/** */
		TabsAndSpaces: Readonly<FaultType<Statement>>;
		/** */
		DuplicateDeclaration: Readonly<FaultType<Span>>;
		/** */
		UnterminatedCharacterSet: Readonly<FaultType<Statement>>;
		/** */
		UnterminatedGroup: Readonly<FaultType<Statement>>;
		/** */
		DuplicateQuantifier: Readonly<FaultType<Statement>>;
		/** */
		UnterminatedInfix: Readonly<FaultType<Statement>>;
		/** */
		EmptyPattern: Readonly<FaultType<Statement>>;
	}>;
	/**
	 * Infinite incremental counter.
	 */
	export class VersionStamp {
		private readonly stamp;
		/** */
		static next(): VersionStamp;
		/** */
		private static nextStamp;
		/** */
		protected constructor(stamp: number | number[]);
		/** */
		newerThan(otherStamp: VersionStamp): boolean;
		/** */
		toString(): string;
	}
	/**
	 * Contains members that replicate the behavior of
	 * the language server.
	 */
	export namespace LanguageServer {
		/**
		 * Position in a text document expressed as zero-based line and character offset.
		 * The offsets are based on a UTF-16 string representation. So a string of the form
		 * `a𐐀b` the character offset of the character `a` is 0, the character offset of `𐐀`
		 * is 1 and the character offset of b is 3 since `𐐀` is represented using two code
		 * units in UTF-16.
		 * 
		 * Positions are line end character agnostic. So you can not specify a position that
		 * denotes `\r|\n` or `\n|` where `|` represents the character offset.
		 */
		interface Position {
			/**
			 * Line position in a document (zero-based).
			 * If a line number is greater than the number of lines in a document, it defaults back to the number of lines in the document.
			 * If a line number is negative, it defaults to 0.
			 */
			line: number;
			/**
			 * Character offset on a line in a document (zero-based). Assuming that the line is
			 * represented as a string, the `character` value represents the gap between the
			 * `character` and `character + 1`.
			 * 
			 * If the character value is greater than the line length it defaults back to the
			 * line length.
			 * If a line number is negative, it defaults to 0.
			 */
			character: number;
		}
		/**
		 * The Position namespace provides helper functions to work with
		 * [Position](#Position) literals.
		 */
		namespace Position {
			/**
			 * Creates a new Position literal from the given line and character.
			 * @param line The position's line.
			 * @param character The position's character.
			 */
			function create(line: number, character: number): Position;
			/**
			 * Checks whether the given liternal conforms to the [Position](#Position) interface.
			 */
			function is(value: any): value is Position;
		}
		/**
		 * A range in a text document expressed as (zero-based) start and end positions.
		 * 
		 * If you want to specify a range that contains a line including the line ending
		 * character(s) then use an end position denoting the start of the next line.
		 * For example:
		 * ```ts
		 * {
		 *     start: { line: 5, character: 23 }
		 *     end : { line 6, character : 0 }
		 * }
		 * ```
		 */
		interface Range {
			/**
			 * The range's start position
			 */
			start: Position;
			/**
			 * The range's end position.
			 */
			end: Position;
		}
		/**
		 * A text edit applicable to a text document.
		 */
		interface TextEdit {
			/**
			 * The range of the text document to be manipulated. To insert
			 * text into a document create a range where start === end.
			 */
			range: Range;
			/**
			 * The string to be inserted. For delete operations use an
			 * empty string.
			 */
			newText: string;
		}
		/**
		 * The TextEdit namespace provides helper function to create replace,
		 * insert and delete edits more easily.
		 */
		namespace TextEdit {
		}
		/**
		 * Describes the content type that a client supports in various
		 * result literals like `Hover`, `ParameterInfo` or `CompletionItem`.
		 * 
		 * Please note that `MarkupKinds` must not start with a `$`. This kinds
		 * are reserved for internal usage.
		 */
		namespace MarkupKind {
		}
		type MarkupKind = 'plaintext' | 'markdown';
		/**
		 * A `MarkupContent` literal represents a string value which content is interpreted base on its
		 * kind flag. Currently the protocol supports `plaintext` and `markdown` as markup kinds.
		 * 
		 * If the kind is `markdown` then the value can contain fenced code blocks like in GitHub issues.
		 * See https://help.github.com/articles/creating-and-highlighting-code-blocks/#syntax-highlighting
		 * 
		 * Here is an example how such a string can be constructed using JavaScript / TypeScript:
		 * ```ts
		 * let markdown: MarkdownContent = {
		 *  kind: MarkupKind.Markdown,
		 *	value: [
		 *		'# Header',
		 *		'Some text',
		 *		'```typescript',
		 *		'someCode();',
		 *		'```'
		 *	].join('\n')
		 * };
		 * ```
		 * 
		 * *Please Note* that clients might sanitize the return markdown. A client could decide to
		 * remove HTML from the markdown to avoid script execution.
		 */
		interface MarkupContent {
			/**
			 * The type of the Markup
			 */
			kind: MarkupKind;
			/**
			 * The content itself
			 */
			value: string;
		}
		/**
		 * The kind of a completion entry.
		 */
		namespace CompletionItemKind {
			const Text = 1;
			const Method = 2;
			const Function = 3;
			const Constructor = 4;
			const Field = 5;
			const Variable = 6;
			const Class = 7;
			const Interface = 8;
			const Module = 9;
			const Property = 10;
			const Unit = 11;
			const Value = 12;
			const Enum = 13;
			const Keyword = 14;
			const Snippet = 15;
			const Color = 16;
			const File = 17;
			const Reference = 18;
			const Folder = 19;
			const EnumMember = 20;
			const Constant = 21;
			const Struct = 22;
			const Event = 23;
			const Operator = 24;
			const TypeParameter = 25;
		}
		type CompletionItemKind = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18 | 19 | 20 | 21 | 22 | 23 | 24 | 25;
		/**
		 * Defines whether the insert text in a completion item should be interpreted as
		 * plain text or a snippet.
		 */
		namespace InsertTextFormat {
		}
		type InsertTextFormat = 1 | 2;
		/**
		 * A completion item represents a text snippet that is
		 * proposed to complete text that is being typed.
		 */
		interface CompletionItem {
			/**
			 * The label of this completion item. By default
			 * also the text that is inserted when selecting
			 * this completion.
			 */
			label: string;
			/**
			 * The kind of this completion item. Based of the kind
			 * an icon is chosen by the editor.
			 */
			kind?: CompletionItemKind;
			/**
			 * A human-readable string with additional information
			 * about this item, like type or symbol information.
			 */
			detail?: string;
			/**
			 * A human-readable string that represents a doc-comment.
			 */
			documentation?: string | MarkupContent;
			/**
			 * Indicates if this item is deprecated.
			 */
			deprecated?: boolean;
			/**
			 * A string that should be used when comparing this item
			 * with other items. When `falsy` the [label](#CompletionItem.label)
			 * is used.
			 */
			sortText?: string;
			/**
			 * A string that should be used when filtering a set of
			 * completion items. When `falsy` the [label](#CompletionItem.label)
			 * is used.
			 */
			filterText?: string;
			/**
			 * A string that should be inserted into a document when selecting
			 * this completion. When `falsy` the [label](#CompletionItem.label)
			 * is used.
			 * 
			 * The `insertText` is subject to interpretation by the client side.
			 * Some tools might not take the string literally. For example
			 * VS Code when code complete is requested in this example `con<cursor position>`
			 * and a completion item with an `insertText` of `console` is provided it
			 * will only insert `sole`. Therefore it is recommended to use `textEdit` instead
			 * since it avoids additional client side interpretation.
			 * 
			 * @deprecated Use textEdit instead.
			 */
			insertText?: string;
			/**
			 * The format of the insert text. The format applies to both the `insertText` property
			 * and the `newText` property of a provided `textEdit`.
			 */
			insertTextFormat?: InsertTextFormat;
			/**
			 * An [edit](#TextEdit) which is applied to a document when selecting
			 * this completion. When an edit is provided the value of
			 * [insertText](#CompletionItem.insertText) is ignored.
			 * 
			 * *Note:* The text edit's range must be a [single line] and it must contain the position
			 * at which completion has been requested.
			 */
			textEdit?: TextEdit;
			/**
			 * An optional array of additional [text edits](#TextEdit) that are applied when
			 * selecting this completion. Edits must not overlap (including the same insert position)
			 * with the main [edit](#CompletionItem.textEdit) nor with themselves.
			 * 
			 * Additional text edits should be used to change text unrelated to the current cursor position
			 * (for example adding an import statement at the top of the file if the completion item will
			 * insert an unqualified type).
			 */
			additionalTextEdits?: TextEdit[];
			/**
			 * An optional set of characters that when pressed while this completion is active will accept it first and
			 * then type that character. *Note* that all commit characters should have `length=1` and that superfluous
			 * characters will be ignored.
			 */
			commitCharacters?: string[];
			/**
			 * An data entry field that is preserved on a completion item between
			 * a [CompletionRequest](#CompletionRequest) and a [CompletionResolveRequest]
			 * (#CompletionResolveRequest)
			 */
			data?: any;
		}
		/**
		 * The CompletionItem namespace provides functions to deal with
		 * completion items.
		 */
		namespace CompletionItem {
		}
	}
	/**
	 * 
	 */
	export class AlphabetRange {
		readonly from: number;
		readonly to: number;
		constructor(from: number, to: number);
	}
	/**
	 * A disposable class for easily creating Alphabet instances
	 * (This design avoids introducing mutability into the Alphabet class).
	 */
	export class AlphabetBuilder {
		/** */
		constructor(...others: (X.Alphabet | AlphabetRange | string | number)[]);
		/**
		 * Adds an entry to the alphabet.
		 * If the second parameter is omitted, the entry refers to a
		 * single character, rather than a range of characters.
		 */
		add(from: string | number, to?: string | number): this;
		/** */
		addWild(): void;
		/**
		 * @returns An optimized Alphabet instances composed
		 * from the characters and ranges applied to this AlphabetBuilder.
		 * 
		 * @param invert In true, causes the entries in the generated
		 * Alphabet to be reversed, such that every character marked
		 * as included is excluded, and vice versa.
		 */
		toAlphabet(invert?: boolean): Alphabet;
		/** */
		private readonly ranges;
	}
	/**
	 * 
	 */
	export class MutableTransitionMap extends TransitionMap {
		/** */
		initialize(srcStateId: number): void;
		/** */
		set(srcStateId: number, symbol: string, dstStateId: number): void;
	}
	/**
	 * 
	 */
	export interface ITransitionLiteral {
		[stateId: number]: ITransitionStateLiteral;
	}
	/**
	 * 
	 */
	export interface ITransitionStateLiteral {
		[symbol: string]: number;
	}
	/**
	 * 
	 */
	export class Document {
		/**
		 * Fills the document with the specified source code.
		 * If the document is non-empty, it is emptied before being filled.
		 * @param source The source text to fill the document.
		 */
		private fill;
		/**
		 * @returns An array of Statement objects that represent
		 * ancestry of the specified statement. If the specified
		 * statement is not in this document, the returned value
		 * is null.
		 */
		getAncestry(statement: Statement | number): Statement[] | null;
		/**
		 * @returns The parent Statement object of the specified
		 * Statement. If the statement is top level, a reference to
		 * this document object is returned. If the statement is
		 * not found in the document, or the specified statement
		 * is a no-op, the returned value is null.
		 */
		getParent(statement: Statement | number): this | Statement | null;
		/**
		 * @returns The Statement that would act as the parent
		 * if a statement where to be inserted at the specified
		 * virtual position in the document. If an inserted
		 * statement would be top-level, a reference to this
		 * document object is returned.
		 */
		getParentFromPosition(virtualLine: number, virtualOffset: number): Statement | this;
		/**
		 * @returns The sibling Statement objects of the
		 * specified Statement. If the specified statement
		 * is not found in the document, or is a no-op, the
		 * returned value is null.
		 */
		getSiblings(statement: Statement | number): Statement[] | null;
		/**
		 * @returns The child Statement objects of the specified
		 * Statement. If the argument is null or omitted, the document's
		 * top-level statements are returned. If the specified statement
		 * is not found in the document, the returned value is null.
		 */
		getChildren(statement?: Statement | null): Statement[];
		/**
		 * @returns A boolean value that indicates whether the specified
		 * statement, or the statement at the specified index has any
		 * descendants. If the argument is null, the returned value is a
		 * boolean indicating whether this document has any non-noop
		 * statements.
		 */
		hasDescendants(statement: Statement | number | null): boolean;
		/**
		 * @returns The index of the specified statement in
		 * the document, relying on caching when available.
		 * If the statement does not exist in the document,
		 * the returned value is -1.
		 */
		getLineNumber(statement: Statement): number;
		/**
		 * @returns An array of strings containing the content
		 * written in the comments directly above the specified
		 * statement. Whitespace lines are ignored. If the specified
		 * statement is a no-op, an empty array is returned.
		 */
		getNotes(statement: Statement | number): string[];
		/**
		 * Enumerates through each statement that is a descendant of the
		 * specified statement. If the parameters are null or omitted, all
		 * statements in this Document are yielded.
		 * 
		 * The method yields an object that contains the yielded statement,
		 * as well as a numeric level value that specifies the difference in
		 * the number of nesting levels between the specified initialStatement
		 * and the yielded statement.
		 * 
		 * @param initialStatement A reference to the statement object
		 * from where the enumeration should begin.
		 * 
		 * @param includeInitial A boolean value indicating whether or
		 * not the specified initialStatement should also be returned
		 * as an element in the enumeration. If true, initialStatement
		 * must be non-null.
		 */
		eachDescendant(initialStatement?: Statement | null, includeInitial?: boolean): IterableIterator<{
			statement: Statement;
			level: number;
		}>;
		/**
		 * @deprecated
		 * Enumerates through each unique URI defined in this document,
		 * that are referenced within the descendants of the specified
		 * statement. If the parameters are null or omitted, all unique
		 * URIs referenced in this document are yielded.
		 * 
		 * @param initialStatement A reference to the statement object
		 * from where the enumeration should begin.
		 * 
		 * @param includeInitial A boolean value indicating whether or
		 * not the specified initialStatement should also be returned
		 * as an element in the enumeration. If true, initialStatement
		 * must be non-null.
		 */
		eachUri(initialStatement?: Statement | null, includeInitial?: boolean): IterableIterator<{
			uri: Uri;
			uriText: string;
		}>;
		/**
		 * Enumerates through each statement in the document,
		 * starting at the specified statement, or numeric position.
		 * 
		 * @yields The statements in the order that they appear
		 * in the document, excluding whitespace-only statements.
		 */
		eachStatement(statement?: Statement | number): IterableIterator<Statement>;
		/**
		 * Reads the Statement at the given position.
		 * Negative numbers read Statement starting from the end of the document.
		 */
		read(lineNumber: number): Statement;
		/**
		 * Convenience method that converts a statement or it's index
		 * within this document to a statement object.
		 */
		private toStatement;
		/**
		 * Convenience method to quickly turn a value that may be
		 * a statement or a statement index, into a bounded statement
		 * index.
		 */
		private toLineNumber;
		/**
		 * Starts an edit transaction in the specified callback function.
		 * Edit transactions are used to synchronize changes made in
		 * an underlying file, typically done by a user in a text editing
		 * environment. System-initiated changes such as automated
		 * fixes, refactors, or renames do not go through this pathway.
		 * @param editFn The callback function in which to perform
		 * document mutation operations.
		 */
		edit(editFn: (facts: IDocumentMutator) => void): void;
		/** Stores the URI from where this document was loaded. */
		readonly sourceUri: Uri;
		/** A reference to the instance of the Compiler that owns this Document. */
		readonly program: Program;
		/**
		 * Stores the complete list of the Document's statements,
		 * sorted in the order that they appear in the file.
		 */
		private readonly statements;
		/**
		 * Shifts the cached statement indexes above the specified
		 * number, by the specified offset. Once the size of the cache
		 * grows past a certain threshold, the statement cache is cleared.
		 * Shifting the indexes of small caches is a simple optimization
		 * that allows the document to avoid throwing away the entire
		 * cache for many edits to the document.
		 */
		private shiftStatementIndexCache;
		/**
		 * Stores a cache of the indexes at which various statements
		 * are located in the statements array. Not all statements
		 * contained in the document are stored in this array. The
		 * cache is built up and cleared over time.
		 */
		private readonly statementIndexCache;
		/**
		 * A state variable that stores whether an
		 * edit transaction is currently underway.
		 */
		private inEdit;
		private _version;
		/**
		 * Returns a formatted version of the Document.
		 */
		toString(): string;
	}
	/**
	 * Represents an interface for creating a
	 * batch of document mutation operations.
	 */
	interface IDocumentMutator {
		/**
		 * Inserts a fact at the given position, and returns the inserted Fact.
		 * Negative numbers insert facts starting from the end of the document.
		 * The factText argument is expected to be one single complete line of text.
		 */
		insert(text: string, at: number): void;
		/**
		 * Replaces a fact at the given position, and returns the replaced Fact.
		 * Negative numbers insert facts starting from the end of the document.
		 * The factText argument is expected to be one single complete line of text.
		 */
		update(factText: string, at: number): void;
		/**
		 * Deletes a fact at the given position, and returns the deleted Fact.
		 * Negative numbers delete facts starting from the end of the document.
		 */
		delete(at: number, count: number): void;
	}
	/**
	 * A class that stores all the documents loaded into a
	 * program, and the inter-dependencies between them.
	 */
	export class DocumentGraph {
		/** */
		constructor(program: Program);
		/**
		 * Reads a Document from the specified URI.
		 * The document is created and returned, asynchronously.
		 */
		read(uri: Uri): Promise<Error | Document>;
		/**
		 * Creates a temporary document that will exist only in memory.
		 * The document may not be linked to other documents in the
		 * graph.
		 */
		create(): Document;
		/**
		 * Creates a temporary document that will exist only in memory,
		 * which is initialized with the specified source text. The document
		 * may not be linked to other documents in the graph.
		 */
		create(sourceText: string): Document;
		/**
		 * Creates a document that was read from the specified URI,
		 * with the specified sourceText. If the content still needs to be
		 * read from a URI, use the .read() method.
		 */
		create(uri: Uri | string, sourceText: string): Document;
		/**
		 * Blocks execution until all queued IO operations have completed.
		 */
		await(): Promise<void>;
		/**
		 * @returns The document loaded into this graph
		 * with the specified URI.
		 */
		get(uri: Uri): Document | null;
		/**
		 * @returns A boolean value that indicates whether
		 * the specified Document has been loaded into
		 * this DocumentGraph.
		 */
		has(param: Uri | Document): boolean;
		/**
		 * @returns An array containing all documents loaded into this
		 * DocumentGraph. The array returned is sorted topologically
		 * from left to right, so that forward traversals are guaranteed
		 * to not cause dependency conflicts.
		 */
		each(): Document[];
		/**
		 * Deletes a document that was previously loaded into the compiler.
		 * Intended to be called by the host environment when a file changes.
		 */
		delete(target: Document | Uri): void;
		/**
		 * Removes all documents from this graph.
		 */
		clear(): void;
		/**
		 * @returns An array containing the dependencies
		 * associated with the specified document. The returned
		 * array is sorted in the order in which the dependencies
		 * are defined in the document.
		 */
		getDependencies(doc: Document): Document[];
		/**
		 * @returns An array containing the dependents
		 * associated with the specified document.
		 */
		getDependents(doc: Document): Document[];
		/**
		 * Attempts to add a link from one document to another,
		 * via the specified URI. If there is some reason why the
		 * link cannot be established, (circular references, bad
		 * URIs), no link is added, and a fault is reported.
		 */
		private tryLink;
		/**
		 * An array of functions that should be executed when
		 * all outstanding async operations have completed.
		 */
		private waitFns;
		/**
		 * Counts the number of async operations in progress.
		 */
		private asyncCount;
		/**
		 * Checks to see if the addition of a reference between the two
		 * specified documents would result in a document graph with
		 * circular relationships.
		 * 
		 * The algorithm used performs a depth-first dependency search,
		 * starting at the candidateTo. If the traversal pattern is able to
		 * make its way to candidateFrom, it can be concluded that the
		 * addition of the proposed reference would result in a cyclical
		 * relationship.
		 */
		private wouldCreateCycles;
		/**
		 * Adds a dependency between two documents in the graph.
		 * If a dependency between the two documents already exists,
		 * the reference count of the dependency is incremented.
		 * This method is executed only after other methods have
		 * indicated that the addition of the link will not cause conflict.
		 */
		private link;
		/**
		 * Removes a dependency between two documents in the graph.
		 * If the reference count of the dependency is greater than 1, the
		 * the reference count is decremented instead of the dependency
		 * being removed completely.
		 */
		private unlink;
		/**
		 * A map of documents loaded into the graph,
		 * indexed by their URIs.
		 */
		private readonly documents;
		/**
		 * A map of each document's dependencies.
		 */
		private readonly dependencies;
		/**
		 * A map of the documents that depend on each document.
		 */
		private readonly dependents;
		/** */
		private readonly program;
		/**
		 * Converts the contents of this DocumentGraph to a
		 * string representation, useful for testing purposes.
		 */
		toString(): string;
	}
	/**
	 * 
	 */
	export class ParseFault {
		readonly innerType: Readonly<FaultType<Statement>>;
		readonly offsetStart: number;
		readonly offsetEnd: number;
		constructor(innerType: Readonly<FaultType<Statement>>, offsetStart: number, offsetEnd: number);
	}
	/**
	 * 
	 */
	export class LineParser {
		/**
		 * Generator function that yields all statements
		 * (unparsed lines) of the given source text.
		 */
		static read(fullSource: string): IterableIterator<string>;
		/**
		 * Main entry point for parsing a single line and producing a
		 * RawStatement object.
		 * 
		 * The parsing algorithm is some kind of quasi-recusive descent with
		 * lookheads and backtracking in some places to make the logic easier
		 * to follow. Technically, it's probably some mash-up of LL(k) & LALR.
		 * Maybe if I blew 4 years of my life in some silly Comp Sci program
		 * instead of dropping out of high school I could say for sure.
		 */
		static parse(lineText: string): Line;
		/** */
		private constructor();
	}
	/**
	 * Placeholder object to mark the position of
	 * an anonymous type within a statement.
	 */
	export class Anon {
		/** */
		toString(): string;
	}
	/**
	 * Stores information about a line, after being parsed.
	 * A Line is different from a Statement in that it has no
	 * relationship to a Document.
	 */
	export class Line {
		readonly sourceText: string;
		readonly indent: number;
		readonly declarations: BoundaryGroup<DeclarationSubject>;
		readonly annotations: BoundaryGroup<AnnotationSubject>;
		readonly sum: string;
		readonly jointPosition: number;
		readonly flags: LineFlags;
		readonly parseFault: ParseFault | null;
		/*** */
		constructor(sourceText: string, indent: number, declarations: BoundaryGroup<DeclarationSubject>, annotations: BoundaryGroup<AnnotationSubject>, sum: string, jointPosition: number, flags: LineFlags, parseFault: ParseFault | null);
	}
	/**
	 * A bit field enumeration used to efficiently store
	 * meta data about a Line (or a Statement) object.
	 */
	export enum LineFlags {
		none = 0,
		isRefresh = 1,
		isComment = 2,
		isWhitespace = 4,
		isDisposed = 8,
		isCruft = 16,
		hasUri = 32,
		hasTotalPattern = 64,
		hasPartialPattern = 128,
		hasPattern = 256
	}
	/**
	 * Stakes out starting and ending character positions
	 * of subjects within a given region.
	 */
	export class BoundaryGroup<TSubject> {
		/** */
		constructor(boundaries: Boundary<TSubject>[]);
		/** */
		[Symbol.iterator](): IterableIterator<Boundary<TSubject>>;
		/** */
		eachSubject(): IterableIterator<TSubject>;
		/** */
		inspect(offset: number): TSubject | null;
		/** */
		first(): Boundary<TSubject> | null;
		/** Gets the number of entries defined in the bounds. */
		readonly length: number;
		/** */
		private readonly entries;
	}
	/** */
	export class Boundary<TSubject> {
		readonly offsetStart: number;
		readonly offsetEnd: number;
		readonly subject: TSubject;
		constructor(offsetStart: number, offsetEnd: number, subject: TSubject);
	}
	/**
	 * 
	 */
	export class Statement {
		/**
		 * 
		 */
		private eachStatementLevelFaults;
		/**
		 * Gets whether the joint operator exists at the
		 * end of the statement, forcing the statement's
		 * declarations to be "refresh types".
		 */
		readonly isRefresh: boolean;
		/**
		 * Gets whether the statement contains nothing
		 * other than a single joint operator.
		 */
		readonly isVacuous: boolean;
		/**
		 * Gets whether the statement is a comment.
		 */
		readonly isComment: boolean;
		/**
		 * Gets whether the statement contains
		 * no non-whitespace characters.
		 */
		readonly isWhitespace: boolean;
		/**
		 * Gets whether the statement is a comment or whitespace.
		 */
		readonly isNoop: boolean;
		/**
		 * Gets whether the statement has been
		 * removed from it's containing document.
		 */
		readonly isDisposed: boolean;
		/**
		 * 
		 */
		readonly isCruft: boolean;
		/** */
		readonly faults: ReadonlyArray<Fault>;
		/** Stores a reference to the document that contains this statement. */
		readonly document: Document;
		/** Stores the indent level of the statement. */
		readonly indent: number;
		/**
		 * Stores the set of objects that are contained by this Statement,
		 * and are marked as cruft. Note that the only Statement object
		 * that may be located in this set is this Statement object itself.
		 */
		readonly cruftObjects: ReadonlySet<Statement | Span | InfixSpan>;
		/**
		 * Gets an array of spans in that represent the declarations
		 * of this statement, excluding those that have been marked
		 * as object-level cruft.
		 */
		readonly declarations: ReadonlyArray<Span>;
		/**
		 * Stores the array of spans that represent the declarations
		 * of this statement, including those that have been marked
		 * as object-level cruft.
		 */
		readonly allDeclarations: ReadonlyArray<Span>;
		/**
		 * Gets an array of spans in that represent the annotations
		 * of this statement, from left to right, excluding those that
		 * have been marked as object-level cruft.
		 */
		readonly annotations: ReadonlyArray<Span>;
		/**
		 * Stores the array of spans that represent the annotations
		 * of this statement, including those that have been marked
		 * as object-level cruft.
		 */
		readonly allAnnotations: ReadonlyArray<Span>;
		/**
		 * Gets an array of spans in that represent both the declarations
		 * and the annotations of this statement, excluding those that have
		 * been marked as object-level cruft.
		 */
		readonly spans: Span[];
		/**
		 * 
		 */
		readonly allSpans: Span[];
		/**
		 * Stores the position at which the joint operator exists
		 * in the statement. A negative number indicates that
		 * the joint operator does not exist in the statement.
		 */
		readonly jointPosition: number;
		/**
		 * Stores the unprocessed text content of the statement,
		 * as it appears in the document.
		 */
		readonly sourceText: string;
		/**
		 * Stores the statement's textual *sum*, which is the
		 * raw text of the statement's annotations, with whitespace
		 * trimmed. The sum is suitable as an input to a total
		 * pattern.
		 */
		readonly sum: string;
		/**
		 * Gets a boolean value indicating whether or not the
		 * statement contains a declaration of a pattern.
		 */
		readonly hasPattern: boolean;
		/**
		 * @returns The kind of StatementRegion that exists
		 * at the given character offset within the Statement.
		 */
		getRegion(offset: number): StatementRegion;
		/**
		 * 
		 */
		getSubject(offset: number): Span | null;
		/**
		 * @returns A span to the declaration subject at the
		 * specified offset, or null if there is none was found.
		 */
		getDeclaration(offset: number): Span | null;
		/**
		 * @returns A span to the annotation subject at the
		 * specified offset, or null if there is none was found.
		 */
		getAnnotation(offset: number): Span | null;
		/**
		 * @returns A string containing the inner comment text of
		 * this statement, excluding the comment syntax token.
		 * If the statement isn't a comment, null is returned.
		 */
		getCommentText(): string | null;
		/**
		 * Converts the statement to a formatted string representation.
		 */
		toString(includeIndent?: boolean): string;
	}
	/**
	 * Defines the areas of a statement that are significantly
	 * different when performing inspection.
	 */
	export enum StatementRegion {
		/**
		 * Refers to the area within a comment statement,
		 * or the whitespace preceeding a non-no-op.
		 */
		void = 0,
		/**
		 * Refers to the area in the indentation area.
		 */
		whitespace = 1,
		/**
		 * Refers to the
		 */
		pattern = 2,
		/** */
		declaration = 3,
		/** */
		annotation = 4,
		/** */
		declarationVoid = 5,
		/** */
		annotationVoid = 6
	}
	/**
	 * 
	 */
	export class Pattern {
		/**
		 * 
		 */
		readonly units: ReadonlyArray<RegexUnit | Infix>;
		/**
		 * Stores whether the pattern is considered to be "Total"
		 * or "Partial". Total patterns must match an entire annotation
		 * set (the entire strip of content to the right of a joint, after
		 * being trimmed). Partial patterns match individually
		 * specified subjects (separated by commas).
		 */
		readonly isTotal: boolean;
		/**
		 * Stores a CRC which is computed from the set of
		 * annotations specified to the right of the pattern.
		 */
		readonly crc: string;
		/**
		 * Stores whether the internal regular expression
		 * was compiled successfully.
		 */
		readonly isValid: boolean;
		/**
		 * Recursively enumerates through this Pattern's unit structure.
		 */
		eachUnit(): IterableIterator<RegexUnit | Infix>;
		/**
		 * @returns A boolean value that indicates whether
		 * this Pattern has at least one infix, of any type.
		 */
		hasInfixes(): boolean;
		/**
		 * @returns An array containing the infixes of the
		 * specified type that are defined in this Pattern.
		 * If the argument is omitted, all infixes of any type
		 * defined on this Pattern are returned.
		 */
		getInfixes(type?: InfixFlags): Infix[];
		/**
		 * Performs an "expedient" test that determines whether the
		 * specified input has a chance of being matched by this pattern.
		 * The check is considered expedient, rather than thorough,
		 * because any infixes that exist in this pattern are replaced
		 * with "catch all" regular expression sequence, rather than
		 * embedding the pattern associated with the type specified
		 * in the infix.
		 */
		test(input: string): boolean;
		/**
		 * Executes the pattern (like a function) using the specified
		 * string as the input.
		 * 
		 * @returns A ReadonlyMap whose keys align with the infixes
		 * contained in this Pattern, and whose values are strings that
		 * are the extracted "inputs", found in the place of each infix.
		 * If this Pattern has no infixes, an empty map is returned.
		 */
		exec(patternParameter: string): ReadonlyMap<Infix, string>;
		/** */
		private compiledRegExp;
		/**
		 * Converts this Pattern to a string representation.
		 * (Note that the serialized pattern cannot be used
		 * as a parameter to a JavaScript RegExp object.)
		 */
		toString(): string;
	}
	/** */
	export class PatternPrecompiler {
		/**
		 * Compiles the specified pattern into a JS-native
		 * RegExp object that can be used to execute regular
		 * expression pre-matching (i.e. checks that essentially
		 * ignore any infixes that the pattern may have).
		 */
		static exec(pattern: Pattern): RegExp | null;
	}
	/**
	 * Ambient unifier for all PatternUnit instances
	 */
	export abstract class RegexUnit {
		readonly quantifier: RegexQuantifier | null;
		constructor(quantifier: RegexQuantifier | null);
		/** */
		abstract toString(): string;
	}
	/**
	 * 
	 */
	export class RegexSet extends RegexUnit {
		readonly knowns: ReadonlyArray<RegexSyntaxKnownSet>;
		readonly ranges: ReadonlyArray<RegexCharRange>;
		readonly unicodeBlocks: ReadonlyArray<string>;
		readonly singles: ReadonlyArray<string>;
		readonly isNegated: boolean;
		readonly quantifier: RegexQuantifier | null;
		/** */
		constructor(knowns: ReadonlyArray<RegexSyntaxKnownSet>, ranges: ReadonlyArray<RegexCharRange>, unicodeBlocks: ReadonlyArray<string>, singles: ReadonlyArray<string>, isNegated: boolean, quantifier: RegexQuantifier | null);
		/** */
		toString(): string;
		/** */
		toAlphabet(): Alphabet;
	}
	/**
	 * 
	 */
	export class RegexCharRange {
		readonly from: number;
		readonly to: number;
		constructor(from: number, to: number);
	}
	/**
	 * 
	 */
	export class RegexGroup extends RegexUnit {
		/**
		 * 
		 */
		readonly cases: ReadonlyArray<ReadonlyArray<RegexUnit>>;
		readonly quantifier: RegexQuantifier | null;
		constructor(
		/**
		 * 
		 */
		cases: ReadonlyArray<ReadonlyArray<RegexUnit>>, quantifier: RegexQuantifier | null);
		/** */
		toString(): string;
	}
	/**
	 * A pattern "grapheme" is a pattern unit class that
	 * represents:
	 * 
	 * a) A "Literal", which is a single unicode-aware character,
	 * with possible representations being an ascii character,
	 * a unicode character, or an ascii or unicode escape
	 * sequence.
	 * 
	 * or b) A "Special", which is a sequence that matches
	 * something other than the character specified,
	 * such as . \b \s
	 */
	export class RegexGrapheme extends RegexUnit {
		readonly grapheme: string;
		readonly quantifier: RegexQuantifier | null;
		constructor(grapheme: string, quantifier: RegexQuantifier | null);
		/** */
		toString(): string;
	}
	/**
	 * A Regex "Sign" refers to an escape sequence that refers
	 * to one other character, as opposed to that character
	 * being written directly in the parse stream.
	 */
	export class RegexSign extends RegexUnit {
		readonly sign: RegexSyntaxSign;
		readonly quantifier: RegexQuantifier | null;
		constructor(sign: RegexSyntaxSign, quantifier: RegexQuantifier | null);
		/** */
		toString(): string;
	}
	/**
	 * A pattern unit class that represents +, *,
	 * and explicit quantifiers such as {1,2}.
	 */
	export class RegexQuantifier {
		/**
		 * Stores the lower bound of the quantifier,
		 * or the fewest number of graphemes to be matched.
		 */
		readonly min: number;
		/**
		 * Stores the upper bound of the quantifier,
		 * or the most number of graphemes to be matched.
		 */
		readonly max: number;
		/**
		 * Stores whether the the quantifier is restrained,
		 * in that it matches the fewest possible number
		 * of characters.
		 * 
		 * (Some regular expression flavours awkwardly
		 * refer to this as "non-greedy".)
		 */
		readonly restrained: boolean;
		constructor(
		/**
		 * Stores the lower bound of the quantifier,
		 * or the fewest number of graphemes to be matched.
		 */
		min: number,
		/**
		 * Stores the upper bound of the quantifier,
		 * or the most number of graphemes to be matched.
		 */
		max: number,
		/**
		 * Stores whether the the quantifier is restrained,
		 * in that it matches the fewest possible number
		 * of characters.
		 * 
		 * (Some regular expression flavours awkwardly
		 * refer to this as "non-greedy".)
		 */
		restrained: boolean);
		/**
		 * Converts the regex quantifier to an optimized string.
		 */
		toString(): string;
	}
	/**
	 * A class that represents a portion of the content
	 * within an Infix that spans a type reference.
	 */
	export class Infix {
		/**
		 * Stores the left-most character position of the Infix
		 * (before the delimiter), relative to the containing statement.
		 */
		readonly offsetStart: number;
		/**
		 * Stores the left-most character position of the Infix
		 * (after the delimiter), relative to the containing statement.
		 */
		readonly offsetEnd: number;
		/**
		 * Stores the Bounds object that marks out the positions
		 * of the identifiers in the Infix that are located before
		 * any Joint operator.
		 */
		readonly lhs: BoundaryGroup<Identifier>;
		/**
		 * Stores the Bounds object that marks out the positions
		 * of the identifiers in the Infix that are located after
		 * any Joint operator.
		 */
		readonly rhs: BoundaryGroup<Identifier>;
		/** */
		readonly flags: InfixFlags;
		constructor(
		/**
		 * Stores the left-most character position of the Infix
		 * (before the delimiter), relative to the containing statement.
		 */
		offsetStart: number,
		/**
		 * Stores the left-most character position of the Infix
		 * (after the delimiter), relative to the containing statement.
		 */
		offsetEnd: number,
		/**
		 * Stores the Bounds object that marks out the positions
		 * of the identifiers in the Infix that are located before
		 * any Joint operator.
		 */
		lhs: BoundaryGroup<Identifier>,
		/**
		 * Stores the Bounds object that marks out the positions
		 * of the identifiers in the Infix that are located after
		 * any Joint operator.
		 */
		rhs: BoundaryGroup<Identifier>,
		/** */
		flags: InfixFlags);
		/**
		 * Gets whether this Infix is of the "pattern" variety.
		 */
		readonly isPattern: boolean;
		/**
		 * Gets whether this Infix is of the "portability" variety.
		 */
		readonly isPortability: boolean;
		/**
		 * Gets whether this Infix is of the "population" variety.
		 */
		readonly isPopulation: boolean;
		/**
		 * Gets whether this Infix has the "nominal" option set.
		 */
		readonly isNominal: boolean;
		/** */
		toString(): string;
	}
	/**
	 * 
	 */
	export enum InfixFlags {
		none = 0,
		/**
		 * Indicates that the joint was specified within
		 * the infix. Can be used to determine if the infix
		 * contains some (erroneous) syntax resembing
		 * a refresh type, eg - /<Type : >/
		 */
		hasJoint = 1,
		/**
		 * Indicates that the </Pattern/> syntax was
		 * used to embed the patterns associated
		 * with a specified type.
		 */
		pattern = 2,
		/**
		 * Indicates that the infix is of the "portabiity"
		 * variety, using the syntax < : Type>
		 */
		portability = 4,
		/**
		 * Indicates that the infix is of the "popuation"
		 * variety, using the syntax <Declaration : Annotation>
		 * or <Declaration>
		 */
		population = 8,
		/**
		 * Indicates that the <<Double>> angle bracket
		 * syntax was used to only match named types,
		 * rather than aliases.
		 */
		nominal = 16
	}
	/**
	 * A class that represents a single subject in a Statement.
	 * Consumers of this class should not expect Subject objects
	 * to be long-lived, as they are discarded regularly after edit
	 * transactions complete.
	 */
	export class Identifier {
		/** */
		constructor(text: string);
		/**
		 * Stores a full string representation of the subject,
		 * as it appears in the document.
		 */
		readonly fullName: string;
		/**
		 * Stores a string representation of the name of the
		 * type to which the subject refers, without any List
		 * operator suffix.
		 */
		readonly typeName: string;
		/** */
		readonly isList: boolean;
		/**
		 * Converts this Subject to it's string representation.
		 * @param escape If true, preserves any necessary
		 * escaping required to ensure the identifier string
		 * is in a parsable format.
		 */
		toString(escape?: IdentifierEscapeKind): string;
	}
	/**
	 * An enumeration that describes the various ways
	 * to handle escaping when serializing an identifier.
	 * This enumeration is used to address the differences
	 * in the way identifiers can be serialized, which can
	 * depend on whether the identifier is a declaration or
	 * an annotation.
	 */
	export const enum IdentifierEscapeKind {
		none = 0,
		declaration = 1,
		annotation = 2
	}
	/**
	 * A class that represents a position in a statement.
	 */
	export class Span {
		/**
		 * Stores a reference to the Statement that contains this Span.
		 */
		readonly statement: Statement;
		/**
		 * Stores the subject, and the location of it in the document.
		 */
		readonly boundary: Boundary<Subject>;
		/**
		 * Stores a string representation of this Span, useful for debugging.
		 */
		private readonly name;
		/**
		 * Gets the Infixes stored within this Span, in the case when
		 * the Span corresponds to a Pattern. In other cases, and
		 * empty array is returned.
		 */
		readonly infixes: ReadonlyArray<Infix>;
		private _infixes;
		/** */
		eachDeclarationForInfix(infix: Infix): IterableIterator<InfixSpan>;
		/** */
		eachAnnotationForInfix(infix: Infix): IterableIterator<InfixSpan>;
		/** */
		private queryInfixSpanTable;
		/** */
		private readonly infixSpanTable;
		/**
		 * Gets an array of statements that represent the statement
		 * containment progression, all the way back to the containing
		 * document.
		 */
		readonly ancestry: ReadonlyArray<Statement>;
		private _ancestry;
		/**
		 * Splits apart the groups subjects specified in the containing
		 * statement's ancestry, and generates a series of spines,
		 * each indicating a separate pathway of declarations through
		 * the ancestry that reach the location in the document
		 * referenced by this global span object.
		 * 
		 * The generated spines are referentially opaque. Running this
		 * method on the same Span object always returns the same
		 * Spine instance.
		 */
		factor(): ReadonlyArray<Spine>;
		/**  */
		private factoredSpines;
		/**
		 * Gets a boolean value that indicates whether this Span is considered
		 * object-level cruft, and should therefore be ignored during type analysis.
		 */
		readonly isCruft: boolean;
		/** */
		toString(): string;
	}
	/**
	 * A class that manages an array of Span objects that
	 * represent a specific spine of declarations, starting at
	 * a document, passing through a series of spans,
	 * and ending at a tip span.
	 * 
	 * In the case when
	 */
	export class Spine {
		/** */
		constructor(vertebrae: (X.Span | Statement)[]);
		/** Stores the last span in the array of segments. */
		readonly tip: Span;
		/** */
		readonly statement: Statement;
		/** Gets a reference to the document that sits at the top of the spine. */
		readonly document: Document;
		/** Stores an array of the Spans that compose the Spine. */
		readonly vertebrae: ReadonlyArray<Span | CruftMarker>;
	}
	/**
	 * A class that acts as a stand-in for a statement that has been
	 * marked as cruft, suitable for usage in a Spine.
	 */
	export class CruftMarker {
		readonly statement: Statement;
		/**
		 * Converts this cruft marker to a string representation,
		 * which is derived from a CRC calculated from this
		 * marker's underlying statement.
		 */
		toString(): string;
	}
	/** */
	export type Subject = DeclarationSubject | AnnotationSubject;
	/**
	 * Stores a map of the character offsets within a Statement
	 * that represent the starting positions of the statement's
	 * declarartions.
	 */
	export type DeclarationSubject = Identifier | Pattern | Uri | Anon;
	/**
	 * Stores a map of the character offsets within a Statement
	 * that represent the starting positions of the statement's
	 * annotations.
	 */
	export type AnnotationSubject = Identifier;
	/** */
	export class SubjectSerializer {
		/**
		 * Universal method for serializing a subject to a string,
		 * useful for debugging and supporting tests.
		 */
		static invoke(subject: Subject, escapeStyle: IdentifierEscapeKind): string;
	}
	/**
	 * @deprecated
	 * This code is only called by the Fragmenter, which is deprecated.
	 */
	export class SubjectParser {
		/**
		 * @deprecated
		 * This code is only called by the Fragmenter, which is deprecated.
		 */
		static invoke(text: string): Subject;
		private constructor();
	}
	/**
	 * 
	 */
	export class HyperGraph {
		private readonly program;
		/**
		 * Reads a root Node with the specified
		 * name out of the specified document.
		 */
		read(document: Document, name: string): Node | null;
		/**
		 * @returns An array containing the node objects
		 * that are defined at the root level of the specified
		 * document.
		 */
		readRoots(document: Document): IterableIterator<Node>;
		/**
		 * Handles a document-level exclusion, which is the removal
		 * of a section of Spans within a document, or possibly the
		 * entire document itself.
		 */
		private exclude;
		/**
		 * Performs a revalidation of the Nodes that correspond to the
		 * input argument.
		 * 
		 * @param root The root object under which which revalidation
		 * should occur. In the case when a Document instance is passed,
		 * all Nodes present within the document are revalidated. In the
		 * case when a Statement instance is passed, the Nodes that
		 * correspond to the Statement, and all of it's contents are
		 * revalidated.
		 */
		private include;
		/**
		 * Performs setup for the invalidate and revalidate methods.
		 */
		private methodSetup;
		/**
		 * Stores a 2-dimensional map of all nodes that
		 * have been loaded into the program, indexed
		 * by a string representation of it's URI.
		 */
		private readonly nodeCache;
		/**
		 * Stores a GraphTransaction instance in the case
		 * when an edit transaction is underway.
		 */
		private activeTransactions;
		/**
		 * Serializes the Graph into a format suitable
		 * for debugging and comparing against baselines.
		 */
		toString(): string;
	}
	/**
	 * A class that represents a single Node contained within
	 * the Program's Graph. Nodes are long-lived, referentially
	 * significant objects that persist between edit frames.
	 * 
	 * Nodes are connected in a graph not by edges, but by
	 * HyperEdges. A HyperEdge (from graph theory) is similar
	 * to a directed edge in that it has a single predecessor,
	 * but differs in that it has multiple successors.
	 * 
	 * It is necessary for Nodes to be connected to each other
	 * in this way, in order for further phases in the pipeline
	 * to execute the various kinds of polymorphic type
	 * resolution.
	 */
	export class Node {
		/**
		 * Removes this Node, and all its contents from the graph.
		 */
		dispose(): void;
		/**
		 * Removes the specified HyperEdge from this Node's
		 * set of outbounds.
		 * 
		 * @throws In the case when the specified HyperEdge is
		 * not owned by this Node.
		 */
		disposeEdge(edge: HyperEdge): void;
		/** */
		readonly container: Node | null;
		/** */
		readonly name: string;
		/** */
		readonly subject: Subject;
		/** */
		readonly uri: Uri;
		/** Stores the document that contains this Node. */
		readonly document: Document;
		/** */
		readonly stamp: VersionStamp;
		/**
		 * Stores the set of declaration-side Span objects that
		 * compose this Node. If this the size of this set were to
		 * reach zero, the Node would be marked for deletion.
		 * (Node cleanup uses a reference counted collection
		 * mechanism that uses the size of this set as it's guide).
		 * 
		 * Note that although the type of this field is defined as
		 * "Set<Span | Anchor>", in practice, it is either a set of
		 * multiple Span objects, or a set containing one single
		 * Anchor object. This is because it's possible to have
		 * fragments of a type declared in multiple places in
		 * a document, however, Anchors (which are references
		 * to declarations within an Infix) can only exist in one
		 * place.
		 */
		readonly declarations: Set<Span | InfixSpan>;
		/**
		 * Gets a readonly map of Nodes that are contained
		 * by this node in the containment hierarchy.
		 */
		readonly contents: NodeMap;
		private readonly _contents;
		/**
		 * Gets a readonly name of Nodes that are adjacent
		 * to this Node in the containment hierarchy.
		 */
		readonly adjacents: NodeMap;
		/**
		 * Gets the names of the identifiers referenced
		 * as portability targets in the infixes of the Node.
		 * If the Node's subject is not a pattern, this property
		 * is an empty array.
		 */
		readonly portabilityTargets: string[];
		/**
		 * @returns A set of nodes that are matched by
		 * patterns of adjacent nodes.
		 * 
		 * (Note that this is possible because annotations
		 * that have been applied to a pattern cannot be
		 * polymorphic)
		 */
		getPatternNodesMatching(nodes: Node[]): Node[];
		/**
		 * Gets an immutable set of HyperEdges from adjacent
		 * or contained Nodes that reference this Node.
		 * 
		 * (The ordering of outbounds isn't important, as
		 * they have no physical representation in the
		 * document, which is why they're stored in a Set
		 * rather than an array.)
		 */
		readonly inbounds: ReadonlySet<HyperEdge>;
		private readonly _inbounds;
		/**
		 * Gets an array of HyperEdges that connect this Node to
		 * others, being either adjacents, or Nodes that
		 * exists somewhere in the containment hierarchy.
		 */
		readonly outbounds: ReadonlyArray<HyperEdge>;
		private readonly _outbounds;
		/**
		 * 
		 */
		private enumerateOutbounds;
		/**
		 * Enumerates upwards through the containment
		 * hierarchy of the Nodes present in this Node's
		 * containing document, yielding the adjacents at
		 * every level, and then continues through to the
		 * root level adjacents of each of the document's
		 * dependencies.
		 */
		enumerateContainment(): IterableIterator<{
			sourceDocument: Document;
			adjacents: ReadonlyMap<string, Node>;
			longitudeDelta: number;
		}>;
		/**
		 * Enumerates upwards through the containment
		 * hierarchy of the Nodes present in this Node's
		 * containing document, yielding each container
		 * of this Node.
		 */
		enumerateContainers(): IterableIterator<Node>;
		/** */
		removeEdgeSource(src: Span | InfixSpan): void;
		/** */
		toString(includePath?: boolean): string;
		/** */
		private addRootNode;
		/** */
		private removeRootNode;
		/** */
		private getRootNodes;
		/** */
		private static rootNodes;
	}
	type NodeMap = ReadonlyMap<string, Node>;
	/**
	 * A HyperEdge connects an origin predecessor Node to a series of
	 * successor Nodes. From graph theory, a "hyper edge" is different
	 * from an "edge" in that it can have many successors:
	 * https://en.wikipedia.org/wiki/Hypergraph
	 */
	export class HyperEdge {
		/**
		 * The Node from where the HyperEdge connection begins.
		 * For example, given the following document:
		 * 
		 * Foo
		 * 	Bar : Foo
		 * 
		 * Two Node objects would be created, one for the first instance
		 * of "Foo", and another for the instance of "Bar". A HyperEdge
		 * would be created between "Bar" and "Foo", and it's
		 * precedessor would refer to the Node representing the
		 * instance of "Bar".
		 */
		readonly predecessor: Node;
		/**
		 * Stores all possible success Nodes to which the predecessor
		 * Node is preemptively connected via this HyperEdge. The
		 * connection is said to be preemptive, because the connection
		 * might be ignored during polymorphic name resolution.
		 */
		readonly successors: ReadonlyArray<Successor>;
		constructor(
		/**
		 * The Node from where the HyperEdge connection begins.
		 * For example, given the following document:
		 * 
		 * Foo
		 * 	Bar : Foo
		 * 
		 * Two Node objects would be created, one for the first instance
		 * of "Foo", and another for the instance of "Bar". A HyperEdge
		 * would be created between "Bar" and "Foo", and it's
		 * precedessor would refer to the Node representing the
		 * instance of "Bar".
		 */
		predecessor: Node,
		/**
		 * 
		 */
		source: Span | InfixSpan,
		/**
		 * Stores all possible success Nodes to which the predecessor
		 * Node is preemptively connected via this HyperEdge. The
		 * connection is said to be preemptive, because the connection
		 * might be ignored during polymorphic name resolution.
		 */
		successors: ReadonlyArray<Successor>);
		/** */
		addSource(source: Span | InfixSpan): void;
		/** */
		removeSource(source: Span | InfixSpan): void;
		/** */
		clearSources(): void;
		/**
		 * The set of annotation-side Spans or annotation-side InfixSpans
		 * that are responsible for the conception of this HyperEdge.
		 * 
		 * The original locations of these Spans (and InfixSpans?) are
		 * potentially scattered across many statements.
		 * 
		 * In the case when the *kind* field is *summation*, this set
		 * must be empty.
		 */
		readonly sources: ReadonlyArray<Span | InfixSpan>;
		/** */
		private readonly sourcesMutable;
		/**
		 * The textual value of an Edge represents different things
		 * depending on the Edge's *kind* property.
		 * 
		 * If *kind* is *literal*, the textual value is the given name
		 * of the type being referenced, for example "String" or
		 * "Employee".
		 * 
		 * If *kind* is *categorical*, the textual value is an alias that
		 * will later be resolved to a specific type, or set of types, for
		 * example "10cm" (presumably resolving to "Unit") or
		 * "user@email.com" (presumable resolving to "Email").
		 * 
		 * If *kind* is *summation* , the textual value is the raw
		 * literal text of the annotation found in the document. For
		 * example, if the document had the content:
		 * 
		 * Foo, Bar : foo, bar
		 * 
		 * This would result in two nodes named "Foo" and "Bar",
		 * each with their own HyperEdges whose textual values
		 * would both be: "foo, bar". In the case of a fragmented
		 * type, the last sum in document order is counted as the
		 * textual value. For example, given the following
		 * document:
		 * 
		 * T : aa, bb
		 * T : xx, yy
		 * 
		 * The "T" node would have a HyperEdge with a textual
		 * value being "xx, yy".
		 * 
		 * The *-overlay kinds have not yet been implemented.
		 */
		readonly identifier: Identifier;
		/**
		 * @returns A string representation of this HyperEdge,
		 * suitable for debugging and testing purposes.
		 */
		toString(): string;
	}
	/**
	 * 
	 */
	export class Successor {
		readonly node: Node;
		/**
		 * The the number of levels of depth in the containment
		 * hierarchy that need to be crossed in order for the containing
		 * HyperEdge to be established between the predecessor and
		 * this successor.
		 */
		readonly longitude: number;
		constructor(node: Node,
		/**
		 * The the number of levels of depth in the containment
		 * hierarchy that need to be crossed in order for the containing
		 * HyperEdge to be established between the predecessor and
		 * this successor.
		 */
		longitude: number);
		readonly stamp: VersionStamp;
	}
	/**
	 * A class that marks out the location of an infix Identifer within
	 * it's containing Infix, it's containing Span, and then it's containing
	 * Statement, Document, and Program.
	 */
	export class InfixSpan {
		readonly containingSpan: Span;
		readonly containingInfix: Infix;
		readonly boundary: Boundary<Identifier>;
		constructor(containingSpan: Span, containingInfix: Infix, boundary: Boundary<Identifier>);
		/**
		 * Gets the Statement that contains this Anchor.
		 */
		readonly statement: Statement;
		/**
		 * Gets a boolean value that indicates whether this InfixSpan
		 * is considered object-level cruft, and should therefore be
		 * ignored during type analysis.
		 */
		readonly isCruft: boolean;
	}
	/**
	 * A class that stores constructed Layers.
	 */
	export class LayerContext {
		private readonly program;
		/** */
		constructor(program: Program);
		/**
		 * Retrieves the Layer that corresponds to the specified URI.
		 * If a corresponding Layer has not already been constructed
		 * in this context, a new one is constructed and returned.
		 */
		maybeConstruct(directive: Uri): Layer | null;
		/**
		 * 
		 */
		getParallelOf(node: Node): SpecifiedParallel | null;
		/**
		 * Enumerates through the faults that have been
		 * generated within this LayerContext.
		 */
		eachFault(): IterableIterator<Fault<TFaultSource>>;
		/**
		 * Gets a map of objects that should each be converted
		 * into a type, which are indexed by a string representation
		 * of the associated type URI. Each object translates into
		 * another component specified in the type URI provided
		 * in the constructor of this object.
		 */
		readonly layers: ReadonlyMap<string, Layer | null>;
		private _layers;
		/** */
		addCruft(cruftObject: TCruft): void;
		/** */
		isCruft(cruftObject: TCruft): boolean;
		/** */
		private readonly cruft;
		/**
		 * Safety enumerates through the successors of the
		 * specified Node, carefully avoiding anything that
		 * has been marked as cruft.
		 */
		eachSuccessorOf(node: Node): IterableIterator<Successor>;
		/**
		 * @returns The successor object contained within the
		 * specified HyperEdge that has previously been resolved
		 * according to the polymorphic name resolution rules.
		 */
		pickSuccessor(hyperEdge: HyperEdge): Successor | null;
		/**
		 * Executes the polymorphic name resolution strategy,
		 * and stores the results in the specified ConstructionContext
		 * object.
		 * 
		 * The method assumes that the edges of the specified
		 * parallel, and all it's edges (nested deeply) have already
		 * been resolved.
		 */
		resolveSuccessors(parallel: SpecifiedParallel): void;
		/** */
		private readonly selectedSuccessors;
	}
	/** */
	type TCruft = Node | HyperEdge | Span | InfixSpan;
	/**
	 * A Layer is a graph of Parallel objects that represents a
	 * complete level in a URI.
	 */
	export class Layer {
		readonly container: Layer | null;
		readonly uri: Uri;
		private readonly context;
		/** */
		constructor(container: Layer | null, uri: Uri, context: LayerContext);
		/**
		 * Stores a string representation of the Layer,
		 * useful for debugging purposes.
		 */
		readonly name: string;
		/**
		 * Initializes a top-level Layer. This method is used instead
		 * of .descend() for top-level Layer construction.
		 * 
		 * @throws In the case when the specified Node instance
		 * has a non-null container (and therefore, is not top level).
		 */
		bootstrap(node: Node): void;
		/**
		 * Maps this Parallel, and all it's connected Parallels, to the type
		 * in each of their contents with the specified name.
		 */
		descend(typeName: string): Layer | null;
		/**
		 * Traverses through the entire graph of Parallels that correspond
		 * to this Layer.
		 */
		traverseLayer(): IterableIterator<LayerEdge>;
		/**
		 * Performs a traversal on all nested Parallel objects in dependency
		 * order, and yields an object that forms an edge that represents
		 * a connection between two Parallel objects.
		 */
		traverseParallelEdges(): IterableIterator<{
			from: Parallel | null;
			to: Parallel;
		}>;
		/**
		 * Performs a traversal of all nested Parallel objects in dependency
		 * order, meaning, the method does not yield Parallel objects until
		 * all its dependencies have also been yielded. The method also
		 * ensures that the same object is not yielded more than once.
		 */
		traverseParallels(): IterableIterator<Parallel>;
		/**
		 * Gets an array containing the Parallels that "seed" this
		 * Layer, meaning that they have no inbound edges.
		 */
		readonly seeds: ReadonlyArray<Parallel>;
		private readonly _seeds;
		/**
		 * Gets the origin seed Parallel of this Layer, if one exists,
		 * or null in the case when it doesn't.
		 * 
		 * The orgin seed is available when there is exactly one
		 * SpecifiedParallel that seeds the Layer. This is the case
		 * when the LayerContext has been instructed to construct
		 * a URI pointing to a specific node.
		 */
		readonly origin: SpecifiedParallel | null;
		/**
		 * Gets an array of
		 */
		readonly patterns: LayerPatterns;
		private _patterns;
	}
	/** */
	export interface LayerEdge {
		fromParallel: Parallel | null;
		fromNode: Node | null;
		toParallel: Parallel;
		toNode: Node | null;
	}
	/**
	 * Stores the information that relates to the Patterns that
	 * have been defined within a single Layer.
	 */
	export class LayerPatterns {
		private readonly layer;
		/** */
		constructor(layer: Layer);
		/**
		 * Stores the nodes that define patterns.
		 */
		readonly nodes: Node[];
		/**
		 * @returns The node that defines a pattern that is generalized
		 * by the type that corresponds to the specified set of nodes.
		 */
		find(resolvingTo: Node[]): Node | null;
		/**
		 * Attempts to feed the specified string into all of the
		 * patterns that are defined within this LayerPatterns
		 * instance.
		 * 
		 * @param filterByNodes If specified, only the pattern
		 * that is generalized by the types that correspond to
		 * the nodes contained in the array.
		 */
		tryExecute(maybeAlias: string, filterByNodes?: Node[]): Node | null;
	}
	/**
	 * A class that represents a single object in the graph
	 * of (what eventually becomes) parallel types. Parallel
	 * objects link to other Parallel objects through ParallelEdge
	 * classes, which allow consumers to scan through the
	 * parallels that relate to a specific Node.
	 * 
	 * Parallels can either be "specified" or "unspecified".
	 * This class represents the "unspecified" variant,
	 * where as the derived class "SpecifiedParallel" represents
	 * the former.
	 */
	export abstract class Parallel {
		readonly uri: Uri;
		readonly container: Parallel | null;
		protected readonly context: LayerContext;
		/**
		 * @returns A Parallel object that was previously constructed
		 * within the specified LayerContext, that matches the specified
		 * URI, or null in the case when no such Parallel exists.
		 */
		protected static getExistingParallel(uri: Uri, context: LayerContext): Parallel | null;
		/**
		 * Stores a map of all the Parallel objects that have been
		 * created for each LayerContext. The purpose of this is
		 * to prevent the two separate Parallel instances from
		 * being created that correspond to the same Node.
		 */
		protected static readonly constructedParallels: WeakMap<LayerContext, Map<string, Parallel>>;
		/** */
		protected constructor(uri: Uri, container: Parallel | null, context: LayerContext);
		readonly version: VersionStamp;
		/**
		 * Stores a string representation of this Parallel,
		 * useful for debugging purposes.
		 */
		readonly name: string;
		/**
		 * Stores an array of other Parallel instances to which
		 * this Parallel connects. For example, the following
		 * document, the Parallel object corresponding to the
		 * last "Field" would have two edges, pointing to two
		 * other Parallel instances corresponding to the "Field"
		 * declarations contained by "Left" and "Right".
		 * 
		 * Left
		 * 	Field
		 * Right
		 * 	Field
		 * Bottom : Left, Right
		 * 	Field
		 */
		readonly edges: ReadonlyArray<Parallel>;
		private readonly _edges;
		/**
		 * Adds an edge between this Parallel instance and
		 * the instance specified, if an equivalent edge does
		 * not already exist.
		 */
		maybeAddEdge(toParallel: Parallel): void;
		/**
		 * Performs a depth-first traversal of all nested Parallel instances,
		 * and yields each one (this Parallel instance is excluded).
		 */
		traverseParallels(): IterableIterator<Parallel>;
		/**
		 * Performs a depth-first traversal of all nested SpecifiedParallel
		 * instances, and yields each one (this Parallel instance is excluded).
		 */
		traverseParallelsSpecified(): IterableIterator<SpecifiedParallel>;
		/** */
		abstract descend(typeName: string): Parallel;
	}
	/**
	 * 
	 */
	export class SpecifiedParallel extends Parallel {
		/**
		 * Constructs a SpecifiedParallel object, or returns a
		 * pre-existing one that corresponds to the specified Node.
		 */
		static maybeConstruct(node: Node, container: SpecifiedParallel | null, context: LayerContext): Parallel;
		/** */
		private constructor();
		/**
		 * Stores the Node instance that corresponds to this
		 * SpecifiedParallel instance.
		 */
		readonly node: Node;
		/**
		 * Traverses through the general graph, depth-first, yielding
		 * elements that corresponds to this parallel, and returns an
		 * object that represents an edge that connects one node.
		 */
		traverseGeneralEdges(): IterableIterator<{
			from: Node;
			to: Node;
		}>;
		/**
		 * @ignore
		 * 
		 * Traverses through the general edge graph, and yields
		 * the parallel that corresponds to each discovered node,
		 * as well as the successor attached to this SpecifiedParallel
		 * instance through which the corresponding SpecifiedParallel
		 * was discovered.
		 */
		/**
		 * @ignore
		 * 
		 * Same as traverseGeneralEdgeParallels, but returns a map
		 * with the results instead of yielding individual results.
		 */
		getGeneralEdgeParallelSet(): Map<Successor, ReadonlyArray<Parallel>>;
		/**
		 * 
		 */
		/**
		 * Analyzes this SpecifiedParallel to scan for the following faults:
		 * 	CircularTypeReference
		 * 	ListIntrinsicExtendingList
		 * 	ListExtrinsicExtendingNonList
		 * 	ListDimensionalDiscrepancyFault
		 * 	IgnoredAnnotation
		 * 	UnresolvedAnnotationFault
		 * 
		 * This method may mark various parts of the document as cruft.
		 * It also computes the existence of the parallel (which is a term
		 * we're using to describe the set of annotations that have been
		 * applied to a type).
		 * 
		 * This method also assumes that it's being called only after all
		 * it's higher Parallels (i.e. Parallels that exist higher than this
		 * one in the Layer) have been analyzed.
		 * 
		 * @deprecated
		 */
		analyze(): void;
		/**
		 * Maps this Parallel instance to another Parallel instance
		 * that corresponds to a Node in this Parallel's underlying
		 * Node's contents.
		 */
		descend(typeName: string): Parallel;
		/** */
		readonly existence: ReadonlyArray<Node>;
		private _existence;
		/**
		 * Gets a string that represents the existence of this
		 * SpecifiedParallel instance, useful for debugging.
		 */
		private readonly existenceLabel;
		/** */
		readonly listDimensionality: number;
		private _listDimensionality;
		/** */
		readonly isList: boolean;
		private _isList;
		/**
		 * Gets an array that contains the faults that have been
		 * identified during the lifecycle of this construction context.
		 */
		readonly faults: ReadonlyArray<Fault<TFaultSource>>;
		private readonly _faults;
	}
	/**
	 * An "unspecified parallel" is a marker object used to
	 * maintain the connectedness of a parallel graph. For
	 * example, consider the following document:
	 * 
	 * Class1
	 * 	Property : Animal
	 * Class2 : Class1
	 * Class3 : Class2
	 * 	Property : Rabbit
	 * 
	 * In this case, the parallel graph connecting Class3's
	 * Property type through to it's apex parallel (which
	 * would be Class1/Property), would have an
	 * UnspecifiedParallel object created, and residing
	 * within the Class2 type.
	 * 
	 * UnspecifiedParallels were originally intended for
	 * use by the type representation in order to perform
	 * operations such as collecting specified and unspecified
	 * adjacent types, however, it appears now that this
	 * may not be sufficient given the current design of the
	 * system.
	 */
	export class UnspecifiedParallel extends Parallel {
		/**
		 * Constructs a UnspecifiedParallel object, or returns a
		 * pre-existing one that corresponds to the specified Node.
		 */
		static maybeConstruct(uri: Uri, container: Parallel, context: LayerContext): Parallel;
		/** */
		private constructor();
		/** */
		descend(typeName: string): UnspecifiedParallel;
	}
	/**
	 * 
	 */
	export class ParallelAnalyzer {
		/** */
		private static isList;
		/**
		 * Performs analysis
		 */
		private static canMerge;
		/** */
		private constructor();
	}
	/**
	 * A class that represents a fully constructed type within the program.
	 */
	export class Type {
		static construct(spine: Spine, program: Program): Type;
		/** */
		private static layerContextMap;
		/**
		 * 
		 */
		private constructor();
		/**
		 * Stores a text representation of the name of the type,
		 * or a serialized version of the pattern content in the
		 * case when the type is actually a pattern.
		 */
		readonly name: string;
		/**
		 * Stores the URI that specifies where this Type was
		 * found in the document.
		 */
		readonly uri: Uri;
		/**
		 * Stores a reference to the type, as it's defined in it's
		 * next most applicable
		 */
		readonly parallels: ReadonlyArray<Type>;
		/**
		 * Stores the Type that contains this Type, or null in
		 * the case when this Type is top-level.
		 */
		readonly container: Type | null;
		/**
		 * 
		 */
		readonly contents: ReadonlyArray<Type>;
		/**
		 * 
		 */
		readonly contentsIntrinsic: ReadonlyArray<Type>;
		/**
		 * Stores the array of types from which this type extends.
		 * If this Type extends from a pattern, it is included in this
		 * array.
		 */
		readonly generals: ReadonlyArray<Type>;
		/**
		 * 
		 */
		readonly metaphors: ReadonlyArray<Type>;
		/**
		 * 
		 */
		readonly specifics: ReadonlyArray<Type>;
		/**
		 * 
		 */
		readonly adjacents: ReadonlyArray<Type>;
		/**
		 * 
		 */
		readonly patterns: ReadonlyArray<Type>;
		/**
		 * Gets a map of raw string values representing the
		 * type aliases with which this type has been annotated,
		 * which are keyed by the type to which they resolve.
		 */
		readonly values: Map<any, any> | ReadonlyMap<Type, string>;
		/**
		 * Stores whether this type represents the intrinsic
		 * side of a list.
		 */
		readonly isListIntrinsic: boolean;
		/**
		 * Stores whether this type represents the extrinsic
		 * side of a list.
		 */
		readonly isListExtrinsic: boolean;
		/**
		 * Stores whether this Type instance has no annotations applied to it.
		 */
		readonly isFresh: boolean;
		/** */
		readonly isOverride: boolean;
		/** */
		readonly isIntroduction: boolean;
		/**
		 * Stores a value that indicates if this Type was directly specified
		 * in the document, or if it's existence was inferred.
		 */
		readonly isSpecified: boolean;
		/** */
		readonly isAnonymous: boolean;
		/** */
		readonly isPattern: boolean;
		/** */
		readonly isUri: boolean;
		/** */
		readonly isList: boolean;
		/**
		 * Gets a boolean value that indicates whether this Type
		 * instance was created from a previous edit frame, and
		 * should no longer be used.
		 */
		readonly isDirty: boolean;
		/**
		 * 
		 */
		readonly faults: ReadonlyArray<Fault>;
	}
}

declare module "truth-compiler" {
	/**
	 * A class that encapsulates CRC functionality.
	 */
	export class Crc {
		private constructor();
		/**
		 * Calculates a numeric CRC from the specified string, and returns the
		 * code as a 4-character ASCII byte string.
		 */
		static calculate(text: string): string;
		/**
		 * Calculates a numeric CRC from the specified string, and returns the
		 * code as a 4-number byte array.
		 */
		static calculate(text: string, type: typeof Number): number[];
	}
	/**
	 * A class that provides various higher-order functions
	 * across data structures.
	 */
	export abstract class HigherOrder {
		/**
		 * @returns A readonly copy of the specified array, set, or list.
		 */
		static copy<T>(array: ReadonlyArray<T>): ReadonlyArray<T>;
		static copy<T>(set: ReadonlySet<T>): ReadonlySet<T>;
		static copy<K, V>(map: ReadonlyMap<K, V>): ReadonlyMap<K, V>;
		private constructor();
	}
	/**
	 * Utility class for performing basic guarding.
	 */
	export class Guard {
		/** */
		static notNull<T>(param: T): NotNull<T>;
		/** */
		static defined<T>(param: T): NotUndefined<T>;
		/** */
		static nullable<T>(param: T): NotNull<T> | NotUndefined<T>;
	}
	type NotNull<T> = T extends null ? never : T;
	type NotUndefined<T> = T extends undefined ? never : T;
	/**
	 * A general parsing utility class that provides consumption
	 * methods that operate over a given input.
	 */
	export class Parser {
		/**
		 * Constructs a new Parser object that operates over
		 * the specified input string, optionally starting at the
		 * specified position.
		 */
		constructor(input: string);
		/**
		 * Attempts to read the specified token immediately
		 * following the cursor.
		 * 
		 * @returns The content read. In the case when no
		 * match could be found, an empty string is returned.
		 */
		read(token?: string): string;
		/**
		 * Reads any whitespace characters and floating
		 * escape characters.
		 * 
		 * @returns The number of whitespace characters
		 * read.
		 */
		readWhitespace(): number;
		/**
		 * Attempts to read a single stream-level grapheme from the
		 * parse stream, using unicode-aware extraction method.
		 * If the parse stream specifies a unicode escape sequence,
		 * such as \uFFFF, these are seen as 6 individual graphemes.
		 * 
		 * @returns The read grapheme, or an empty string in the case
		 * when there is no more content in the parse stream.
		 */
		readGrapheme(): string;
		/**
		 * Reads graphemes from the parse stream, until either
		 * the cursor reaches one of the specified quit tokens,
		 * or the parse stream terminates.
		 */
		readUntil(...quitTokens: string[]): string;
		/**
		 * Attempts to read the specified token from the parse stream,
		 * if and only if it's at the end of the parse stream.
		 */
		readThenTerminal(token: string): string;
		/**
		 * @returns A boolean value that indicates whether the
		 * specified string exists immediately at the position of
		 * the cursor.
		 */
		peek(token: string): boolean;
		/**
		 * @returns A boolean value that indicates whether the
		 * specified string exists immediately at the position of
		 * the cursor, and following this token is the end of the
		 * parse stream.
		 */
		peekThenTerminal(token: string): boolean;
		/**
		 * @returns A boolean value that indicates whether
		 * there are more characters to read in the input.
		 */
		more(): boolean;
		/**
		 * Gets or sets the position of the cursor from where
		 * reading takes place in the cursor.
		 */
		position: number;
		private _position;
		/** */
		private readonly input;
		/**
		 * 
		 */
		private atRealBackslash;
		/**
		 * @deprecated
		 * @returns A boolean value that indicates whether an
		 * escape character exists behind the current character.
		 * The algorithm used is respective of sequences of
		 * multiple escape characters.
		 */
		private escaped;
	}
	/**
	 * Stores the maximum character code in the unicode set.
	 */
	export const UnicodeMax = 65536;
	/**
	 * Stores a map of the names of all unicode blocks,
	 * and their character ranges.
	 */
	export const UnicodeBlocks: Readonly<Map<string, [number, number]>>;
	/**
	 * Stores unsorted general utility methods.
	 */
	export class Misc {
		/**
		 * Counts incrementally through numbers, using the specified
		 * radix sequence. For example, if the radixes [2, 2, 2] were to
		 * be specified, this would result in binary counting starting at
		 * [0, 0, 0] and ending at [1, 1, 1].
		 */
		static variableRadixCounter(radixes: number[]): IterableIterator<number[]>;
		/**
		 * 
		 */
		static calculatePowerset<T>(array: T[]): T[][];
		/**
		 * @returns Whether the items of the first set object form
		 * a subset (not a proper subset) of the items of the second
		 * set.
		 */
		static isSubset(sourceSet: ReadonlySet<any>, possibleSubset: ReadonlySet<any>): boolean;
		/**
		 * @returns Whether the items of the first set object form
		 * a superset (not a proper superset) of the items of the
		 * second set.
		 */
		static isSuperset(sourceSet: ReadonlySet<any>, possibleSuperset: ReadonlySet<any>): boolean;
		/**
		 * @returns The number of items that are missing
		 * from the second set that exist in the first set.
		 */
		static computeSubsetFactor(a: ReadonlyArray<any>, b: ReadonlyArray<any>): number;
		private constructor();
	}
	/**
	 * The top-level object that manages Truth documents.
	 */
	export class Program {
		/**
		 * Creates a new Program, into which Documents may
		 * be added, and verified.
		 * 
		 * @param autoVerify Indicates whether verification should
		 * occur after every edit cycle, and reports faults to this
		 * Program's .faults field.
		 */
		constructor(autoVerify?: boolean);
		/** */
		readonly hooks: HookTypesInstance;
		/** */
		readonly agents: Agents;
		/** */
		readonly documents: DocumentGraph;
		/**  */
		readonly faults: FaultService;
		/** */
		readonly version: VersionStamp;
		private _version;
		/** */
		private readonly indentCheckService;
		/**
		 * Stores an object that allows type analysis to be performed on
		 * this Program. It is reset at the beginning of every edit cycle.
		 */
		private currentProgramScanner;
		/**
		 * Performs a full verification of all documents loaded into the program.
		 * This Program's .faults field is populated with any faults generated as
		 * a result of the verification. If no documents loaded into this program
		 * has been edited since the last verification, verification is not re-attempted.
		 * 
		 * @returns An entrypoint into performing analysis of the Types that
		 * have been defined in this program.
		 */
		scan(): ProgramScanner;
		/**
		 * @returns A fully constructed Type instance that corresponds to
		 * the type path specified. In the case when no type could be found
		 * at the specified location, null is returned.
		 * 
		 * @param document An instance of a Document that specifies
		 * where to begin the query.
		 * 
		 * @param typePath The type path to query within the the specified
		 * Document.
		 */
		query(document: Document, ...typePath: string[]): Type | null;
		/**
		 * @returns An array that contains the root-level types defined
		 * in the specified Document.
		 */
		queryRoots(document: Document): ReadonlyArray<Type>;
		/**
		 * Begin inspecting a document loaded
		 * into this program, a specific location.
		 */
		inspect(document: Document, line: number, offset: number): ProgramInspectionResult;
	}
	/**
	 * Stores the details about a precise location in a Document.
	 */
	export class ProgramInspectionResult {
		/**
		 * Stores the compilation object that most closely represents
		 * what was found at the specified location. Stores null in the
		 * case when the specified location contains an object that
		 * has been marked as cruft (the statement and span fields
		 * are still populated in this case).
		 */
		readonly result: Document | Type[] | null;
		/**
		 * Stores the Statement found at the specified location.
		 */
		readonly statement: Statement;
		/**
		 * Stores the Span found at the specified location, or
		 * null in the case when no Span was found, such as if
		 * the specified location is whitespace or a comment.
		 */
		readonly span: Span | null;
	}
	/**
	 * Provides an entry point for enumeration through
	 * the types defined in a program.
	 */
	export class ProgramScanner {
		private program;
		/**
		 * Enumerate through all visible types defined in the Program.
		 */
		enumerate(filterDocument?: Document): IterableIterator<{
			type: Type;
			document: Document;
		}>;
		/** */
		private readonly roots;
	}
	/**
	 * A cache that stores all agents loaded by the compiler.
	 */
	export class Agents {
		/**
		 * Constructs an agent from the specified file, or from
		 * a cache if the specified file has already been read.
		 * @returns A reference to the added agent.
		 */
		add(sourceUri: Uri | string): Promise<Agent | null>;
		/**
		 * Removes the agent from the system having the specified source file path.
		 * @returns A boolean indicating whether an agent was deleted.
		 */
		delete(sourceUri: Uri | string): boolean;
		/** Stores a map of agent build functions, indexed by their absolute URI. */
		private readonly buildFunctionCache;
		/** Stores a set of all agents added to the system. */
		private readonly agentCacheObject;
	}
	/** */
	export class Agent {
		/** Stores an array of documents that reference this Agent. */
		readonly referencingDocuments: Document[];
		/** Stores the absolute path to the JavaScript file that contains the agent source code. */
		readonly sourceUri: Uri;
		/** Store the built-in hooks, as well as the hooks specified in the document. */
		readonly hooks: HookTypesInstance;
	}
	/**
	 * 
	 */
	export abstract class HookType<TIn extends object | void = object, TOut extends object | void = void> {
		private readonly router;
		private readonly agent;
		/**
		 * Adds a hook contributor function that executes in
		 * response to the running of hooks of the containing type.
		 */
		contribute(fn: (hookIn: Readonly<TIn>) => TOut | void): void;
		/**
		 * Adds a hook capturer function that runs after the hook contributors
		 * have returned their results. Hook capturer functions are passed an
		 * array containing the produced results of all the contributor functions.
		 */
		capture(fn: (hookIn: Readonly<TIn>) => void): void;
		/**
		 * Runs all hook contributor functions whose constructor matches the
		 * containing hook type. Then, all matching hook capturer functions are
		 * called, passing the return values generated by the contributor functions.
		 * @param hook An instance of the Hook to run.
		 */
		run(hookIn: TIn): TOut[];
	}
	/**
	 * Stores all of the hook types used across the entire system.
	 */
	export namespace HookTypes {
		/** A hooks that runs immediate after a document has been created. */
		class DocumentCreated extends HookType<DocumentParam> {
		}
		/** A hooks that runs immediately before a document is removed from the program. */
		class DocumentDeleted extends HookType<DocumentParam> {
		}
		/** A hook that runs when a document's file name changes. */
		class DocumentRenamed extends HookType<DocumentRenameParam> {
		}
		/** A base class for a hook that is run during type resolution events. */
		class Resolution extends HookType<ResolutionParam, ResolutionResult> {
		}
		/** A hook that runs before the core is about to resolve a term. */
		class BeforeResolve extends HookTypes.Resolution {
		}
		/** A hook that runs after the core has resolved a term. */
		class AfterResolve extends HookTypes.Resolution {
		}
		/** A hook that runs when the core is unable to resolve a particular term. */
		class NotResolved extends HookTypes.Resolution {
		}
		/** A base class for a hook that performs editor navigations. */
		class Navigation extends HookType<NavigationParam> {
		}
		/** A hook that runs when a "Find References" operation has been requested. */
		class FindReferences extends HookTypes.Navigation {
		}
		/** A hook that runs when a "Find Fragments" operation has been requested. */
		class FindFragments extends HookTypes.Navigation {
		}
		/** A hook that runs when a "Find Declarations" operation has been requested. */
		class FindDeclarations extends HookTypes.Navigation {
		}
		/** A hook that runs when a quick fix operation is requested. Not implemented. */
		class Fix<TIn extends object> extends HookType<TIn> {
		}
		/** A hook that runs when checking whether a rename operation can be executed. */
		class CanRename extends HookType<CanParam, CanResult> {
		}
		/** A hook that runs when a rename operation should be executed. */
		class DoRename extends HookType<DoRenameParam> {
		}
		/** A hook that runs when a dialog should be displayed. Not implemented. */
		class Dialog extends HookType<void> {
		}
		/** A hook that runs when completion. */
		class Completion extends HookType<CompletionParam, CompletionResult> {
		}
		/** */
		class Invalidate extends HookType<InvalidateParam> {
		}
		/** */
		class Revalidate extends HookType<RevalidateParam> {
		}
		/**
		 * A hook that runs when a document edit transaction has completed.
		 */
		class EditComplete extends HookType<DocumentParam> {
		}
		/**
		 * A hook that runs when a URI reference is added to a document,
		 * but before it resolves to a resource.
		 */
		class UriReferenceAdded extends HookType<UriReferenceParam, UriReferenceResult> {
		}
		/**
		 * A hook that runs when a URI reference is removed from a document.
		 */
		class UriReferenceRemoved extends HookType<UriReferenceParam> {
		}
		/** A hook that runs when a fault has been detected in a document. */
		class FaultReported extends HookType<FaultParam> {
		}
		/** A hook that runs when a fault has been rectified, and should be eliminated. */
		class FaultRectified extends HookType<FaultParam> {
		}
	}
	/** */
	export class DocumentParam {
		readonly document: Document;
		constructor(document: Document);
	}
	/** Input parameters for documents being renamed. */
	export class DocumentRenameParam {
		readonly document: Document;
		readonly oldUri: Uri;
		constructor(document: Document, oldUri: Uri);
	}
	/**
	 * 
	 */
	export class InvalidateParam {
		/**
		 * A reference to the Document object in which the Invalidation occured.
		 */
		readonly document: Document;
		/**
		 * An array of statements whose descendants should be invalidated.
		 * If the array is empty, the entire document should be invalidated.
		 */
		readonly parents: ReadonlyArray<Statement>;
		/**
		 * An array of indexes whose length is the same as the parents field,
		 * that represents the index of each parent within the document.
		 */
		readonly indexes: ReadonlyArray<number>;
		constructor(
		/**
		 * A reference to the Document object in which the Invalidation occured.
		 */
		document: Document,
		/**
		 * An array of statements whose descendants should be invalidated.
		 * If the array is empty, the entire document should be invalidated.
		 */
		parents: ReadonlyArray<Statement>,
		/**
		 * An array of indexes whose length is the same as the parents field,
		 * that represents the index of each parent within the document.
		 */
		indexes: ReadonlyArray<number>);
	}
	/**
	 * 
	 */
	export class RevalidateParam {
		/**
		 * A reference to the Document object in which the Revalidation will occur.
		 */
		readonly document: Document;
		/**
		 * An array of statements whose descendants should be revalidated.
		 */
		readonly parents: ReadonlyArray<Statement>;
		/**
		 * An array of indexes whose length is the same as the parents field,
		 * that represents the index of each parent within the document.
		 */
		readonly indexes: ReadonlyArray<number>;
		constructor(
		/**
		 * A reference to the Document object in which the Revalidation will occur.
		 */
		document: Document,
		/**
		 * An array of statements whose descendants should be revalidated.
		 */
		parents: ReadonlyArray<Statement>,
		/**
		 * An array of indexes whose length is the same as the parents field,
		 * that represents the index of each parent within the document.
		 */
		indexes: ReadonlyArray<number>);
	}
	/**
	 * Generic class that stores the inputs of a "Can" hook.
	 * "Can" hooks are hooks where the system needs to perform
	 * a pre-flight check to see if the command can be run at
	 * a certain position within a document.
	 */
	export class CanParam {
		readonly document: Document;
		readonly span: Span;
		constructor(document: Document, span: Span);
	}
	/** Generic class that stores the output of a "Can" hook. */
	export class CanResult {
		readonly value: boolean;
		constructor(value: boolean);
	}
	/** Input parameters for resolution hooks */
	export class ResolutionParam {
		readonly program: Program;
		readonly spine: Spine;
		constructor(program: Program, spine: Spine);
	}
	/** Output for resolution hooks */
	export class ResolutionResult {
		resolves: boolean;
	}
	/** Input parameters for navigation hooks. */
	export class NavigationParam {
		readonly document: Document;
		readonly initiatingSubject: Subject;
		constructor(document: Document, initiatingSubject: Subject);
	}
	/** */
	export class DoRenameParam {
		readonly document: Document;
		readonly span: Span;
		constructor(document: Document, span: Span);
	}
	/** Input parameters for completion hooks. */
	export class CompletionParam {
		readonly document: Document;
		readonly line: number;
		readonly offset: number;
		constructor(document: Document, line: number, offset: number);
	}
	/** Output for completion hooks. */
	export class CompletionResult {
		readonly items: LanguageServer.CompletionItem[];
		constructor(items: LanguageServer.CompletionItem[]);
	}
	/** */
	export class FillParam {
		readonly document: Document;
		constructor(document: Document);
	}
	/** */
	export class UriReferenceParam {
		readonly document: Document;
		readonly statement: Statement;
		readonly uri: Uri;
		constructor(document: Document, statement: Statement, uri: Uri);
	}
	/** */
	export class UriReferenceResult {
		readonly accepted: boolean;
		constructor(accepted: boolean);
	}
	/** */
	export class FaultParam {
		readonly document: Document;
		readonly fault: Fault;
		constructor(document: Document, fault: Fault);
	}
	/** Defines an instantatiated version of the HookTypes namespace. */
	export type HookTypesInstance = {
		[P in keyof typeof HookTypes]: Readonly<InstanceType<typeof HookTypes[P]>>;
	};
	/**
	 * An enumeration that lists all availble protocols
	 * supported by the system. The list can be enumerated
	 * via Uri.eachProtocol()
	 */
	export enum UriProtocol {
		none = "",
		unknown = "?",
		file = "file:",
		https = "https:",
		http = "http:",
		internal = "system-internal:"
	}
	/**
	 * A class that represents a Truth URI.
	 * A Truth URI can point to a truth file, or an agent through a variety of
	 * different protocols, just like a normal URI. However, a Truth URI that
	 * points to a Truth file can also point to declarations within that file
	 * directly in the URI, using the double slash syntax. For example:
	 * 
	 * //domain.com/File.truth//Path/To/Declaration
	 */
	export class Uri {
		/**
		 * Stores a reference to the protocol used by the URI.
		 */
		readonly protocol: UriProtocol;
		/**
		 * Stores the file name specified in the URI, if one exists.
		 */
		readonly fileName: string;
		/**
		 * Stores the fully qualified path to the file, and the file
		 * name itself, but without any protocol.
		 */
		readonly ioPath: ReadonlyArray<string>;
		/**
		 * Stores the contents of any type path specified in the URI.
		 */
		readonly typePath: ReadonlyArray<string>;
		/**
		 * Enumerates through the list of available
		 * protocols supported by the system.
		 */
		static eachProtocol(): IterableIterator<UriProtocol>;
		/**
		 * @param uriText A string containing the URI to parse
		 * @param relativeFallback A URI that identifies the origin
		 * of the URI being parsed, used in the case when the
		 * uriText parameter is a relative path.
		 */
		static parse(uriText: string, relativeFallback?: Uri): Uri | null;
		/**
		 * Creates a new Uri from the specified input.
		 * 
		 * @param from If the parameter is omited,
		 * a unique internal URI is generated.
		 */
		static create(from?: Spine | Uri): Uri;
		/** */
		protected constructor(
		/**
		 * Stores a reference to the protocol used by the URI.
		 */
		protocol: UriProtocol,
		/**
		 * Stores the file name specified in the URI, if one exists.
		 */
		fileName: string,
		/**
		 * Stores the fully qualified path to the file, and the file
		 * name itself, but without any protocol.
		 */
		ioPath: ReadonlyArray<string>,
		/**
		 * Stores the contents of any type path specified in the URI.
		 */
		typePath: ReadonlyArray<string>);
		/**
		 * Converts the URI to a fully-qualified path including the file name.
		 * 
		 * @param includeProtocol Whether the protocol portion of the URI
		 * should be included in the final string. Defaults to true.
		 * 
		 * @param includeTypePath Whether the typePath portion of the URI
		 * should be included in the final string. Defaults to false.
		 */
		toString(includeProtocol?: boolean, includeTypePath?: boolean): string;
		/**
		 * @returns A value indicating whether two URIs point to the same resource.
		 */
		equals(uri: Uri | string, compareTypePaths?: boolean): boolean;
		/**
		 * Creates a new Uri, whose typePath and ioPath
		 * fields are retracted by the specified levels of
		 * depth.
		 * 
		 * @returns A new Uri that is otherwise a copy of this
		 * one, but with it's IO path and type path peeled
		 * back by the specified number of levels.
		 */
		retract(ioRetraction?: number, typeRetraction?: number): Uri;
		/**
		 * Creates a new Uri, whose typePath field is
		 * retracted to the specified level of depth.
		 */
		retractTo(typePathLength: number): Uri;
		/**
		 * @returns A new Uri, whose typePath and ioPath
		 * fields are extended with the specified segments.
		 */
		extend(ioSegments: string | string[], typeSegments: string | string[]): Uri;
	}
	/** */
	export class UriReader {
		/**
		 * Attempts to read the contents of the given URI.
		 * If an error is generated while trying to read a file
		 * at the specified location, the errors is returned.
		 */
		static tryRead(uri: Uri): Promise<string | Error>;
	}
	/**
	 * An enumeration that stores language syntax tokens.
	 */
	export const enum Syntax {
		tab = "\t",
		space = " ",
		terminal = "\n",
		combinator = ",",
		joint = ":",
		list = "...",
		escapeChar = "\\",
		comment = "//",
		typePathSeparator = "//",
		truthExtension = "truth",
		agentExtension = "js"
	}
	/**
	 * An enumeration that stores the escape sequences
	 * that only match a single kind of character. "Sign" in
	 * this case refers to the fact that these are escape
	 * sequences that refer to another character.
	 */
	export enum RegexSyntaxSign {
		tab = "\\t",
		lineFeed = "\\n",
		carriageReturn = "\\r",
		escapedFinalizer = "\\/",
		backslash = "\\\\"
	}
	export namespace RegexSyntaxSign {
		/**
		 * @returns A RegexSyntaxSign member from the
		 * specified sign literal (ex: "\t") or raw signable
		 * character (ex: "	").
		 */
		function resolve(value: string): RegexSyntaxSign | null;
		/** */
		function unescape(value: string): string;
	}
	/**
	 * An enumeration that stores the escape sequences
	 * that can match more than one kind of character.
	 */
	export enum RegexSyntaxKnownSet {
		digit = "\\d",
		digitNon = "\\D",
		alphanumeric = "\\w",
		alphanumericNon = "\\W",
		whitespace = "\\s",
		whitespaceNon = "\\S",
		wild = "."
	}
	export namespace RegexSyntaxKnownSet {
		function resolve(value: string): RegexSyntaxKnownSet | null;
	}
	/**
	 * An enumeration that stores the delimiters available
	 * in the system's regular expression flavor.
	 */
	export const enum RegexSyntaxDelimiter {
		main = "/",
		utf16GroupStart = "\\u{",
		utf16GroupEnd = "}",
		groupStart = "(",
		groupEnd = ")",
		alternator = "|",
		setStart = "[",
		setEnd = "]",
		quantifierStart = "{",
		quantifierEnd = "}",
		quantifierSeparator = ",",
		range = "-"
	}
	/**
	 * An enumeration that stores miscellaneous regular
	 * expression special characters that don't fit into
	 * the other enumerations.
	 */
	export const enum RegexSyntaxMisc {
		star = "*",
		plus = "+",
		negate = "^",
		restrained = "?",
		boundary = "\\b",
		boundaryNon = "\\B"
	}
	/**
	 * An enumeration that stores the delimiters available
	 * in the infix syntax.
	 */
	export const enum InfixSyntax {
		start = "<",
		end = ">",
		nominalStart = "<<",
		nominalEnd = ">>",
		patternStart = "</",
		patternEnd = "/>"
	}
	/**
	 * A class that manages the diagnostics that have been
	 * reported for the current state of the program.
	 */
	export class FaultService {
		private readonly program;
		/** */
		constructor(program: Program);
		/**
		 * Reports a fault. If a similar Fault on the same area
		 * of the document hasn't been reported, the method
		 * runs the FaultReported hook.
		 */
		report(fault: Fault): void;
		/**
		 * Gets a number representing the number of
		 * unrectified faults retained by this FaultService.
		 */
		readonly count: number;
		/**
		 * @returns A boolean value indicating whether this
		 * FaultService retains a fault that is similar to the specified
		 * fault (meaning that it has the same code and source).
		 */
		has(similarFault: Fault): boolean;
		/**
		 * @returns An array of Fault objects that have been reported
		 * at the specified source. If the source has no faults, an empty
		 * array is returned.
		 */
		check<TSource extends object>(source: TSource): Fault<TSource>[];
		/**
		 * Enumerates through the unrectified faults retained
		 * by this FaultService.
		 */
		each(): IterableIterator<Fault<TFaultSource>>;
		/**
		 * Broadcasts all reports stored in activeContext,
		 * and creates a new activeContext.
		 */
		private broadcastReports;
		/** */
		private inEditTransaction;
		/**
		 * A rolling, mutable field that is used as the build target of the
		 * faults found in the current frame.
		 */
		private activeContext;
	}
	/**
	 * A type that describes the possible objects within a document
	 * that may be responsible for the generation of a fault.
	 */
	export type TFaultSource = Statement | Span | InfixSpan;
	/**
	 * 
	 */
	export class Fault<TSource = TFaultSource> {
		/** */
		readonly type: FaultType<TSource>;
		/** The document object that caused the fault to be reported. */
		readonly source: TSource;
		constructor(
		/** */
		type: FaultType<TSource>,
		/** The document object that caused the fault to be reported. */
		source: TSource);
	}
	/**
	 * 
	 */
	export class FaultType<TSource = TFaultSource> {
		/**
		 * An error code, useful for reference purposes, or display in a user interface.
		 */
		readonly code: number;
		/**
		 * A human-readable description of the fault.
		 */
		readonly message: string;
		/**
		 * 
		 */
		readonly severity: FaultSeverity;
		constructor(
		/**
		 * An error code, useful for reference purposes, or display in a user interface.
		 */
		code: number,
		/**
		 * A human-readable description of the fault.
		 */
		message: string,
		/**
		 * 
		 */
		severity: FaultSeverity);
		/**
		 * Creates a fault of this type.
		 */
		create(source: TSource): Fault<TSource>;
	}
	/**
	 * 
	 */
	export const enum FaultSeverity {
		/**
		 * Indicates the severity of a fault is "error", which means that
		 * the associated object will be ignored during type analysis.
		 */
		error = 1,
		/**
		 * Indicates the severity of a fault is "warning", which means that
		 * the associated object will still be processed during type analysis.
		 */
		warning = 2
	}
	/**
	 * 
	 */
	export const Faults: Readonly<{
		/** */
		each(): IterableIterator<FaultType<object>>;
		/**
		 * @returns An object containing the FaultType instance
		 * associated with the fault with the specified code, as
		 * well as the name of the instance. In the case when the
		 * faultCode was not found, null is returned.
		 */
		nameOf(faultCode: number): string;
		/** */
		UnresolvedResource: Readonly<FaultType<Statement>>;
		/** */
		CircularResourceReference: Readonly<FaultType<Statement>>;
		/** */
		InsecureResourceReference: Readonly<FaultType<Statement>>;
		/** */
		UnresolvedAnnotationFault: Readonly<FaultType<Span>>;
		/** */
		CircularTypeReference: Readonly<FaultType<Span>>;
		/** */
		ContractViolation: Readonly<FaultType<Span>>;
		/** */
		TypeCannotBeRefreshed: Readonly<FaultType<Statement>>;
		/** */
		IgnoredAnnotation: Readonly<FaultType<Span>>;
		/** */
		IgnoredAlias: Readonly<FaultType<Span>>;
		/** */
		TypeSelfReferential: Readonly<FaultType<Span>>;
		/** */
		AnonymousInListIntrinsicType: Readonly<FaultType<Statement>>;
		/** */
		ListContractViolation: Readonly<FaultType<Span>>;
		/** */
		ListIntrinsicExtendingList: Readonly<FaultType<Span>>;
		/** */
		ListExtrinsicExtendingNonList: Readonly<FaultType<Span>>;
		/** */
		ListDimensionalDiscrepancyFault: Readonly<FaultType<Span>>;
		/** */
		PatternInvalid: Readonly<FaultType<Statement>>;
		/** */
		PatternWithoutAnnotation: Readonly<FaultType<Statement>>;
		/** */
		PatternCanMatchEmpty: Readonly<FaultType<Statement>>;
		/** */
		PatternMatchingTypesAlreadyExists: Readonly<FaultType<Statement>>;
		/** */
		PatternMatchingList: Readonly<FaultType<Span>>;
		/** */
		PatternCanMatchWhitespaceOnly: Readonly<FaultType<Statement>>;
		/** */
		PatternAcceptsLeadingWhitespace: Readonly<FaultType<Statement>>;
		/** */
		PatternRequiresLeadingWhitespace: Readonly<FaultType<Statement>>;
		/** */
		PatternAcceptsTrailingWhitespace: Readonly<FaultType<Statement>>;
		/** */
		PatternRequiresTrailingWhitespace: Readonly<FaultType<Statement>>;
		/** */
		PatternNonCovariant: Readonly<FaultType<Statement>>;
		/** */
		PatternPartialWithCombinator: Readonly<FaultType<Statement>>;
		/** */
		DiscrepantUnion: Readonly<FaultType<Span>>;
		/** */
		InfixHasQuantifier: Readonly<FaultType<Statement>>;
		/** */
		InfixHasDuplicateIdentifier: Readonly<FaultType<InfixSpan>>;
		/** */
		InfixHasSelfReferentialType: Readonly<FaultType<InfixSpan>>;
		/** */
		InfixNonConvariant: Readonly<FaultType<InfixSpan>>;
		/** */
		InfixCannotDefineNewTypes: Readonly<FaultType<InfixSpan>>;
		/** */
		InfixReferencedTypeMustHavePattern: Readonly<FaultType<InfixSpan>>;
		/** */
		InfixReferencedTypeCannotBeRecursive: Readonly<FaultType<InfixSpan>>;
		/** */
		InfixContractViolation: Readonly<FaultType<InfixSpan>>;
		/** */
		InfixPopulationChaining: Readonly<FaultType<InfixSpan>>;
		/** */
		InfixUsingListOperator: Readonly<FaultType<InfixSpan>>;
		/** */
		InfixReferencingList: Readonly<FaultType<InfixSpan>>;
		/** */
		PortabilityInfixHasMultipleDefinitions: Readonly<FaultType<InfixSpan>>;
		/** */
		PopulationInfixHasMultipleDefinitions: Readonly<FaultType<InfixSpan>>;
		/** */
		NominalInfixMustSubtype: Readonly<FaultType<Span>>;
		/** */
		StatementBeginsWithComma: Readonly<FaultType<Statement>>;
		/** */
		StatementBeginsWithEllipsis: Readonly<FaultType<Statement>>;
		/** */
		StatementBeginsWithEscapedSpace: Readonly<FaultType<Statement>>;
		/** */
		TabsAndSpaces: Readonly<FaultType<Statement>>;
		/** */
		DuplicateDeclaration: Readonly<FaultType<Span>>;
		/** */
		UnterminatedCharacterSet: Readonly<FaultType<Statement>>;
		/** */
		UnterminatedGroup: Readonly<FaultType<Statement>>;
		/** */
		DuplicateQuantifier: Readonly<FaultType<Statement>>;
		/** */
		UnterminatedInfix: Readonly<FaultType<Statement>>;
		/** */
		EmptyPattern: Readonly<FaultType<Statement>>;
	}>;
	/**
	 * Infinite incremental counter.
	 */
	export class VersionStamp {
		private readonly stamp;
		/** */
		static next(): VersionStamp;
		/** */
		private static nextStamp;
		/** */
		protected constructor(stamp: number | number[]);
		/** */
		newerThan(otherStamp: VersionStamp): boolean;
		/** */
		toString(): string;
	}
	/**
	 * Contains members that replicate the behavior of
	 * the language server.
	 */
	export namespace LanguageServer {
		/**
		 * Position in a text document expressed as zero-based line and character offset.
		 * The offsets are based on a UTF-16 string representation. So a string of the form
		 * `a𐐀b` the character offset of the character `a` is 0, the character offset of `𐐀`
		 * is 1 and the character offset of b is 3 since `𐐀` is represented using two code
		 * units in UTF-16.
		 * 
		 * Positions are line end character agnostic. So you can not specify a position that
		 * denotes `\r|\n` or `\n|` where `|` represents the character offset.
		 */
		interface Position {
			/**
			 * Line position in a document (zero-based).
			 * If a line number is greater than the number of lines in a document, it defaults back to the number of lines in the document.
			 * If a line number is negative, it defaults to 0.
			 */
			line: number;
			/**
			 * Character offset on a line in a document (zero-based). Assuming that the line is
			 * represented as a string, the `character` value represents the gap between the
			 * `character` and `character + 1`.
			 * 
			 * If the character value is greater than the line length it defaults back to the
			 * line length.
			 * If a line number is negative, it defaults to 0.
			 */
			character: number;
		}
		/**
		 * The Position namespace provides helper functions to work with
		 * [Position](#Position) literals.
		 */
		namespace Position {
			/**
			 * Creates a new Position literal from the given line and character.
			 * @param line The position's line.
			 * @param character The position's character.
			 */
			function create(line: number, character: number): Position;
			/**
			 * Checks whether the given liternal conforms to the [Position](#Position) interface.
			 */
			function is(value: any): value is Position;
		}
		/**
		 * A range in a text document expressed as (zero-based) start and end positions.
		 * 
		 * If you want to specify a range that contains a line including the line ending
		 * character(s) then use an end position denoting the start of the next line.
		 * For example:
		 * ```ts
		 * {
		 *     start: { line: 5, character: 23 }
		 *     end : { line 6, character : 0 }
		 * }
		 * ```
		 */
		interface Range {
			/**
			 * The range's start position
			 */
			start: Position;
			/**
			 * The range's end position.
			 */
			end: Position;
		}
		/**
		 * A text edit applicable to a text document.
		 */
		interface TextEdit {
			/**
			 * The range of the text document to be manipulated. To insert
			 * text into a document create a range where start === end.
			 */
			range: Range;
			/**
			 * The string to be inserted. For delete operations use an
			 * empty string.
			 */
			newText: string;
		}
		/**
		 * The TextEdit namespace provides helper function to create replace,
		 * insert and delete edits more easily.
		 */
		namespace TextEdit {
		}
		/**
		 * Describes the content type that a client supports in various
		 * result literals like `Hover`, `ParameterInfo` or `CompletionItem`.
		 * 
		 * Please note that `MarkupKinds` must not start with a `$`. This kinds
		 * are reserved for internal usage.
		 */
		namespace MarkupKind {
		}
		type MarkupKind = 'plaintext' | 'markdown';
		/**
		 * A `MarkupContent` literal represents a string value which content is interpreted base on its
		 * kind flag. Currently the protocol supports `plaintext` and `markdown` as markup kinds.
		 * 
		 * If the kind is `markdown` then the value can contain fenced code blocks like in GitHub issues.
		 * See https://help.github.com/articles/creating-and-highlighting-code-blocks/#syntax-highlighting
		 * 
		 * Here is an example how such a string can be constructed using JavaScript / TypeScript:
		 * ```ts
		 * let markdown: MarkdownContent = {
		 *  kind: MarkupKind.Markdown,
		 *	value: [
		 *		'# Header',
		 *		'Some text',
		 *		'```typescript',
		 *		'someCode();',
		 *		'```'
		 *	].join('\n')
		 * };
		 * ```
		 * 
		 * *Please Note* that clients might sanitize the return markdown. A client could decide to
		 * remove HTML from the markdown to avoid script execution.
		 */
		interface MarkupContent {
			/**
			 * The type of the Markup
			 */
			kind: MarkupKind;
			/**
			 * The content itself
			 */
			value: string;
		}
		/**
		 * The kind of a completion entry.
		 */
		namespace CompletionItemKind {
			const Text = 1;
			const Method = 2;
			const Function = 3;
			const Constructor = 4;
			const Field = 5;
			const Variable = 6;
			const Class = 7;
			const Interface = 8;
			const Module = 9;
			const Property = 10;
			const Unit = 11;
			const Value = 12;
			const Enum = 13;
			const Keyword = 14;
			const Snippet = 15;
			const Color = 16;
			const File = 17;
			const Reference = 18;
			const Folder = 19;
			const EnumMember = 20;
			const Constant = 21;
			const Struct = 22;
			const Event = 23;
			const Operator = 24;
			const TypeParameter = 25;
		}
		type CompletionItemKind = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18 | 19 | 20 | 21 | 22 | 23 | 24 | 25;
		/**
		 * Defines whether the insert text in a completion item should be interpreted as
		 * plain text or a snippet.
		 */
		namespace InsertTextFormat {
		}
		type InsertTextFormat = 1 | 2;
		/**
		 * A completion item represents a text snippet that is
		 * proposed to complete text that is being typed.
		 */
		interface CompletionItem {
			/**
			 * The label of this completion item. By default
			 * also the text that is inserted when selecting
			 * this completion.
			 */
			label: string;
			/**
			 * The kind of this completion item. Based of the kind
			 * an icon is chosen by the editor.
			 */
			kind?: CompletionItemKind;
			/**
			 * A human-readable string with additional information
			 * about this item, like type or symbol information.
			 */
			detail?: string;
			/**
			 * A human-readable string that represents a doc-comment.
			 */
			documentation?: string | MarkupContent;
			/**
			 * Indicates if this item is deprecated.
			 */
			deprecated?: boolean;
			/**
			 * A string that should be used when comparing this item
			 * with other items. When `falsy` the [label](#CompletionItem.label)
			 * is used.
			 */
			sortText?: string;
			/**
			 * A string that should be used when filtering a set of
			 * completion items. When `falsy` the [label](#CompletionItem.label)
			 * is used.
			 */
			filterText?: string;
			/**
			 * A string that should be inserted into a document when selecting
			 * this completion. When `falsy` the [label](#CompletionItem.label)
			 * is used.
			 * 
			 * The `insertText` is subject to interpretation by the client side.
			 * Some tools might not take the string literally. For example
			 * VS Code when code complete is requested in this example `con<cursor position>`
			 * and a completion item with an `insertText` of `console` is provided it
			 * will only insert `sole`. Therefore it is recommended to use `textEdit` instead
			 * since it avoids additional client side interpretation.
			 * 
			 * @deprecated Use textEdit instead.
			 */
			insertText?: string;
			/**
			 * The format of the insert text. The format applies to both the `insertText` property
			 * and the `newText` property of a provided `textEdit`.
			 */
			insertTextFormat?: InsertTextFormat;
			/**
			 * An [edit](#TextEdit) which is applied to a document when selecting
			 * this completion. When an edit is provided the value of
			 * [insertText](#CompletionItem.insertText) is ignored.
			 * 
			 * *Note:* The text edit's range must be a [single line] and it must contain the position
			 * at which completion has been requested.
			 */
			textEdit?: TextEdit;
			/**
			 * An optional array of additional [text edits](#TextEdit) that are applied when
			 * selecting this completion. Edits must not overlap (including the same insert position)
			 * with the main [edit](#CompletionItem.textEdit) nor with themselves.
			 * 
			 * Additional text edits should be used to change text unrelated to the current cursor position
			 * (for example adding an import statement at the top of the file if the completion item will
			 * insert an unqualified type).
			 */
			additionalTextEdits?: TextEdit[];
			/**
			 * An optional set of characters that when pressed while this completion is active will accept it first and
			 * then type that character. *Note* that all commit characters should have `length=1` and that superfluous
			 * characters will be ignored.
			 */
			commitCharacters?: string[];
			/**
			 * An data entry field that is preserved on a completion item between
			 * a [CompletionRequest](#CompletionRequest) and a [CompletionResolveRequest]
			 * (#CompletionResolveRequest)
			 */
			data?: any;
		}
		/**
		 * The CompletionItem namespace provides functions to deal with
		 * completion items.
		 */
		namespace CompletionItem {
		}
	}
	/**
	 * 
	 */
	export class AlphabetRange {
		readonly from: number;
		readonly to: number;
		constructor(from: number, to: number);
	}
	/**
	 * A disposable class for easily creating Alphabet instances
	 * (This design avoids introducing mutability into the Alphabet class).
	 */
	export class AlphabetBuilder {
		/** */
		constructor(...others: (X.Alphabet | AlphabetRange | string | number)[]);
		/**
		 * Adds an entry to the alphabet.
		 * If the second parameter is omitted, the entry refers to a
		 * single character, rather than a range of characters.
		 */
		add(from: string | number, to?: string | number): this;
		/** */
		addWild(): void;
		/**
		 * @returns An optimized Alphabet instances composed
		 * from the characters and ranges applied to this AlphabetBuilder.
		 * 
		 * @param invert In true, causes the entries in the generated
		 * Alphabet to be reversed, such that every character marked
		 * as included is excluded, and vice versa.
		 */
		toAlphabet(invert?: boolean): Alphabet;
		/** */
		private readonly ranges;
	}
	/**
	 * 
	 */
	export class MutableTransitionMap extends TransitionMap {
		/** */
		initialize(srcStateId: number): void;
		/** */
		set(srcStateId: number, symbol: string, dstStateId: number): void;
	}
	/**
	 * 
	 */
	export interface ITransitionLiteral {
		[stateId: number]: ITransitionStateLiteral;
	}
	/**
	 * 
	 */
	export interface ITransitionStateLiteral {
		[symbol: string]: number;
	}
	/**
	 * 
	 */
	export class Document {
		/**
		 * Fills the document with the specified source code.
		 * If the document is non-empty, it is emptied before being filled.
		 * @param source The source text to fill the document.
		 */
		private fill;
		/**
		 * @returns An array of Statement objects that represent
		 * ancestry of the specified statement. If the specified
		 * statement is not in this document, the returned value
		 * is null.
		 */
		getAncestry(statement: Statement | number): Statement[] | null;
		/**
		 * @returns The parent Statement object of the specified
		 * Statement. If the statement is top level, a reference to
		 * this document object is returned. If the statement is
		 * not found in the document, or the specified statement
		 * is a no-op, the returned value is null.
		 */
		getParent(statement: Statement | number): this | Statement | null;
		/**
		 * @returns The Statement that would act as the parent
		 * if a statement where to be inserted at the specified
		 * virtual position in the document. If an inserted
		 * statement would be top-level, a reference to this
		 * document object is returned.
		 */
		getParentFromPosition(virtualLine: number, virtualOffset: number): Statement | this;
		/**
		 * @returns The sibling Statement objects of the
		 * specified Statement. If the specified statement
		 * is not found in the document, or is a no-op, the
		 * returned value is null.
		 */
		getSiblings(statement: Statement | number): Statement[] | null;
		/**
		 * @returns The child Statement objects of the specified
		 * Statement. If the argument is null or omitted, the document's
		 * top-level statements are returned. If the specified statement
		 * is not found in the document, the returned value is null.
		 */
		getChildren(statement?: Statement | null): Statement[];
		/**
		 * @returns A boolean value that indicates whether the specified
		 * statement, or the statement at the specified index has any
		 * descendants. If the argument is null, the returned value is a
		 * boolean indicating whether this document has any non-noop
		 * statements.
		 */
		hasDescendants(statement: Statement | number | null): boolean;
		/**
		 * @returns The index of the specified statement in
		 * the document, relying on caching when available.
		 * If the statement does not exist in the document,
		 * the returned value is -1.
		 */
		getLineNumber(statement: Statement): number;
		/**
		 * @returns An array of strings containing the content
		 * written in the comments directly above the specified
		 * statement. Whitespace lines are ignored. If the specified
		 * statement is a no-op, an empty array is returned.
		 */
		getNotes(statement: Statement | number): string[];
		/**
		 * Enumerates through each statement that is a descendant of the
		 * specified statement. If the parameters are null or omitted, all
		 * statements in this Document are yielded.
		 * 
		 * The method yields an object that contains the yielded statement,
		 * as well as a numeric level value that specifies the difference in
		 * the number of nesting levels between the specified initialStatement
		 * and the yielded statement.
		 * 
		 * @param initialStatement A reference to the statement object
		 * from where the enumeration should begin.
		 * 
		 * @param includeInitial A boolean value indicating whether or
		 * not the specified initialStatement should also be returned
		 * as an element in the enumeration. If true, initialStatement
		 * must be non-null.
		 */
		eachDescendant(initialStatement?: Statement | null, includeInitial?: boolean): IterableIterator<{
			statement: Statement;
			level: number;
		}>;
		/**
		 * @deprecated
		 * Enumerates through each unique URI defined in this document,
		 * that are referenced within the descendants of the specified
		 * statement. If the parameters are null or omitted, all unique
		 * URIs referenced in this document are yielded.
		 * 
		 * @param initialStatement A reference to the statement object
		 * from where the enumeration should begin.
		 * 
		 * @param includeInitial A boolean value indicating whether or
		 * not the specified initialStatement should also be returned
		 * as an element in the enumeration. If true, initialStatement
		 * must be non-null.
		 */
		eachUri(initialStatement?: Statement | null, includeInitial?: boolean): IterableIterator<{
			uri: Uri;
			uriText: string;
		}>;
		/**
		 * Enumerates through each statement in the document,
		 * starting at the specified statement, or numeric position.
		 * 
		 * @yields The statements in the order that they appear
		 * in the document, excluding whitespace-only statements.
		 */
		eachStatement(statement?: Statement | number): IterableIterator<Statement>;
		/**
		 * Reads the Statement at the given position.
		 * Negative numbers read Statement starting from the end of the document.
		 */
		read(lineNumber: number): Statement;
		/**
		 * Convenience method that converts a statement or it's index
		 * within this document to a statement object.
		 */
		private toStatement;
		/**
		 * Convenience method to quickly turn a value that may be
		 * a statement or a statement index, into a bounded statement
		 * index.
		 */
		private toLineNumber;
		/**
		 * Starts an edit transaction in the specified callback function.
		 * Edit transactions are used to synchronize changes made in
		 * an underlying file, typically done by a user in a text editing
		 * environment. System-initiated changes such as automated
		 * fixes, refactors, or renames do not go through this pathway.
		 * @param editFn The callback function in which to perform
		 * document mutation operations.
		 */
		edit(editFn: (facts: IDocumentMutator) => void): void;
		/** Stores the URI from where this document was loaded. */
		readonly sourceUri: Uri;
		/** A reference to the instance of the Compiler that owns this Document. */
		readonly program: Program;
		/**
		 * Stores the complete list of the Document's statements,
		 * sorted in the order that they appear in the file.
		 */
		private readonly statements;
		/**
		 * Shifts the cached statement indexes above the specified
		 * number, by the specified offset. Once the size of the cache
		 * grows past a certain threshold, the statement cache is cleared.
		 * Shifting the indexes of small caches is a simple optimization
		 * that allows the document to avoid throwing away the entire
		 * cache for many edits to the document.
		 */
		private shiftStatementIndexCache;
		/**
		 * Stores a cache of the indexes at which various statements
		 * are located in the statements array. Not all statements
		 * contained in the document are stored in this array. The
		 * cache is built up and cleared over time.
		 */
		private readonly statementIndexCache;
		/**
		 * A state variable that stores whether an
		 * edit transaction is currently underway.
		 */
		private inEdit;
		private _version;
		/**
		 * Returns a formatted version of the Document.
		 */
		toString(): string;
	}
	/**
	 * Represents an interface for creating a
	 * batch of document mutation operations.
	 */
	interface IDocumentMutator {
		/**
		 * Inserts a fact at the given position, and returns the inserted Fact.
		 * Negative numbers insert facts starting from the end of the document.
		 * The factText argument is expected to be one single complete line of text.
		 */
		insert(text: string, at: number): void;
		/**
		 * Replaces a fact at the given position, and returns the replaced Fact.
		 * Negative numbers insert facts starting from the end of the document.
		 * The factText argument is expected to be one single complete line of text.
		 */
		update(factText: string, at: number): void;
		/**
		 * Deletes a fact at the given position, and returns the deleted Fact.
		 * Negative numbers delete facts starting from the end of the document.
		 */
		delete(at: number, count: number): void;
	}
	/**
	 * A class that stores all the documents loaded into a
	 * program, and the inter-dependencies between them.
	 */
	export class DocumentGraph {
		/** */
		constructor(program: Program);
		/**
		 * Reads a Document from the specified URI.
		 * The document is created and returned, asynchronously.
		 */
		read(uri: Uri): Promise<Error | Document>;
		/**
		 * Creates a temporary document that will exist only in memory.
		 * The document may not be linked to other documents in the
		 * graph.
		 */
		create(): Document;
		/**
		 * Creates a temporary document that will exist only in memory,
		 * which is initialized with the specified source text. The document
		 * may not be linked to other documents in the graph.
		 */
		create(sourceText: string): Document;
		/**
		 * Creates a document that was read from the specified URI,
		 * with the specified sourceText. If the content still needs to be
		 * read from a URI, use the .read() method.
		 */
		create(uri: Uri | string, sourceText: string): Document;
		/**
		 * Blocks execution until all queued IO operations have completed.
		 */
		await(): Promise<void>;
		/**
		 * @returns The document loaded into this graph
		 * with the specified URI.
		 */
		get(uri: Uri): Document | null;
		/**
		 * @returns A boolean value that indicates whether
		 * the specified Document has been loaded into
		 * this DocumentGraph.
		 */
		has(param: Uri | Document): boolean;
		/**
		 * @returns An array containing all documents loaded into this
		 * DocumentGraph. The array returned is sorted topologically
		 * from left to right, so that forward traversals are guaranteed
		 * to not cause dependency conflicts.
		 */
		each(): Document[];
		/**
		 * Deletes a document that was previously loaded into the compiler.
		 * Intended to be called by the host environment when a file changes.
		 */
		delete(target: Document | Uri): void;
		/**
		 * Removes all documents from this graph.
		 */
		clear(): void;
		/**
		 * @returns An array containing the dependencies
		 * associated with the specified document. The returned
		 * array is sorted in the order in which the dependencies
		 * are defined in the document.
		 */
		getDependencies(doc: Document): Document[];
		/**
		 * @returns An array containing the dependents
		 * associated with the specified document.
		 */
		getDependents(doc: Document): Document[];
		/**
		 * Attempts to add a link from one document to another,
		 * via the specified URI. If there is some reason why the
		 * link cannot be established, (circular references, bad
		 * URIs), no link is added, and a fault is reported.
		 */
		private tryLink;
		/**
		 * An array of functions that should be executed when
		 * all outstanding async operations have completed.
		 */
		private waitFns;
		/**
		 * Counts the number of async operations in progress.
		 */
		private asyncCount;
		/**
		 * Checks to see if the addition of a reference between the two
		 * specified documents would result in a document graph with
		 * circular relationships.
		 * 
		 * The algorithm used performs a depth-first dependency search,
		 * starting at the candidateTo. If the traversal pattern is able to
		 * make its way to candidateFrom, it can be concluded that the
		 * addition of the proposed reference would result in a cyclical
		 * relationship.
		 */
		private wouldCreateCycles;
		/**
		 * Adds a dependency between two documents in the graph.
		 * If a dependency between the two documents already exists,
		 * the reference count of the dependency is incremented.
		 * This method is executed only after other methods have
		 * indicated that the addition of the link will not cause conflict.
		 */
		private link;
		/**
		 * Removes a dependency between two documents in the graph.
		 * If the reference count of the dependency is greater than 1, the
		 * the reference count is decremented instead of the dependency
		 * being removed completely.
		 */
		private unlink;
		/**
		 * A map of documents loaded into the graph,
		 * indexed by their URIs.
		 */
		private readonly documents;
		/**
		 * A map of each document's dependencies.
		 */
		private readonly dependencies;
		/**
		 * A map of the documents that depend on each document.
		 */
		private readonly dependents;
		/** */
		private readonly program;
		/**
		 * Converts the contents of this DocumentGraph to a
		 * string representation, useful for testing purposes.
		 */
		toString(): string;
	}
	/**
	 * 
	 */
	export class ParseFault {
		readonly innerType: Readonly<FaultType<Statement>>;
		readonly offsetStart: number;
		readonly offsetEnd: number;
		constructor(innerType: Readonly<FaultType<Statement>>, offsetStart: number, offsetEnd: number);
	}
	/**
	 * 
	 */
	export class LineParser {
		/**
		 * Generator function that yields all statements
		 * (unparsed lines) of the given source text.
		 */
		static read(fullSource: string): IterableIterator<string>;
		/**
		 * Main entry point for parsing a single line and producing a
		 * RawStatement object.
		 * 
		 * The parsing algorithm is some kind of quasi-recusive descent with
		 * lookheads and backtracking in some places to make the logic easier
		 * to follow. Technically, it's probably some mash-up of LL(k) & LALR.
		 * Maybe if I blew 4 years of my life in some silly Comp Sci program
		 * instead of dropping out of high school I could say for sure.
		 */
		static parse(lineText: string): Line;
		/** */
		private constructor();
	}
	/**
	 * Placeholder object to mark the position of
	 * an anonymous type within a statement.
	 */
	export class Anon {
		/** */
		toString(): string;
	}
	/**
	 * Stores information about a line, after being parsed.
	 * A Line is different from a Statement in that it has no
	 * relationship to a Document.
	 */
	export class Line {
		readonly sourceText: string;
		readonly indent: number;
		readonly declarations: BoundaryGroup<DeclarationSubject>;
		readonly annotations: BoundaryGroup<AnnotationSubject>;
		readonly sum: string;
		readonly jointPosition: number;
		readonly flags: LineFlags;
		readonly parseFault: ParseFault | null;
		/*** */
		constructor(sourceText: string, indent: number, declarations: BoundaryGroup<DeclarationSubject>, annotations: BoundaryGroup<AnnotationSubject>, sum: string, jointPosition: number, flags: LineFlags, parseFault: ParseFault | null);
	}
	/**
	 * A bit field enumeration used to efficiently store
	 * meta data about a Line (or a Statement) object.
	 */
	export enum LineFlags {
		none = 0,
		isRefresh = 1,
		isComment = 2,
		isWhitespace = 4,
		isDisposed = 8,
		isCruft = 16,
		hasUri = 32,
		hasTotalPattern = 64,
		hasPartialPattern = 128,
		hasPattern = 256
	}
	/**
	 * Stakes out starting and ending character positions
	 * of subjects within a given region.
	 */
	export class BoundaryGroup<TSubject> {
		/** */
		constructor(boundaries: Boundary<TSubject>[]);
		/** */
		[Symbol.iterator](): IterableIterator<Boundary<TSubject>>;
		/** */
		eachSubject(): IterableIterator<TSubject>;
		/** */
		inspect(offset: number): TSubject | null;
		/** */
		first(): Boundary<TSubject> | null;
		/** Gets the number of entries defined in the bounds. */
		readonly length: number;
		/** */
		private readonly entries;
	}
	/** */
	export class Boundary<TSubject> {
		readonly offsetStart: number;
		readonly offsetEnd: number;
		readonly subject: TSubject;
		constructor(offsetStart: number, offsetEnd: number, subject: TSubject);
	}
	/**
	 * 
	 */
	export class Statement {
		/**
		 * 
		 */
		private eachStatementLevelFaults;
		/**
		 * Gets whether the joint operator exists at the
		 * end of the statement, forcing the statement's
		 * declarations to be "refresh types".
		 */
		readonly isRefresh: boolean;
		/**
		 * Gets whether the statement contains nothing
		 * other than a single joint operator.
		 */
		readonly isVacuous: boolean;
		/**
		 * Gets whether the statement is a comment.
		 */
		readonly isComment: boolean;
		/**
		 * Gets whether the statement contains
		 * no non-whitespace characters.
		 */
		readonly isWhitespace: boolean;
		/**
		 * Gets whether the statement is a comment or whitespace.
		 */
		readonly isNoop: boolean;
		/**
		 * Gets whether the statement has been
		 * removed from it's containing document.
		 */
		readonly isDisposed: boolean;
		/**
		 * 
		 */
		readonly isCruft: boolean;
		/** */
		readonly faults: ReadonlyArray<Fault>;
		/** Stores a reference to the document that contains this statement. */
		readonly document: Document;
		/** Stores the indent level of the statement. */
		readonly indent: number;
		/**
		 * Stores the set of objects that are contained by this Statement,
		 * and are marked as cruft. Note that the only Statement object
		 * that may be located in this set is this Statement object itself.
		 */
		readonly cruftObjects: ReadonlySet<Statement | Span | InfixSpan>;
		/**
		 * Gets an array of spans in that represent the declarations
		 * of this statement, excluding those that have been marked
		 * as object-level cruft.
		 */
		readonly declarations: ReadonlyArray<Span>;
		/**
		 * Stores the array of spans that represent the declarations
		 * of this statement, including those that have been marked
		 * as object-level cruft.
		 */
		readonly allDeclarations: ReadonlyArray<Span>;
		/**
		 * Gets an array of spans in that represent the annotations
		 * of this statement, from left to right, excluding those that
		 * have been marked as object-level cruft.
		 */
		readonly annotations: ReadonlyArray<Span>;
		/**
		 * Stores the array of spans that represent the annotations
		 * of this statement, including those that have been marked
		 * as object-level cruft.
		 */
		readonly allAnnotations: ReadonlyArray<Span>;
		/**
		 * Gets an array of spans in that represent both the declarations
		 * and the annotations of this statement, excluding those that have
		 * been marked as object-level cruft.
		 */
		readonly spans: Span[];
		/**
		 * 
		 */
		readonly allSpans: Span[];
		/**
		 * Stores the position at which the joint operator exists
		 * in the statement. A negative number indicates that
		 * the joint operator does not exist in the statement.
		 */
		readonly jointPosition: number;
		/**
		 * Stores the unprocessed text content of the statement,
		 * as it appears in the document.
		 */
		readonly sourceText: string;
		/**
		 * Stores the statement's textual *sum*, which is the
		 * raw text of the statement's annotations, with whitespace
		 * trimmed. The sum is suitable as an input to a total
		 * pattern.
		 */
		readonly sum: string;
		/**
		 * Gets a boolean value indicating whether or not the
		 * statement contains a declaration of a pattern.
		 */
		readonly hasPattern: boolean;
		/**
		 * @returns The kind of StatementRegion that exists
		 * at the given character offset within the Statement.
		 */
		getRegion(offset: number): StatementRegion;
		/**
		 * 
		 */
		getSubject(offset: number): Span | null;
		/**
		 * @returns A span to the declaration subject at the
		 * specified offset, or null if there is none was found.
		 */
		getDeclaration(offset: number): Span | null;
		/**
		 * @returns A span to the annotation subject at the
		 * specified offset, or null if there is none was found.
		 */
		getAnnotation(offset: number): Span | null;
		/**
		 * @returns A string containing the inner comment text of
		 * this statement, excluding the comment syntax token.
		 * If the statement isn't a comment, null is returned.
		 */
		getCommentText(): string | null;
		/**
		 * Converts the statement to a formatted string representation.
		 */
		toString(includeIndent?: boolean): string;
	}
	/**
	 * Defines the areas of a statement that are significantly
	 * different when performing inspection.
	 */
	export enum StatementRegion {
		/**
		 * Refers to the area within a comment statement,
		 * or the whitespace preceeding a non-no-op.
		 */
		void = 0,
		/**
		 * Refers to the area in the indentation area.
		 */
		whitespace = 1,
		/**
		 * Refers to the
		 */
		pattern = 2,
		/** */
		declaration = 3,
		/** */
		annotation = 4,
		/** */
		declarationVoid = 5,
		/** */
		annotationVoid = 6
	}
	/**
	 * 
	 */
	export class Pattern {
		/**
		 * 
		 */
		readonly units: ReadonlyArray<RegexUnit | Infix>;
		/**
		 * Stores whether the pattern is considered to be "Total"
		 * or "Partial". Total patterns must match an entire annotation
		 * set (the entire strip of content to the right of a joint, after
		 * being trimmed). Partial patterns match individually
		 * specified subjects (separated by commas).
		 */
		readonly isTotal: boolean;
		/**
		 * Stores a CRC which is computed from the set of
		 * annotations specified to the right of the pattern.
		 */
		readonly crc: string;
		/**
		 * Stores whether the internal regular expression
		 * was compiled successfully.
		 */
		readonly isValid: boolean;
		/**
		 * Recursively enumerates through this Pattern's unit structure.
		 */
		eachUnit(): IterableIterator<RegexUnit | Infix>;
		/**
		 * @returns A boolean value that indicates whether
		 * this Pattern has at least one infix, of any type.
		 */
		hasInfixes(): boolean;
		/**
		 * @returns An array containing the infixes of the
		 * specified type that are defined in this Pattern.
		 * If the argument is omitted, all infixes of any type
		 * defined on this Pattern are returned.
		 */
		getInfixes(type?: InfixFlags): Infix[];
		/**
		 * Performs an "expedient" test that determines whether the
		 * specified input has a chance of being matched by this pattern.
		 * The check is considered expedient, rather than thorough,
		 * because any infixes that exist in this pattern are replaced
		 * with "catch all" regular expression sequence, rather than
		 * embedding the pattern associated with the type specified
		 * in the infix.
		 */
		test(input: string): boolean;
		/**
		 * Executes the pattern (like a function) using the specified
		 * string as the input.
		 * 
		 * @returns A ReadonlyMap whose keys align with the infixes
		 * contained in this Pattern, and whose values are strings that
		 * are the extracted "inputs", found in the place of each infix.
		 * If this Pattern has no infixes, an empty map is returned.
		 */
		exec(patternParameter: string): ReadonlyMap<Infix, string>;
		/** */
		private compiledRegExp;
		/**
		 * Converts this Pattern to a string representation.
		 * (Note that the serialized pattern cannot be used
		 * as a parameter to a JavaScript RegExp object.)
		 */
		toString(): string;
	}
	/** */
	export class PatternPrecompiler {
		/**
		 * Compiles the specified pattern into a JS-native
		 * RegExp object that can be used to execute regular
		 * expression pre-matching (i.e. checks that essentially
		 * ignore any infixes that the pattern may have).
		 */
		static exec(pattern: Pattern): RegExp | null;
	}
	/**
	 * Ambient unifier for all PatternUnit instances
	 */
	export abstract class RegexUnit {
		readonly quantifier: RegexQuantifier | null;
		constructor(quantifier: RegexQuantifier | null);
		/** */
		abstract toString(): string;
	}
	/**
	 * 
	 */
	export class RegexSet extends RegexUnit {
		readonly knowns: ReadonlyArray<RegexSyntaxKnownSet>;
		readonly ranges: ReadonlyArray<RegexCharRange>;
		readonly unicodeBlocks: ReadonlyArray<string>;
		readonly singles: ReadonlyArray<string>;
		readonly isNegated: boolean;
		readonly quantifier: RegexQuantifier | null;
		/** */
		constructor(knowns: ReadonlyArray<RegexSyntaxKnownSet>, ranges: ReadonlyArray<RegexCharRange>, unicodeBlocks: ReadonlyArray<string>, singles: ReadonlyArray<string>, isNegated: boolean, quantifier: RegexQuantifier | null);
		/** */
		toString(): string;
		/** */
		toAlphabet(): Alphabet;
	}
	/**
	 * 
	 */
	export class RegexCharRange {
		readonly from: number;
		readonly to: number;
		constructor(from: number, to: number);
	}
	/**
	 * 
	 */
	export class RegexGroup extends RegexUnit {
		/**
		 * 
		 */
		readonly cases: ReadonlyArray<ReadonlyArray<RegexUnit>>;
		readonly quantifier: RegexQuantifier | null;
		constructor(
		/**
		 * 
		 */
		cases: ReadonlyArray<ReadonlyArray<RegexUnit>>, quantifier: RegexQuantifier | null);
		/** */
		toString(): string;
	}
	/**
	 * A pattern "grapheme" is a pattern unit class that
	 * represents:
	 * 
	 * a) A "Literal", which is a single unicode-aware character,
	 * with possible representations being an ascii character,
	 * a unicode character, or an ascii or unicode escape
	 * sequence.
	 * 
	 * or b) A "Special", which is a sequence that matches
	 * something other than the character specified,
	 * such as . \b \s
	 */
	export class RegexGrapheme extends RegexUnit {
		readonly grapheme: string;
		readonly quantifier: RegexQuantifier | null;
		constructor(grapheme: string, quantifier: RegexQuantifier | null);
		/** */
		toString(): string;
	}
	/**
	 * A Regex "Sign" refers to an escape sequence that refers
	 * to one other character, as opposed to that character
	 * being written directly in the parse stream.
	 */
	export class RegexSign extends RegexUnit {
		readonly sign: RegexSyntaxSign;
		readonly quantifier: RegexQuantifier | null;
		constructor(sign: RegexSyntaxSign, quantifier: RegexQuantifier | null);
		/** */
		toString(): string;
	}
	/**
	 * A pattern unit class that represents +, *,
	 * and explicit quantifiers such as {1,2}.
	 */
	export class RegexQuantifier {
		/**
		 * Stores the lower bound of the quantifier,
		 * or the fewest number of graphemes to be matched.
		 */
		readonly min: number;
		/**
		 * Stores the upper bound of the quantifier,
		 * or the most number of graphemes to be matched.
		 */
		readonly max: number;
		/**
		 * Stores whether the the quantifier is restrained,
		 * in that it matches the fewest possible number
		 * of characters.
		 * 
		 * (Some regular expression flavours awkwardly
		 * refer to this as "non-greedy".)
		 */
		readonly restrained: boolean;
		constructor(
		/**
		 * Stores the lower bound of the quantifier,
		 * or the fewest number of graphemes to be matched.
		 */
		min: number,
		/**
		 * Stores the upper bound of the quantifier,
		 * or the most number of graphemes to be matched.
		 */
		max: number,
		/**
		 * Stores whether the the quantifier is restrained,
		 * in that it matches the fewest possible number
		 * of characters.
		 * 
		 * (Some regular expression flavours awkwardly
		 * refer to this as "non-greedy".)
		 */
		restrained: boolean);
		/**
		 * Converts the regex quantifier to an optimized string.
		 */
		toString(): string;
	}
	/**
	 * A class that represents a portion of the content
	 * within an Infix that spans a type reference.
	 */
	export class Infix {
		/**
		 * Stores the left-most character position of the Infix
		 * (before the delimiter), relative to the containing statement.
		 */
		readonly offsetStart: number;
		/**
		 * Stores the left-most character position of the Infix
		 * (after the delimiter), relative to the containing statement.
		 */
		readonly offsetEnd: number;
		/**
		 * Stores the Bounds object that marks out the positions
		 * of the identifiers in the Infix that are located before
		 * any Joint operator.
		 */
		readonly lhs: BoundaryGroup<Identifier>;
		/**
		 * Stores the Bounds object that marks out the positions
		 * of the identifiers in the Infix that are located after
		 * any Joint operator.
		 */
		readonly rhs: BoundaryGroup<Identifier>;
		/** */
		readonly flags: InfixFlags;
		constructor(
		/**
		 * Stores the left-most character position of the Infix
		 * (before the delimiter), relative to the containing statement.
		 */
		offsetStart: number,
		/**
		 * Stores the left-most character position of the Infix
		 * (after the delimiter), relative to the containing statement.
		 */
		offsetEnd: number,
		/**
		 * Stores the Bounds object that marks out the positions
		 * of the identifiers in the Infix that are located before
		 * any Joint operator.
		 */
		lhs: BoundaryGroup<Identifier>,
		/**
		 * Stores the Bounds object that marks out the positions
		 * of the identifiers in the Infix that are located after
		 * any Joint operator.
		 */
		rhs: BoundaryGroup<Identifier>,
		/** */
		flags: InfixFlags);
		/**
		 * Gets whether this Infix is of the "pattern" variety.
		 */
		readonly isPattern: boolean;
		/**
		 * Gets whether this Infix is of the "portability" variety.
		 */
		readonly isPortability: boolean;
		/**
		 * Gets whether this Infix is of the "population" variety.
		 */
		readonly isPopulation: boolean;
		/**
		 * Gets whether this Infix has the "nominal" option set.
		 */
		readonly isNominal: boolean;
		/** */
		toString(): string;
	}
	/**
	 * 
	 */
	export enum InfixFlags {
		none = 0,
		/**
		 * Indicates that the joint was specified within
		 * the infix. Can be used to determine if the infix
		 * contains some (erroneous) syntax resembing
		 * a refresh type, eg - /<Type : >/
		 */
		hasJoint = 1,
		/**
		 * Indicates that the </Pattern/> syntax was
		 * used to embed the patterns associated
		 * with a specified type.
		 */
		pattern = 2,
		/**
		 * Indicates that the infix is of the "portabiity"
		 * variety, using the syntax < : Type>
		 */
		portability = 4,
		/**
		 * Indicates that the infix is of the "popuation"
		 * variety, using the syntax <Declaration : Annotation>
		 * or <Declaration>
		 */
		population = 8,
		/**
		 * Indicates that the <<Double>> angle bracket
		 * syntax was used to only match named types,
		 * rather than aliases.
		 */
		nominal = 16
	}
	/**
	 * A class that represents a single subject in a Statement.
	 * Consumers of this class should not expect Subject objects
	 * to be long-lived, as they are discarded regularly after edit
	 * transactions complete.
	 */
	export class Identifier {
		/** */
		constructor(text: string);
		/**
		 * Stores a full string representation of the subject,
		 * as it appears in the document.
		 */
		readonly fullName: string;
		/**
		 * Stores a string representation of the name of the
		 * type to which the subject refers, without any List
		 * operator suffix.
		 */
		readonly typeName: string;
		/** */
		readonly isList: boolean;
		/**
		 * Converts this Subject to it's string representation.
		 * @param escape If true, preserves any necessary
		 * escaping required to ensure the identifier string
		 * is in a parsable format.
		 */
		toString(escape?: IdentifierEscapeKind): string;
	}
	/**
	 * An enumeration that describes the various ways
	 * to handle escaping when serializing an identifier.
	 * This enumeration is used to address the differences
	 * in the way identifiers can be serialized, which can
	 * depend on whether the identifier is a declaration or
	 * an annotation.
	 */
	export const enum IdentifierEscapeKind {
		none = 0,
		declaration = 1,
		annotation = 2
	}
	/**
	 * A class that represents a position in a statement.
	 */
	export class Span {
		/**
		 * Stores a reference to the Statement that contains this Span.
		 */
		readonly statement: Statement;
		/**
		 * Stores the subject, and the location of it in the document.
		 */
		readonly boundary: Boundary<Subject>;
		/**
		 * Stores a string representation of this Span, useful for debugging.
		 */
		private readonly name;
		/**
		 * Gets the Infixes stored within this Span, in the case when
		 * the Span corresponds to a Pattern. In other cases, and
		 * empty array is returned.
		 */
		readonly infixes: ReadonlyArray<Infix>;
		private _infixes;
		/** */
		eachDeclarationForInfix(infix: Infix): IterableIterator<InfixSpan>;
		/** */
		eachAnnotationForInfix(infix: Infix): IterableIterator<InfixSpan>;
		/** */
		private queryInfixSpanTable;
		/** */
		private readonly infixSpanTable;
		/**
		 * Gets an array of statements that represent the statement
		 * containment progression, all the way back to the containing
		 * document.
		 */
		readonly ancestry: ReadonlyArray<Statement>;
		private _ancestry;
		/**
		 * Splits apart the groups subjects specified in the containing
		 * statement's ancestry, and generates a series of spines,
		 * each indicating a separate pathway of declarations through
		 * the ancestry that reach the location in the document
		 * referenced by this global span object.
		 * 
		 * The generated spines are referentially opaque. Running this
		 * method on the same Span object always returns the same
		 * Spine instance.
		 */
		factor(): ReadonlyArray<Spine>;
		/**  */
		private factoredSpines;
		/**
		 * Gets a boolean value that indicates whether this Span is considered
		 * object-level cruft, and should therefore be ignored during type analysis.
		 */
		readonly isCruft: boolean;
		/** */
		toString(): string;
	}
	/**
	 * A class that manages an array of Span objects that
	 * represent a specific spine of declarations, starting at
	 * a document, passing through a series of spans,
	 * and ending at a tip span.
	 * 
	 * In the case when
	 */
	export class Spine {
		/** */
		constructor(vertebrae: (X.Span | Statement)[]);
		/** Stores the last span in the array of segments. */
		readonly tip: Span;
		/** */
		readonly statement: Statement;
		/** Gets a reference to the document that sits at the top of the spine. */
		readonly document: Document;
		/** Stores an array of the Spans that compose the Spine. */
		readonly vertebrae: ReadonlyArray<Span | CruftMarker>;
	}
	/**
	 * A class that acts as a stand-in for a statement that has been
	 * marked as cruft, suitable for usage in a Spine.
	 */
	export class CruftMarker {
		readonly statement: Statement;
		/**
		 * Converts this cruft marker to a string representation,
		 * which is derived from a CRC calculated from this
		 * marker's underlying statement.
		 */
		toString(): string;
	}
	/** */
	export type Subject = DeclarationSubject | AnnotationSubject;
	/**
	 * Stores a map of the character offsets within a Statement
	 * that represent the starting positions of the statement's
	 * declarartions.
	 */
	export type DeclarationSubject = Identifier | Pattern | Uri | Anon;
	/**
	 * Stores a map of the character offsets within a Statement
	 * that represent the starting positions of the statement's
	 * annotations.
	 */
	export type AnnotationSubject = Identifier;
	/** */
	export class SubjectSerializer {
		/**
		 * Universal method for serializing a subject to a string,
		 * useful for debugging and supporting tests.
		 */
		static invoke(subject: Subject, escapeStyle: IdentifierEscapeKind): string;
	}
	/**
	 * @deprecated
	 * This code is only called by the Fragmenter, which is deprecated.
	 */
	export class SubjectParser {
		/**
		 * @deprecated
		 * This code is only called by the Fragmenter, which is deprecated.
		 */
		static invoke(text: string): Subject;
		private constructor();
	}
	/**
	 * 
	 */
	export class HyperGraph {
		private readonly program;
		/**
		 * Reads a root Node with the specified
		 * name out of the specified document.
		 */
		read(document: Document, name: string): Node | null;
		/**
		 * @returns An array containing the node objects
		 * that are defined at the root level of the specified
		 * document.
		 */
		readRoots(document: Document): IterableIterator<Node>;
		/**
		 * Handles a document-level exclusion, which is the removal
		 * of a section of Spans within a document, or possibly the
		 * entire document itself.
		 */
		private exclude;
		/**
		 * Performs a revalidation of the Nodes that correspond to the
		 * input argument.
		 * 
		 * @param root The root object under which which revalidation
		 * should occur. In the case when a Document instance is passed,
		 * all Nodes present within the document are revalidated. In the
		 * case when a Statement instance is passed, the Nodes that
		 * correspond to the Statement, and all of it's contents are
		 * revalidated.
		 */
		private include;
		/**
		 * Performs setup for the invalidate and revalidate methods.
		 */
		private methodSetup;
		/**
		 * Stores a 2-dimensional map of all nodes that
		 * have been loaded into the program, indexed
		 * by a string representation of it's URI.
		 */
		private readonly nodeCache;
		/**
		 * Stores a GraphTransaction instance in the case
		 * when an edit transaction is underway.
		 */
		private activeTransactions;
		/**
		 * Serializes the Graph into a format suitable
		 * for debugging and comparing against baselines.
		 */
		toString(): string;
	}
	/**
	 * A class that represents a single Node contained within
	 * the Program's Graph. Nodes are long-lived, referentially
	 * significant objects that persist between edit frames.
	 * 
	 * Nodes are connected in a graph not by edges, but by
	 * HyperEdges. A HyperEdge (from graph theory) is similar
	 * to a directed edge in that it has a single predecessor,
	 * but differs in that it has multiple successors.
	 * 
	 * It is necessary for Nodes to be connected to each other
	 * in this way, in order for further phases in the pipeline
	 * to execute the various kinds of polymorphic type
	 * resolution.
	 */
	export class Node {
		/**
		 * Removes this Node, and all its contents from the graph.
		 */
		dispose(): void;
		/**
		 * Removes the specified HyperEdge from this Node's
		 * set of outbounds.
		 * 
		 * @throws In the case when the specified HyperEdge is
		 * not owned by this Node.
		 */
		disposeEdge(edge: HyperEdge): void;
		/** */
		readonly container: Node | null;
		/** */
		readonly name: string;
		/** */
		readonly subject: Subject;
		/** */
		readonly uri: Uri;
		/** Stores the document that contains this Node. */
		readonly document: Document;
		/** */
		readonly stamp: VersionStamp;
		/**
		 * Stores the set of declaration-side Span objects that
		 * compose this Node. If this the size of this set were to
		 * reach zero, the Node would be marked for deletion.
		 * (Node cleanup uses a reference counted collection
		 * mechanism that uses the size of this set as it's guide).
		 * 
		 * Note that although the type of this field is defined as
		 * "Set<Span | Anchor>", in practice, it is either a set of
		 * multiple Span objects, or a set containing one single
		 * Anchor object. This is because it's possible to have
		 * fragments of a type declared in multiple places in
		 * a document, however, Anchors (which are references
		 * to declarations within an Infix) can only exist in one
		 * place.
		 */
		readonly declarations: Set<Span | InfixSpan>;
		/**
		 * Gets a readonly map of Nodes that are contained
		 * by this node in the containment hierarchy.
		 */
		readonly contents: NodeMap;
		private readonly _contents;
		/**
		 * Gets a readonly name of Nodes that are adjacent
		 * to this Node in the containment hierarchy.
		 */
		readonly adjacents: NodeMap;
		/**
		 * Gets the names of the identifiers referenced
		 * as portability targets in the infixes of the Node.
		 * If the Node's subject is not a pattern, this property
		 * is an empty array.
		 */
		readonly portabilityTargets: string[];
		/**
		 * @returns A set of nodes that are matched by
		 * patterns of adjacent nodes.
		 * 
		 * (Note that this is possible because annotations
		 * that have been applied to a pattern cannot be
		 * polymorphic)
		 */
		getPatternNodesMatching(nodes: Node[]): Node[];
		/**
		 * Gets an immutable set of HyperEdges from adjacent
		 * or contained Nodes that reference this Node.
		 * 
		 * (The ordering of outbounds isn't important, as
		 * they have no physical representation in the
		 * document, which is why they're stored in a Set
		 * rather than an array.)
		 */
		readonly inbounds: ReadonlySet<HyperEdge>;
		private readonly _inbounds;
		/**
		 * Gets an array of HyperEdges that connect this Node to
		 * others, being either adjacents, or Nodes that
		 * exists somewhere in the containment hierarchy.
		 */
		readonly outbounds: ReadonlyArray<HyperEdge>;
		private readonly _outbounds;
		/**
		 * 
		 */
		private enumerateOutbounds;
		/**
		 * Enumerates upwards through the containment
		 * hierarchy of the Nodes present in this Node's
		 * containing document, yielding the adjacents at
		 * every level, and then continues through to the
		 * root level adjacents of each of the document's
		 * dependencies.
		 */
		enumerateContainment(): IterableIterator<{
			sourceDocument: Document;
			adjacents: ReadonlyMap<string, Node>;
			longitudeDelta: number;
		}>;
		/**
		 * Enumerates upwards through the containment
		 * hierarchy of the Nodes present in this Node's
		 * containing document, yielding each container
		 * of this Node.
		 */
		enumerateContainers(): IterableIterator<Node>;
		/** */
		removeEdgeSource(src: Span | InfixSpan): void;
		/** */
		toString(includePath?: boolean): string;
		/** */
		private addRootNode;
		/** */
		private removeRootNode;
		/** */
		private getRootNodes;
		/** */
		private static rootNodes;
	}
	type NodeMap = ReadonlyMap<string, Node>;
	/**
	 * A HyperEdge connects an origin predecessor Node to a series of
	 * successor Nodes. From graph theory, a "hyper edge" is different
	 * from an "edge" in that it can have many successors:
	 * https://en.wikipedia.org/wiki/Hypergraph
	 */
	export class HyperEdge {
		/**
		 * The Node from where the HyperEdge connection begins.
		 * For example, given the following document:
		 * 
		 * Foo
		 * 	Bar : Foo
		 * 
		 * Two Node objects would be created, one for the first instance
		 * of "Foo", and another for the instance of "Bar". A HyperEdge
		 * would be created between "Bar" and "Foo", and it's
		 * precedessor would refer to the Node representing the
		 * instance of "Bar".
		 */
		readonly predecessor: Node;
		/**
		 * Stores all possible success Nodes to which the predecessor
		 * Node is preemptively connected via this HyperEdge. The
		 * connection is said to be preemptive, because the connection
		 * might be ignored during polymorphic name resolution.
		 */
		readonly successors: ReadonlyArray<Successor>;
		constructor(
		/**
		 * The Node from where the HyperEdge connection begins.
		 * For example, given the following document:
		 * 
		 * Foo
		 * 	Bar : Foo
		 * 
		 * Two Node objects would be created, one for the first instance
		 * of "Foo", and another for the instance of "Bar". A HyperEdge
		 * would be created between "Bar" and "Foo", and it's
		 * precedessor would refer to the Node representing the
		 * instance of "Bar".
		 */
		predecessor: Node,
		/**
		 * 
		 */
		source: Span | InfixSpan,
		/**
		 * Stores all possible success Nodes to which the predecessor
		 * Node is preemptively connected via this HyperEdge. The
		 * connection is said to be preemptive, because the connection
		 * might be ignored during polymorphic name resolution.
		 */
		successors: ReadonlyArray<Successor>);
		/** */
		addSource(source: Span | InfixSpan): void;
		/** */
		removeSource(source: Span | InfixSpan): void;
		/** */
		clearSources(): void;
		/**
		 * The set of annotation-side Spans or annotation-side InfixSpans
		 * that are responsible for the conception of this HyperEdge.
		 * 
		 * The original locations of these Spans (and InfixSpans?) are
		 * potentially scattered across many statements.
		 * 
		 * In the case when the *kind* field is *summation*, this set
		 * must be empty.
		 */
		readonly sources: ReadonlyArray<Span | InfixSpan>;
		/** */
		private readonly sourcesMutable;
		/**
		 * The textual value of an Edge represents different things
		 * depending on the Edge's *kind* property.
		 * 
		 * If *kind* is *literal*, the textual value is the given name
		 * of the type being referenced, for example "String" or
		 * "Employee".
		 * 
		 * If *kind* is *categorical*, the textual value is an alias that
		 * will later be resolved to a specific type, or set of types, for
		 * example "10cm" (presumably resolving to "Unit") or
		 * "user@email.com" (presumable resolving to "Email").
		 * 
		 * If *kind* is *summation* , the textual value is the raw
		 * literal text of the annotation found in the document. For
		 * example, if the document had the content:
		 * 
		 * Foo, Bar : foo, bar
		 * 
		 * This would result in two nodes named "Foo" and "Bar",
		 * each with their own HyperEdges whose textual values
		 * would both be: "foo, bar". In the case of a fragmented
		 * type, the last sum in document order is counted as the
		 * textual value. For example, given the following
		 * document:
		 * 
		 * T : aa, bb
		 * T : xx, yy
		 * 
		 * The "T" node would have a HyperEdge with a textual
		 * value being "xx, yy".
		 * 
		 * The *-overlay kinds have not yet been implemented.
		 */
		readonly identifier: Identifier;
		/**
		 * @returns A string representation of this HyperEdge,
		 * suitable for debugging and testing purposes.
		 */
		toString(): string;
	}
	/**
	 * 
	 */
	export class Successor {
		readonly node: Node;
		/**
		 * The the number of levels of depth in the containment
		 * hierarchy that need to be crossed in order for the containing
		 * HyperEdge to be established between the predecessor and
		 * this successor.
		 */
		readonly longitude: number;
		constructor(node: Node,
		/**
		 * The the number of levels of depth in the containment
		 * hierarchy that need to be crossed in order for the containing
		 * HyperEdge to be established between the predecessor and
		 * this successor.
		 */
		longitude: number);
		readonly stamp: VersionStamp;
	}
	/**
	 * A class that marks out the location of an infix Identifer within
	 * it's containing Infix, it's containing Span, and then it's containing
	 * Statement, Document, and Program.
	 */
	export class InfixSpan {
		readonly containingSpan: Span;
		readonly containingInfix: Infix;
		readonly boundary: Boundary<Identifier>;
		constructor(containingSpan: Span, containingInfix: Infix, boundary: Boundary<Identifier>);
		/**
		 * Gets the Statement that contains this Anchor.
		 */
		readonly statement: Statement;
		/**
		 * Gets a boolean value that indicates whether this InfixSpan
		 * is considered object-level cruft, and should therefore be
		 * ignored during type analysis.
		 */
		readonly isCruft: boolean;
	}
	/**
	 * A class that stores constructed Layers.
	 */
	export class LayerContext {
		private readonly program;
		/** */
		constructor(program: Program);
		/**
		 * Retrieves the Layer that corresponds to the specified URI.
		 * If a corresponding Layer has not already been constructed
		 * in this context, a new one is constructed and returned.
		 */
		maybeConstruct(directive: Uri): Layer | null;
		/**
		 * 
		 */
		getParallelOf(node: Node): SpecifiedParallel | null;
		/**
		 * Enumerates through the faults that have been
		 * generated within this LayerContext.
		 */
		eachFault(): IterableIterator<Fault<TFaultSource>>;
		/**
		 * Gets a map of objects that should each be converted
		 * into a type, which are indexed by a string representation
		 * of the associated type URI. Each object translates into
		 * another component specified in the type URI provided
		 * in the constructor of this object.
		 */
		readonly layers: ReadonlyMap<string, Layer | null>;
		private _layers;
		/** */
		addCruft(cruftObject: TCruft): void;
		/** */
		isCruft(cruftObject: TCruft): boolean;
		/** */
		private readonly cruft;
		/**
		 * Safety enumerates through the successors of the
		 * specified Node, carefully avoiding anything that
		 * has been marked as cruft.
		 */
		eachSuccessorOf(node: Node): IterableIterator<Successor>;
		/**
		 * @returns The successor object contained within the
		 * specified HyperEdge that has previously been resolved
		 * according to the polymorphic name resolution rules.
		 */
		pickSuccessor(hyperEdge: HyperEdge): Successor | null;
		/**
		 * Executes the polymorphic name resolution strategy,
		 * and stores the results in the specified ConstructionContext
		 * object.
		 * 
		 * The method assumes that the edges of the specified
		 * parallel, and all it's edges (nested deeply) have already
		 * been resolved.
		 */
		resolveSuccessors(parallel: SpecifiedParallel): void;
		/** */
		private readonly selectedSuccessors;
	}
	/** */
	type TCruft = Node | HyperEdge | Span | InfixSpan;
	/**
	 * A Layer is a graph of Parallel objects that represents a
	 * complete level in a URI.
	 */
	export class Layer {
		readonly container: Layer | null;
		readonly uri: Uri;
		private readonly context;
		/** */
		constructor(container: Layer | null, uri: Uri, context: LayerContext);
		/**
		 * Stores a string representation of the Layer,
		 * useful for debugging purposes.
		 */
		readonly name: string;
		/**
		 * Initializes a top-level Layer. This method is used instead
		 * of .descend() for top-level Layer construction.
		 * 
		 * @throws In the case when the specified Node instance
		 * has a non-null container (and therefore, is not top level).
		 */
		bootstrap(node: Node): void;
		/**
		 * Maps this Parallel, and all it's connected Parallels, to the type
		 * in each of their contents with the specified name.
		 */
		descend(typeName: string): Layer | null;
		/**
		 * Traverses through the entire graph of Parallels that correspond
		 * to this Layer.
		 */
		traverseLayer(): IterableIterator<LayerEdge>;
		/**
		 * Performs a traversal on all nested Parallel objects in dependency
		 * order, and yields an object that forms an edge that represents
		 * a connection between two Parallel objects.
		 */
		traverseParallelEdges(): IterableIterator<{
			from: Parallel | null;
			to: Parallel;
		}>;
		/**
		 * Performs a traversal of all nested Parallel objects in dependency
		 * order, meaning, the method does not yield Parallel objects until
		 * all its dependencies have also been yielded. The method also
		 * ensures that the same object is not yielded more than once.
		 */
		traverseParallels(): IterableIterator<Parallel>;
		/**
		 * Gets an array containing the Parallels that "seed" this
		 * Layer, meaning that they have no inbound edges.
		 */
		readonly seeds: ReadonlyArray<Parallel>;
		private readonly _seeds;
		/**
		 * Gets the origin seed Parallel of this Layer, if one exists,
		 * or null in the case when it doesn't.
		 * 
		 * The orgin seed is available when there is exactly one
		 * SpecifiedParallel that seeds the Layer. This is the case
		 * when the LayerContext has been instructed to construct
		 * a URI pointing to a specific node.
		 */
		readonly origin: SpecifiedParallel | null;
		/**
		 * Gets an array of
		 */
		readonly patterns: LayerPatterns;
		private _patterns;
	}
	/** */
	export interface LayerEdge {
		fromParallel: Parallel | null;
		fromNode: Node | null;
		toParallel: Parallel;
		toNode: Node | null;
	}
	/**
	 * Stores the information that relates to the Patterns that
	 * have been defined within a single Layer.
	 */
	export class LayerPatterns {
		private readonly layer;
		/** */
		constructor(layer: Layer);
		/**
		 * Stores the nodes that define patterns.
		 */
		readonly nodes: Node[];
		/**
		 * @returns The node that defines a pattern that is generalized
		 * by the type that corresponds to the specified set of nodes.
		 */
		find(resolvingTo: Node[]): Node | null;
		/**
		 * Attempts to feed the specified string into all of the
		 * patterns that are defined within this LayerPatterns
		 * instance.
		 * 
		 * @param filterByNodes If specified, only the pattern
		 * that is generalized by the types that correspond to
		 * the nodes contained in the array.
		 */
		tryExecute(maybeAlias: string, filterByNodes?: Node[]): Node | null;
	}
	/**
	 * A class that represents a single object in the graph
	 * of (what eventually becomes) parallel types. Parallel
	 * objects link to other Parallel objects through ParallelEdge
	 * classes, which allow consumers to scan through the
	 * parallels that relate to a specific Node.
	 * 
	 * Parallels can either be "specified" or "unspecified".
	 * This class represents the "unspecified" variant,
	 * where as the derived class "SpecifiedParallel" represents
	 * the former.
	 */
	export abstract class Parallel {
		readonly uri: Uri;
		readonly container: Parallel | null;
		protected readonly context: LayerContext;
		/**
		 * @returns A Parallel object that was previously constructed
		 * within the specified LayerContext, that matches the specified
		 * URI, or null in the case when no such Parallel exists.
		 */
		protected static getExistingParallel(uri: Uri, context: LayerContext): Parallel | null;
		/**
		 * Stores a map of all the Parallel objects that have been
		 * created for each LayerContext. The purpose of this is
		 * to prevent the two separate Parallel instances from
		 * being created that correspond to the same Node.
		 */
		protected static readonly constructedParallels: WeakMap<LayerContext, Map<string, Parallel>>;
		/** */
		protected constructor(uri: Uri, container: Parallel | null, context: LayerContext);
		readonly version: VersionStamp;
		/**
		 * Stores a string representation of this Parallel,
		 * useful for debugging purposes.
		 */
		readonly name: string;
		/**
		 * Stores an array of other Parallel instances to which
		 * this Parallel connects. For example, the following
		 * document, the Parallel object corresponding to the
		 * last "Field" would have two edges, pointing to two
		 * other Parallel instances corresponding to the "Field"
		 * declarations contained by "Left" and "Right".
		 * 
		 * Left
		 * 	Field
		 * Right
		 * 	Field
		 * Bottom : Left, Right
		 * 	Field
		 */
		readonly edges: ReadonlyArray<Parallel>;
		private readonly _edges;
		/**
		 * Adds an edge between this Parallel instance and
		 * the instance specified, if an equivalent edge does
		 * not already exist.
		 */
		maybeAddEdge(toParallel: Parallel): void;
		/**
		 * Performs a depth-first traversal of all nested Parallel instances,
		 * and yields each one (this Parallel instance is excluded).
		 */
		traverseParallels(): IterableIterator<Parallel>;
		/**
		 * Performs a depth-first traversal of all nested SpecifiedParallel
		 * instances, and yields each one (this Parallel instance is excluded).
		 */
		traverseParallelsSpecified(): IterableIterator<SpecifiedParallel>;
		/** */
		abstract descend(typeName: string): Parallel;
	}
	/**
	 * 
	 */
	export class SpecifiedParallel extends Parallel {
		/**
		 * Constructs a SpecifiedParallel object, or returns a
		 * pre-existing one that corresponds to the specified Node.
		 */
		static maybeConstruct(node: Node, container: SpecifiedParallel | null, context: LayerContext): Parallel;
		/** */
		private constructor();
		/**
		 * Stores the Node instance that corresponds to this
		 * SpecifiedParallel instance.
		 */
		readonly node: Node;
		/**
		 * Traverses through the general graph, depth-first, yielding
		 * elements that corresponds to this parallel, and returns an
		 * object that represents an edge that connects one node.
		 */
		traverseGeneralEdges(): IterableIterator<{
			from: Node;
			to: Node;
		}>;
		/**
		 * @ignore
		 * 
		 * Traverses through the general edge graph, and yields
		 * the parallel that corresponds to each discovered node,
		 * as well as the successor attached to this SpecifiedParallel
		 * instance through which the corresponding SpecifiedParallel
		 * was discovered.
		 */
		/**
		 * @ignore
		 * 
		 * Same as traverseGeneralEdgeParallels, but returns a map
		 * with the results instead of yielding individual results.
		 */
		getGeneralEdgeParallelSet(): Map<Successor, ReadonlyArray<Parallel>>;
		/**
		 * 
		 */
		/**
		 * Analyzes this SpecifiedParallel to scan for the following faults:
		 * 	CircularTypeReference
		 * 	ListIntrinsicExtendingList
		 * 	ListExtrinsicExtendingNonList
		 * 	ListDimensionalDiscrepancyFault
		 * 	IgnoredAnnotation
		 * 	UnresolvedAnnotationFault
		 * 
		 * This method may mark various parts of the document as cruft.
		 * It also computes the existence of the parallel (which is a term
		 * we're using to describe the set of annotations that have been
		 * applied to a type).
		 * 
		 * This method also assumes that it's being called only after all
		 * it's higher Parallels (i.e. Parallels that exist higher than this
		 * one in the Layer) have been analyzed.
		 * 
		 * @deprecated
		 */
		analyze(): void;
		/**
		 * Maps this Parallel instance to another Parallel instance
		 * that corresponds to a Node in this Parallel's underlying
		 * Node's contents.
		 */
		descend(typeName: string): Parallel;
		/** */
		readonly existence: ReadonlyArray<Node>;
		private _existence;
		/**
		 * Gets a string that represents the existence of this
		 * SpecifiedParallel instance, useful for debugging.
		 */
		private readonly existenceLabel;
		/** */
		readonly listDimensionality: number;
		private _listDimensionality;
		/** */
		readonly isList: boolean;
		private _isList;
		/**
		 * Gets an array that contains the faults that have been
		 * identified during the lifecycle of this construction context.
		 */
		readonly faults: ReadonlyArray<Fault<TFaultSource>>;
		private readonly _faults;
	}
	/**
	 * An "unspecified parallel" is a marker object used to
	 * maintain the connectedness of a parallel graph. For
	 * example, consider the following document:
	 * 
	 * Class1
	 * 	Property : Animal
	 * Class2 : Class1
	 * Class3 : Class2
	 * 	Property : Rabbit
	 * 
	 * In this case, the parallel graph connecting Class3's
	 * Property type through to it's apex parallel (which
	 * would be Class1/Property), would have an
	 * UnspecifiedParallel object created, and residing
	 * within the Class2 type.
	 * 
	 * UnspecifiedParallels were originally intended for
	 * use by the type representation in order to perform
	 * operations such as collecting specified and unspecified
	 * adjacent types, however, it appears now that this
	 * may not be sufficient given the current design of the
	 * system.
	 */
	export class UnspecifiedParallel extends Parallel {
		/**
		 * Constructs a UnspecifiedParallel object, or returns a
		 * pre-existing one that corresponds to the specified Node.
		 */
		static maybeConstruct(uri: Uri, container: Parallel, context: LayerContext): Parallel;
		/** */
		private constructor();
		/** */
		descend(typeName: string): UnspecifiedParallel;
	}
	/**
	 * 
	 */
	export class ParallelAnalyzer {
		/** */
		private static isList;
		/**
		 * Performs analysis
		 */
		private static canMerge;
		/** */
		private constructor();
	}
	/**
	 * A class that represents a fully constructed type within the program.
	 */
	export class Type {
		static construct(spine: Spine, program: Program): Type;
		/** */
		private static layerContextMap;
		/**
		 * 
		 */
		private constructor();
		/**
		 * Stores a text representation of the name of the type,
		 * or a serialized version of the pattern content in the
		 * case when the type is actually a pattern.
		 */
		readonly name: string;
		/**
		 * Stores the URI that specifies where this Type was
		 * found in the document.
		 */
		readonly uri: Uri;
		/**
		 * Stores a reference to the type, as it's defined in it's
		 * next most applicable
		 */
		readonly parallels: ReadonlyArray<Type>;
		/**
		 * Stores the Type that contains this Type, or null in
		 * the case when this Type is top-level.
		 */
		readonly container: Type | null;
		/**
		 * 
		 */
		readonly contents: ReadonlyArray<Type>;
		/**
		 * 
		 */
		readonly contentsIntrinsic: ReadonlyArray<Type>;
		/**
		 * Stores the array of types from which this type extends.
		 * If this Type extends from a pattern, it is included in this
		 * array.
		 */
		readonly generals: ReadonlyArray<Type>;
		/**
		 * 
		 */
		readonly metaphors: ReadonlyArray<Type>;
		/**
		 * 
		 */
		readonly specifics: ReadonlyArray<Type>;
		/**
		 * 
		 */
		readonly adjacents: ReadonlyArray<Type>;
		/**
		 * 
		 */
		readonly patterns: ReadonlyArray<Type>;
		/**
		 * Gets a map of raw string values representing the
		 * type aliases with which this type has been annotated,
		 * which are keyed by the type to which they resolve.
		 */
		readonly values: Map<any, any> | ReadonlyMap<Type, string>;
		/**
		 * Stores whether this type represents the intrinsic
		 * side of a list.
		 */
		readonly isListIntrinsic: boolean;
		/**
		 * Stores whether this type represents the extrinsic
		 * side of a list.
		 */
		readonly isListExtrinsic: boolean;
		/**
		 * Stores whether this Type instance has no annotations applied to it.
		 */
		readonly isFresh: boolean;
		/** */
		readonly isOverride: boolean;
		/** */
		readonly isIntroduction: boolean;
		/**
		 * Stores a value that indicates if this Type was directly specified
		 * in the document, or if it's existence was inferred.
		 */
		readonly isSpecified: boolean;
		/** */
		readonly isAnonymous: boolean;
		/** */
		readonly isPattern: boolean;
		/** */
		readonly isUri: boolean;
		/** */
		readonly isList: boolean;
		/**
		 * Gets a boolean value that indicates whether this Type
		 * instance was created from a previous edit frame, and
		 * should no longer be used.
		 */
		readonly isDirty: boolean;
		/**
		 * 
		 */
		readonly faults: ReadonlyArray<Fault>;
	}
}


declare const Hooks: Truth.HookTypesInstance;
declare const Program: Truth.Program;
