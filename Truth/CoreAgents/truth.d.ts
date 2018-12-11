
declare namespace Truth {

	/**
	 * A class that encapsulates CRC functionality.
	 */
	export class Crc {
		private constructor();
		/**
		 * Calculates a numeric CRC from the specified string, and returns the
		 * code as a 4-character ASCII byte string.
		 * @param seed A starting seed value, used in the case of a rolling CRC.
		 */
		static calculate(text: string, seed?: number): string;
	}
	/**
	 * A class that provides various higher-order functions
	 * across data structures.
	 */
	export abstract class HigherOrder {
		/**
		 * @returns The specified array.
		 * @throws An exception in the case when the array contains
		 * null or undefined items.
		 */
		static throwOnNullable<T>(array: Array<T>): Array<NonNullable<T>>;
		/**
		 * @returns The specified array, but with null and undefined
		 * items removed.
		 */
		static filterNullable<T>(array: Array<T>): Array<NonNullable<T>>;
		/**
		 * 
		 */
		static subtractMap<K, V>(positive: Map<K, V>, negative: Map<K, V>): void;
		/**
		 * 
		 */
		static applySymmetricDifference<K, V>(left: Map<K, V>, right: Map<K, V>): void;
		/**
		 * Prunes elements from the specified array
		 * that match the specified predicate.
		 */
		static prune<T>(array: Array<T>, predicate: (item: T, index: number) => boolean): T[];
		/**
		 * @returns A readonly copy of the specified array, set, or list.
		 */
		static copy<T>(array: ReadonlyArray<T>): ReadonlyArray<T>;
		static copy<T>(set: ReadonlySet<T>): ReadonlySet<T>;
		static copy<K, V>(map: ReadonlyMap<K, V>): ReadonlyMap<K, V>;
		/** */
		static map<T, R>(set: ReadonlySet<T>, fn: (item: T) => R): Set<R>;
		/** */
		static distinct<T>(array: Array<T>): ReadonlyArray<T>;
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
		private readonly indentCheckService;
		/**
		 * Stores an object that allows type analysis to be performed on
		 * this Program. It is reset at the beginning of every edit cycle.
		 */
		private lastProgramScanner;
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
		 * what was found at the specified location.
		 */
		readonly result: Document | Type[] | Alias | null;
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
	/** */
	export enum UriProtocol {
		none = 0,
		file = 1,
		https = 2,
		http = 3,
		internal = 4,
		unsupported = 5
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
		 * Stores the base file name specified in the URI.
		 * For example, for the URI path/to/dir/file.ext, base would
		 * be the string "file". If the URI does not contain a file
		 * name, the field is an empty string.
		 */
		readonly fileNameBase: string;
		/**
		 * Stores the extension of the file specified in the URI,
		 * without the dot character. If the URI does not contain
		 * a file name, the field is an empty string.
		 */
		readonly fileExtension: string;
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
		 * 
		 * @param uriText A string containing the URI to parse
		 * @param relativeFallback A URI that identifies the origin
		 * of the URI being parsed, used in the case when the
		 * uriText parameter is a relative path.
		 */
		static parse(uriText: string, relativeFallback?: Uri): Uri | null;
		/**
		 * Creates a new Uri from the specified input.
		 * 
		 * @param from If the parameter is omited, a unique internal
		 * URI is generated.
		 */
		static create(from?: Spine | Strand | Uri): Uri;
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
		 * Stores the base file name specified in the URI.
		 * For example, for the URI path/to/dir/file.ext, base would
		 * be the string "file". If the URI does not contain a file
		 * name, the field is an empty string.
		 */
		fileNameBase: string,
		/**
		 * Stores the extension of the file specified in the URI,
		 * without the dot character. If the URI does not contain
		 * a file name, the field is an empty string.
		 */
		fileExtension: string,
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
		equals(uri: Uri | string): boolean;
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
		patternDelimiter = "/",
		infixStart = "<",
		infixEnd = ">",
		escapeChar = "\\",
		comment = "// ",
		truthExtension = "truth",
		agentExtension = "js"
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
		check(source: Span | Statement): Fault[];
		/**
		 * Enumerates through the unrectified faults retained
		 * by this FaultService.
		 */
		each(): IterableIterator<Fault>;
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
	/** */
	export type FaultSource = Statement | Span;
	/** Base class for all faults. */
	export abstract class Fault {
		/** */
		readonly severity: FaultSeverity;
		/** A human-readable description of the fault. */
		readonly abstract message: string;
		/** An error code, useful for reference purposes, or display in a user interface. */
		readonly abstract code: number;
		/** The document object that caused the fault to be reported. */
		readonly abstract source: FaultSource;
	}
	/** Base class for faults that relate to a specific statement. */
	export abstract class StatementFault extends Fault {
		readonly source: Statement;
		constructor(source: Statement);
	}
	/** Base class for faults that relate to a specific span. */
	export abstract class SpanFault extends Fault {
		readonly source: Span;
		constructor(source: Span);
	}
	/** */
	export enum FaultSeverity {
		/** Reports an error. */
		error = 1,
		/** Reports a warning. */
		warning = 2
	}
	/** */
	export class UnresolvedResourceFault extends StatementFault {
		constructor(source: Statement, error?: Error);
		readonly code = 100;
		readonly message = "URI points to a resource that could not be resolved.";
	}
	/** */
	export class CircularResourceReferenceFault extends StatementFault {
		readonly code = 102;
		readonly message = "URI points to a resource that would cause a circular reference.";
	}
	/** */
	export class InsecureResourceReferenceFault extends StatementFault {
		readonly code = 104;
		readonly message: string;
	}
	/** */
	export class UnresolvedAnnotationFault extends SpanFault {
		readonly code = 201;
		readonly message = "Unresolved annotation.";
	}
	/** */
	export class CircularTypeReferenceFault extends SpanFault {
		readonly code = 203;
		readonly message = "Circular type reference detected.";
	}
	/** */
	export class ContractViolationFault extends StatementFault {
		readonly code = 204;
		readonly severity = FaultSeverity.warning;
		readonly message = "Overridden types must explicitly expand the type as defined in the base.";
	}
	/** */
	export class TypeCannotBeRefreshedFault extends StatementFault {
		readonly code = 206;
		readonly severity = FaultSeverity.warning;
		readonly message: string;
	}
	/** */
	export class AnonymousInListIntrinsicTypeFault extends StatementFault {
		readonly code = 300;
		readonly message = "Types contained directly by List-intrinsic types cannot be anonymous.";
	}
	/** */
	export class ListContractViolationFault extends SpanFault {
		readonly code = 301;
		readonly message = "The containing list cannot contain children of this type.";
	}
	/** */
	export class ListIntrinsicExtendingListFault extends SpanFault {
		readonly code = 303;
		readonly message = "List intrinsic types cannot extend from other lists.";
	}
	/** */
	export class ListExtrinsicExtendingNonListFault extends SpanFault {
		readonly code = 305;
		readonly message = "Lists cannot extend from non-lists.";
	}
	/** */
	export class PatternInvalidFault extends StatementFault {
		readonly code = 400;
		readonly message = "Invalid pattern.";
	}
	/** */
	export class PatternWithoutAnnotationFault extends StatementFault {
		readonly code = 402;
		readonly message = "Pattern has no annotations.";
		readonly severity = FaultSeverity.warning;
	}
	/** */
	export class PatternCanMatchEmptyFault extends StatementFault {
		readonly code = 404;
		readonly message = "Patterns must not be able to match an empty input.";
	}
	/** */
	export class PatternCanMatchWhitespaceOnlyFault extends StatementFault {
		readonly code = 420;
		readonly message: string;
	}
	/** */
	export class PatternAcceptsLeadingWhitespaceFault extends StatementFault {
		readonly code = 434;
		readonly message: string;
	}
	/** */
	export class PatternRequiresLeadingWhitespaceFault extends StatementFault {
		readonly code = 436;
		readonly message: string;
	}
	/** */
	export class PatternAcceptsTrailingWhitespaceFault extends StatementFault {
		readonly code = 438;
		readonly message: string;
	}
	/** */
	export class PatternRequiresTrailingWhitespaceFault extends StatementFault {
		readonly code = 440;
		readonly message: string;
	}
	/** */
	export class PatternNonCovariantFault extends StatementFault {
		readonly code = 406;
		readonly message = "Pattern does not match it's base types.";
	}
	/** */
	export class PatternUnknownNestedTypesFault extends SpanFault {
		readonly code = 432;
		readonly message = "The base specified on the containing pattern has no type with this name.";
	}
	/** */
	export class PatternIncompatibleFault extends StatementFault {
		readonly code = 442;
		readonly message = "This pattern is incompatible with other patterns that match the specified types.";
	}
	/** */
	export class InfixInRepeatingPatternFault extends StatementFault {
		readonly code = 408;
		readonly message = "Infixes cannot exist in a repeating context.";
	}
	/**  */
	export class InfixSelfReferentialFault extends StatementFault {
		readonly code = 410;
		readonly message = "Infixes can't be self-referential.";
	}
	/**  */
	export class InfixNonConvariantFault extends StatementFault {
		readonly code = 412;
		readonly message = "Infixes must be compatible with their bases.";
	}
	/** */
	export class InfixNotDefinedFault extends StatementFault {
		readonly code = 422;
		readonly message = "Infixes must be defined on at least one of their matched bases.";
	}
	/** */
	export class InfixMustHaveExpressionFault extends StatementFault {
		readonly code = 414;
		readonly message = "Infixes must have at least one associated pattern.";
	}
	/** */
	export class InfixRecursiveFault extends StatementFault {
		readonly code = 416;
		readonly message = "Recursive types cannot be referenced within infixes.";
	}
	/** */
	export class InfixContractViolationFault extends StatementFault {
		readonly code = 424;
		readonly message = "Infix type annotations must explicitly expand the type as defined by the base.";
	}
	/** */
	export class InfixChainingFault extends StatementFault {
		readonly code = 426;
		readonly message = "Infixes cannot be chained together.";
	}
	/** */
	export class InfixReferencingListFault extends StatementFault {
		readonly code = 428;
		readonly message = "Infixes cannot reference list types.";
	}
	/** */
	export class PortabilityInfixDuplicatedFault extends StatementFault {
		readonly code = 418;
		readonly message = "Portability infixes with compatible types cannot be specified more than once.";
	}
	/** */
	export class NominalInfixMustSubtypeFault extends StatementFault {
		readonly code = 430;
		readonly message: string;
	}
	/** */
	export class DiscrepantUnionFault extends StatementFault {
		readonly code = 450;
		readonly message: string;
	}
	/** */
	export class TabsAndSpacesFault extends StatementFault {
		readonly code = 1000;
		readonly message = "Statement indent contains a mixture of tabs and spaces.";
		readonly severity = FaultSeverity.warning;
	}
	/** */
	export class IgnoredAnnotationFault extends SpanFault {
		readonly code = 1001;
		readonly message: string;
		readonly severity = FaultSeverity.warning;
	}
	/** */
	export class IgnoredAliasFault extends SpanFault {
		readonly code = 1003;
		readonly message: string;
		readonly severity = FaultSeverity.warning;
	}
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
		getStatementIndex(statement: Statement): number;
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
		read(line: number): Statement;
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
		private toIndex;
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
	export class Statement {
		/** */
		constructor(document: Document, text: string);
		/** */
		readonly isRefresh: boolean;
		/** Gets whether the statement is a comment. */
		readonly isComment: boolean;
		/** Gets whether the statement contains no non-whitespace characters. */
		readonly isWhitespace: boolean;
		/** Gets whether the statement is a comment or whitespace. */
		readonly isNoop: boolean;
		/** Gets whether the statement has been removed from it's containing document. */
		readonly isDisposed: boolean;
		/** Stores a reference to the document that contains this statement. */
		readonly document: Document;
		/** Stores the indent level of the statement. */
		readonly indent: number;
		/** */
		private readonly declarationBounds;
		/** */
		private readonly annotationBounds;
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
		readonly textContent: string;
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
		 * Gets the set of spans in that represent all declarations
		 * and annotations in this statement, from left to right.
		 */
		readonly subjects: Span[];
		/**
		 * Gets the set of spans in that represent the
		 * declarations of this statement, from left to right.
		 */
		readonly declarations: Span[];
		private _declarations;
		/**
		 * Gets the set of spans in that represent the
		 * annotations of this statement, from left to right.
		 */
		readonly annotations: Span[];
		private _annotations;
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
		 * @returns The raw trimmed text of the complete
		 * annotation side of this statement.
		 */
		getAnnotationContent(): string;
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
	 * Stores a map of the character offsets within a Statement
	 * that represent the starting positions of the statement's
	 * Subjects.
	 */
	export type SubjectBounds = ReadonlyMap<number, Identifier | ForePattern | null>;
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
		readonly value: string;
		/** */
		readonly isList: boolean;
		/**
		 * Stores a parsed URI object, in the case the subject is
		 * formatted as a URI. In other cases, the field is null.
		 */
		readonly uri: Uri | null;
		/** Calculates whether this Subject is structurally equal to another. */
		equals(other: Identifier | string | null): boolean;
		/** Converts this Subject to it's string representation. */
		toString(): string;
	}
	/**
	 * A class that represents a position in a statement.
	 */
	export class Span {
		/**
		 * Gets an array of statements that represent the statement
		 * containment progression, all the way back to the containing
		 * document.
		 */
		readonly ancestry: ReadonlyArray<Statement>;
		private _ancestry;
		/** Stores a reference to the Statement that contains this Span. */
		readonly statement: Statement;
		/**
		 * Stores either a reference to the instance of the Subject that this
		 * Span represents, or a unique string in the case when this is
		 * a "Thin Span" that represents an Invisible Subject.
		 */
		readonly subject: Subject;
		/**
		 * The offset in the statement that marks the start of the
		 * region being pointed to.
		 */
		readonly offsetStart: number;
		/**
		 * The offset in the statement that marks the end of the
		 * region being pointed to.
		 */
		readonly offsetEnd: number;
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
	}
	/**
	 * A class that manages an array of Span objects that
	 * represent a specific spine of declarations, starting at
	 * a document, passing through a series of spans,
	 * and ending at a tip span.
	 */
	export class Spine {
		/** */
		constructor(nodes: Span[]);
		/** Stores the last span in the array of segments. */
		readonly tip: Span;
		/** */
		readonly statement: Statement;
		/** Gets a reference to the document that sits at the top of the spine. */
		readonly document: Document;
		/**  */
		readonly nodes: ReadonlyArray<Span>;
	}
	/** */
	export type Subject = Identifier | ForePattern | string;
	/** */
	export class SubjectParser {
		/** */
		static invoke(text: string): Subject;
		private constructor();
	}
	/**
	 * A class that stores an unparsed Pattern,
	 * contained directly by a Statement.
	 */
	export class ForePattern {
		/**
		 * Parses a pattern from an internally serialized
		 * representation of it.
		 */
		static parse(serialized: string): ForePattern | null;
		/**
		 * Gets whether the specified internall serialized
		 * regular expression can be parsed through the
		 * static .parse() method on this class.
		 */
		static canParse(serialized: string): boolean;
		/** */
		readonly content: string;
		/** */
		readonly chunks: ForePatternChunks;
		/** */
		readonly crc: string;
		/**
		 * Stores whether the pattern literal specifies the
		 * coexistence (trailing comma) flag, which allows
		 * aliases to exist within the annotation set of
		 * other non-aliases.
		 */
		readonly hasCoexistenceFlag: boolean;
		/**
		 * Stores the inner regular expression of this pattern,
		 * in the case when a valid RegExp object could be
		 * created from the input passed to the constructor
		 * of this object. In the case when the input could not
		 * be converted into a usable RegExp object, the field
		 * stores null.
		 */
		private readonly innerRegExp;
		/**
		 * @returns A boolean value that indicates whether
		 * the specified input string matches the regular expression
		 * stored inside this pattern.
		 */
		test(input: string): boolean;
		/** */
		toString(format?: PatternSerializationFormat): string;
	}
	/**
	 * Identifies the various textual representations of a pattern.
	 */
	export const enum PatternSerializationFormat {
		/** Refers to the inner content of the pattern. */
		content = 1,
		/** Refers to the pattern literal as it appears in the document. */
		literal = 2,
		/**
		 * Refers to the pattern literal's system serialization format.
		 * The internal serialization format is as follows:
		 * 
		 * 1 byte for the bell (for easy identification)
		 * 1 or more bytes for the regular expression content
		 * 1 byte for the flags
		 * (crcLength) bytes for the computed CRC of the associated annotations.
		 */
		system = 4
	}
	/**
	 * 
	 */
	export enum PatternFlags {
		/** Indicates that no flags have been declared on the pattern. */
		none = 0,
		/** Indicates that the coexistence flag has been declared on the pattern. */
		coexistence = 1
	}
	/**  */
	export class ForePatternParser {
		/**
		 * Parses the specified pattern string (without delimiters
		 * or flags), into an array of strings and infixes.
		 */
		static parse(content: string): ForePatternChunks;
		/** */
		private constructor();
	}
	/**
	 * 
	 */
	export class Infix {
		/**
		 * Stores an array of strings that represent the
		 * terms located before the Joint operator.
		 */
		readonly lhsTerms: ReadonlyArray<string>;
		/**
		 * Stores an array of strings that represent the
		 * terms located after the Joint operator.
		 */
		readonly rhsTerms: ReadonlyArray<string>;
		/**
		 * Stores whether the <<Double>> angle bracket
		 * syntax was used to only match named types,
		 * rather than aliases.
		 */
		readonly forcesNominal: boolean;
		/**
		 * Stores whether the </Pattern/> syntax was
		 * used to embed an external pattern.
		 */
		readonly requestsPattern: boolean;
		constructor(
		/**
		 * Stores an array of strings that represent the
		 * terms located before the Joint operator.
		 */
		lhsTerms?: ReadonlyArray<string>,
		/**
		 * Stores an array of strings that represent the
		 * terms located after the Joint operator.
		 */
		rhsTerms?: ReadonlyArray<string>,
		/**
		 * Stores whether the <<Double>> angle bracket
		 * syntax was used to only match named types,
		 * rather than aliases.
		 */
		forcesNominal?: boolean,
		/**
		 * Stores whether the </Pattern/> syntax was
		 * used to embed an external pattern.
		 */
		requestsPattern?: boolean);
		/** */
		readonly kind: InfixKind;
	}
	/** */
	export enum InfixKind {
		faulty = 0,
		pattern = 1,
		portability = 2,
		population = 3
	}
	/** */
	export type ForePatternChunks = (Infix | string)[];
	/**
	 * 
	 */
	export class Fragmenter {
		private readonly program;
		/** */
		constructor(program: Program);
		/**
		 * Updates contents of the Fragmenter to include the
		 * contents of the specified document.
		 */
		private handleDocumentAdded;
		/**
		 * Updates contents of the Fragmenter to exclude the
		 * contents of the specified document.
		 */
		private handleDocumentRemoved;
		/**
		 * Performs a query on the Fragmenter.
		 * @returns A Strand, or null in the case
		 * when the URI specified doesn't map to a populated
		 * location in the document.
		 */
		query(uri: Uri): Strand | null;
		/** */
		queryContents(uri: Uri): Strand[];
		/** */
		private queryInner;
		/**
		 * Translates a declaration-side atom, by collecting it's
		 * corresponding annotation-side atoms and packaging
		 * it into a Molecule object.
		 */
		private translateAtomToMolecule;
		/**
		 * Stores the declarations of the specified statement, and
		 * all of the declarations in it's descendant statements in
		 * the internal caches.
		 * 
		 * The statement object specified in the storeTarget parameter
		 * is expected to not be stored in the internal caches.
		 */
		private storeStatement;
		/**
		 * Removes the fragments associated with the specified span
		 * from all internal caches.
		 */
		private unstoreSpan;
		/** */
		private cacheFragment;
		/** */
		private uncacheFragment;
		/**
		 * A map used to quickly find the fragments associated with a span.
		 * A separate fragment will exist in the array value for every spine
		 * ending at the Span key. Naturally, Spans that are directly
		 * contained by a Document will only ever have one item in it's
		 * associated fragment array.
		 * 
		 * Note that the fragments in the array value may be parented by
		 * different apexes (meaning Spans or Documents).
		 * 
		 * Although provisions are taken to ensure entries in this map are
		 * all explicitly released, a WeakMap is used in this case instead of
		 * a traditional Map as a defense measure against unforeseen bugs
		 * resulting in memory leaks.
		 */
		private readonly fragmentFinder;
		/**
		 * A map of the Document objects loaded into the system,
		 * and the top-level fragment objects to which they map.
		 */
		private readonly documents;
		/**
		 * Converts the contents of the Fragmenter to a string
		 * representation, useful for testing purposes.
		 */
		toString(): string;
	}
	/**
	 * A Strand is essentially an inspectable version of a URI's type
	 * path. More specifically, it is a type that describes a series of
	 * objects of the abstract Subject type, that aligns with the
	 * components of a type URI (the ordering of the entry in the
	 * map is relevant).
	 * 
	 * Each Subject key is related to a set of Span objects that
	 * represent the points of the document that where discovered
	 * in relation to each component of the type URI.
	 */
	export class Strand {
		readonly molecules: ReadonlyArray<Molecule>;
		/** */
		constructor(molecules: ReadonlyArray<Molecule>);
		/**
		 * Creates a string representation of this Strand that
		 * allows it's contents to be compared with other
		 * Strand objects with equivalent contents. An example
		 * of the string format is as follows:
		 * 
		 * 	file://path/to/document.truth
		 * LocalAtom1
		 * 	ReferencedAtom1
		 * 	ReferencedAtom2
		 * LocalAtom2
		 * 	ReferencedAtom3
		 * 	ReferencedAtom4
		 * 
		 * Future work may include determining whether returning
		 * this string as an MD5 hash will result in a reduction of
		 * memory usage.
		 */
		toString(): string;
		/**
		 * Clones this Strand into a new object, but with the
		 * specified number of molecules trimmed from the end.
		 */
		retract(depth: number): Strand;
	}
	/**
	 * 
	 */
	export class Molecule {
		readonly localAtom: Atom;
		readonly referencedAtoms: ReadonlyArray<Atom>;
		constructor(localAtom: Atom, referencedAtoms: ReadonlyArray<Atom>);
	}
	/**
	 * 
	 */
	export class Atom {
		readonly subject: Subject;
		readonly spans: ReadonlyArray<Span>;
		constructor(subject: Subject, spans: ReadonlyArray<Span>);
	}
	/**
	 * 
	 */
	export class Graph {
		private readonly program;
		/**
		 * Reads a root Node with the specified
		 * name out of the specified document.
		 */
		read(doc: Document, name: string): Node | null;
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
		private readonly nodes;
		/**
		 * Stores a GraphTransaction instance in the case when
		 * the program is under
		 */
		private activeTransactions;
	}
	/**
	 * A class that represents a single Node contained within
	 * the Program's Graph. Nodes are long-lived objects that
	 * persist between edit frames, and maintain referential
	 * integrity.
	 * 
	 * Nodes are connected in a graph not by edges, but by
	 * "Fans". A Fan is similar to a directed edge in that it has
	 * a single origin, but differs in that it has multiple destinations.
	 * It is necessary for Nodes to be connected to each other
	 * in this way, in order for further phases in the pipeline
	 * to perform type resolution.
	 */
	export class Node {
		/** */
		private static rootNodes;
		/** */
		private addRootNode;
		/** */
		private removeRootNode;
		/** */
		private getRootNodes;
		/** */
		private deleteRootNode;
		/**
		 * Removes this Node, and all its contents from the graph.
		 */
		dispose(): void;
		/**
		 * Removes the specified Fan from this Node's
		 * set of outbounds.
		 * 
		 * @throws In the case when the specified Fan is
		 * not owned by this Node.
		 */
		disposeFan(fan: Fan): void;
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
		 * Stores the set of declaration-side Span
		 * objects that compose this Node.
		 */
		readonly spans: Set<Span>;
		/** */
		readonly statements: Set<Statement>;
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
		 * Gets an immutable set of Fans from adjacent or
		 * contained Nodes that reference this Node.
		 * 
		 * (The ordering of outbounds isn't important, as
		 * they have no physical representation in the
		 * document, which is why they're stored in a Set
		 * rather than an array.)
		 */
		readonly inbounds: ReadonlySet<Fan>;
		private readonly _inbounds;
		/**
		 * Gets an array of Fans that connect this Node to
		 * others, being either adjacents, or Nodes that
		 * exists somewhere in the containment hierarchy.
		 */
		readonly outbounds: ReadonlyArray<Fan>;
		private readonly _outbounds;
		/**
		 * Enumerates upwards through the containment
		 * hierarchy of the Nodes present in this Node's
		 * containing document, yielding the adjacents at
		 * every level, and then continues through to the
		 * root level adjacents of each of the document's
		 * dependencies.
		 */
		private enumerateContainment;
		/** */
		removeFanSpan(span: Span): void;
	}
	type NodeMap = ReadonlyMap<string, Node>;
	/**
	 * A Fan connects origin Nodes to target Nodes, for a
	 * specific reason, identified by the "rationale" field.
	 * 
	 * Each Fan object is always "owned" by one single Node
	 * object, however, Nodes have a reference to the Fans
	 * that are targeting them through their Node.inbounds
	 * field.
	 */
	export class Fan {
		/**
		 * Stores a string representation of the subjects
		 * contained by the spans that this Fan represents.
		 * In the case when the FanRationale is a sum, the
		 * field instead stores the raw annotation-side
		 * content as it appears in the document.
		 */
		readonly name: string;
		/** */
		readonly origin: Node;
		/**
		 * Gets an array containing the Nodes to which the origin is
		 * connected. If the array is empty, the Fan is technically
		 */
		readonly targets: ReadonlyArray<Node>;
		private readonly _targets;
		/** */
		readonly rationale: FanRationale;
		private _rationale;
		/**
		 * Gets an array of annotation-side Span objects that compose
		 * the Fan. In the case when the "rationale" of this Fan is "patternSum",
		 * this array is composed of a complete set of spans on the annotation
		 * side of a single statement. In other cases, the array is composed of
		 * Spans potentially scattered throughout the document across many
		 * statements.
		 */
		readonly spans: Set<Span>;
	}
	/**
	 * An enumeration that describes why a Fan was
	 * created to connect a Node to a series of others.
	 */
	export enum FanRationale {
		/**
		 * Indicates that the Fan was created, but doesn't
		 * actually connect anything, due to an inability
		 * to resolve an annotation to a meaningful place
		 * in the document.
		 */
		orphan = 0,
		/**
		 * Indicates that the Fan was created to connect
		 * an origin Node to other Nodes through a type
		 * relationship (meaning an exact name match).
		 */
		type = 1,
		/**
		 * Indicates that the Fan was created to connect
		 * an origin Node to other Nodes through a pattern
		 * with the coexistence flag set.
		 */
		pattern = 2,
		/**
		 * Indicates that the Fan was created to connect
		 * and origin Node to other Nodes through a "sum"
		 * pattern (a pattern without the coexistence flag set).
		 * 
		 * A Sum is a serialized representation of a series of annotations
		 * that are all present within a single statement. It is used to handle
		 * the case that given a statement in the form "A : B, C, D", the
		 * annotation "B, C, D" may actually be matchable by a pattern
		 * without a coexistence flag. Sums allow these potential matches
		 * to be processed more easily.
		 */
		sum = 3
	}
	/**
	 * 
	 */
	export class Pattern {
		/** */
		constructor();
		/** */
		readonly compiledExpression: RegExp;
		/** */
		readonly ast: Object;
		/**
		 * Stores a boolean value indicating whether the pattern
		 * can match individual blocks of content on the annotation
		 * side of a statement (separated by commas), or whether
		 * the pattern must match all annotation-side content in a
		 * statement.
		 */
		readonly canCoexist = false;
		/** Necessary? */
		readonly canMatchEmpty = false;
		/** Necessary? */
		readonly canMatchWhitespace = false;
	}
	/**
	 * 
	 */
	export enum PatternComparisonResult {
		/** */
		subset = 0,
		/** */
		superset = 1,
		/** */
		equal = 2,
		/** */
		unequal = 3
	}
	/**
	 * 
	 */
	export abstract class Alias {
		/** */
		abstract readonly span: Span;
		/**
		 * Stores an array of Patterns that match this alias.
		 */
		abstract readonly recognizers: ReadonlyArray<Pattern>;
	}
	/**
	 * 
	 */
	export class Waterfall {
		/** */
		static create(directiveUri: Uri, program: Program): Waterfall | null;
		/** */
		readonly origin: Turn;
		/** */
		readonly directive: ReadonlyArray<Turn>;
		/**
		 * @returns The number of terraces in the underlying
		 * waterfall. Used to quickly determine if a URI was directed
		 * at an unpopulated location in a document.
		 */
		readonly totalHeight: number;
		/**
		 * Stores an array of faults that were generated before the
		 * Waterfall was constructed.
		 */
		readonly constructionFaults: ReadonlyArray<Fault>;
		/**
		 * Reads a full terrace from the waterfall, from the specified
		 * URI.
		 * 
		 * @throws If the URI has typePath that is not a strict subset
		 * of this Waterfall's directive.
		 */
		readTerrace(uri: Uri): ReadonlyArray<Turn | undefined>;
		/** */
		readFloorTerrace(): never[];
		/** */
		walk(): WaterfallWalker;
	}
	/**
	 * A class that acts as a cursor for walking around a Waterfall
	 * instance. Note that the WaterfallWalker does, indeed, walk
	 * on water.
	 */
	export class WaterfallWalker {
		private readonly waterfall;
		constructor(waterfall: Waterfall);
		/** */
		plunge(): Turn | null;
		/** */
		canPlunge(): boolean;
		/** */
		flow(): Turn | null;
		/** */
		canFlow(): boolean;
	}
	/**
	 * 
	 */
	interface IMutableTurn {
		/**
		 * Indicates whether this Turn terminates the flow of it's ledge.
		 */
		terminal: boolean;
		/**
		 * Stores the array of Node objects that correspond to this turn.
		 */
		nodes: Node[];
	}
	export type Turn = Freeze<IMutableTurn>;
	/**
	 * A class that represents a fully constructed type within the program.
	 */
	export class Type {
		static construct(spine: Spine, program: Program): Type;
		/** */
		constructor();
		/**
		 * 
		 */
		constructAdjacents(): never[];
		/**
		 * 
		 */
		constructContents(): Type[];
		/**
		 * Attempts to match the specified string against the
		 * Patterns that resolve to this type. If this type is a pattern,
		 * the input is tested against the inner regular expression.
		 */
		tryMatch(input: string): boolean;
		/**
		 * Stores the Waterfall diagram used to construct this type.
		 */
		private readonly waterfall;
		/**
		 * Stores a text representation of the name of the type,
		 * or a serialized version of the pattern content in the
		 * case when the type is actually a pattern.
		 */
		readonly name: string;
		/** */
		readonly container: Type;
		/**
		 * Stores the array of types from which this type extends.
		 * If this Type extends from a pattern, it is included in this
		 * array.
		 */
		readonly bases: ReadonlyArray<Type>;
		/**
		 * Stores the array of annotations attached to this Type
		 * that were resolved as type aliases through a Pattern.
		 */
		readonly aliases: ReadonlyArray<Alias>;
		/**
		 * Stores a reference to the intrinsic side of the list when
		 * this type represents the extrinsic side of a list, or vice
		 * versa.
		 * Stores null in the case when the type is not a list.
		 */
		readonly listPortal: Type | null;
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
		 * Stores whether the bases explicitly assigned to
		 * this type are compliant with the requirements
		 * imposed on this type from it's inheritance source.
		 */
		readonly isContractuallyCompliant: boolean;
		/** */
		readonly isFresh: boolean;
		/** */
		readonly isOverride: boolean;
		/** */
		readonly isAnonymous: boolean;
		/** */
		readonly inCircularGroup: boolean;
		/** */
		readonly isPattern: boolean;
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
		 * @param seed A starting seed value, used in the case of a rolling CRC.
		 */
		static calculate(text: string, seed?: number): string;
	}
	/**
	 * A class that provides various higher-order functions
	 * across data structures.
	 */
	export abstract class HigherOrder {
		/**
		 * @returns The specified array.
		 * @throws An exception in the case when the array contains
		 * null or undefined items.
		 */
		static throwOnNullable<T>(array: Array<T>): Array<NonNullable<T>>;
		/**
		 * @returns The specified array, but with null and undefined
		 * items removed.
		 */
		static filterNullable<T>(array: Array<T>): Array<NonNullable<T>>;
		/**
		 * 
		 */
		static subtractMap<K, V>(positive: Map<K, V>, negative: Map<K, V>): void;
		/**
		 * 
		 */
		static applySymmetricDifference<K, V>(left: Map<K, V>, right: Map<K, V>): void;
		/**
		 * Prunes elements from the specified array
		 * that match the specified predicate.
		 */
		static prune<T>(array: Array<T>, predicate: (item: T, index: number) => boolean): T[];
		/**
		 * @returns A readonly copy of the specified array, set, or list.
		 */
		static copy<T>(array: ReadonlyArray<T>): ReadonlyArray<T>;
		static copy<T>(set: ReadonlySet<T>): ReadonlySet<T>;
		static copy<K, V>(map: ReadonlyMap<K, V>): ReadonlyMap<K, V>;
		/** */
		static map<T, R>(set: ReadonlySet<T>, fn: (item: T) => R): Set<R>;
		/** */
		static distinct<T>(array: Array<T>): ReadonlyArray<T>;
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
		private readonly indentCheckService;
		/**
		 * Stores an object that allows type analysis to be performed on
		 * this Program. It is reset at the beginning of every edit cycle.
		 */
		private lastProgramScanner;
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
		 * what was found at the specified location.
		 */
		readonly result: Document | Type[] | Alias | null;
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
	/** */
	export enum UriProtocol {
		none = 0,
		file = 1,
		https = 2,
		http = 3,
		internal = 4,
		unsupported = 5
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
		 * Stores the base file name specified in the URI.
		 * For example, for the URI path/to/dir/file.ext, base would
		 * be the string "file". If the URI does not contain a file
		 * name, the field is an empty string.
		 */
		readonly fileNameBase: string;
		/**
		 * Stores the extension of the file specified in the URI,
		 * without the dot character. If the URI does not contain
		 * a file name, the field is an empty string.
		 */
		readonly fileExtension: string;
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
		 * 
		 * @param uriText A string containing the URI to parse
		 * @param relativeFallback A URI that identifies the origin
		 * of the URI being parsed, used in the case when the
		 * uriText parameter is a relative path.
		 */
		static parse(uriText: string, relativeFallback?: Uri): Uri | null;
		/**
		 * Creates a new Uri from the specified input.
		 * 
		 * @param from If the parameter is omited, a unique internal
		 * URI is generated.
		 */
		static create(from?: Spine | Strand | Uri): Uri;
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
		 * Stores the base file name specified in the URI.
		 * For example, for the URI path/to/dir/file.ext, base would
		 * be the string "file". If the URI does not contain a file
		 * name, the field is an empty string.
		 */
		fileNameBase: string,
		/**
		 * Stores the extension of the file specified in the URI,
		 * without the dot character. If the URI does not contain
		 * a file name, the field is an empty string.
		 */
		fileExtension: string,
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
		equals(uri: Uri | string): boolean;
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
		patternDelimiter = "/",
		infixStart = "<",
		infixEnd = ">",
		escapeChar = "\\",
		comment = "// ",
		truthExtension = "truth",
		agentExtension = "js"
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
		check(source: Span | Statement): Fault[];
		/**
		 * Enumerates through the unrectified faults retained
		 * by this FaultService.
		 */
		each(): IterableIterator<Fault>;
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
	/** */
	export type FaultSource = Statement | Span;
	/** Base class for all faults. */
	export abstract class Fault {
		/** */
		readonly severity: FaultSeverity;
		/** A human-readable description of the fault. */
		readonly abstract message: string;
		/** An error code, useful for reference purposes, or display in a user interface. */
		readonly abstract code: number;
		/** The document object that caused the fault to be reported. */
		readonly abstract source: FaultSource;
	}
	/** Base class for faults that relate to a specific statement. */
	export abstract class StatementFault extends Fault {
		readonly source: Statement;
		constructor(source: Statement);
	}
	/** Base class for faults that relate to a specific span. */
	export abstract class SpanFault extends Fault {
		readonly source: Span;
		constructor(source: Span);
	}
	/** */
	export enum FaultSeverity {
		/** Reports an error. */
		error = 1,
		/** Reports a warning. */
		warning = 2
	}
	/** */
	export class UnresolvedResourceFault extends StatementFault {
		constructor(source: Statement, error?: Error);
		readonly code = 100;
		readonly message = "URI points to a resource that could not be resolved.";
	}
	/** */
	export class CircularResourceReferenceFault extends StatementFault {
		readonly code = 102;
		readonly message = "URI points to a resource that would cause a circular reference.";
	}
	/** */
	export class InsecureResourceReferenceFault extends StatementFault {
		readonly code = 104;
		readonly message: string;
	}
	/** */
	export class UnresolvedAnnotationFault extends SpanFault {
		readonly code = 201;
		readonly message = "Unresolved annotation.";
	}
	/** */
	export class CircularTypeReferenceFault extends SpanFault {
		readonly code = 203;
		readonly message = "Circular type reference detected.";
	}
	/** */
	export class ContractViolationFault extends StatementFault {
		readonly code = 204;
		readonly severity = FaultSeverity.warning;
		readonly message = "Overridden types must explicitly expand the type as defined in the base.";
	}
	/** */
	export class TypeCannotBeRefreshedFault extends StatementFault {
		readonly code = 206;
		readonly severity = FaultSeverity.warning;
		readonly message: string;
	}
	/** */
	export class AnonymousInListIntrinsicTypeFault extends StatementFault {
		readonly code = 300;
		readonly message = "Types contained directly by List-intrinsic types cannot be anonymous.";
	}
	/** */
	export class ListContractViolationFault extends SpanFault {
		readonly code = 301;
		readonly message = "The containing list cannot contain children of this type.";
	}
	/** */
	export class ListIntrinsicExtendingListFault extends SpanFault {
		readonly code = 303;
		readonly message = "List intrinsic types cannot extend from other lists.";
	}
	/** */
	export class ListExtrinsicExtendingNonListFault extends SpanFault {
		readonly code = 305;
		readonly message = "Lists cannot extend from non-lists.";
	}
	/** */
	export class PatternInvalidFault extends StatementFault {
		readonly code = 400;
		readonly message = "Invalid pattern.";
	}
	/** */
	export class PatternWithoutAnnotationFault extends StatementFault {
		readonly code = 402;
		readonly message = "Pattern has no annotations.";
		readonly severity = FaultSeverity.warning;
	}
	/** */
	export class PatternCanMatchEmptyFault extends StatementFault {
		readonly code = 404;
		readonly message = "Patterns must not be able to match an empty input.";
	}
	/** */
	export class PatternCanMatchWhitespaceOnlyFault extends StatementFault {
		readonly code = 420;
		readonly message: string;
	}
	/** */
	export class PatternAcceptsLeadingWhitespaceFault extends StatementFault {
		readonly code = 434;
		readonly message: string;
	}
	/** */
	export class PatternRequiresLeadingWhitespaceFault extends StatementFault {
		readonly code = 436;
		readonly message: string;
	}
	/** */
	export class PatternAcceptsTrailingWhitespaceFault extends StatementFault {
		readonly code = 438;
		readonly message: string;
	}
	/** */
	export class PatternRequiresTrailingWhitespaceFault extends StatementFault {
		readonly code = 440;
		readonly message: string;
	}
	/** */
	export class PatternNonCovariantFault extends StatementFault {
		readonly code = 406;
		readonly message = "Pattern does not match it's base types.";
	}
	/** */
	export class PatternUnknownNestedTypesFault extends SpanFault {
		readonly code = 432;
		readonly message = "The base specified on the containing pattern has no type with this name.";
	}
	/** */
	export class PatternIncompatibleFault extends StatementFault {
		readonly code = 442;
		readonly message = "This pattern is incompatible with other patterns that match the specified types.";
	}
	/** */
	export class InfixInRepeatingPatternFault extends StatementFault {
		readonly code = 408;
		readonly message = "Infixes cannot exist in a repeating context.";
	}
	/**  */
	export class InfixSelfReferentialFault extends StatementFault {
		readonly code = 410;
		readonly message = "Infixes can't be self-referential.";
	}
	/**  */
	export class InfixNonConvariantFault extends StatementFault {
		readonly code = 412;
		readonly message = "Infixes must be compatible with their bases.";
	}
	/** */
	export class InfixNotDefinedFault extends StatementFault {
		readonly code = 422;
		readonly message = "Infixes must be defined on at least one of their matched bases.";
	}
	/** */
	export class InfixMustHaveExpressionFault extends StatementFault {
		readonly code = 414;
		readonly message = "Infixes must have at least one associated pattern.";
	}
	/** */
	export class InfixRecursiveFault extends StatementFault {
		readonly code = 416;
		readonly message = "Recursive types cannot be referenced within infixes.";
	}
	/** */
	export class InfixContractViolationFault extends StatementFault {
		readonly code = 424;
		readonly message = "Infix type annotations must explicitly expand the type as defined by the base.";
	}
	/** */
	export class InfixChainingFault extends StatementFault {
		readonly code = 426;
		readonly message = "Infixes cannot be chained together.";
	}
	/** */
	export class InfixReferencingListFault extends StatementFault {
		readonly code = 428;
		readonly message = "Infixes cannot reference list types.";
	}
	/** */
	export class PortabilityInfixDuplicatedFault extends StatementFault {
		readonly code = 418;
		readonly message = "Portability infixes with compatible types cannot be specified more than once.";
	}
	/** */
	export class NominalInfixMustSubtypeFault extends StatementFault {
		readonly code = 430;
		readonly message: string;
	}
	/** */
	export class DiscrepantUnionFault extends StatementFault {
		readonly code = 450;
		readonly message: string;
	}
	/** */
	export class TabsAndSpacesFault extends StatementFault {
		readonly code = 1000;
		readonly message = "Statement indent contains a mixture of tabs and spaces.";
		readonly severity = FaultSeverity.warning;
	}
	/** */
	export class IgnoredAnnotationFault extends SpanFault {
		readonly code = 1001;
		readonly message: string;
		readonly severity = FaultSeverity.warning;
	}
	/** */
	export class IgnoredAliasFault extends SpanFault {
		readonly code = 1003;
		readonly message: string;
		readonly severity = FaultSeverity.warning;
	}
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
		getStatementIndex(statement: Statement): number;
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
		read(line: number): Statement;
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
		private toIndex;
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
	export class Statement {
		/** */
		constructor(document: Document, text: string);
		/** */
		readonly isRefresh: boolean;
		/** Gets whether the statement is a comment. */
		readonly isComment: boolean;
		/** Gets whether the statement contains no non-whitespace characters. */
		readonly isWhitespace: boolean;
		/** Gets whether the statement is a comment or whitespace. */
		readonly isNoop: boolean;
		/** Gets whether the statement has been removed from it's containing document. */
		readonly isDisposed: boolean;
		/** Stores a reference to the document that contains this statement. */
		readonly document: Document;
		/** Stores the indent level of the statement. */
		readonly indent: number;
		/** */
		private readonly declarationBounds;
		/** */
		private readonly annotationBounds;
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
		readonly textContent: string;
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
		 * Gets the set of spans in that represent all declarations
		 * and annotations in this statement, from left to right.
		 */
		readonly subjects: Span[];
		/**
		 * Gets the set of spans in that represent the
		 * declarations of this statement, from left to right.
		 */
		readonly declarations: Span[];
		private _declarations;
		/**
		 * Gets the set of spans in that represent the
		 * annotations of this statement, from left to right.
		 */
		readonly annotations: Span[];
		private _annotations;
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
		 * @returns The raw trimmed text of the complete
		 * annotation side of this statement.
		 */
		getAnnotationContent(): string;
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
	 * Stores a map of the character offsets within a Statement
	 * that represent the starting positions of the statement's
	 * Subjects.
	 */
	export type SubjectBounds = ReadonlyMap<number, Identifier | ForePattern | null>;
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
		readonly value: string;
		/** */
		readonly isList: boolean;
		/**
		 * Stores a parsed URI object, in the case the subject is
		 * formatted as a URI. In other cases, the field is null.
		 */
		readonly uri: Uri | null;
		/** Calculates whether this Subject is structurally equal to another. */
		equals(other: Identifier | string | null): boolean;
		/** Converts this Subject to it's string representation. */
		toString(): string;
	}
	/**
	 * A class that represents a position in a statement.
	 */
	export class Span {
		/**
		 * Gets an array of statements that represent the statement
		 * containment progression, all the way back to the containing
		 * document.
		 */
		readonly ancestry: ReadonlyArray<Statement>;
		private _ancestry;
		/** Stores a reference to the Statement that contains this Span. */
		readonly statement: Statement;
		/**
		 * Stores either a reference to the instance of the Subject that this
		 * Span represents, or a unique string in the case when this is
		 * a "Thin Span" that represents an Invisible Subject.
		 */
		readonly subject: Subject;
		/**
		 * The offset in the statement that marks the start of the
		 * region being pointed to.
		 */
		readonly offsetStart: number;
		/**
		 * The offset in the statement that marks the end of the
		 * region being pointed to.
		 */
		readonly offsetEnd: number;
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
	}
	/**
	 * A class that manages an array of Span objects that
	 * represent a specific spine of declarations, starting at
	 * a document, passing through a series of spans,
	 * and ending at a tip span.
	 */
	export class Spine {
		/** */
		constructor(nodes: Span[]);
		/** Stores the last span in the array of segments. */
		readonly tip: Span;
		/** */
		readonly statement: Statement;
		/** Gets a reference to the document that sits at the top of the spine. */
		readonly document: Document;
		/**  */
		readonly nodes: ReadonlyArray<Span>;
	}
	/** */
	export type Subject = Identifier | ForePattern | string;
	/** */
	export class SubjectParser {
		/** */
		static invoke(text: string): Subject;
		private constructor();
	}
	/**
	 * A class that stores an unparsed Pattern,
	 * contained directly by a Statement.
	 */
	export class ForePattern {
		/**
		 * Parses a pattern from an internally serialized
		 * representation of it.
		 */
		static parse(serialized: string): ForePattern | null;
		/**
		 * Gets whether the specified internall serialized
		 * regular expression can be parsed through the
		 * static .parse() method on this class.
		 */
		static canParse(serialized: string): boolean;
		/** */
		readonly content: string;
		/** */
		readonly chunks: ForePatternChunks;
		/** */
		readonly crc: string;
		/**
		 * Stores whether the pattern literal specifies the
		 * coexistence (trailing comma) flag, which allows
		 * aliases to exist within the annotation set of
		 * other non-aliases.
		 */
		readonly hasCoexistenceFlag: boolean;
		/**
		 * Stores the inner regular expression of this pattern,
		 * in the case when a valid RegExp object could be
		 * created from the input passed to the constructor
		 * of this object. In the case when the input could not
		 * be converted into a usable RegExp object, the field
		 * stores null.
		 */
		private readonly innerRegExp;
		/**
		 * @returns A boolean value that indicates whether
		 * the specified input string matches the regular expression
		 * stored inside this pattern.
		 */
		test(input: string): boolean;
		/** */
		toString(format?: PatternSerializationFormat): string;
	}
	/**
	 * Identifies the various textual representations of a pattern.
	 */
	export const enum PatternSerializationFormat {
		/** Refers to the inner content of the pattern. */
		content = 1,
		/** Refers to the pattern literal as it appears in the document. */
		literal = 2,
		/**
		 * Refers to the pattern literal's system serialization format.
		 * The internal serialization format is as follows:
		 * 
		 * 1 byte for the bell (for easy identification)
		 * 1 or more bytes for the regular expression content
		 * 1 byte for the flags
		 * (crcLength) bytes for the computed CRC of the associated annotations.
		 */
		system = 4
	}
	/**
	 * 
	 */
	export enum PatternFlags {
		/** Indicates that no flags have been declared on the pattern. */
		none = 0,
		/** Indicates that the coexistence flag has been declared on the pattern. */
		coexistence = 1
	}
	/**  */
	export class ForePatternParser {
		/**
		 * Parses the specified pattern string (without delimiters
		 * or flags), into an array of strings and infixes.
		 */
		static parse(content: string): ForePatternChunks;
		/** */
		private constructor();
	}
	/**
	 * 
	 */
	export class Infix {
		/**
		 * Stores an array of strings that represent the
		 * terms located before the Joint operator.
		 */
		readonly lhsTerms: ReadonlyArray<string>;
		/**
		 * Stores an array of strings that represent the
		 * terms located after the Joint operator.
		 */
		readonly rhsTerms: ReadonlyArray<string>;
		/**
		 * Stores whether the <<Double>> angle bracket
		 * syntax was used to only match named types,
		 * rather than aliases.
		 */
		readonly forcesNominal: boolean;
		/**
		 * Stores whether the </Pattern/> syntax was
		 * used to embed an external pattern.
		 */
		readonly requestsPattern: boolean;
		constructor(
		/**
		 * Stores an array of strings that represent the
		 * terms located before the Joint operator.
		 */
		lhsTerms?: ReadonlyArray<string>,
		/**
		 * Stores an array of strings that represent the
		 * terms located after the Joint operator.
		 */
		rhsTerms?: ReadonlyArray<string>,
		/**
		 * Stores whether the <<Double>> angle bracket
		 * syntax was used to only match named types,
		 * rather than aliases.
		 */
		forcesNominal?: boolean,
		/**
		 * Stores whether the </Pattern/> syntax was
		 * used to embed an external pattern.
		 */
		requestsPattern?: boolean);
		/** */
		readonly kind: InfixKind;
	}
	/** */
	export enum InfixKind {
		faulty = 0,
		pattern = 1,
		portability = 2,
		population = 3
	}
	/** */
	export type ForePatternChunks = (Infix | string)[];
	/**
	 * 
	 */
	export class Fragmenter {
		private readonly program;
		/** */
		constructor(program: Program);
		/**
		 * Updates contents of the Fragmenter to include the
		 * contents of the specified document.
		 */
		private handleDocumentAdded;
		/**
		 * Updates contents of the Fragmenter to exclude the
		 * contents of the specified document.
		 */
		private handleDocumentRemoved;
		/**
		 * Performs a query on the Fragmenter.
		 * @returns A Strand, or null in the case
		 * when the URI specified doesn't map to a populated
		 * location in the document.
		 */
		query(uri: Uri): Strand | null;
		/** */
		queryContents(uri: Uri): Strand[];
		/** */
		private queryInner;
		/**
		 * Translates a declaration-side atom, by collecting it's
		 * corresponding annotation-side atoms and packaging
		 * it into a Molecule object.
		 */
		private translateAtomToMolecule;
		/**
		 * Stores the declarations of the specified statement, and
		 * all of the declarations in it's descendant statements in
		 * the internal caches.
		 * 
		 * The statement object specified in the storeTarget parameter
		 * is expected to not be stored in the internal caches.
		 */
		private storeStatement;
		/**
		 * Removes the fragments associated with the specified span
		 * from all internal caches.
		 */
		private unstoreSpan;
		/** */
		private cacheFragment;
		/** */
		private uncacheFragment;
		/**
		 * A map used to quickly find the fragments associated with a span.
		 * A separate fragment will exist in the array value for every spine
		 * ending at the Span key. Naturally, Spans that are directly
		 * contained by a Document will only ever have one item in it's
		 * associated fragment array.
		 * 
		 * Note that the fragments in the array value may be parented by
		 * different apexes (meaning Spans or Documents).
		 * 
		 * Although provisions are taken to ensure entries in this map are
		 * all explicitly released, a WeakMap is used in this case instead of
		 * a traditional Map as a defense measure against unforeseen bugs
		 * resulting in memory leaks.
		 */
		private readonly fragmentFinder;
		/**
		 * A map of the Document objects loaded into the system,
		 * and the top-level fragment objects to which they map.
		 */
		private readonly documents;
		/**
		 * Converts the contents of the Fragmenter to a string
		 * representation, useful for testing purposes.
		 */
		toString(): string;
	}
	/**
	 * A Strand is essentially an inspectable version of a URI's type
	 * path. More specifically, it is a type that describes a series of
	 * objects of the abstract Subject type, that aligns with the
	 * components of a type URI (the ordering of the entry in the
	 * map is relevant).
	 * 
	 * Each Subject key is related to a set of Span objects that
	 * represent the points of the document that where discovered
	 * in relation to each component of the type URI.
	 */
	export class Strand {
		readonly molecules: ReadonlyArray<Molecule>;
		/** */
		constructor(molecules: ReadonlyArray<Molecule>);
		/**
		 * Creates a string representation of this Strand that
		 * allows it's contents to be compared with other
		 * Strand objects with equivalent contents. An example
		 * of the string format is as follows:
		 * 
		 * 	file://path/to/document.truth
		 * LocalAtom1
		 * 	ReferencedAtom1
		 * 	ReferencedAtom2
		 * LocalAtom2
		 * 	ReferencedAtom3
		 * 	ReferencedAtom4
		 * 
		 * Future work may include determining whether returning
		 * this string as an MD5 hash will result in a reduction of
		 * memory usage.
		 */
		toString(): string;
		/**
		 * Clones this Strand into a new object, but with the
		 * specified number of molecules trimmed from the end.
		 */
		retract(depth: number): Strand;
	}
	/**
	 * 
	 */
	export class Molecule {
		readonly localAtom: Atom;
		readonly referencedAtoms: ReadonlyArray<Atom>;
		constructor(localAtom: Atom, referencedAtoms: ReadonlyArray<Atom>);
	}
	/**
	 * 
	 */
	export class Atom {
		readonly subject: Subject;
		readonly spans: ReadonlyArray<Span>;
		constructor(subject: Subject, spans: ReadonlyArray<Span>);
	}
	/**
	 * 
	 */
	export class Graph {
		private readonly program;
		/**
		 * Reads a root Node with the specified
		 * name out of the specified document.
		 */
		read(doc: Document, name: string): Node | null;
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
		private readonly nodes;
		/**
		 * Stores a GraphTransaction instance in the case when
		 * the program is under
		 */
		private activeTransactions;
	}
	/**
	 * A class that represents a single Node contained within
	 * the Program's Graph. Nodes are long-lived objects that
	 * persist between edit frames, and maintain referential
	 * integrity.
	 * 
	 * Nodes are connected in a graph not by edges, but by
	 * "Fans". A Fan is similar to a directed edge in that it has
	 * a single origin, but differs in that it has multiple destinations.
	 * It is necessary for Nodes to be connected to each other
	 * in this way, in order for further phases in the pipeline
	 * to perform type resolution.
	 */
	export class Node {
		/** */
		private static rootNodes;
		/** */
		private addRootNode;
		/** */
		private removeRootNode;
		/** */
		private getRootNodes;
		/** */
		private deleteRootNode;
		/**
		 * Removes this Node, and all its contents from the graph.
		 */
		dispose(): void;
		/**
		 * Removes the specified Fan from this Node's
		 * set of outbounds.
		 * 
		 * @throws In the case when the specified Fan is
		 * not owned by this Node.
		 */
		disposeFan(fan: Fan): void;
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
		 * Stores the set of declaration-side Span
		 * objects that compose this Node.
		 */
		readonly spans: Set<Span>;
		/** */
		readonly statements: Set<Statement>;
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
		 * Gets an immutable set of Fans from adjacent or
		 * contained Nodes that reference this Node.
		 * 
		 * (The ordering of outbounds isn't important, as
		 * they have no physical representation in the
		 * document, which is why they're stored in a Set
		 * rather than an array.)
		 */
		readonly inbounds: ReadonlySet<Fan>;
		private readonly _inbounds;
		/**
		 * Gets an array of Fans that connect this Node to
		 * others, being either adjacents, or Nodes that
		 * exists somewhere in the containment hierarchy.
		 */
		readonly outbounds: ReadonlyArray<Fan>;
		private readonly _outbounds;
		/**
		 * Enumerates upwards through the containment
		 * hierarchy of the Nodes present in this Node's
		 * containing document, yielding the adjacents at
		 * every level, and then continues through to the
		 * root level adjacents of each of the document's
		 * dependencies.
		 */
		private enumerateContainment;
		/** */
		removeFanSpan(span: Span): void;
	}
	type NodeMap = ReadonlyMap<string, Node>;
	/**
	 * A Fan connects origin Nodes to target Nodes, for a
	 * specific reason, identified by the "rationale" field.
	 * 
	 * Each Fan object is always "owned" by one single Node
	 * object, however, Nodes have a reference to the Fans
	 * that are targeting them through their Node.inbounds
	 * field.
	 */
	export class Fan {
		/**
		 * Stores a string representation of the subjects
		 * contained by the spans that this Fan represents.
		 * In the case when the FanRationale is a sum, the
		 * field instead stores the raw annotation-side
		 * content as it appears in the document.
		 */
		readonly name: string;
		/** */
		readonly origin: Node;
		/**
		 * Gets an array containing the Nodes to which the origin is
		 * connected. If the array is empty, the Fan is technically
		 */
		readonly targets: ReadonlyArray<Node>;
		private readonly _targets;
		/** */
		readonly rationale: FanRationale;
		private _rationale;
		/**
		 * Gets an array of annotation-side Span objects that compose
		 * the Fan. In the case when the "rationale" of this Fan is "patternSum",
		 * this array is composed of a complete set of spans on the annotation
		 * side of a single statement. In other cases, the array is composed of
		 * Spans potentially scattered throughout the document across many
		 * statements.
		 */
		readonly spans: Set<Span>;
	}
	/**
	 * An enumeration that describes why a Fan was
	 * created to connect a Node to a series of others.
	 */
	export enum FanRationale {
		/**
		 * Indicates that the Fan was created, but doesn't
		 * actually connect anything, due to an inability
		 * to resolve an annotation to a meaningful place
		 * in the document.
		 */
		orphan = 0,
		/**
		 * Indicates that the Fan was created to connect
		 * an origin Node to other Nodes through a type
		 * relationship (meaning an exact name match).
		 */
		type = 1,
		/**
		 * Indicates that the Fan was created to connect
		 * an origin Node to other Nodes through a pattern
		 * with the coexistence flag set.
		 */
		pattern = 2,
		/**
		 * Indicates that the Fan was created to connect
		 * and origin Node to other Nodes through a "sum"
		 * pattern (a pattern without the coexistence flag set).
		 * 
		 * A Sum is a serialized representation of a series of annotations
		 * that are all present within a single statement. It is used to handle
		 * the case that given a statement in the form "A : B, C, D", the
		 * annotation "B, C, D" may actually be matchable by a pattern
		 * without a coexistence flag. Sums allow these potential matches
		 * to be processed more easily.
		 */
		sum = 3
	}
	/**
	 * 
	 */
	export class Pattern {
		/** */
		constructor();
		/** */
		readonly compiledExpression: RegExp;
		/** */
		readonly ast: Object;
		/**
		 * Stores a boolean value indicating whether the pattern
		 * can match individual blocks of content on the annotation
		 * side of a statement (separated by commas), or whether
		 * the pattern must match all annotation-side content in a
		 * statement.
		 */
		readonly canCoexist = false;
		/** Necessary? */
		readonly canMatchEmpty = false;
		/** Necessary? */
		readonly canMatchWhitespace = false;
	}
	/**
	 * 
	 */
	export enum PatternComparisonResult {
		/** */
		subset = 0,
		/** */
		superset = 1,
		/** */
		equal = 2,
		/** */
		unequal = 3
	}
	/**
	 * 
	 */
	export abstract class Alias {
		/** */
		abstract readonly span: Span;
		/**
		 * Stores an array of Patterns that match this alias.
		 */
		abstract readonly recognizers: ReadonlyArray<Pattern>;
	}
	/**
	 * 
	 */
	export class Waterfall {
		/** */
		static create(directiveUri: Uri, program: Program): Waterfall | null;
		/** */
		readonly origin: Turn;
		/** */
		readonly directive: ReadonlyArray<Turn>;
		/**
		 * @returns The number of terraces in the underlying
		 * waterfall. Used to quickly determine if a URI was directed
		 * at an unpopulated location in a document.
		 */
		readonly totalHeight: number;
		/**
		 * Stores an array of faults that were generated before the
		 * Waterfall was constructed.
		 */
		readonly constructionFaults: ReadonlyArray<Fault>;
		/**
		 * Reads a full terrace from the waterfall, from the specified
		 * URI.
		 * 
		 * @throws If the URI has typePath that is not a strict subset
		 * of this Waterfall's directive.
		 */
		readTerrace(uri: Uri): ReadonlyArray<Turn | undefined>;
		/** */
		readFloorTerrace(): never[];
		/** */
		walk(): WaterfallWalker;
	}
	/**
	 * A class that acts as a cursor for walking around a Waterfall
	 * instance. Note that the WaterfallWalker does, indeed, walk
	 * on water.
	 */
	export class WaterfallWalker {
		private readonly waterfall;
		constructor(waterfall: Waterfall);
		/** */
		plunge(): Turn | null;
		/** */
		canPlunge(): boolean;
		/** */
		flow(): Turn | null;
		/** */
		canFlow(): boolean;
	}
	/**
	 * 
	 */
	interface IMutableTurn {
		/**
		 * Indicates whether this Turn terminates the flow of it's ledge.
		 */
		terminal: boolean;
		/**
		 * Stores the array of Node objects that correspond to this turn.
		 */
		nodes: Node[];
	}
	export type Turn = Freeze<IMutableTurn>;
	/**
	 * A class that represents a fully constructed type within the program.
	 */
	export class Type {
		static construct(spine: Spine, program: Program): Type;
		/** */
		constructor();
		/**
		 * 
		 */
		constructAdjacents(): never[];
		/**
		 * 
		 */
		constructContents(): Type[];
		/**
		 * Attempts to match the specified string against the
		 * Patterns that resolve to this type. If this type is a pattern,
		 * the input is tested against the inner regular expression.
		 */
		tryMatch(input: string): boolean;
		/**
		 * Stores the Waterfall diagram used to construct this type.
		 */
		private readonly waterfall;
		/**
		 * Stores a text representation of the name of the type,
		 * or a serialized version of the pattern content in the
		 * case when the type is actually a pattern.
		 */
		readonly name: string;
		/** */
		readonly container: Type;
		/**
		 * Stores the array of types from which this type extends.
		 * If this Type extends from a pattern, it is included in this
		 * array.
		 */
		readonly bases: ReadonlyArray<Type>;
		/**
		 * Stores the array of annotations attached to this Type
		 * that were resolved as type aliases through a Pattern.
		 */
		readonly aliases: ReadonlyArray<Alias>;
		/**
		 * Stores a reference to the intrinsic side of the list when
		 * this type represents the extrinsic side of a list, or vice
		 * versa.
		 * Stores null in the case when the type is not a list.
		 */
		readonly listPortal: Type | null;
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
		 * Stores whether the bases explicitly assigned to
		 * this type are compliant with the requirements
		 * imposed on this type from it's inheritance source.
		 */
		readonly isContractuallyCompliant: boolean;
		/** */
		readonly isFresh: boolean;
		/** */
		readonly isOverride: boolean;
		/** */
		readonly isAnonymous: boolean;
		/** */
		readonly inCircularGroup: boolean;
		/** */
		readonly isPattern: boolean;
	}
}


declare const Hooks: Truth.HookTypesInstance;
declare const Program: Truth.Program;
