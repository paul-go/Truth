import * as X from "../../X";


/**
 * A class that manages an array of Span objects that
 * represent a specific spine of declarations, starting at
 * a document, passing through a series of spans,
 * and ending at a tip span.
 * 
 * In the case when 
 */
export class Spine
{
	/** */
	constructor(vertebrae: (X.Span | X.Statement)[])
	{
		if (vertebrae.length === 0)
			throw X.Exception.invalidCall();
		
		this.vertebrae = vertebrae.map(v =>
		{
			if (v instanceof X.Span)
				return v;
			
			const existCruftMarker = CruftMarkers.get(v);
			if (existCruftMarker !== undefined)
				return existCruftMarker;
			
			const newCruftMarker = new CruftMarker(v);
			CruftMarkers.set(v, newCruftMarker);
			return newCruftMarker;
		});
		
		const tip = this.vertebrae[vertebrae.length - 1];
		if (tip instanceof CruftMarker)
			throw X.Exception.invalidCall();
		
		this.tip = tip;
	}
	
	/** Stores the last span in the array of segments. */
	readonly tip: X.Span;
	
	/** */
	get statement() { return this.tip.statement }
	
	/** Gets a reference to the document that sits at the top of the spine. */
	get document() { return this.statement.document; }
	
	/** Stores an array of the Spans that compose the Spine. */
	readonly vertebrae: ReadonlyArray<X.Span | CruftMarker> = [];
}


/**
 * A class that acts as a stand-in for a statement that has been
 * marked as cruft, suitable for usage in a Spine.
 */
export class CruftMarker
{
	/** @internal */
	constructor(readonly statement: X.Statement) { }
	
	/**
	 * Converts this cruft marker to a string representation,
	 * which is derived from a CRC calculated from this
	 * marker's underlying statement.
	 */
	toString()
	{
		const toLowerCaseChar = (num: number) => 
			String.fromCharCode((num & ((1 << 4) - 1)) + 97) +
			String.fromCharCode((num & ((1 << 8) - 1)) + 97) +
			String.fromCharCode((num & ((1 << 12) - 1)) + 97) +
			String.fromCharCode((num & ((1 << 16) - 1)) + 97);
		
		const crc = X.Crc.calculate(this.statement.sourceText, Number);
		return "≈" + crc.map(num => toLowerCaseChar(num)).join("");
	}
}

const CruftMarkers = new WeakMap<X.Statement, CruftMarker>();
