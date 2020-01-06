
namespace Backer.TruthTalk
{
	/**
	 * 
	 */
	export type Cursor = Surrogate | Name | Aggregate;
	
	/**
	 * 
	 */
	export function execute(ast: Branch)
	{
		const cursors = new CursorSet(...Object.values(Backer.Graph));
		cursors.query(ast);
		return cursors.snapshot();
	}
	
	/**
	 * Keeps track of possible output of query
	 */
	export class CursorSet
	{	
		/** */
		static new()
		{
			return new CursorSet(...Object.values(Backer.Graph));
		}
		
		/** */
		constructor(...cursors: Cursor[])
		{
			this.cursors = new Set(cursors);
		}
		
		/** */
		private cursors: Set<Cursor>;
		
		/**
		 * Snapshot of current possibilities
		 */
		snapshot()
		{
			return Array.from(this.cursors);
		}
		
		/**
		 * 
		 */
		map(filter: (cursor: Cursor) => boolean, map: (items: Cursor) => MaybeArray<Cursor>)
		{
			this.cursors = new Set(this.snapshot()
				.filter(filter)
				.flatMap(map)
				.filter(cursor => !!cursor));
		}
		
		/**
		 * Clones current state of CursorSet
		 */
		clone()
		{
			return new CursorSet(...this.snapshot());
		}
		
		/**
		 * Filters current possibilities
		 */
		filter(fn: (cursor: Cursor) => boolean)
		{
			this.cursors = new Set(this.snapshot().filter(cursor => fn(cursor)));
		}
		
		/**
		 * Filters current possibilities
		 */
		filterSurrogate(fn: (v: Surrogate) => boolean)
		{
			this.cursors = new Set(this.snapshot()
				.filter((v): v is Surrogate => v instanceof Surrogate && fn(v)));
		}
		
		/**
		 * Executes a Truth Talk query
		 */
		query(ast: Branch | Leaf) 
		{
			if (ast instanceof Branch)
				this.branch(ast);
			else 
				this.leaf(ast);
		}
		
		/**
		 * Executes a Truth Talk branch
		 */
		branch(branch: Branch) 
		{
			switch (branch[op])
			{
				case BranchOp.is:
				case BranchOp.query:
					for (const query of branch.children)
						this.query(query);	
					break;
				
				case BranchOp.not: 
					this.not(branch);
					break;
				
				case BranchOp.or:
					this.or(branch);
					break;
				
				case BranchOp.has:
					this.contents();
					
					for (const query of branch.children)
						this.query(query);
					
					this.containers();
					break;
			}
		}
		
		/**
		 * Executes a Truth Talk leaf
		 */
		leaf(leaf: Leaf) 
		{
			switch (leaf[op])
			{
				case LeafOp.surrogate:
					const surrogateLeaf = leaf as Surrogate;
					this.filterSurrogate(sur =>
					{
						if (sur[typeOf].is(surrogateLeaf[typeOf]))
							return true;
						
						if (sur[typeOf].parallelRoots.includes(surrogateLeaf[typeOf]))
							return true;
						
						return false;
					});
					break;
				
				case LeafOp.contents:
					this.contents();
					break;
				
				case LeafOp.roots:
					this.roots();
					break;
				
				case LeafOp.containers:
					this.containers();
					break;
				
				case LeafOp.aliased:
					this.filter(sur => sur[value] !== null);
					break;
				
				case LeafOp.leaves:
					this.filter(sur => sur[value] === null);
					break;
				
				case LeafOp.fresh:
					this.filterSurrogate(sur => sur[typeOf].isFresh);
					break;
				
				case PredicateOp.equals:
					this.equals(leaf as Leaves.Predicate);
					break;
				
				case PredicateOp.greaterThan:
					this.filter(sur => (sur[value] || 0) > (leaf as Leaves.Predicate).operand);
					break;
				
				case PredicateOp.lessThan:
					this.filter(sur => (sur[value] || 0) < (leaf as Leaves.Predicate).operand);
					break;
					
				case PredicateOp.startsWith:
					this.filter(sur => sur[value] == null ? 
						false : 
						sur[value]!.toString().startsWith((leaf as Leaves.Predicate).operand as string));
					break;
				
				case PredicateOp.endsWith:
					this.filter(sur => sur[value] == null ? 
						false : 
						sur[value]!.toString().endsWith((leaf as Leaves.Predicate).operand as string));
					break;
				
				case LeafOp.slice:
					this.slice(leaf);
					break;
				
				case LeafOp.occurences:
					this.occurences(leaf);
					break;
				
				case LeafOp.sort: 
					this.sort(leaf);
					break;
				
				case LeafOp.reverse:
					this.cursors = new Set(this.snapshot().reverse());
					break;
				
				case LeafOp.names:
					this.names();
					break;
				
				case PredicateOp.named:
					this.names();
					this.equals(leaf as Leaves.Predicate);
					this.containers();
					break;
				
			}
		}
		
		/**
		 * 
		 */
		equals(leaf: Leaves.Predicate)
		{
			this.filter(sur => sur[value] === null ? 
				false :
				sur[value] == (leaf).operand);
		}
		
		/**
		 * 
		 */
		names()
		{
			this.map(surrogateFilterFn, cursor => (cursor as Surrogate)[name]);
		}
		
		/**
		 * Extends all cursors to include their direct contents.
		 */
		contents()
		{
			this.map(surrogateFilterFn, cursor => (cursor as Surrogate).contents);
		}
		
		/**
		 * Retracts all cursors to their top-level ancestors.
		 */
		roots()
		{
			const newCursors = this.snapshot()
				.map((cursor: Cursor | null) =>
				{
					while (cursor && cursor[parent])
						cursor = cursor[parent] as Surrogate;
					
					return cursor;
				})
				.filter((sur): sur is Surrogate => !!sur);
			
			this.cursors = new Set(newCursors);
		}
		
		/**
		 * Retracts all cursors to their immediate container.
		 */
		containers()
		{
			this.map(
				cursor => !!cursor[parent],
				cursor => cursor[parent] as any);
		}
	
		/** */
		not(branch: Branch)
		{
			const instance = this.clone();
					
			for (const query of branch.children)
				instance.query(query);
			
			const snap = instance.snapshot();
			this.filter(x => !snap.includes(x));
		}
		
		/** */
		or(branch: Branch)
		{
			const instances: CursorSet[] = [];
			
			for (const query of branch.children)
			{
				const instance = this.clone();	
				instance.query(query);
				instances.push(instance);
			}
			
			const snap = instances.flat();
			this.filter(x => snap.includes(x));
		}
		
		/** */
		slice(leaf: Leaf)
		{
			let { start, end } = leaf as Leaves.Slice;
			const snap = this.snapshot();
			
			if (end && end < 1)
				end = start + Math.round(end * snap.length);
			
			this.cursors = new Set(snap.slice(start, end));
		}
		
		/** */
		occurences(leaf: Leaf)
		{
			let { min, max } = leaf as Leaves.Occurences;
			
			if (!max)
				max = min;
			
			const valueMap: Record<string, Cursor[]> = {};
			
			for (const item of this.cursors)
			{
				const val = JSON.stringify(item[value]);
				
				if (!valueMap.hasOwnProperty(val))
					valueMap[val] = [];
					
				valueMap[val].push(item);
			}
			
			this.cursors = new Set(Object.values(valueMap)
				.filter(cursor => cursor.length >= min && cursor.length <= max)
				.flat());
		}
		
		/** */
		is(surrogate: Surrogate, not = false)
		{
			const instance = this.clone();
			return instance.filterSurrogate(sur => 
			{
				const condition = 
					sur[typeOf].is(surrogate[typeOf]) || 
					sur[typeOf].parallelRoots.includes(surrogate[typeOf]);
				
				return not ?
					!condition : 
					condition;
			});
		}
		
		/** */
		sort(leaf: Leaf)
		{
			const contentTypes = (leaf as Leaves.Sort).contentTypes as Struct[];
			const snap = this.snapshot();
			snap.sort((a, b) => a[value] - b[value]);
			
			for (let i = contentTypes.length; i-- > 0;)
			{
				const struct = contentTypes[i];
				if (!struct)
					continue;
				
				snap.sort((a, b) => 
				{
					if (!(a instanceof Surrogate)) 
						return b instanceof Surrogate ? -1 : 0;
					
					else if (!(b instanceof Surrogate))
						return 1;
					
					const p1 = a.get(struct);
					const p2 = b.get(struct);
					const v1: number = p1 ? p1[value] || 0 : 0;
					const v2: number = p2 ? p2[value] || 0 : 0;
					return v1 - v2;
				});
			}
			
			this.cursors = new Set(snap);
		}
	}
	
	type MaybeArray<T> = T | T[];
	const surrogateFilterFn = (x: Cursor): x is Surrogate => x instanceof Surrogate;
}
