
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
		/**
		 * Returns a reference to the phrases that are extended by the subject specified.
		 * In the case when such a phrase has not been added to the internal forwarding
		 * table, a new hypothetical phrase is created and returned in a single-item array.
		 * 
		 * An array must be returned from this method rather than a singular Phrase
		 * object, because the phrase structure may have a nested homograph. Although
		 * these are invalid, the phrase structure must still be capable of representing
		 * these.
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
			this.hypotheticalPhrases.set(hash, created);
			this.hypotheticalSubjects.add(target.phrase.id, subject);
			
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
				for (const subject of hypotheticals)
					if (!yielded.has(subject))
						yield subject;
		}
		
		/**
		 * Erases the contents of this PhraseProvider.
		 */
		reset()
		{
			this.hypotheticalPhrases.clear();
			this.hypotheticalSubjects.clear();
		}
		
		/**
		 * Creates a JavaScript-compatible hash value.
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
		private readonly hypotheticalPhrases = new Map<string | bigint, Phrase>();
		
		/**
		 * Stores a SetMap whose keys are a phrase's .id value, and whose values
		 * are a set of the subjects that forward from the phrase.
		 */
		private readonly hypotheticalSubjects = new SetMap<number, Subject>();
	}
}
