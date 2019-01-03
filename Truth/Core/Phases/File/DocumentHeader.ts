import * as X from "../../X";


/**
 * @internal
 * Stores information about a document's header.
 */
export class DocumentHeader
{
	/** */
	constructor(document: X.Document)
	{
		this.document = document;
	}
	
	/**
	 * Forces the header to be recomputed, by scanning
	 * the statements in the underlying document.
	 * 
	 * If the header has changed, the method runs the
	 * necessary hooks to notify subscribers of hooks 
	 * any added or removed.
	 */
	recompute()
	{
		const oldUriMap = this.uriMap;
		const newUriMap = new Map<X.Statement, X.Uri>();
		
		for (const { statement } of this.document.eachDescendant())
		{
			// Currently, any statement with an annotation is
			// considered to be a non-header statement. This
			// will change if scoped references become supported.
			// Also, only one URI reference statement per line is
			// accepted. Vaccuous statements break the header.
			if (statement.allAnnotations.length > 0 || statement.allDeclarations.length !== 1)
				break;
			
			const decl = statement.allDeclarations[0];
			
			if (typeof decl.boundary.subject === "string")
				throw X.Exception.unknownState();
			
			if (!(decl.boundary.subject instanceof X.Uri))
				break;
			
			newUriMap.set(statement, decl.boundary.subject);
		}
		
		if (oldUriMap.size + newUriMap.size === 0)
			return;
		
		const removedUriMap = new Map<X.Uri, X.Statement>();
		const addedUriMap = new Map<X.Uri, X.Statement>();
		
		for (const [statement, oldUri] of oldUriMap)
			if (!newUriMap.has(statement))
				removedUriMap.set(oldUri, statement);
		
		for (const [statement, newUri] of newUriMap)
			if (!oldUriMap.has(statement))
				addedUriMap.set(newUri, statement);
		
		const doc = this.document;
		const hooks = doc.program.hooks;
		
		for (const [uri, statement] of removedUriMap)
			hooks.UriReferenceRemoved.run(new X.UriReferenceParam(doc, statement, uri));
		
		for (const [uri, statement] of addedUriMap)
			hooks.UriReferenceAdded.run(new X.UriReferenceParam(doc, statement, uri));
		
		this.uriMap.clear();
		newUriMap.forEach((uri, statement) => this.uriMap.set(statement, uri));
	}
	
	/**
	 * @returns The document reference URI that corresponds 
	 * to the specified statement. Returns null in the case when
	 * the specified statement is not a part of the header.
	 */
	getHeaderUri(statement: X.Statement)
	{
		return this.uriMap.get(statement) || null;
	}
	
	/**
	 * Stores a map of the URIs referenced in the header of this 
	 * document, which are indexed by the statement in which
	 * the URI is found.
	 */
	private readonly uriMap = new Map<X.Statement, X.Uri>();
	
	/** */
	private readonly document: X.Document;
}
