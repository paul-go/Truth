
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
			return new Phrase(containingDocument);
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
		 * Returns an array of Phrase objects that refer to the (potentially hypothetical) areas
		 * in a document. The returned array will contain multiple Phrase objects in the case
		 * when the first term in the path is a member of a homograph. In order to restrict the
		 * returned array to a single item, a non-empty array should be provided in the clarifier
		 * argument in order to disambiguate.
		 * 
		 * Returns an empty array in the case when the case when the provided path of subjects
		 * argument is a zero-length array, or the first term in the path refers to a non-existent
		 * area of the target document.
		 * 
		 * Returns a number in the case when a homograph was detected at some point beyond
		 * the first level. The number indicates the index of the path at which the homograph
		 * was detected (this should be considered an error).
		 */
		static fromPathComponents(
			targetDocument: Document,
			path: string[],
			clarifier: string[] = []): Phrase[] | number
		{
			if (path.length === 0)
				return [];
			
			// In order to make this method work with patterns, 
			// pathSubjects needs to be an array of subjects, or there
			// needs to be some easy way to turn these into subjects.
			
			const clarifierKey = this.getClarifierKey(clarifier);
			const pathTerms = path.map(v => Term.from(v));
			const firstTerm = pathTerms.shift()!;
			
			const rootPhrases = clarifierKey ?
				targetDocument.phrase.peek(firstTerm, clarifierKey) :
				targetDocument.phrase.peek(firstTerm);
			
			if (rootPhrases.length === 0)
				return [];
			
			const outPhrases: Phrase[] = [];
			
			for (const rootPhrase of rootPhrases)
			{
				let currentPhrase = rootPhrase;
				
				for (const pathTerm of pathTerms)
				{
					const phrases = currentPhrase.peek(pathTerm);
					
					if (phrases.length === 1)
					{
						currentPhrase = phrases[0];
					}
					else if (phrases.length === 0)
					{
						currentPhrase = new Phrase(currentPhrase, pathTerm);
					}
					else return currentPhrase.length;
				}
				
				outPhrases.push(currentPhrase);
			}
			
			return outPhrases;
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
						.map(span => span.boundary.subject as Term);
					
					const clarifierKey = this.getClarifierKey(clarifiers);
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
		 * Returns a clarification key from the specified set of strings or Terms,
		 * which are annotations in some statement. The clarification key is
		 * a single string of comma-separated terms. For example:
		 * ```
		 * A : B, C
		 * ```
		 * Given the above statement, the clarification key for A would be "B,C".
		 */
		private static getClarifierKey(clarifiers: (string | Term)[])
		{
			return clarifiers.length === 0 ?
				"" :
				clarifiers
					.map(v => v instanceof Term ? v.id : Term.from(v).id)
					.sort((a, b) => a - b)
					.join();
		}
		
		/**
		 * Create a top-level, zero-length Phrase that sits at the root of a document.
		 */
		private constructor(containingDocument: Document)
		/**
		 * Create an L > 0 length Phrase that represents a path to an explicit area of the
		 * document (meaning, an area that isn't explicitly backed by a span).
		 */
		private constructor(parent: Phrase, inflator: Span, clarifiers: Term[], clarifierKey: string)
		/**
		 * Create an L > 0 length Phrase that represents a path to a hypothetical area of the
		 * document (meaning, an area that is suggested to be valid through inheritance).
		 */
		private constructor(parent: Phrase, subject: Subject)
		private constructor(a: Document | Phrase, b?: Span | Subject, c?: Term[], d?: string)
		{
			super();
			
			this.terminal = Term.void;
			this.clarifiers = [];
			this.clarifierKey = "";
			this.isHypothetical = false;
			
			// First overload
			if (a instanceof Document)
			{
				this.containingDocument = a;
				this.parent = this;
				this.length = 0;
			}
			else
			{
				this.containingDocument = a.containingDocument;
				this.parent = a;
				this.length = a.length + 1;
				
				// Second overload
				if (b instanceof Span)
				{
					this.terminal = b.boundary.subject;
					this.clarifiers = c || [];
					this.clarifierKey = d || "";
					this.parent.forwardings.set(this.terminal, this.clarifierKey, this);
					this.inflatingSpans.add(b);
				}
				// Third overload
				else if (b)
				{
					this.isHypothetical = true;
					this.terminal = b;
					// Its important that in the case when we're creating a phrase that
					// refers to a hypothetical area, this phrase isn't added to the
					// forwardings table. These phrases should be seen as transient.
				}
			}
		}
		
		/** */
		readonly class = Class.phrase;
		
		/**
		 * Stores the list of terms that exist on the right-side of the
		 * statement (or statements) that caused this Phrase to come
		 * into being.
		 */
		readonly clarifiers: readonly Term[];
		
		/**
		 * Stores a string that can be used as a hash that corresponds
		 * to a unique set of clarifier terms.
		 */
		readonly clarifierKey: string;
		
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
		 * Stores whether this Phrase represents a path to an hypothetical area of the
		 * document (meaning, an area that is suggested to be valid through
		 * inheritance).
		 */
		readonly isHypothetical: boolean;
		
		/**
		 * Gets a read-only array of Statement objects from which this Phrase
		 * is composed.
		 */
		get statements()
		{
			if (this._statements !== null)
				return this._statements;
			
			if (this.isHypothetical)
				return this._statements = [];
			
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
		peek(subject: Subject, clarifierKey?: string): Phrase[]
		{
			if (clarifierKey === undefined)
				return this.forwardings.get(subject);
			
			const result = this.forwardings.get(subject, clarifierKey);
			return result ? [result] : [];
		}
		
		/**
		 * Returns a reference to the phrase that is extended by the array of subjects
		 * specified, or null in the case when the subject path specified does not exist
		 * in the internal forwarding table.
		 */
		peekDeep(path: readonly (string | Subject)[])
		{
			// This method needs to deal with clarifiers
			debugger;
			
			let current: Phrase = this;
			
			for (const item of path)
			{
				const subject = typeof item === "string" ? Term.from(item) : item;
				const peeked = current.peek(subject, "");
				if (peeked.length !== 1)
					return null;
				
				current = peeked[0];
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
			return Subject.serializeInternal(this.terminal);
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
			
			if (this.isHypothetical)
				throw Exception.invalidOperationOnHypotheticalPhrase();
			
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
