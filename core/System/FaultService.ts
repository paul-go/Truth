
namespace Truth
{
	/**
	 * A class that manages the diagnostics that have been 
	 * reported for the current state of the program.
	 */
	export class FaultService
	{
		constructor(private readonly program: Program) { }
		
		/**
		 * @internal
		 */
		async executeTransaction(transactionFn: () => Promise<void>)
		{
			this.inEditTransaction = true;
			await transactionFn();
			this.inEditTransaction = false;
			this.refresh();
		}
		
		/**
		 * @internal
		 * Clear out any faults that correspond to sources that
		 * no longer exist in their containing document. 
		 */
		prune()
		{
			this.backgroundManualFrame.prune();
			this.backgroundAutoFrame.prune();
		}
		
		/** */
		private inEditTransaction = false;
		
		/**
		 * Returns an array that contains all faults retained by this FaultService,
		 * sorted in the order that they exist in the program, optionally filtered
		 * by the document specified.
		 */
		each(document?: Document)
		{
			let faults = [
				...this.foregroundAutoFrame.faults.values(),
				...this.foregroundManualFrame.faults.values()
			]
				.map(faultMap => [...faultMap.values()])
				.reduce((a, b) => a.concat(b), []);
			
			if (document)
				faults = faults.filter(v => v.document === document);
			
			return faults.sort(this.compareFaults);
		}
		
		/**
		 * @internal
		 * Compares two fault instances, and returns a number that is suitable
		 * as a return value for the callback function passed to JavaScript's
		 * Array.sort() method.
		 * 
		 * Returns 0 in the case when the faults appear to be equivalent.
		 */
		compareFaults(a: Fault, b: Fault)
		{
			if (a.document !== b.document)
				return a.document.uri.toString() < b.document.uri.toString() ? -1 : 1;
			
			if (a.line !== b.line)
				return a.line - b.line;
			
			// When the faults exist on the same line, the ordering is based on 
			// the starting offset of the reported fault's range. This should cause
			// Statement faults to always be ordered before Span and InfixSpan
			// faults.
			const offsetDelta = a.range[0] - b.range[0];
			if (offsetDelta !== 0)
				return offsetDelta;
			
			// If there are multiple faults reported on the same span, the ordering
			// is based on the internal fault code. If the faults are the same, 0 is
			// returned, and the faults are considered to be equivalent.
			return a.type.code - b.type.code;
		}
		
		/**
		 * Gets a number representing the number of
		 * unrectified faults retained by this FaultService.
		 */
		get count()
		{
			return this.foregroundAutoFrame.faults.size +
				this.foregroundManualFrame.faults.size;
		}
		
		/**
		 * Reports a fault. If a similar Fault on the same area
		 * of the document hasn't been reported, the method
		 * runs the FaultReported hook.
		 */
		report(fault: Fault)
		{
			this.backgroundAutoFrame.addFault(fault);
		}
		
		/**
		 * Reports a fault outside the context of an edit transaction.
		 * This method is to be used for faults that are reported in
		 * asynchronous callbacks, such as network errors.
		 */
		reportManual(fault: Fault)
		{
			this.backgroundManualFrame.addFault(fault);
			this.maybeQueueManualRefresh();
		}
		
		/**
		 * Clears a fault that was previously reported outside
		 * of an edit transaction. 
		 */
		resolveManual(fault: Fault)
		{
			this.backgroundManualFrame.removeFault(fault);
			this.maybeQueueManualRefresh();
		}
		
		/**
		 * Queues the copying of the background fault buffer to the 
		 * foreground. 
		 */
		private maybeQueueManualRefresh()
		{
			if (this.manualRefreshQueued)
				return;
			
			this.manualRefreshQueued = true;
			
			setTimeout(() =>
			{
				this.manualRefreshQueued = false;
				
				if (!this.inEditTransaction)
					this.refresh();
			},
			0);
		}
		private manualRefreshQueued = false;
		
		/**
		 * @returns An array of Fault objects that have been reported
		 * at the specified source. If the source has no faults, an empty
		 * array is returned.
		 */
		inspect<TSource extends TFaultSource>(source: TSource): Fault<TSource>[]
		{
			const out: Fault<TSource>[] = [];
			
			for (const retainedFault of this.each())
				if (retainedFault.source === source)
					out.push(retainedFault as Fault<TSource>);
			
			return out;
		}
		
		/**
		 * @returns An array of Fault objects that have been reported that
		 * correspond to the specified Statement, or any Span or InfixSpan
		 * objects contained within it.
		 */
		inspectDeep(source: Statement): Fault[]
		{
			const out: Fault[] = [];
			
			for (const retainedFault of this.each())
			{
				const reSource = retainedFault.source;
				
				if (reSource === source)
					out.push(retainedFault);
				
				else if (reSource instanceof Span || reSource instanceof InfixSpan)
					if (reSource.statement === source)
						out.push(retainedFault);
			}
			
			return out;
		}
		
		/**
		 * @internal
		 * Used internally to inform the FaultService that type-level fault
		 * analysis is being done on the provided phrase. This is necessary
		 * because type-level faults do not live beyond a single edit frame,
		 * so the FaultService needs to know which phrases were analyzed
		 * so that newly rectified faults can be cleared out.
		 * 
		 * When this method is called, any faults corresponding to the
		 * specified phrase are cleared out, and are only added back in if
		 * they were re-detected during this edit transaction.
		 */
		inform(phrase: Phrase)
		{
			if (phrase.isHypothetical)
				throw Exception.invalidArgument();
			
			const smts = phrase.statements.filter(smt => !smt.isDisposed);
			
			// Clear out any statement-level faults that touch the node
			for (const smt of smts)
				this.backgroundAutoFrame.removeSource(smt);
			
			// Clear out any span-level faults that touch the node
			const spans = smts
				.map(smt => smt.spans)
				.reduce((a, b) => a.concat(b), []);
			
			for (const span of spans)
				this.backgroundAutoFrame.removeSource(span);
			
			// Clear out any infix-level faults that touch the node
			const infixes = smts
				.map(smt => smt.infixSpans || [])
				.reduce((a, b) => a.concat(b), []);
			
			for (const infix of infixes)
				this.backgroundAutoFrame.removeSource(infix);
		}
		
		/**
		 * @internal
		 * Broadcasts any not-yet-reported faults to the FaultService.
		 */
		refresh()
		{
			const [autoAdded, autoRemoved] = this.refreshFrameSet(
				this.backgroundAutoFrame,
				this.foregroundAutoFrame);
			
			const [manualAdded, manualRemoved] = this.refreshFrameSet(
				this.backgroundManualFrame,
				this.foregroundManualFrame);
			
			const autoChanged = autoAdded.length + autoRemoved.length > 0;
			if (autoChanged)
			{
				this.foregroundAutoFrame = this.backgroundAutoFrame;
				this.backgroundAutoFrame = this.backgroundAutoFrame.clone();
			}
			
			const manualChanged = manualAdded.length + manualRemoved.length > 0;
			if (manualChanged)
			{
				this.foregroundManualFrame = this.backgroundManualFrame;
				this.backgroundManualFrame = this.backgroundManualFrame.clone();
			}
			
			if (autoChanged || manualChanged)
				this.program.emit("faultChange",
					autoAdded.concat(manualAdded),
					autoRemoved.concat(manualRemoved));
		}
		
		/** */
		private refreshFrameSet(bgFrame: FaultFrame, fgFrame: FaultFrame)
		{
			const faultsAdded: Fault[] = [];
			const faultsRemoved: Fault[] = [];
			
			for (const map of bgFrame.faults.values())
				for (const fault of map.values())
					if (!fgFrame.hasFault(fault))
						faultsAdded.push(fault);
			
			for (const map of fgFrame.faults.values())
				for (const fault of map.values())
					if (!bgFrame.hasFault(fault))
						faultsRemoved.push(fault);
			
			return [faultsAdded, faultsRemoved];
		}
		
		/**
		 * Stores faults that are exposed to the outside when the 
		 * FaultService's accessor methods are used. These faults are
		 * reported within an edit transaction, and clear automatically
		 * when the Statement or Span to which they are connected is
		 * disposed.
		 */
		private foregroundAutoFrame = new FaultFrame();
		
		/**
		 * Stores a buffer of the faults that will eventually be exposed to the
		 * outside. These faults clear automatically when the Statement or
		 * Span to which they are connected is disposed.
		 */
		private backgroundAutoFrame = new FaultFrame();
		
		/**
		 * Stores faults that are exposed to the outside when the
		 * FaultService's accessor methods are used. 
		 */
		private foregroundManualFrame = new FaultFrame();
		
		/**
		 * Stores a buffer of the faults that will eventually be exposed to the
		 * outside, after being copied to the foregroundManualFrame.
		 * These faults are reported outside of an edit transacrtion, and must 
		 * be cleared manually (via reportManual).
		 */
		private backgroundManualFrame = new FaultFrame();
	}
	
	/**
	 * Stores a buffer of faults.
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
		
		/** */
		addFault(fault: Fault)
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
		removeSource(source: TFaultSource)
		{
			this.faults.delete(source);
			
			if (source instanceof Statement)
				for (const cruftObject of source.cruftObjects)
					this.faults.delete(cruftObject);
		}
		
		/**
		 * Removes the faults from this frame that correspond to 
		 * sources that have been removed from their containing
		 * document.
		 */
		prune()
		{
			for (const source of this.faults.keys())
			{
				const smt = source instanceof Statement ?
					source :
					source.statement;
				
				if (smt.isDisposed)
					this.faults.delete(source);
			}
		}
		
		/** */
		removeFault(fault: Fault)
		{
			const faultsForSource = this.faults.get(fault.source);
			if (faultsForSource)
				faultsForSource.delete(fault.type.code);
		}
		
		/** */
		hasFault(fault: Fault)
		{
			const faultsForSource = this.faults.get(fault.source);
			return faultsForSource ?
				faultsForSource.has(fault.type.code) :
				false;
		}
		
		/**
		 * A doubly-nested map of fault sources, fault codes, and the actual fault.
		 */
		readonly faults = new Map<TFaultSource, TFaultMap>();
	}
	
	type TFaultMap = Map<number, Fault>;
}
