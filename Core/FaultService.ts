import * as X from "./X";


/**
 * A class that manages the diagnostics that have been 
 * reported for the current state of the program.
 */
export class FaultService
{
	/** */
	constructor(private readonly program: X.Program)
	{
		program.hooks.Invalidate.capture(hook =>
		{
			this.inEditTransaction = true;
			this.activeContext.invalidatedParents.push(...hook.parents);
		});
		
		program.hooks.EditComplete.capture(hook =>
		{
			this.inEditTransaction = false;
			this.broadcastReports();
		});
	}
	
	/**
	 * Reports a fault. If a similar Fault on the same area
	 * of the document hasn't been reported, the method
	 * runs the FaultReported hook.
	 */
	report(fault: X.Fault)
	{
		this.activeContext.reportFrame.addFault(fault);
		
		// If we're not currently in an edit transaction, the fault
		// is attempted to be broadcasted immediately.
		if (!this.inEditTransaction)
			this.broadcastReports();
	}
	
	/**
	 * Gets a number representing the number of
	 * unrectified faults retained by this FaultService.
	 */
	get count()
	{
		return this.activeContext.frozenFrame.faults.size;
	}
	
	/**
	 * @returns A boolean value indicating whether this
	 * FaultService retains a fault that is similar to the specified
	 * fault (meaning that it has the same code and source).
	 */
	has(similarFault: X.Fault)
	{
		for (const retainedFault of this.each())
			if (retainedFault.code === similarFault.code)
				if (retainedFault.source === similarFault.source)
					return true;
		
		return false;
	}
	
	/**
	 * Enumerates through the unrectified faults retained
	 * by this FaultService.
	 */
	*each()
	{
		for (const faults of this.activeContext.frozenFrame.faults.values())
			for (const fault of faults.values())
				yield fault;
	}
	
	/**
	 * Broadcasts all reports stored in activeContext, 
	 * and creates a new activeContext.
	 */
	private broadcastReports()
	{
		const finalizeResult = this.activeContext.finalize();
		
		const createParam = (fault: X.Fault) =>
		{
			const doc = (() =>
			{
				if (fault.source instanceof X.Statement)
					return fault.source.document;
				
				if (fault.source instanceof X.Pointer)
					return fault.source.statement.document;
				
				throw X.ExceptionMessage.unknownState();
			})();
			
			return new X.FaultParam(doc, fault);
		}
		
		for (const faults of finalizeResult.removed.faults.values())
			for (const fault of faults.values())
				this.program.hooks.FaultRectified.run(createParam(fault));
		
		for (const faults of finalizeResult.added.faults.values())
			for (const fault of faults.values())
				this.program.hooks.FaultReported.run(createParam(fault));
		
		this.activeContext = new FaultFrameContext(finalizeResult.nextFrozen);
	}
	
	/** */
	private inEditTransaction = false;
	
	/**
	 * A rolling, mutable field that is used as the build target of the
	 * faults found in the current frame.
	 */
	private activeContext = new FaultFrameContext();
}


/**
 * 
 */
class FaultFrameContext
{
	/** */
	constructor(frozenFrame?: FaultFrame)
	{
		if (frozenFrame)
			this.frozenFrame = frozenFrame;
	}
	
	/** */
	finalize()
	{
		const negativeFaultFrame = new FaultFrame();
		
		for (const invalidatedParent of this.invalidatedParents)
		{
			const containingDoc = invalidatedParent.document;
			const iter = containingDoc.visitDescendants(invalidatedParent, true);
			
			for (const { level, statement } of iter)
			{
				const faultsForStatement = this.frozenFrame.faults.get(statement);
				
				// Copy the found faults over to the negativeFaultFrame
				if (faultsForStatement)
					for (const fault of faultsForStatement.values())
						negativeFaultFrame.addFault(fault);
			}
		}
		
		const positiveFaultFrame = new FaultFrame();
				
		// Go through the reportFrame. When we find something
		// that was reported that exists in negativeFaultFrame, it's
		// removed from it. If it isn't in negativeFaultFrame, it's
		// added to the positiveFaultFrame.
		
		for (const [source, faults] of this.reportFrame.faults)
		{
			const negFaultsForSource = negativeFaultFrame.faults.get(source);
			if (negFaultsForSource)
			{
				for (const fault of faults.values())
				{
					negativeFaultFrame.hasFault(fault) ?
						negativeFaultFrame.removeFault(fault) :
						positiveFaultFrame.addFault(fault);
				}
			}
			else for (const fault of faults.values())
				positiveFaultFrame.addFault(fault);
		}
		
		const newFrozenFrame = new FaultFrame();
		
		// Make a new frozen frame, copy the contents 
		// from the existing frozenFrame, but without
		// anything specified in the negativeFaultFrame.
		for (const faults of this.frozenFrame.faults.values())
			for (const fault of faults.values())
				if (!negativeFaultFrame.hasFault(fault))
					newFrozenFrame.addFault(fault);
		
		// Add the contents of the positiveFaultFrame
		// from the existing referenceFrame.
		for (const faults of positiveFaultFrame.faults.values())
			for (const fault of faults.values())
				newFrozenFrame.addFault(fault);
		
		return {
			added: positiveFaultFrame,
			removed: negativeFaultFrame,
			nextFrozen: newFrozenFrame
		};
	}
	
	/**  */
	readonly invalidatedParents: X.Statement[] = [];
	
	/**
	 * A mutable frame object used as a reference to future frames.
	 */
	readonly frozenFrame = new FaultFrame();
	
	/**
	 * The frame where reports are sent.
	 */
	readonly reportFrame = new FaultFrame();
}


/**
 * 
 */
class FaultFrame
{
	/**  */
	addFault(fault: X.Fault)
	{
		const faultsForSource = this.faults.get(fault.source);
		if (faultsForSource)
		{
			faultsForSource.set(fault.code, fault);
		}
		else
		{
			const map = new Map<number, X.Fault>();
			map.set(fault.code, fault);
			this.faults.set(fault.source, map);
		}
	}
	
	/** */
	removeFault(fault: X.Fault)
	{
		const faultsForSource = this.faults.get(fault.source);
		if (faultsForSource)
			faultsForSource.delete(fault.code);
	}
	
	/** */
	hasFault(fault: X.Fault)
	{
		const faultsForSource = this.faults.get(fault.source);
		return faultsForSource ?
			faultsForSource.has(fault.code) :
			false;
	}
	
	/** */
	readonly faults = new Map<X.FaultSource, Map<number, X.Fault>>();
}
