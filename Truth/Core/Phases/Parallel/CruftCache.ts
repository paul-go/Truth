import * as X from "../../X";


/**
 * A simple class for handling objects marked as cruft.
 */
export class CruftCache
{
	/** */
	constructor(private readonly program: X.Program) { }
	
	/**
	 * Adds a fault of the specified type to the internal set,
	 * and marks all relevant objects as cruft.
	 */
	add(source: TCruft, type: X.FaultType)
	{
		const faultSources: ReadonlyArray<X.TFaultSource> =
			source instanceof X.Node ? source.statements : 
			source instanceof X.HyperEdge ? source.sources :
			[source];
		
		for (const fSource of faultSources)
		{
			const fault = new X.Fault(type, fSource);
			this.program.faults.report(fault);
			this.cruft.add(fSource);
		}
		
		this.cruft.add(source);
	}
	
	/**
	 * @returns A boolean value that indicates whether the
	 * specified object has been marked as cruft.
	 */
	has(source: TCruft)
	{
		return this.cruft.has(source);
	}
	
	/** Stores a set of objects that have been marked as cruft. */
	private readonly cruft = new Set<TCruft>();
}


/** */
type TCruft = X.TFaultSource | X.Node | X.HyperEdge;
