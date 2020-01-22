
// Util
/// <reference path="./Util/Helpers.ts" />
/// <reference path="./Util/MultiMap.ts" />
/// <reference path="./Util/Fs.ts" />
/// <reference path="./Util/Hash.ts" />
/// <reference path="./Util/HigherOrder.ts" />
/// <reference path="./Util/Not.ts" />
/// <reference path="./Util/Parser.ts" />
/// <reference path="./Util/UnicodeBlocks.ts" />
/// <reference path="./Util/Misc.ts" />

// System
/// <reference path="./System/AbstractClass.ts" />
/// <reference path="./System/Program.ts" />
/// <reference path="./System/ProgramInspectionResult.ts" />
/// <reference path="./System/AgentCache.ts" />
/// <reference path="./System/Cause.ts" />
/// <reference path="./System/Exception.ts" />
/// <reference path="./System/UriProtocol.ts" />
/// <reference path="./System/UriReader.ts" />
/// <reference path="./System/Syntax.ts" />
/// <reference path="./System/FaultService.ts" />
/// <reference path="./System/Faults.ts" />
/// <reference path="./System/Phrase.ts" />
/// <reference path="./System/Term.ts" />
/// <reference path="./System/VersionStamp.ts" />

// Finite State Machine
/// <reference path="./Fsm/Alphabet.ts" />
/// <reference path="./Fsm/TransitionMap.ts" />
/// <reference path="./Fsm/TransitionState.ts" />
/// <reference path="./Fsm/Guide.ts" />
/// <reference path="./Fsm/Fsm.ts" />
/// <reference path="./Fsm/FsmTranslator.ts" />

// Phases / File Representation
/// <reference path="./Phases/File/Document.ts" />
/// <reference path="./Phases/File/DocumentTypes.ts" />
/// <reference path="./Phases/File/CycleDetector.ts" />
/// <reference path="./Phases/File/LineParser.ts" />
/// <reference path="./Phases/File/Anon.ts" />
/// <reference path="./Phases/File/Line.ts" />
/// <reference path="./Phases/File/Boundary.ts" />
/// <reference path="./Phases/File/Statement.ts" />
/// <reference path="./Phases/File/Pattern.ts" />
/// <reference path="./Phases/File/PatternPrecompiler.ts" />
/// <reference path="./Phases/File/RegexTypes.ts" />
/// <reference path="./Phases/File/Infix.ts" />
/// <reference path="./Phases/File/Span.ts" />
/// <reference path="./Phases/File/Spine.ts" />
/// <reference path="./Phases/File/Subject.ts" />

// Phases / Graph Representation
/// <reference path="./Phases/Graph/HyperGraph.ts" />
/// <reference path="./Phases/Graph/Node.ts" />
/// <reference path="./Phases/Graph/NodeIndex.ts" />
/// <reference path="./Phases/Graph/HyperEdge.ts" />
/// <reference path="./Phases/Graph/InfixSpan.ts" />

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
/// <reference path="./Phases/Type/TypeProxy.ts" />
/// <reference path="./Phases/Type/TypeProxyArray.ts" />
/// <reference path="./Phases/Type/TypeCache.ts" />

// Node compatibility
if (typeof module !== "undefined" && module.exports)
	module.exports = Truth;
