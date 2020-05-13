
namespace Truth
{
	/** @internal */
	export type ContingentKey = number | bigint | string;
	
	/**
	 * A base class for data structures whose contents are cleared
	 * when documents go in an unchecked state, or are removed
	 * from the containing program.
	 */
	export abstract class Contingent
	{
		constructor(program: Program)
		{
			const del = (doc: Document) => this.data.delete(doc.id);
			program.on("documentRemove", del);
			program.on("documentUnchecked", del);
		}
		
		/** */
		protected readonly abstract data: { delete(id: number): void; };
	}
	
	/**
	 * A class that presents the interface of a JavaScript-standard Set,
	 * but whose values are removed when the document with which
	 * the value is associated goes into an unchecked state.
	 */
	export class ContingentSet<K extends ContingentKey = number>
		extends Contingent
	{
		/** */
		has(key: K)
		{
			for (const set of this.data.values())
				if (set.has(key))
					return true;
			
			return false;
		}
		
		/** */
		add(key: K, contingentDocument: Document)
		{
			this.data.add(contingentDocument.id, key);
		}
		
		/** */
		protected readonly data = new SetMap<number, K>();
	}
	
	/**
	 * A class that presents the interface of a JavaScript-standard Map,
	 * but whose keys and values are removed when the document with
	 * which the value is associated goes into an unchecked state.
	 */
	export class ContingentMap<K extends ContingentKey, V> extends Contingent
	{
		/** */
		get(key: K)
		{
			for (const map of this.data.values())
			{
				const value = map.get(key);
				if (value !== undefined)
					return value;
			}
			
			return null;
		}
		
		/** */
		set(key: K, value: V, contingentDocument: Document)
		{
			let map = this.data.get(contingentDocument.id);
			map ?
				map.set(key, value) :
				this.data.set(contingentDocument.id, new Map([[key, value]]));
		}
		
		/** */
		each(document: Document): IterableIterator<V>
		{
			const map = this.data.get(document.id);
			return map?.values() || new Map().values();
		}
		
		/** */
		protected readonly data = new Map<number, Map<K, V>>();
	}
	
	/**
	 * A class that presents the interface of Truth's SetMap object,
	 * but whose values are removed when the document with which
	 * the value is associated goes into an unchecked state.
	 */
	export class ContingentSetMap<K extends ContingentKey, V> 
		extends Contingent
	{
		/** */
		get(key: K): Set<V> | null
		{
			for (const setMap of this.data.values())
			{
				const value = setMap.get(key);
				if (value !== undefined)
					return value;
			}
			return null;
		}
		
		/** */
		add(key: K, value: V, contingentDocument: Document)
		{
			let setMap = this.data.get(contingentDocument.id);
			if (!setMap)
				this.data.set(contingentDocument.id, setMap = new SetMap());
			
			setMap.add(key, value);
		}
		
		/** */
		*each(document: Document): IterableIterator<V>
		{
			const setMap = this.data.get(document.id);
			if (setMap)
				for (const nestedSet of setMap.values())
					for (const value of nestedSet)
						yield value;
		}
		
		/** */
		protected readonly data = new Map<number, SetMap<K, V>>();
	}
}
