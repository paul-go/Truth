
// Util
/// <reference path="./Util/Helpers.ts" />
/// <reference path="./Util/MultiMap.ts" />
/// <reference path="./Util/Fs.ts" />
/// <reference path="./Util/Hash.ts" />
/// <reference path="./Util/HigherOrder.ts" />
/// <reference path="./Util/Not.ts" />
/// <reference path="./Util/UnicodeBlocks.ts" />
/// <reference path="./Util/Misc.ts" />

// System
/// <reference path="./System/AbstractClass.ts" />
/// <reference path="./System/Program.ts" />
/// <reference path="./System/ProgramInspectionResult.ts" />
/// <reference path="./System/Exception.ts" />
/// <reference path="./System/UriProtocol.ts" />
/// <reference path="./System/UriReader.ts" />
/// <reference path="./System/Syntax.ts" />
/// <reference path="./System/FaultService.ts" />
/// <reference path="./System/Faults.ts" />
/// <reference path="./System/Term.ts" />
/// <reference path="./System/VersionStamp.ts" />

// Finite State Machine
/// <reference path="./Fsm/Alphabet.ts" />
/// <reference path="./Fsm/TransitionMap.ts" />
/// <reference path="./Fsm/TransitionState.ts" />
/// <reference path="./Fsm/Guide.ts" />
/// <reference path="./Fsm/Fsm.ts" />
/// <reference path="./Fsm/FsmTranslator.ts" />

// Phases / Document Representation
/// <reference path="./Phases/Document/Document.ts" />
/// <reference path="./Phases/Document/DocumentTypes.ts" />
/// <reference path="./Phases/Document/CycleDetector.ts" />
/// <reference path="./Phases/Document/Parser.ts" />
/// <reference path="./Phases/Document/Anon.ts" />
/// <reference path="./Phases/Document/Line.ts" />
/// <reference path="./Phases/Document/Boundary.ts" />
/// <reference path="./Phases/Document/Statement.ts" />
/// <reference path="./Phases/Document/Pattern.ts" />
/// <reference path="./Phases/Document/PatternPrecompiler.ts" />
/// <reference path="./Phases/Document/RegexTypes.ts" />
/// <reference path="./Phases/Document/Infix.ts" />
/// <reference path="./Phases/Document/Span.ts" />
/// <reference path="./Phases/Document/Spine.ts" />
/// <reference path="./Phases/Document/Subject.ts" />

// Phases / Intermedia Representation
/// <reference path="./Phases/Intermediate/Phrase.ts" />

// Phases / Parallel Representation
/// <reference path="./Phases/Parallel/ConstructionWorker.ts" />
/// <reference path="./Phases/Parallel/Parallel.ts" />
/// <reference path="./Phases/Parallel/ExplicitParallel.ts" />
/// <reference path="./Phases/Parallel/ImplicitParallel.ts" />
/// <reference path="./Phases/Parallel/CruftCache.ts" />
/// <reference path="./Phases/Parallel/ParallelCache.ts" />
/// <reference path="./Phases/Parallel/Contract.ts" />
/// <reference path="./Phases/Parallel/Sanitizer.ts" />

// Phases / Type Representation
/// <reference path="./Phases/Type/Type.ts" />

// Node compatibility
if (typeof module !== "undefined" && module.exports)
	module.exports = Truth;
