
namespace Truth
{
	/**
	 * @internal
	 * A class that shields access to phrases.
	 * 
	 * Some phrases are non-hypothetical, which means that they're backed by
	 * some physical representation in the document, where as others are not.
	 * Phrases have an internal forwarding table (read about this in the Phrase
	 * class), but these forwarding tables only store non-hypothetical phrases.
	 * 
	 * However, there are times when the system needs to access the forwardings
	 * of a phrase, and get back both the hypothetical and non-hypothetical
	 * phrases.
	 * 
	 * This class therefore stores, and provides abstraction so that accessing
	 * the forwardings of a phrase can return phrases of all kinds, whether
	 * they are hypothetical or non-hypothetical. The lifetime of these
	 * hypothetical phrases are equal to an edit transaction. When the version
	 * of the containing program changes (meaning one of it's documents were
	 * modified), the hypothetical phrases stored here are disposed.
	 */
	export class PhraseProvider
	{
		/** */
		constructor(program: Program)
		{
			this.hypotheticalPhrases = new ContingentMap(program);
			this.hypotheticalSubjects = new ContingentMap(program);
		}
		
		/**
		 * Returns a reference to the phrases that are extended by the subject specified.
		 * In the case when such a phrase has not been added to the internal forwarding
		 * table, a new hypothetical phrase is created and returned in a single-item array.
		 * 
		 * An array must be returned from this method rather than a singular Phrase
		 * object, because the phrase structure may have a submerged homograph.
		 * Although these are invalid, the phrase structure must still be capable of
		 * representing these.
		 */
		forward(target: Parallel, subject: Subject): readonly Phrase[]
		{
			const existingNonHypthetical = target.phrase.peek(subject);
			if (existingNonHypthetical.length > 0)
				return existingNonHypthetical;
			
			const hash = this.createHash(target, subject);
			const existingHypothetical = this.hypotheticalPhrases.get(hash);
			if (existingHypothetical)
				return [existingHypothetical];
			
			const created = Phrase.createHypothetical(target.phrase, subject);
			const doc = target.document;
			this.hypotheticalPhrases.set(hash, created, doc);
			
			const id = target.phrase.id;
			const contents = this.hypotheticalSubjects.get(id);
			
			if (Array.isArray(contents))
				contents.push(subject);
			
			else if (contents === null)
				this.hypotheticalSubjects.set(id, subject, doc);
			
			else
				this.hypotheticalSubjects.set(id, [contents, subject], doc);
			
			return [created];
		}
		
		/**
		 * Yields subjects that correspond to both the hypothetical and 
		 * non-hypothetical phrases that extend from this phrase.
		 */
		*peekSubjects(target: Parallel)
		{
			const yielded = new Set<Subject>();
			
			for (const subject of target.phrase.peekSubjects())
			{
				yielded.add(subject);
				yield subject;
			}
			
			const hypotheticals = this.hypotheticalSubjects.get(target.phrase.id);
			if (hypotheticals)
			{
				if (Array.isArray(hypotheticals))
				{
					for (const subject of hypotheticals)
						if (!yielded.has(subject))
							yield subject;
				}
				else yield hypotheticals;
			}
		}
		
		/**
		 * Creates a JavaScript-compatible hash value composed from
		 * a Parallel and a Subject.
		 */
		private createHash(target: Parallel, subject: Subject)
		{
			return typeof BigInt === "function" ?
				BigInt(target.phrase.id) << BigInt(32) | BigInt(subject.id) :
				target.phrase.id + " " + subject.id;
		}
		
		/**
		 * Stores a map whose keys are a hash value that is composed of a parent
		 * phrase's .id value, and a subject's .id value, and whose values are a phrase
		 * that forwards from the parent phrase by way of the subject.
		 * 
		 * This is a way of compressing what would otherwise have to be a 3-dimensional
		 * data structure into a more efficient 2-dimensional map.
		 */
		private readonly hypotheticalPhrases: PhrasesMapType;
		
		/**
		 * Stores a SetMap whose keys are a phrase's .id value, and whose values
		 * are a set of the subjects that forward from the phrase, or a singlular subject
		 * that forwards from the phrase in the case when there's only one. This is a
		 * memory optimization, because in the vast majority of cases, there will only
		 * be a single subject forwarding from a phrase (multiple subjects would indicate
		 * a homograph). By avoiding boxing the Subject in an array, we can avoid 
		 * unnecessary memory consumption (and therefore GC strain).
		 */
		private readonly hypotheticalSubjects: SubjectsMapType;
	}
	
	type PhrasesMapType = ContingentMap<string | bigint, Phrase>;
	type SubjectsMapType = ContingentMap<number, Subject[] | Subject>;
}
