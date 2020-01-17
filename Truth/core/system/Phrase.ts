
namespace Truth
{
	/**
	 * A chain of Subjects that form a path to a particular
	 * location within a Document.
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
			 * 
			 */
			readonly containingDocument: Document,
			/**
			 * 
			 */
			readonly terminal: Subject,
			/**
			 * 
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
		 * 
		 */
		back()
		{
			return this.parent || this;
		}
		
		/**
		 * 
		 */
		forward(subject: Subject)
		{
			return Misc.get(
				this.forwardings,
				subject,
				() => new Phrase(this, this.containingDocument, subject, this.length + 1));
		}
		
		/**
		 * 
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
				this._subjects = this._ancestry.map(ph => ph.terminal);
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
			if (this._ancestry.length === 0)
			{
				let current: Phrase = this;
				
				// If the phrase has no parent, then it's a phrase
				// that is owned by a document with no subjects.
				// These aren't included in the ancestry.
				while (current.parent !== current)
				{
					this._ancestry.unshift(current);
					current = current.parent;
				}
			}
			
			return this._ancestry;
		}
		private _ancestry: Phrase[] = [];
		
		/**
		 * 
		 */
		toString()
		{
			return this.subjects.map(sub => sub.toString()).join("/");
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
