
namespace Truth
{
	/**
	 * A simple class for handling objects marked as cruft.
	 */
	export class CruftCache
	{
		/** */
		constructor(private readonly program: Program) { }
		
		/**
		 * Adds a fault of the specified type to the internal set,
		 * marks all relevant objects as cruft, and reports the
		 * relevant fault type.
		 */
		add(cruft: TCruft, relevantFaultType: FaultType)
		{
			const faultSources: readonly TFaultSource[] =
				cruft instanceof Node ? cruft.statements : 
				cruft instanceof HyperEdge ? cruft.fragments :
				[cruft];
			
			for (const faultSrc of faultSources)
			{
				const fault = new Fault(relevantFaultType, faultSrc);
				this.program.faults.report(fault);
				this.cruft.add(faultSrc);
			}
			
			this.cruft.add(cruft);
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
	export type TCruft = TFaultSource | Node | HyperEdge;
}
