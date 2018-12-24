import * as X from "../../X";


/**
 * A class that stores all the documents loaded into a
 * program, and the inter-dependencies between them.
 */
export class DocumentGraph
{
	/** */
	constructor(program: X.Program)
	{
		this.program = program;
		
		program.hooks.DocumentRenamed.capture(hook =>
		{
			const oldUri = hook.oldUri.toString();
			const newUri = hook.document.sourceUri.toString();
			
			const entry = this.documents.get(oldUri);
			if (!entry)
				return;
			
			this.documents.delete(oldUri);
			this.documents.set(newUri, entry);
		});
		
		program.hooks.Revalidate.capture(hook =>
		{
			const docUri = hook.document.sourceUri.toString();
			const entry = this.documents.get(docUri);
			const header = entry ? entry.header : null;
			
			// The header is being re-computed on every document
			// modification. There may be some optimizations here
			// to eliminate recompute in common cases, but it would
			// be a micro-optimization at the time of this writing.
			if (header)
				header.recompute();
		});
		
		program.hooks.UriReferenceAdded.contribute(hook =>
		{
			this.tryLink(hook.document, hook.statement, hook.uri);
		});
		
		program.hooks.UriReferenceRemoved.capture(hook =>
		{
			const entry = this.documents.get(hook.uri.toString());
			if (entry)
				this.unlink(hook.document, entry.document);
		});
	}
	
	/**
	 * Reads a Document from the specified URI.
	 * The document is created and returned, asynchronously.
	 */
	async read(uri: X.Uri)
	{
		const readResult = await X.UriReader.tryRead(uri);
		if (readResult instanceof Error)
			return readResult;
		
		return this.create(uri, readResult);
	}
	
	/**
	 * Creates a temporary document that will exist only in memory.
	 * The document may not be linked to other documents in the
	 * graph.
	 */
	create(): X.Document;
	/**
	 * Creates a temporary document that will exist only in memory,
	 * which is initialized with the specified source text. The document
	 * may not be linked to other documents in the graph.
	 */
	create(sourceText: string): X.Document;
	/**
	 * Creates a document that was read from the specified URI, 
	 * with the specified sourceText. If the content still needs to be 
	 * read from a URI, use the .read() method.
	 */
	create(uri: X.Uri | string, sourceText: string): X.Document;
	create(param1?: X.Uri | string, param2?: string)
	{
		const zeroArgs = arguments.length === 0;
		const oneArg = arguments.length === 1;
		
		const uri = (() =>
		{
			if (zeroArgs || oneArg)
				return X.Uri.create();
			
			if (!param1)
				return null;
			
			if (param1 instanceof X.Uri)
				return param1;
			
			return X.Uri.parse(param1);
		})();
		
		if (!uri)
			throw X.ExceptionMessage.invalidUri();
		
		const sourceText = 
			zeroArgs ? "" :
			oneArg ? (param1 || "").toString() :
			param2 || "";
		
		const document = new X.Document(this.program, uri, sourceText);
		const header = new X.DocumentHeader(document);
		const entry: IDocumentEntry = { document, header };
		this.documents.set(uri.toString(), entry);
		header.recompute();
		
		const param = new X.DocumentParam(document);
		this.program.hooks.DocumentCreated.run(param);
		
		return document;
	}
	
	/**
	 * Blocks execution until all queued IO operations have completed.
	 */
	async await()
	{
		return new Promise<void>(resolve =>
		{
			if (this.asyncCount === 0)
				resolve();
			else
				this.waitFns.push(resolve);
		});
	}
	
	/**
	 * @returns The document loaded into this graph
	 * with the specified URI.
	 */
	get(uri: X.Uri)
	{
		const entry = this.documents.get(uri.toString());
		return entry ? entry.document : null;
	}
	
	/**
	 * @returns A boolean value that indicates whether
	 * the specified Document has been loaded into
	 * this DocumentGraph.
	 */
	has(param: X.Uri | X.Document)
	{
		if (param instanceof X.Document)
		{
			for (const entry of this.documents.values())
				if (entry.document === param)
					return true;
			
			return false;
		}
		
		return !!this.get(param);
	}
	
	/**
	 * @returns An array containing all documents loaded into this
	 * DocumentGraph. The array returned is sorted topologically 
	 * from left to right, so that forward traversals are guaranteed 
	 * to not cause dependency conflicts.
	 */
	each()
	{
		// The topological sorting mechanism uses a variant of depth-first search.
		// Algorithm is described here: https://en.wikipedia.org/wiki/Topological_sorting
		
		const sortedResult: X.Document[] = [];
		const docsFinalized = new Set<X.Document>();
		const docsInStack = new Set<X.Document>();
		const allDocs = Array.from(this.documents.values())
			.map(entry => entry.document);
		
		const recurse = (currentDoc: X.Document) =>
		{
			if (docsFinalized.has(currentDoc))
				return;
			
			// Cycle detected. This condition should never pass because
			// DocumentGraph is supposed to prevent cycles.
			if (docsInStack.has(currentDoc))
				throw X.ExceptionMessage.unknownState();
			
			docsInStack.add(currentDoc);
			
			const deps = this.dependencies.get(currentDoc);
			
			if (deps)
				for (const dep of deps)
					recurse(dep.target);
			
			docsFinalized.add(currentDoc);
			sortedResult.unshift(currentDoc);
		}
		
		while (docsFinalized.size < allDocs.length)
		{
			const nextUnvisited = allDocs.find(d => !docsFinalized.has(d));
			if (!nextUnvisited)
				throw X.ExceptionMessage.unknownState();
			
			recurse(nextUnvisited);
		}
		
		return sortedResult;
	}
	
	/**
	 * Deletes a document that was previously loaded into the compiler.
	 * Intended to be called by the host environment when a file changes.
	 */
	delete(target: X.Document | X.Uri)
	{
		const doc = target instanceof X.Document ? target : (() =>
		{
			const entry = this.documents.get(target.toString());
			return entry ? entry.document : null;
		})();
		
		if (!doc)
			return;
		
		const param = new X.DocumentParam(doc);
		this.program.hooks.DocumentDeleted.run(param);
		
		// Go through the entire map of dependent documents, 
		// and find documents that have the deleted document 
		// listed as one of it's dependents. These documents are
		// then removed from the array of dependents.
		for (const [refDoc, dependents] of this.dependents)
		{
			const docIdx = dependents.indexOf(doc);
			if (docIdx > -1)
				dependents.splice(docIdx, 1);
			
			if (dependents.length === 0)
				this.dependents.delete(refDoc);
		}
		
		// Delete the dependencies of the document
		// after we're done clearing out the dependents.
		this.dependencies.delete(doc);
		
		// Delete the deleted document last
		this.documents.delete(doc.sourceUri.toString());
	}
	
	/**
	 * Removes all documents from this graph.
	 */
	clear()
	{
		this.documents.clear();
		this.dependencies.clear();
		this.dependents.clear();
	}
	
	/**
	 * @returns An array containing the dependencies
	 * associated with the specified document. The returned
	 * array is sorted in the order in which the dependencies
	 * are defined in the document.
	 */
	getDependencies(doc: X.Document)
	{
		const dependencies = this.dependencies.get(doc);
		if (!dependencies)
			return [];
		
		const urisSorted: string[] = [];
		const docDependencies = dependencies.map(d => d.target);
		const entry = this.documents.get(doc.sourceUri.toString());
		
		if (entry === undefined)
			throw X.ExceptionMessage.unknownState();
		
		for (const statement of doc.eachStatement())
		{
			if (statement.isNoop)
				continue;
			
			// If a non-noop statement is reached that isn't a part
			// of the header, the end of the header has been reached.
			const refUri = entry.header.getHeaderUri(statement);
			if (!refUri)
				break;
			
			urisSorted.push(refUri.toString());
		}
		
		const depsSorted = urisSorted.map(uriText => 
			docDependencies.find(docDep => 
				docDep.sourceUri.toString() === uriText)!);
		
		if (depsSorted.some(d => d === undefined))
			throw X.ExceptionMessage.unknownState();
		
		return depsSorted;
	}
	
	/**
	 * @returns An array containing the dependents
	 * associated with the specified document.
	 */
	getDependents(doc: X.Document)
	{
		const dependents = this.dependents.get(doc);
		return dependents ?
			dependents.slice() :
			[];
	}
	
	/**
	 * Attempts to add a link from one document to another,
	 * via the specified URI. If there is some reason why the
	 * link cannot be established, (circular references, bad
	 * URIs), no link is added, and a fault is reported.
	 */
	private tryLink(
		containingDocument: X.Document, 
		containingStatement: X.Statement, 
		uri: X.Uri)
	{
		this.asyncCount++;
		const uriText = uri.toString();
		
		setTimeout(() => (async () =>
		{
			const refDocument = await (async () =>
			{
				// Is the document already loaded into the graph?
				const existingEntry = this.documents.get(uriText);
				if (existingEntry)
					return existingEntry.document;
				
				// Read the document if it wasn't loaded
				const result = await this.read(uri);
				if (result instanceof Error)
				{
					const fault = X.Faults.UnresolvedResource.create(containingStatement);
					this.program.faults.report(fault);
					return null;
				}
				
				// Return the entry, which should be 
				const newEntry = this.documents.get(uriText);
				if (!newEntry)
					throw X.ExceptionMessage.unknownState();
				
				return newEntry.document;
			})();
			
			if (!refDocument)
				return;
			
			// Bail if a document loaded from HTTP is trying to reference
			// a document located on the file system.
			const srcProto = containingDocument.sourceUri.protocol;
			const dstProto = refDocument.sourceUri.protocol;
			
			if ((srcProto === X.UriProtocol.http || srcProto === X.UriProtocol.https) && 
				dstProto === X.UriProtocol.file)
			{
				const param = X.Faults.InsecureResourceReference.create(containingStatement);
				this.program.faults.report(param);
			}
			
			// Bail if the addition of the reference is going to result in a circular reference.
			if (this.wouldCreateCycles(containingDocument, refDocument))
			{
				const param = X.Faults.CircularResourceReference.create(containingStatement);
				this.program.faults.report(param);
			}
			else
			{
				this.link(containingDocument, refDocument);
			}
			
			this.asyncCount--;
			
			if (this.asyncCount < 0)
				throw X.ExceptionMessage.unknownState();
			
			if (this.asyncCount === 0)
			{
				const waitFns = this.waitFns.slice();
				this.waitFns.length = 0;
				waitFns.forEach(fn => fn());
			}
			
		})(), 0);
	}
	
	/**
	 * An array of functions that should be executed when
	 * all outstanding async operations have completed.
	 */
	private waitFns: (() => void)[] = [];
	
	/**
	 * Counts the number of async operations in progress.
	 */
	private asyncCount = 0;
	
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
	private wouldCreateCycles(proposedFrom: X.Document, proposedTo: X.Document)
	{
		const checkForCyclesRecursive = (current: X.Document) =>
		{
			if (current === proposedFrom)
				return true;
			
			const dependencies = (this.dependencies.get(current) || []).map(d => d.target);
			if (dependencies.length === 0)
				return false;
			
			if (current === proposedFrom)
				dependencies.unshift(proposedTo);
			
			if (dependencies.some(d => checkForCyclesRecursive(d)))
				return true;
			
			return false;
		}
		
		return checkForCyclesRecursive(proposedTo);
	}
	
	/**
	 * Adds a dependency between two documents in the graph.
	 * If a dependency between the two documents already exists,
	 * the reference count of the dependency is incremented.
	 * This method is executed only after other methods have
	 * indicated that the addition of the link will not cause conflict.
	 */
	private link(from: X.Document, to: X.Document)
	{
		const dependencyArray = this.dependencies.get(from);
		if (dependencyArray)
		{
			const dependency = dependencyArray.find(d => d.target === to);
			if (dependency)
				dependency.referenceCount++;
			else
				dependencyArray.push(new Dependency(to));
		}
		else
		{
			this.dependencies.set(from, [new Dependency(to)]);
		}
		
		const dependentArray = this.dependents.get(to);
		if (dependentArray)
		{
			if (!dependentArray.includes(from))
				dependentArray.push(from);
		}
		else
		{
			this.dependents.set(to, [from]);
		}
	}
	
	/**
	 * Removes a dependency between two documents in the graph.
	 * If the reference count of the dependency is greater than 1, the
	 * the reference count is decremented instead of the dependency
	 * being removed completely.
	 */
	private unlink(from: X.Document, to: X.Document)
	{
		const dependencyArray = this.dependencies.get(from);
		if (!dependencyArray)
			return;
		
		const dependencyIdx = dependencyArray.findIndex(d => d.target === to);
		if (dependencyIdx < 0)
			return;
		
		const dependency = dependencyArray[dependencyIdx];
		
		if (dependency.referenceCount > 1)
		{
			dependency.referenceCount--;
		}
		else
		{
			dependencyArray.splice(dependencyIdx);
			
			// Get rid of the entry in the dependencies map
			// completely if the dependency array is now empty.
			if (dependencyArray.length === 0)
				this.dependencies.delete(from);
		}
		
		const dependentArray = this.dependents.get(to);
		if (dependentArray)
		{
			const depIdx = dependentArray.indexOf(from);
			if (depIdx > -1)
				dependentArray.splice(depIdx, 1);
		}
	}
	
	/** 
	 * A map of documents loaded into the graph,
	 * indexed by their URIs.
	 */
	private readonly documents = new Map<string, IDocumentEntry>();
	
	/**
	 * A map of each document's dependencies.
	 */
	private readonly dependencies = new Map<X.Document, Dependency[]>();
	
	/**
	 * A map of the documents that depend on each document.
	 */
	private readonly dependents = new Map<X.Document, X.Document[]>();
	
	/** */
	private readonly program: X.Program;
	
	/**
	 * Converts the contents of this DocumentGraph to a 
	 * string representation, useful for testing purposes.
	 */
	toString()
	{
		const lines: string[] = [];
		
		for (const [uriText, entry] of this.documents)
		{
			const uri = X.Uri.parse(uriText);
			const doc = entry.document;
			
			if (!uri)
				throw X.ExceptionMessage.unknownState();
			
			lines.push(uri.toString());
			lines.push("\tDependencies");
			
			const docDependencies = this.dependencies.get(doc);
			if (docDependencies)
			{
				if (docDependencies.length)
				{
					for (const dependency of docDependencies)
						lines.push("\t\t" + dependency.target.sourceUri.toString());
				}
				else lines.push("\t\t(none)");
			}
			else lines.push("\t\t(undefined)");
			
			lines.push("\tDependents");
			
			const docDependents = this.dependents.get(doc);
			if (docDependents)
			{
				if (docDependents.length)
				{
					for (const docDependent of docDependents)
						lines.push("\t\t" + docDependent.sourceUri.toString());
				}
				else lines.push("\t\t(none)");
			}
			else lines.push("\t\t(undefined)");
			
			lines.push("");
		}
		
		return lines.slice(0, -1).join("\n");
	}
}


/**
 * 
 */
interface IDocumentEntry
{
	header: X.DocumentHeader;
	document: X.Document;
}


/**
 * A class that stores information about a dependency 
 * between documents.
 */
class Dependency
{
	constructor(readonly target: X.Document) { }
	
	referenceCount = 0;
}
