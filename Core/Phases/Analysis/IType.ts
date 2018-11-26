import * as X from "./X";


/**
 * An interface that serves as a base for IType and IPattern
 */
export interface IAxiom
{
	/** */
	readonly subject: X.Subject;
	
	/** */
	readonly stamp: X.VersionStamp;
	
	/** */
	readonly container: IType;
	
	/** */
	readonly spans: ReadonlyArray<X.Span>;
	
	/** */
	readonly statements: ReadonlyArray<X.Statement>;
	
	/** */
	readonly faults: ReadonlyArray<X.Fault>;
	
	/** */
	readonly bases: ReadonlyArray<IType>;
	
	/** */
	readonly orphans: ReadonlyArray<X.Atom>;
	
	/** */
	readonly typesInherited: ReadonlyMap<IType, ReadonlyArray<IType>>;
	
	/** */
	readonly typedSpecified: ReadonlyArray<IType>;
}


/**
 * 
 */
export interface IType extends IAxiom
{
	/** */
	readonly uri: X.Uri;
	
	/** */
	readonly name: string;
	
	/** */
	readonly containersResolved: ReadonlyArray<IType>;
	
	/** */
	readonly aliases: ReadonlyArray<IAlias>;
	
	/** */
	readonly contract: ReadonlyArray<IRequirement>;
	
	/** */
	readonly typesPassed: ReadonlyArray<IType>;
	
	/** */
	readonly typesComputed: ReadonlyArray<IType>;
	
	/** */
	readonly listPortal: IType | null;
	
	/** */
	readonly isList: boolean;
	
	/** */
	readonly isListIntrinsic: boolean;
	
	/** */
	readonly isListExtrinsic: boolean;
	
	/** */
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
	readonly patternsApplied: ReadonlyArray<IPattern>;
	
	/** */
	readonly patternsInherited: ReadonlyArray<IPattern>;
	
	/** */
	readonly patternsComputed: ReadonlyArray<IPattern>;
}


/**
 * 
 */
export interface IPattern extends IAxiom
{
	/** */
	readonly compiledExpression: RegExp;
	
	/** */
	readonly infixes: ReadonlyArray<Infix>;
	
	/** */
	readonly ast: Object;
}


/**
 * 
 */
export abstract class Infix
{
	/** */
	abstract readonly faults: ReadonlyArray<X.Fault>;
	
	/** */
	abstract readonly spans: ReadonlyArray<InfixSpan>;
}


/**
 * 
 */
export interface IPortabilityInfix extends Infix
{
	/** */
	readonly bases: ReadonlyArray<IType>;
}


/**
 * 
 */
export interface IPopulationInfix extends Infix
{
	/** */
	readonly type: IType;
	
	/** */
	readonly additionalBases: ReadonlyArray<IType>;
	
	/** */
	readonly forcesNominal: boolean;
	
	/** */
	readonly usesNominal: boolean;
}


/**
 * 
 */
export interface IPatternInfix extends Infix
{
	/** */
	readonly patternSource: IType | null;
}


/**
 * 
 */
export class InfixSpan
{
	constructor(
		readonly statementOffsetStart: number,
		readonly statementOffsetEnd: number,
		readonly infixOffsetStart: number,
		readonly infixOffsetEnd: number,
		readonly text: string)
	{ }
}


/**
 * 
 */
export interface IAlias
{
	/** */
	readonly span: X.Span;
	
	/** */
	readonly recognizers: ReadonlyArray<IPattern>;
}


/**
 * 
 */
export interface IRequirement
{
	/** */
	readonly requester: IType;
	
	/** */
	readonly requestedType: IType;
	
	/** */
	readonly allowances: ReadonlyArray<IType>;
}


/**
 * 
 */
export enum PatternComparisonResult
{
	/** */
	subset,
	
	/** */
	superset,
	
	/** */
	equal,
	
	/** */
	unequal
}

