import * as X from "./X";


/**
 * 
 */
export class ProgramInspectionSite
{
	/** @internal */
	constructor(
		doc: X.Document,
		line: number,
		offset: number,
		defragmenter: X.Defragmenter)
	{
		this.document = doc;
		this.line = line;
		this.offset = offset;
		this.statement = doc.read(line);
		this.area = this.statement.getAreaKind(offset);
		this.defragmenter = defragmenter;
		this.typeConstructor = new X.TypeConstructor(defragmenter);
	}
	
	/** */
	readonly document: X.Document;
	
	/** */
	readonly line: number;
	
	/** */
	readonly offset: number;
	
	/** */
	readonly area: X.StatementAreaKind;
	
	/** */
	readonly statement: X.Statement;
	
	/** */
	private readonly defragmenter: X.Defragmenter;
	
	/** */
	private readonly typeConstructor: X.TypeConstructor;
	
	/**
	 * Gets the statement that is the parent of this 
	 * ProgramInspectionPoint's statement object.
	 * 
	 * In the case when this statement is top level,
	 * a reference to the statement's containing
	 * document is returned. 
	 * 
	 * In the case when the inspection point has
	 * no logical parent, such as if the statement
	 * is a comment, the returned value is null.
	 */
	get parent(): X.Statement | X.Document | null
	{
		const field = this._parent;
		
		return field !== undefined ? field : this._parent = (() =>
		{
			const kind = X.StatementAreaKind;
			
			const parent = (() =>
			{
				if (this.area === kind.whitespace)
					return this.document.getParentFromPosition(this.line, this.offset);
				
				if (this.area === kind.declaration || this.area === kind.annotation)
					return this.document.getParent(this.statement);
				
				return null;
			})();
			
			if (parent === null)
				throw X.ExceptionMessage.unknownState();
			
			return parent;
		})();
	}
	private _parent: X.Statement | X.Document | null = null;
	
	/**
	 * Gets information about any declaration found at
	 * the document location specified in the constructor
	 * parameters of this object.
	 * 
	 * Gets null in the case when something other than
	 * a declaration is found at the location.
	 */
	get declaration(): DeclarationSite | null
	{
		const field = this._declaration;
		
		return field !== undefined ? field : this._declaration = (() =>
		{
			const kind = X.StatementAreaKind;
			if (this.area !== kind.declaration)
				return null;
			
			const statementInspection = this.statement.inspect(this.offset);
			const pointer = statementInspection.pointer;
			if (!pointer)
				throw X.ExceptionMessage.unknownState();
			
			const decl = new DeclarationSite(pointer, this.typeConstructor);
			return decl;
		})();
	}
	private _declaration: DeclarationSite | null | undefined = undefined;
	
	/**
	 * Get information about any annotation found at
	 * the document location specified in the constructor
	 * parameters of this object.
	 * 
	 * Gets null in the case when something other than
	 * an annotation is found at the location.
	 */
	get annotation(): AnnotationSite | null
	{
		const field = this._annotation;
		
		return field !== undefined ? field : this._annotation = (() =>
		{
			const kind = X.StatementAreaKind;
			if (this.area !== kind.annotation)
				return null;
			
			// Get a pointer from somewhere:
			const pointer = <X.Pointer>null!;
			
			const anno = new AnnotationSite(pointer);
			return anno;
		})();
	}
	private _annotation: AnnotationSite | null | undefined = undefined;
}


/**
 * A class that allows access to the underlying
 * Types defined at the point of one single 
 * subject within a document.
 */
export class DeclarationSite
{
	constructor(
		pointer: X.Pointer,
		typeConstructor: X.TypeConstructor)
	{
		this.pointer = pointer;
		this.typeConstructor = typeConstructor;
	}
	
	/** */
	readonly pointer: X.Pointer;
	
	/**
	 * Stores a reference to the TypeConstructor object
	 * used across the current frame.
	 */
	private readonly typeConstructor: X.TypeConstructor;
	
	/** 
	 * Gets the array of types referenced at the declaration site.
	 * Multiple types may be related to a single declaration site
	 * in the case when it's contained by a statement with multiple
	 * declarations.
	 */
	get types()
	{
		return this._types !== null ? this._types : this._types = (() =>
		{
			const paths = this.pointer.factor();
			const types = paths.map(path => this.typeConstructor.exec(path));
			return types;
		})();
	}
	private _types: ReadonlyArray<X.Type> | null = null;
}


/**
 * 
 */
export class AnnotationSite
{
	constructor(pointer: X.Pointer)
	{
		this.pointer = pointer;
	}
	
	/** */
	readonly subject: X.Subject = null!;
	
	/**
	 * Gets an array representing the declaration sites that 
	 * sit to the left of this annotation site in the document.
	 */
	get adjacentDeclarations()
	{
		const field = this._adjacentDeclarations;
		
		return field !== null ? field : this._adjacentDeclarations = (() =>
		{
			return [];
		})();
	}
	private _adjacentDeclarations: ReadonlyArray<DeclarationSite> | null = null;
	
	/**
	 * Gets an array representing the declaration sites that 
	 * sit to the left of this annotation site in the document.
	 */
	get matches()
	{
		const field = this._matches;
		
		return field !== null ? field : this._matches = (() =>
		{
			return [];
		})();
	}
	private _matches: ReadonlyArray<X.Match> | null = null;
	
	/** */
	private readonly pointer: X.Pointer;
}
