import * as X from "../Core/X";


/**
 * 
 */
export class BaselineDocument
{
	constructor(readonly lines: BaselineActualStatement[]) { }
	
	/**
	 * Generates source text from this BaselineDocument that
	 * is a suitable input for parsing as a real Truth document.
	 */
	toParsableString()
	{
		const lines: string[] = [];
		
		const recurse = (statements: BaselineActualStatement[], level: number) =>
		{
			for (const statement of statements)
			{
				const indent = X.Syntax.tab.repeat(level);
				const decls = statement.declarations
					.map(d => d.subject.toString())
					.join(X.Syntax.combinator + " ");
				
				const joint = " " + X.Syntax.joint + " ";
				const annos = statement.annotationsActual
					.map(a => a.subject.toString())
					.join(X.Syntax.combinator + " ");
				
				lines.push(indent + decls + joint + annos);
				recurse(statement.statementsActual, level + 1);
			}
		}
		
		recurse(this.lines, 0);
		return lines.join(X.Syntax.terminal);
	}
}


/**
 * 
 */
export class BaselineActualStatement
{
	constructor(
		readonly level: number,
		readonly container: BaselineActualStatement | null,
		readonly declarations: BaselineSpan[],
		readonly annotationsActual: BaselineSpan[],
		/** Null indicates a type that must be fresh. */
		readonly annotationsVirtual: BaselineVirtualSpan[] | null)
	{ }
	
	readonly statementsActual: BaselineActualStatement[] = [];
	readonly statementsVirtual: BaselineVirtualStatement[] = [];
}


/**
 * 
 */
export class BaselineVirtualStatement
{
	constructor(
		readonly level: number,
		readonly container: BaselineStatement,
		readonly declarations: X.Subject[],
		readonly annotations: BaselineVirtualSpan[])
	{ }
	
	readonly statements: BaselineVirtualStatement[] = [];
}


/**
 * 
 */
export type BaselineStatement = 
	BaselineActualStatement | 
	BaselineVirtualStatement;


/**
 * 
 */
export class BaselineSpan
{
	constructor(
		readonly subject: X.Subject,
		readonly codes: number[])
	{ }
}


/**
 * 
 */
export class BaselineVirtualSpan
{
	constructor(
		readonly subject: X.Subject, 
		readonly isNegation: boolean)
	{ }
}


/**
 * 
 */
export class BaselineParser
{
	private constructor() { }
	
	/** */
	static invoke(content: string, fileName: string)
	{
		const lines = content.split(X.Syntax.terminal);
		
		const recurse = (
			idx: number, 
			container: BaselineActualStatement | BaselineVirtualStatement) =>
		{
			if (idx >= lines.length)
				return;
			
			const line = lines[idx];
			const lineTrim = line.trimLeft();
			
			// Skip comments
			if (lineTrim.startsWith(X.Syntax.comment))
				return;
			
			// Skip whitespace lines
			if (lineTrim.length === 0)
				return;
			
			const baselineStatement = this.parseLine(lineTrim, container);
			
			const append = (
				container: BaselineStatement, 
				item: BaselineStatement) =>
			{
				if (container instanceof BaselineActualStatement)
				{
					item instanceof BaselineActualStatement ?
						container.statementsActual.push(item) :
						container.statementsVirtual.push(item);
				}
				else if (container instanceof BaselineVirtualStatement)
				{
					if (item instanceof BaselineActualStatement)
						throw "Actual statements cannot be nested within virtual statements.";
					
					container.statements.push(item);
				}
			}
			
			// Moving inward
			if (baselineStatement.level > container.level)
			{
				append(container, baselineStatement);
				recurse(idx + 1, baselineStatement);
			}
			// Same level
			else if (baselineStatement.level === container.level)
			{
				const prevContainer = container.container;
				if (!prevContainer)
					throw X.ExceptionMessage.unknownState();
				
				append(prevContainer, baselineStatement);
				recurse(idx + 1, prevContainer);
			}
			// Moving outward
			else if (baselineStatement.level < container.level)
			{
				let prevContainer = container;
				
				for (let i = container.level - baselineStatement.level; i-- > 0;)
				{
					if (!prevContainer.container)
						throw X.ExceptionMessage.unknownState();
					
					prevContainer = prevContainer.container;
				}
				
				append(prevContainer, baselineStatement);
				recurse(idx + 1, prevContainer);
			}
		}
		
		const root = new BaselineActualStatement(0, null, [], [], []);
		recurse(0, root);
		return new BaselineDocument(root.statementsActual);
	}
	
	/**
	 * 
	 */
	private static parseLine(lineText: string, container: BaselineStatement)
	{
		const lineTrim = lineText.trim();
		const level = lineText.length - lineTrim.length;
		
		const virtualStatementExp = 
			/^(\s*)~[\w\d\s]+(,[\w\d\s]+)*\s*:\s*[\w\d\s]+(,[\w\d\s]+)$/;
		
		const freshStatementExp =
			/^(\s*)~[\w\d\s]+(,[\w\d\s]+)*\s*~$/;
		
		const plainStatementExp = 
			/^[\w\d\s]+(,[\w\d\s]+)*\s*:\s*[\w\d\s]+(,[\w\d\s]+)$/;
		
		if (virtualStatementExp.test(lineText))
		{
			const statementText = lineText.replace(/^[\s~]/, "");
			const statementParsed = this.parseStatement(statementText);
			
			const annotations = statementParsed.annotations
				.map(a => a instanceof BaselineVirtualSpan ? a : <never>null);
			
			if (annotations.some(a => !a))
				throw X.ExceptionMessage.unknownState();
			
			const declarations = this.getSubjectsFromSide(statementParsed.declarations);
			
			return new BaselineVirtualStatement(
				level,
				container,
				declarations,
				annotations);
		}
		else if (freshStatementExp.test(lineText))
		{
			if (container instanceof BaselineVirtualStatement)
				throw X.ExceptionMessage.unknownState();
			
			const side = this.parseSide(lineText.replace(/~\s*/, ""));
			const subjects = this.getSubjectsFromSide(side);
			const baselinePtrs = subjects.map(sub => new BaselineSpan(sub, []));
			
			return new BaselineActualStatement(
				level,
				container,
				baselinePtrs,
				[],
				null);
		}
		else
		{
			if (!(container instanceof BaselineActualStatement))
				throw X.ExceptionMessage.unknownState();
			
			const parsedStatement = this.parseStatement(lineText);
			const declarations = parsedStatement.declarations.map(value =>
			{
				if (value instanceof BaselineSpan)
					return value;
				
				throw X.ExceptionMessage.unknownState();
			});
			
			const annotationsActual = 
				<BaselineSpan[]>parsedStatement.annotations
					.filter(value => value instanceof BaselineSpan);
			
			const annotationsVirtual =
				<BaselineVirtualSpan[]>parsedStatement.annotations
					.filter(value => value instanceof BaselineVirtualSpan);
			
			return new BaselineActualStatement(
				level,
				container,
				declarations,
				annotationsActual,
				annotationsVirtual);
		}
	}
	
	/** */
	private static parseStatement(statementText: string)
	{
		const sides = statementText.split(X.Syntax.joint, 2);
		if (sides.length !== 2)
			throw "Improperly formatted statement in baseline.";
		
		return {
			declarations: this.parseSide(sides[0]),
			annotations: this.parseSide(sides[1])
		}
	}
	
	/** */
	private static parseSide(sideText: string)
	{
		return sideText.split(X.Syntax.combinator).map(s => this.parseSpan(s));
	}
	
	/** */
	private static parseSpan(spanText: string)
	{
		const negationExp = /![\w\d]+/;
		
		if (negationExp.test(spanText))
		{
			return new BaselineVirtualSpan(
				new X.Subject(spanText.slice(1)),
				true);
		}
		
		const faultExp = /#[\d]+;$/;
		
		if (faultExp.test(spanText))
		{
			const parts = spanText.split("#").map(s => s.trim());
			const subject = new X.Subject(parts[0]);
			const codes = parts.map(s => parseInt(s));
			
			if (codes.some(s => !s))
				throw X.ExceptionMessage.unknownState();
			
			return new BaselineSpan(subject, codes);
		}
		
		return new X.Subject(spanText.trim());
	}
	
	/** */
	private static getSubjectsFromSide(side: (BaselineSpan | X.Subject | BaselineVirtualSpan)[])
	{
		return side.map(value => value instanceof X.Subject ? value : value.subject);
	}
}
