import * as X from "../X";


/**
 * A class that manages the diagnostics that have been 
 * reported for the current state of the program.
 */
export class FaultService
{
	/** */
	constructor(private readonly program: X.Program)
	{
		// Listen for invalidations and clear out any faults
		// that correspond to objects that don't exist in the
		// document anymore.
		program.hooks.Invalidate.capture(hook =>
		{
			if (hook.parents.length > 0)
			{
				for (const smt of hook.parents)
					for (const { statement } of smt.document.eachDescendant(smt, true))
						this.removeStatementFaults(statement);
			}
			else for (const { statement } of hook.document.eachDescendant())
				this.removeStatementFaults(statement);
			
			this.inEditTransaction = true;
		});
		
		program.hooks.EditComplete.capture(hook =>
		{
			this.inEditTransaction = false;
			this.refresh();
		});
	}
	
	/** */
	private inEditTransaction = false;
	
	/**
	 * Removes all faults associated with the specified statement.
	 */
	private removeStatementFaults(statement: X.Statement)
	{
		this.bufferFrame.removeSource(statement);
		
		for (const span of statement.allSpans)
			this.bufferFrame.removeSource(span);
		
		for (const infixSpan of statement.infixSpans)
			this.bufferFrame.removeSource(infixSpan);
	}
	
	/**
	 * Enumerates through the unrectified faults retained
	 * by this FaultService.
	 */
	*each()
	{
		const faultsSorted = 
			Array.from(this.asyncFrame.faults.values())
				.concat(Array.from(this.visibleFrame.faults.values()))
				.map(faultMap => Array.from(faultMap.values()))
				.reduce((a, b) => a.concat(b), [])
				.sort((a, b) => a.line - b.line);
		
		for (const fault of faultsSorted)
			yield fault;
	}
	
	/**
	 * Gets a number representing the number of
	 * unrectified faults retained by this FaultService.
	 */
	get count()
	{
		return this.visibleFrame.faults.size;
	}
	
	/**
	 * Reports a fault. If a similar Fault on the same area
	 * of the document hasn't been reported, the method
	 * runs the FaultReported hook.
	 */
	report(fault: X.Fault)
	{
		this.bufferFrame.addFault(fault);
	}
	
	/**
	 * Reports a fault outside the context of an edit transaction.
	 * This method is to be used for faults that are reported in
	 * asynchronous callbacks, such as network errors.
	 */
	reportAsync(fault: X.Fault)
	{
		this.bufferFrame.addFault(fault);
		
		if (!this.inEditTransaction)
			this.refresh();
	}
	
	/**
	 * @returns A boolean value indicating whether this
	 * FaultService retains a fault that is similar to the specified
	 * fault (meaning that it has the same code and source).
	 */
	has(similarFault: X.Fault)
	{
		for (const retainedFault of this.each())
			if (retainedFault.type.code === similarFault.type.code)
				if (retainedFault.source === similarFault.source)
					return true;
		
		return false;
	}
	
	/**
	 * @returns An array of Fault objects that have been reported
	 * at the specified source. If the source has no faults, an empty
	 * array is returned.
	 */
	check<TSource extends object>(source: TSource): X.Fault<TSource>[]
	{
		const out: X.Fault<TSource>[] = [];
		
		for (const retainedFault of this.each())
			if (retainedFault.source === source)
				out.push(<X.Fault<TSource>>retainedFault);
		
		return out;
	}
	
	/**
	 * @internal
	 * Used internally to inform the FaultService that type-level fault
	 * analysis is being done on the provided Node. This is necessary
	 * because type-level faults do not live beyond a single edit frame,
	 * so the FaultService needs to know which Nodes were analyzed
	 * so that newly rectified faults can be cleared out.
	 * 
	 * When this method is called, any the faults corresponding to the
	 * specified Node are cleared out, and are only added back in if
	 * they were re-detected during this edit transaction.
	 */
	inform(node: X.Node)
	{
		const spans = node.statements
			.filter(smt => !smt.isDisposed)
			.map(smt => smt.spans)
			.reduce((a, b) => a.concat(b), []);
		
		for (const span of spans)
			this.bufferFrame.removeSource(span);
		
		const infixes = node.statements
			.map(smt => smt.infixSpans || [])
			.reduce((a, b) => a.concat(b), []);
		
		for (const infix of infixes)
			this.bufferFrame.removeSource(infix);
	}
	
	/**
	 * @internal
	 */
	refresh()
	{
		const faultsAdded: X.Fault[] = [];
		const faultsRemoved: X.Fault[] = [];
		
		for (const [faultSource, map] of this.bufferFrame.faults)
			for (const [code, fault] of map)
				if (!this.visibleFrame.hasFault(fault))
					faultsAdded.push(fault);
		
		for (const [faultSource, map] of this.visibleFrame.faults)
			for (const [code, fault] of map)
				if (!this.bufferFrame.hasFault(fault))
					faultsRemoved.push(fault);
		
		this.visibleFrame = this.bufferFrame;
		this.bufferFrame = this.bufferFrame.clone();
		
		if (faultsAdded.length + faultsRemoved.length > 0)
		{
			const faultParam = new X.FaultParam(
				faultsAdded,
				faultsRemoved);
			
			this.program.hooks.FaultsChanged.run(faultParam);
		}
	}
	
	/**
	 * Stores the faults that are presented to external consumers
	 * of the fault service when they use the accessor methods.
	 */
	private visibleFrame = new FaultFrame();
	
	/**
	 * Stores the faults that have been built up during an edit transaction.
	 * These faults are copied to the `visibleFrame` when the edit
	 * transaction completes.
	 */
	private bufferFrame = new FaultFrame();
	
	/**
	 * Stores the faults that were reported asynchronously, and therefore
	 * are not bound to any edit transaction.
	 */
	private asyncFrame = new FaultFrame();
}


/**
 * 
 */
class FaultFrame
{
	/** */
	clone()
	{
		const newFrame = new FaultFrame();
		
		for (const [faultSource, existingMap] of this.faults)
		{
			const newMap: TFaultMap = new Map();
			
			for (const [code, fault] of existingMap)
				newMap.set(code, fault);
			
			newFrame.faults.set(faultSource, newMap);
		}
		
		return newFrame;
	}
	
	/**  */
	addFault(fault: X.Fault)
	{
		const faultsForSource = this.faults.get(fault.source);
		if (faultsForSource)
		{
			faultsForSource.set(fault.type.code, fault);
		}
		else
		{
			const map: TFaultMap = new Map();
			map.set(fault.type.code, fault);
			this.faults.set(fault.source, map);
		}
	}
	
	/** */
	removeSource(source: X.TFaultSource)
	{
		this.faults.delete(source);
		
		if (source instanceof X.Statement)
			for (const cruftObject of source.cruftObjects)
				this.faults.delete(cruftObject);
	}
	
	/** */
	removeFault(fault: X.Fault)
	{
		const faultsForSource = this.faults.get(fault.source);
		if (faultsForSource)
			faultsForSource.delete(fault.type.code);
	}
	
	/** */
	hasFault(fault: X.Fault)
	{
		const faultsForSource = this.faults.get(fault.source);
		return faultsForSource ?
			faultsForSource.has(fault.type.code) :
			false;
	}
	
	/**
	 * A doubly-nested map of fault sources, fault codes, and the actual fault.
	 */
	readonly faults = new Map<X.TFaultSource, TFaultMap>();
}

type TFaultMap = Map<number, X.Fault>;
