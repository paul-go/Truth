
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
			return new Phrase(null, containingDocument, Term.void, 0);
		}
		
		/**
		 * @internal
		 * Finds or creates a Phrase object from the specified Spine.
		 * Returns null in the case when the Spine passes through
		 * statements that have been marked as cruft.
		 */
		static fromSpine(spine: Spine)
		{
			let current = spine.document.phrase;
			
			for (const vert of spine.vertebrae)
			{
				if (!(vert instanceof Span))
					return null;
				
				current = current.forward(vert.boundary.subject);
			}
			
			return current;
		}
		
		/**
		 * @internal
		 * Iterates through the first-level phrases of the specified document,
		 * skipping over the phrases that don't have an associated node.
		 */
		static *rootsOf(document: Document): IterableIterator<AssociatedPhrase>
		{
			for (const phrase of document.phrase.forwardings.values())
				if (phrase.associatedNode !== null)
					yield phrase as AssociatedPhrase;
		}
		
		/** */
		private constructor(
			parent: Phrase | null,
			/**
			 * Stores a reference to the Document that ultimately
			 * contains this Phrase.
			 */
			readonly containingDocument: Document,
			/**
			 * Stores the subject that exists at the end of this phrase.
			 */
			readonly terminal: Subject,
			/**
			 * Stores the number of subjects in this Phrase. This value
			 * is equivalent to the length of this Phrase's ancestry. 
			 */
			readonly length: number)
		{
			super();
			this.parent = parent || this;
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
		 * Returns a reference to the phrase that is 1 subject shorter than
		 * this one (counting from the end).
		 */
		back()
		{
			return this.parent || this;
		}
		
		/**
		 * Returns a reference to the phrase that is extended by the subject specified.
		 */
		forward(subject: Subject)
		{
			return Misc.get(
				this.forwardings,
				subject,
				() => new Phrase(this, this.containingDocument, subject, this.length + 1));
		}
		
		/**
		 * Returns a reference to the phrase that is extended by the array of subjects specified.
		 */
		forwardDeep(path: readonly (string | Subject)[])
		{
			let current: Phrase = this;
			
			for (const item of path)
			{
				const subject = typeof item === "string" ? Term.from(item) : item;
				current = current.forward(subject);
			}
			
			return current;
		}
		
		/** */
		private readonly forwardings = new Map<Subject, Phrase>();
		
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
		 * 
		 * AA
		 * AA / BB
		 * AA / BB / CC
		 * 
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
		 * Returns a string representation of this Phrase, suitable for debugging purposes.
		 */
		toString()
		{
			const uri = this.containingDocument.uri.toString();
			const path = this.subjects.map(sub => sub.toString()).join("/");
			return uri + "//" + path;
		}
		
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
	}
	
	/**
	 * @internal
	 * A type that describes a Phrase object with a non-null .associatedNode field.
	 */
	export type AssociatedPhrase = Phrase & { readonly associatedNode: Node; };
}
