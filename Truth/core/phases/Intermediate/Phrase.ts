
namespace Truth
{
	/**
	 * A chain of Subjects that form a path to a particular
	 * location within a Document.
	 * 
	 * The lifetime of a Phrase is pinned (directly or indirectly)
	 * to the lifetime of a Document. A Document object as a
	 * reference to a root-level Phrase, and Phrase objects are
	 * then store references to their nested Phrase children.
	 */
	export class Phrase extends AbstractClass
	{
		/**
		 * @internal
		 * Creates a new root phrase.
		 */
		static new(containingDocument: Document)
		{
			return new Phrase(null, containingDocument, [], "");
		}
		
		/**
		 * @internal
		 */
		static destroyRecursive(root: Document | readonly Statement[])
		{
			if (root instanceof Document)
			{
				debugger;
				throw new Error("This probably shouldn't be available.");
			}
			
			for (const span of this.enumerate(root))
				for (const phrase of Phrase.fromSpan(span))
					phrase.deflate(span);
			
			/*
			// This algorithm creates a list of phrases whose context
			// should be disposed, sorted in an order that would like this:
			// 
			// A/B/C
			// A/B/D
			// A/B
			// A
			// X/Y/Z
			// X/Y/W
			// X/Y
			phrases.sort((a, b) =>
			{
				if (b.length !== a.length)
					return b.length - a.length;
				
				for (let i = -1; ++i < a.length;)
				{
					const idA = a.subjects[i].id;
					const idB = b.subjects[i].id;
					
					if (idA !== idB)
						return idB - idA;
				}
				
				return 0;
			});
			
			for (const phrase of phrases)
				phrase.dispose();
			*/
		}
		
		/**
		 * @internal
		 */
		static createRecursive(statements: readonly Statement[])
		{
			for (const span of this.enumerate(statements))
				for (const phrase of Phrase.fromSpan(span))
					phrase.inflate(span);
		}
		
		/** */
		private static *enumerate(statements: readonly Statement[])
		{
			if (statements.length === 0)
				return;
			
			const doc = statements[0].document;
			const visted = new Set<Statement>();
			
			for (const paramStatement of statements)
			{
				for (const { statement } of doc.eachDescendant(paramStatement, true))
				{
					if (visted.has(statement))
						continue;
					
					for (const span of statement.declarations)
						yield span;
					
					visted.add(statement);
				}
			}
		}
		
		/**
		 * @internal
		 * Returns all Phrase objects that are terminated by the specified Span.
		 * The phrases are created and added to the internal forwarding table
		 * in the case when they're missing.
		 */
		static fromSpan(span: Span)
		{
			const phrases: Phrase[] = [];
			const root = span.statement.document.phrase;
			
			for (const spine of span.spines)
			{
				let current = root;
				
				for (const spineSpan of spine)
				{
					if (spineSpan.isCruftMarker)
						continue;
					
					const clarifiers = spineSpan.statement.annotations
						.map(span => span.boundary.subject)
						.filter((subject): subject is Term => subject instanceof Term);
					
					const clarifierKey = clarifiers.length === 0 ?
						"" :
						clarifiers
							.map(t => t.id)
							.sort((a, b) => a - b)
							.join();
					
					const subject = spineSpan.boundary.subject;
					current = 
						current.forwardings.get(subject, clarifierKey) ||
						new Phrase(current, spineSpan, clarifiers, clarifierKey);
				}
				
				if (current !== root)
					phrases.push(current);
			}
			
			return phrases;
		}
		
		/**
		 * Finds a possible Phrase object, which is identified by an phrase path
		 * string.
		 * 
		 * @returns The existing Phrase found at the phrase path specified, or
		 * null in the case when the path specified refers to a non-existent
		 * phrase, to the path refers to a Phrase that has cruft somewhere in
		 * it's ancestry.
		 */
		static fromPath(
			containingDocument: Document,
			encodedPhrasePath: string): Phrase | null
		{
			debugger;
			return null;
		}
		
		/**
		 * @returns The existing Phrase found at the phrase path specified, or
		 * null in the case when the path specified refers to a non-existent
		 * phrase, to the path refers to a Phrase that has cruft somewhere in
		 * it's ancestry.
		 */
		static fromPathComponents(
			containingDocument: Document,
			pathComponents: string[]): Phrase | null
		{
			// This is going to require clarifiers in the case when there are homographs.
			debugger;
			return null;
		}
		
		/**
		 * @internal
		 * Iterates through the first-level phrases of the specified document,
		 * skipping over the phrases that don't have an associated node.
		 */
		static *rootsOf(document: Document): IterableIterator<Phrase>
		{
			for (const [subject, clarifier, phrase] of document.phrase.forwardings)
				yield phrase;
		}
		
		/** */
		private constructor(
			parent: Phrase | null,
			inflator: Document | Span,
			/**
			 * Stores the list of terms that exist on the right-side of the
			 * statement (or statements) that caused this Phrase to come
			 * into being.
			 */
			readonly clarifiers: readonly Term[],
			/**
			 * Stores a string that can be used as a hash that corresponds
			 * to a unique set of clarifier terms.
			 */
			readonly clarifierKey: string)
		{
			super();
			this.parent = parent || this;
			this.length = this.parent === this ? 0 : this.parent.length + 1;
			
			this.containingDocument = inflator instanceof Document ? 
				inflator : 
				inflator.statement.document;
			
			this.terminal = inflator instanceof Document ?
				Term.void :
				inflator.boundary.subject;
			
			if (parent)
				parent.forwardings.set(this.terminal, clarifierKey, this);
		}
		
		/** */
		readonly class = Class.phrase;
		
		/**
		 * Stores a reference to the Phrase object that contains exactly one
		 * less term than this one (from the end). In the case when the Phrase
		 * is root-level, this field stores a self-reference.
		 */
		readonly parent: Phrase;
		
		/**
		 * Stores a reference to the Document that ultimately
		 * contains this Phrase.
		 */
		readonly containingDocument: Document;
		
		/**
		 * Gets a read-only array of Statement objects from which this Phrase
		 * is composed.
		 */
		get statements()
		{
			if (this._statements !== null)
				return this._statements;
			
			const statements = new Set<Statement>();
			
			for (const span of this.inflatingSpans)
				statements.add(span.statement);
			
			return this._statements = Array.from(statements);
		}
		private _statements: readonly Statement[] | null = null;
		
		/**
		 * Stores the subject that exists at the end of this phrase.
		 */
		readonly terminal: Subject;
		
		/**
		 * Stores the number of subjects in this Phrase. This value
		 * is equivalent to the length of this Phrase's ancestry. 
		 */
		readonly length: number;
		
		/**
		 * Stores a table of nested phrases, keyed in 2 dimensions, firstly by the
		 * Phrases terminating subject, and secondly by the Phrase's clarifierKey,
		 * (a hash of the phrase's associated annotations).
		 */
		private readonly forwardings = new Map3D<Subject, string, Phrase>();
		
		/**
		 * 
		 */
		private inflate(span: Span)
		{
			this.inflatingSpans.add(span);
		}
		
		/**
		 * 
		 */
		private deflate(span: Span)
		{
			this.inflatingSpans.delete(span);
			if (this.inflatingSpans.size === 0)
				this.dispose();
		}
		
		private readonly inflatingSpans = new Set<Span>();
		
		/**
		 * @internal
		 * Gets a number that indicates the number of Spans that are contributing
		 * the necessary existence of the Phrase.
		 */
		get inflationSize()
		{
			return this.inflatingSpans.size;
		}
		
		/**
		 * Returns a reference to the phrase that is 1 subject shorter than
		 * this one (counting from the end).
		 */
		back()
		{
			return this.parent || this;
		}
		
		/**
		 * Returns a reference to the phrase that is extended by the subject specified,
		 * in the case when such a phrase has been added to the internal forwarding
		 * table.
		 */
		peek(subject: Subject): Phrase[];
		peek(subject: Subject, clarifierKey: string): Phrase | null;
		peek(subject: Subject, clarifierKey?: string)
		{
			return clarifierKey === void 0 ?
				this.forwardings.get(subject) :
				this.forwardings.get(subject, clarifierKey) || null;
		}
		
		/**
		 * Returns a reference to the phrase that is extended by the array of subjects
		 * specified, or null in the case when the subject path specified does not exist
		 * in the internal forwarding table.
		 */
		peekDeep(path: readonly (string | Subject)[])
		{
			// This method needs some way to perform clarifiers.
			
			let current: Phrase = this;
			
			for (const item of path)
			{
				const subject = typeof item === "string" ? Term.from(item) : item;
				const peeked = current.peek(subject, "");
				if (peeked === null)
					return null;
				
				current = peeked;
			}
			
			return current;
		}
		
		/**
		 * 
		 */
		*eachDescendant()
		{
			function *recurse(phrase: Phrase): IterableIterator<Phrase>
			{
				yield phrase;
				
				for (const [subject, clarifier, subPhrase] of phrase.forwardings)
					yield* recurse(subPhrase);	
			}
			
			yield* recurse(this);
		}
		
		/**
		 * Gets an array containing the subjects that compose this phrase.
		 * Note that if only the number of subjects is required, the .length
		 * field should be used instead.
		 */
		get subjects()
		{
			return this._subjects ?
				this._subjects :
				this._subjects = this.ancestry.map(ph => ph.terminal);
		}
		private _subjects: readonly Subject[] | null = null;
		
		/**
		 * Gets an array of Phrase objects that form a path leading to this Phrase.
		 * For example, if the subjects of this Phrase were to serialize to something
		 * like AA / BB / CC, then this property would store an array of 3 Phrases,
		 * which would serialize to:
		 * ```
		 * AA
		 * AA / BB
		 * AA / BB / CC
		 * ```
		 * Note that if only the length of the phrase is required, the .length
		 * field should be used instead.
		 */
		get ancestry(): Phrase[]
		{
			if (this._ancestry === null)
			{
				this._ancestry = [];
				let current: Phrase = this;
				
				// The ancestry never includes the 0-length phrase
				// attached to a document, and always includes itself.
				while (current.length > 0)
				{
					this._ancestry.unshift(current);
					current = current.parent;
				}
			}
			
			return this._ancestry;
		}
		private _ancestry: (Phrase[] | null) = null;
		
		/**
		 * @internal
		 * For reasons related to performance and architectural simplicity,
		 * a reference to the Node to which this Phrase is associated is
		 * stored here. This is so that we can avoid managing a separate
		 * index to manage the relationship between these two objects.
		 * Phrases are created before their associated Node, and so in this
		 * case, this field is null.
		 * 
		 * This field should only be assigned from within the Node class.
		 */
		associatedNode: Node | null = null;
		
		/**
		 * @internal
		 * Gets a text representation of this Node's subject,
		 * for debugging purposes only.
		 */
		get name()
		{
			return SubjectSerializer.forInternal(this.terminal);
		}
		
		/**
		 * 
		 */
		get container()
		{
			debugger;
			return this.parent;
		}
		
		/**
		 * In the case when this PhraseContext is a direct descendent of a
		 * another PhraseContext that represents a pattern, and that pattern
		 * has population infixes, and this PhraseContext directly corresponds
		 * to one of those infixes, this property gets a reference to said
		 * corresponding infix.
		 */
		get containerInfix()
		{
			const flag = InfixFlags.population;
			
			if (this.container?.terminal instanceof Pattern)
				for (const nfx of this.container.terminal.getInfixes(flag))
					if (nfx.lhs.length > 0)
						return nfx;
			
			return null;
		}
		
		/** */
		get isListIntrisic()
		{
			return this.terminal instanceof Term && this.terminal.isList;
		}
		
		/**
		 * Gets whether this Phrase has been explicitly defined as a list extrinsic.
		 * It is worth noting that this property in and of itself is not sufficient to
		 * determine whether any corresponding type is actually a list (full type
		 * analysis is required to draw this conclusion).
		 */
		get isListExtrinsic()
		{
			return this.clarifiers.some(term => term.isList);
		}
		
		/**
		 * Gets an array of Forks that connect this Phrase to others, through
		 * the annotations 
		 */
		get outbounds()
		{
			if (this._outbounds !== null)
				return this._outbounds;
			
			const forks: Fork[] = [];
			const globalAncestry = this.ancestry.slice();
			
			for (const doc of this.containingDocument.traverseDependencies())
				globalAncestry.unshift(doc.phrase);
			
			for (const term of this.clarifiers)
			{
				const successors: Phrase[] = [];
				
				for (const ancestorPhrase of this.ancestry)
				{
					const phrases = ancestorPhrase.peek(term);
					successors.unshift(...phrases);
				}
				
				forks.push(new Fork(this,  successors));
			}
			
			return this._outbounds = forks;
		}
		private _outbounds: Fork[] | null = null;
		
		/**
		 * @internal
		 * Performs a non-recursive disposal of the stored information in this phrase.
		 */
		dispose()
		{
			if (this.parent === this)
				throw Exception.unknownState();
			
			this.parent.forwardings.delete(this.terminal, this.clarifierKey);
			this._outbounds = null;
			this._ancestry = null;
			this._subjects = null;
			this._statements = null;
		}
		
		/**
		 * Returns a string representation of this Phrase, suitable for debugging purposes.
		 */
		toString(includeClarifiers = false)
		{
			const prefix = this.containingDocument.uri.toString() + "//";
			const parts: string[] = [];
			
			for (const phrase of this.ancestry)
			{
				let part = phrase.terminal.toString();
				if (includeClarifiers)
					part += ":" + phrase.clarifierKey;
				
				parts.push(part);
			}
			
			return prefix + parts.join("/");
		}
	}
	
	/**
	 * @internal
	 * A type that describes a Phrase object with a non-null .associatedNode field.
	 */
	export type AssociatedPhrase = Phrase & { readonly associatedNode: Node; };
}
