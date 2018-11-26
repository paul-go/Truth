import * as X from "./X";


/**
 * 
 */
export class Fragmenter
{
	/**
	 * @internal
	 * Test-only field used to disable the functions of the Fragmenter.
	 */
	static disabled: boolean | null;
	
	/** */
	constructor(private readonly program: X.Program)
	{
		if (Fragmenter.disabled)
			return;
		
		program.documents.each()
			.forEach(this.handleDocumentAdded.bind(this));
		
		program.hooks.DocumentCreated.capture(hook =>
		{
			this.handleDocumentAdded(hook.document);
		});
		
		program.hooks.DocumentDeleted.capture(hook =>
		{
			this.handleDocumentRemoved(hook.document);
		});
		
		program.hooks.Invalidate.capture(hook =>
		{
			const spans: X.Span[] = [];
			
			hook.parents.forEach(statement =>
				spans.push(...statement.declarations));
			
			for (const span of spans)
				this.unstoreSpan(span);
		});
		
		program.hooks.Revalidate.capture(hook =>
		{
			for (const statement of hook.parents)
				this.storeStatement(statement);
		});
	}
	
	/**
	 * Updates contents of the Fragmenter to include the 
	 * contents of the specified document.
	 */
	private handleDocumentAdded(doc: X.Document)
	{
		for (const statement of doc.getChildren())
			this.storeStatement(statement);
	}
	
	/**
	 * Updates contents of the Fragmenter to exclude the
	 * contents of the specified document.
	 */
	private handleDocumentRemoved(doc: X.Document)
	{
		for (const { statement } of doc.eachDescendant())
			for (const decl of statement.declarations)
				this.fragmentFinder.delete(decl);
		
		this.documents.delete(doc);
	}
	
	/**
	 * Performs a query on the Fragmenter.
	 * @returns A Strand, or null in the case
	 * when the URI specified doesn't map to a populated 
	 * location in the document.
	 */
	query(uri: X.Uri): X.Strand | null
	{
		return this.queryInner(uri, false);
	}
	
	/** */
	queryContents(uri: X.Uri): X.Strand[]
	{
		return this.queryInner(uri, true);
	}
	
	/** */
	private queryInner(uri: X.Uri, queryContents: true): X.Strand[];
	private queryInner(uri: X.Uri, queryContents: false): X.Strand | null;
	private queryInner(uri: X.Uri, queryContents: boolean): X.Strand[] | X.Strand | null
	{
		const typePathNames = uri.typePath.slice();
		if (typePathNames.length === 0)
			return null;
		
		const containingDoc = this.program.documents.get(uri);
		if (!containingDoc)
			return null;
		
		const rootFragment = this.documents.get(containingDoc);
		if (!rootFragment)
			return null;
		
		// Stores the base sequence of molecules that will be returned
		// in all Strands, whether a single Strand is being generated,
		// or multiple Strands (querying contents).
		const baseMolecules: X.Molecule[] = [];
		
		// Stores an array of fragment arrays. Each fragment array
		// is constructed by taking the tip fragment array, and querying
		// it's localDictionary for fragments whose subject matches 
		// the following segment in typePathSegments. These fragments
		// are then merged together into a single array, and added to
		// the stack. The process continues until all segments in the
		// typePath have been visited.
		let currentFragments = [rootFragment];
		
		for (const name of typePathNames)
		{
			const subject = new X.Subject(name);
			const spans = new Set<X.Span>();
			const nextFragments: Fragment[] = [];
			
			for (const currentFragment of currentFragments)
			{
				// If there were no fragments found at the current location
				// in the type path, the location specified is "unpopulated",
				// so null is returned.
				const nextFragments = currentFragment.localDictionary.get(name);
				if (nextFragments)
					nextFragments.push(...nextFragments);
			}
			
			if (nextFragments.length === 0)
				return null;
			
			for (const fragment of nextFragments)
				if (fragment.associatedSpan)
					spans.add(fragment.associatedSpan);
			
			const atom = new X.Atom(subject, Array.from(spans));
			const molecule = this.translateAtomToMolecule(atom);
			baseMolecules.push(molecule);
			
			currentFragments = nextFragments;
		}
		
		if (queryContents)
		{
			const strands: X.Strand[] = [];
			
			for (const fragment of currentFragments)
			{
				for (const [name, fragments] of fragment.localDictionary)
				{
					const subject = new X.Subject(name);
					const spans = <X.Span[]>fragments
						.map(frag => frag.associatedSpan)
						.filter(span => !!span);
					
					const tipAtom = new X.Atom(subject, spans);
					const tipMolecule = this.translateAtomToMolecule(tipAtom);
					strands.push(new X.Strand(baseMolecules.concat(tipMolecule)));
				}
			}
			
			return strands;
		}
		
		return new X.Strand(baseMolecules);
	}
	
	/**
	 * Translates a declaration-side atom, by collecting it's 
	 * corresponding annotation-side atoms and packaging
	 * it into a Molecule object.
	 */
	private translateAtomToMolecule(atom: X.Atom)
	{
		const annotations = atom.spans
			.map(span => span.statement)
			.filter((stmt, idx, array) => array.indexOf(stmt) < idx)
			.map(stmt => stmt.annotations)
			.reduce((accum, span) => accum.concat(span));
		
		// Organize the annotations by subject
		const subjectSpanMap = new X.MultiMap<string, X.Span>();
		for (const annotation of annotations)
			subjectSpanMap.add(annotation.subject.toString(), annotation);
		
		const referencedAtoms: X.Atom[] = [];
		for (const [subjectText, spans] of subjectSpanMap)
			referencedAtoms.push(new X.Atom(new X.Subject(subjectText), spans));
		
		return new X.Molecule(atom, referencedAtoms);
	}
	
	/**
	 * Stores the declarations of the specified statement, and
	 * all of the declarations in it's descendant statements in
	 * the internal caches.
	 * 
	 * The statement object specified in the storeTarget parameter
	 * is expected to not be stored in the internal caches.
	 */
	private storeStatement(storeTarget: X.Statement)
	{
		const containingDoc = storeTarget.document;
		const storeTargetParent = containingDoc.getParent(storeTarget);
		
		if (!storeTargetParent)
			throw X.ExceptionMessage.unknownState();
		
		// Stores an array of fragment arrays. The array is a projection
		// of the visited statement ancestry stack that the following
		// looping pattern builds up and down. Each fragment array
		// represents the fragments that are related to a statement
		// in the ancestry.
		const fragmentArrayAncestry: Fragment[][] = [];
		
		// If the storeTarget is top level, the behavior of the storing
		// algorithm differs slightly from the behavior when dealing 
		// with nested statements. So we deal with it first (if required)
		// before moving on to the second part.
		if (storeTargetParent instanceof X.Document)
		{
			const rootFragment = this.documents.get(storeTargetParent) || (() =>
			{
				const newFrag = new Fragment();
				this.documents.set(storeTargetParent, newFrag);
				return newFrag;
			})();
			
			fragmentArrayAncestry.push([rootFragment]);
		}
		else
		{
			// Pre-populate the fragmentStack with the 
			// fragments that relate to storeTarget's 
			// containing statement.
			const containingFragments: Fragment[] = [];
			
			for (const declPtr of storeTargetParent.declarations)
			{
				const fragmentsForDecl = this.fragmentFinder.get(declPtr);
				if (fragmentsForDecl)
					containingFragments.push(...fragmentsForDecl);
			}
			
			fragmentArrayAncestry.push(containingFragments);
		}
		
		for (const { statement, level } of containingDoc.eachDescendant(storeTarget, true))
		{
			// Peel back the fragment stack if we're backtracking.
			if (fragmentArrayAncestry.length > level + 1)
				fragmentArrayAncestry.length = level + 1;
			
			// The array of fragments that are used as containers
			// of the new fragments about to be created.
			const fragmentAppendTargets = fragmentArrayAncestry[fragmentArrayAncestry.length - 1];
			
			// An array of fragments that will be built in the upcoming
			// loop, and pushed onto the containingFragment array.
			const fragmentArrayAncestryItem: Fragment[] = [];
			
			for (const declPtr of statement.declarations)
			{
				const declTerm = declPtr.subject.toString();
				
				// Add a new fragment to every containing fragment
				for (const appendTargetFrag of fragmentAppendTargets)
				{
					const newFrag = new Fragment(declPtr, appendTargetFrag);
					appendTargetFrag.addFragment(newFrag);
					appendTargetFrag.incrementLowerDictionary(declTerm);
					fragmentArrayAncestryItem.push(newFrag);
					this.cacheFragment(declPtr, newFrag);
				}
			}
			
			// Push the array of fragments onto the containingFragments
			// stack, so that it is available in the next iteration.
			fragmentArrayAncestry.push(fragmentArrayAncestryItem);
		}
	}
	
	/**
	 * Removes the fragments associated with the specified span
	 * from all internal caches.
	 */
	private unstoreSpan(unstoreTarget: X.Span)
	{
		const fragmentsAtTarget = this.fragmentFinder.get(unstoreTarget);
		if (!fragmentsAtTarget)
			return;
		
		// Zero-length fragment arrays should never be in the fragmentFinder.
		// These should be deleted from the map when the last item is spliced
		// out of the array.
		if (fragmentsAtTarget.length === 0)
			throw X.ExceptionMessage.unknownState();
		
		const term = unstoreTarget.subject.toString();
		
		// Prune all (now invalid) fragments in the fragment tree.
		for (const fragAtTarget of fragmentsAtTarget)
		{
			// Any fragment that is related to a span cannot
			// have a null container, because fragments with
			// null containers always relate to documents.
			if (!fragAtTarget.container)
				throw X.ExceptionMessage.unknownState();
			
			const dict = fragAtTarget.container.localDictionary;
			
			const topLevelFragArray = dict.get(term);
			if (!topLevelFragArray)
				throw X.ExceptionMessage.unknownState();
			
			const fragIdx = topLevelFragArray.indexOf(fragAtTarget);
			if (fragIdx < 0)
				throw X.ExceptionMessage.unknownState();
			
			topLevelFragArray.splice(fragIdx, 1);
			
			if (topLevelFragArray.length === 0)
				dict.delete(term);
		}
		
		// Decrement all the containing dictionaries of
		// all fragments found at the unstoreTarget.
		for (const fragAtTarget of fragmentsAtTarget)
			for (const containingFrag of fragAtTarget.eachContainer())
				containingFrag.decrementLowerDictionary(term);
		
		// Clean out the (now invalid) entries in the fragmentFinder
		const doc = unstoreTarget.statement.document;
		const unstoreStmt = unstoreTarget.statement;
		
		for (const { statement } of doc.eachDescendant(unstoreStmt))
			for (const declaration of statement.declarations)
				this.fragmentFinder.delete(declaration);
		
		this.fragmentFinder.delete(unstoreTarget);
	}
	
	/** */
	private cacheFragment(span: X.Span, fragment: Fragment)
	{
		const array = this.fragmentFinder.get(span);
		array ?
			array.push(fragment) :
			this.fragmentFinder.set(span, [fragment]);
	}
	
	/** */
	private uncacheFragment(span: X.Span, fragment: Fragment)
	{
		const array = this.fragmentFinder.get(span);
		if (array)
		{
			const idx = array.indexOf(fragment);
			if (idx >= 0)
				array.splice(idx, 1);
			
			if (array.length === 0)
				this.fragmentFinder.delete(span);
		}
	}
	
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
	private readonly fragmentFinder = new Map<X.Span, Fragment[]>();
	
	/**
	 * A map of the Document objects loaded into the system,
	 * and the top-level fragment objects to which they map.
	 */
	private readonly documents = new Map<X.Document, Fragment>();
	
	/** 
	 * Converts the contents of the Fragmenter to a string
	 * representation, useful for testing purposes.
	 */
	toString()
	{
		const lines: string[] = [];
		let level = 1;
		
		const fragmentCodeMap = new Map<Fragment, number>();
		let nextCode = 0;
		
		const recurse = (fragment: Fragment) =>
		{
			for (const fragmentArray of fragment.localDictionary.values())
			{
				for (const fragment of fragmentArray)
				{
					const span = fragment.associatedSpan;
					if (!span)
						throw X.ExceptionMessage.unknownState();
					
					const code = ++nextCode;
					fragmentCodeMap.set(fragment, code);
					
					const term = span.subject.toString();
					const indent = "\t".repeat(level);
					lines.push(indent + term + " (" + code + ")");
					
					level++;
					recurse(fragment);
					level--;
				}
			}
		}
		
		for (const [document, fragment] of this.documents)
		{
			lines.push(document.sourceUri.toString());
			recurse(fragment);
		}
		
		lines.push("");
		
		for (const [span, fragments] of this.fragmentFinder)
		{
			const subject = span.subject.toString();
			const codes = fragments.map(f => fragmentCodeMap.get(f)!);
			
			if (codes.some(code => !code))
				throw X.ExceptionMessage.unknownState();
			
			codes.sort((a, b) => a - b);
			lines.push(subject + ` => (${codes.join(", ")})`);
		}
		
		return lines.join("\n");
	}
}


/**
 * Refers to a series of Fragment definitions that all share a
 * common container within the file. The container is a
 * Document in the case when the fragment is root-level,
 * and a Span when the fragment is nested.
 */
class Fragment
{
	/** */
	constructor(
		associatedSpan: X.Span | null = null, 
		container: Fragment | null = null)
	{
		this.container = container;
		this.associatedSpan = associatedSpan;
	}
	
	/**
	 * A reference to the Span object that represents the
	 * location in the document that relates to this fragment.
	 * If this fragment is a root fragment, it is associated with
	 * a document rather than a span, and so the field is null.
	 */
	readonly associatedSpan: X.Span | null;
	
	/**
	 * Stores a reference to the Fragment that contains this one.
	 * If this fragment is a root fragment, it is associated with
	 * a document rather than a span, and so the field is null.
	 */
	readonly container: Fragment | null;
	
	/**
	 * A map of the names of the terms defined in this fragment,
	 * and a reference to the lower-level fragments that sit beneath
	 * them. In the common case, the fragment array will only contain
	 * a single entry. Fragment arrays with multiple entries only exist
	 * in the case when more than one equivalently named subject
	 * exists below a single span.
	 */
	readonly localDictionary = new Map<string, Fragment[]>();
	
	/**
	 * A map of the terms defined beneath this type, 
	 * and the number of times each term is defined.
	 */
	readonly lowerDictionary = new Map<string, number>();
	
	/**
	 * Adds the specified Fragment to the localDictionary.
	 */
	addFragment(fragment: Fragment)
	{
		// Root fragments are never added below others.
		if (!fragment.associatedSpan)
			throw X.ExceptionMessage.unknownState();
			
		const subject = fragment.associatedSpan.subject.toString();
		const existingFragArray = this.localDictionary.get(subject);
		
		if (existingFragArray)
			existingFragArray.push(fragment);
		else
			this.localDictionary.set(subject, [fragment]);
	}
	
	/**
	 * Removes the specified Fragment from the localDictionary.
	 */
	removeFragment(fragment: Fragment)
	{
		// Root fragments are never removed from beneath others.
		if (!fragment.associatedSpan)
			throw X.ExceptionMessage.unknownState();
		
		const subject = fragment.associatedSpan.subject.toString();
		const existingFragArray = this.localDictionary.get(subject);
		
		if (!existingFragArray)
			throw X.ExceptionMessage.unknownState();
		
		const idx = existingFragArray.indexOf(fragment);
		if (idx < 0)
			throw X.ExceptionMessage.unknownState();
		
		existingFragArray.splice(idx, 1);
		
		if (existingFragArray.length === 0)
			this.localDictionary.delete(subject);
	}
	
	/**
	 * Call this function when an instance of a term is added
	 * somewhere in this fragment's subtree.
	 */
	incrementLowerDictionary(term: string)
	{
		const count = this.lowerDictionary.get(term) || 0;
		this.lowerDictionary.set(term, count + 1);
	}
	
	/**
	 * Call this function when an instance of a term is removed
	 * from somewhere in this fragment's subtree.
	 */
	decrementLowerDictionary(term: string)
	{
		const count = this.lowerDictionary.get(term);
		if (count !== undefined)
		{
			count < 2 ?
				this.lowerDictionary.delete(term) :
				this.lowerDictionary.set(term, count - 1);
		}
	}
	
	/**
	 * Enumerates through the containment hierarchy starting
	 * at this Fragment, and working backwards all the way up 
	 * to the root.
	 */
	*eachContainer()
	{
		let currentContainer = this.container;
		
		while (currentContainer)
		{
			yield currentContainer;
			currentContainer = currentContainer.container;
		}
	}
}