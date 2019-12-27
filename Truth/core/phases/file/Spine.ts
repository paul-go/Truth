
namespace Truth
{
	/**
	 * A class that manages an array of Span objects that
	 * represent a specific spine of declarations, starting at
	 * a document, passing through a series of spans,
	 * and ending at a tip span.
	 */
	export class Spine
	{
		/** */
		constructor(vertebrae: (Span | Statement)[])
		{
			if (vertebrae.length === 0)
				throw Exception.invalidCall();
			
			this.vertebrae = vertebrae.map(v =>
			{
				if (v instanceof Span)
					return v;
				
				const existCruftMarker = cruftMarkers.get(v);
				if (existCruftMarker !== undefined)
					return existCruftMarker;
				
				const newCruftMarker = new CruftMarker(v);
				cruftMarkers.set(v, newCruftMarker);
				return newCruftMarker;
			});
			
			const tip = this.vertebrae[vertebrae.length - 1];
			if (tip instanceof CruftMarker)
				throw Exception.invalidCall();
			
			this.tip = tip;
		}
		
		/** Stores the last span in the array of segments. */
		readonly tip: Span;
		
		/** */
		get statement() { return this.tip.statement; }
		
		/** Gets a reference to the document that sits at the top of the spine. */
		get document() { return this.statement.document; }
		
		/** Stores an array of the Spans that compose the Spine. */
		readonly vertebrae: readonly (Span | CruftMarker)[] = [];
	}
	
	/**
	 * A class that acts as a stand-in for a statement that has been
	 * marked as cruft, suitable for usage in a Spine.
	 */
	export class CruftMarker
	{
		/** @internal */
		constructor(readonly statement: Statement) { }
		
		/**
		 * Converts this cruft marker to a string representation,
		 * which is derived from a hash calculated from this
		 * marker's underlying statement.
		 */
		toString()
		{
			return "≈" + Hash.calculate(this.statement.sourceText);
		}
	}
	
	const cruftMarkers = new WeakMap<Statement, CruftMarker>();
}
