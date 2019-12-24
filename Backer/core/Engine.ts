
namespace Backer.TruthTalk
{
	export type Cursor = Surrogate | Name | Aggregate;
	type MaybeArray<T> = T | T[];
	
	const SurrogateFilter = (x: Cursor): x is Surrogate => x instanceof Surrogate;
	
	export function Execute(Ast: Branch)
	{
		const cursors = new CursorSet(...Object.values(Backer.Graph));
		cursors.query(Ast);
		return cursors.snapshot();
	}
	
	/**
	 * Keeps track of possible output of query
	 */
	export class CursorSet
	{	
		static new()
		{
			return new CursorSet(...Object.values(Backer.Graph));
		}
		
		cursors: Set<Cursor>;
		
		constructor(...cursors: Cursor[])
		{
			this.cursors = new Set(cursors);
		}
		
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
			this.cursors = new Set(this.snapshot().filter(filter).flatMap(map).filter(x => !!x));
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
		filter(fn: (v: Cursor) => boolean)
		{
			this.cursors = new Set(this.snapshot().filter(x => fn(x)));
		}
		
		/**
		 * Filters current possibilities
		 */
		filterSurrogate(fn: (v: Surrogate) => boolean)
		{
			this.cursors = new Set(this.snapshot().filter((x): x is Surrogate => x instanceof Surrogate && fn(x)));
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
					this.filterSurrogate(x => x[typeOf].is((<Surrogate>leaf)[typeOf]) || x[typeOf].parallelRoots.includes((<Surrogate>leaf)[typeOf]));
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
					this.filter(x => x[value] !== null);
					break;
				case LeafOp.leaves:
					this.filter(x => x[value] === null);
					break;
				case LeafOp.fresh:
					this.filterSurrogate(x => x[typeOf].isFresh);
					break;
				case PredicateOp.equals:
					this.equals(<Leaves.Predicate>leaf);
					break;
				case PredicateOp.greaterThan:
					this.filter(x => (x[value] || 0) > (<Leaves.Predicate>leaf).operand);
					break;
				case PredicateOp.lessThan:
					this.filter(x => (x[value] || 0) < (<Leaves.Predicate>leaf).operand);
					break;	
				case PredicateOp.startsWith:
					this.filter(x => x[value] == null ? false : x[value]!.toString().startsWith(<string>(<Leaves.Predicate>leaf).operand));
					break;
				case PredicateOp.endsWith:
					this.filter(x => x[value] == null ? false : x[value]!.toString().endsWith(<string>(<Leaves.Predicate>leaf).operand));
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
					this.equals(<Leaves.Predicate>leaf);
					this.containers();
					break;
			}
		}
		
		equals(leaf: Leaves.Predicate)
		{
			this.filter(x => x[value] !== null ? x[value] == (leaf).operand : false);
		}
		
		names()
		{
			this.map(SurrogateFilter, (x) => (<Surrogate>x)[name]);
		}
		
		/**
		 * Go one level nested in
		 */
		contents()
		{
			this.map(SurrogateFilter, x => (<Surrogate>x).contents);
		}
		
		/**
		 * Go to top level
		 */
		roots()
		{
			this.cursors = new Set(this.snapshot().map((x: Cursor | null) =>
				{
					while (x && x[parent]) 
						x = x[parent] as Surrogate;
					return x;				
				}).filter((x): x is Surrogate => !!x));
		}
		
		/**
		 * Go one level nested out
		 */
		containers()
		{
			this.map(x => !!x[parent], x => (<any>x[parent]));
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
			const instances = [];
			
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
			let {
				start,
				end
			} = <Leaves.Slice>leaf;
			
			const snap = this.snapshot();
			if (end && end < 1) end = start + Math.round(end * snap.length);
			
			this.cursors = new Set(snap.slice(start, end));
		}
		
		/** */
		occurences(leaf: Leaf)
		{
			let {
				min,
				max
			} = <Leaves.Occurences>leaf;
			
			if (!max) max = min;

			const valueMap: Record<string, Cursor[]> = {};
			
			for (const item of this.cursors)
			{
				const val = JSON.stringify(item[value]);
				
				if (!valueMap.hasOwnProperty(val))
					valueMap[val] = [];
					
				valueMap[val].push(item);
			}
			
			this.cursors = new Set(Object.values(valueMap).filter(x => x.length >= min && x.length <= max).flat());
		}
		
		/** */
		is(surrogate: Surrogate, not = false)
		{
			const instance = this.clone();
			return instance.filterSurrogate(x => 
				{
					const condition = x[typeOf].is(surrogate[typeOf]) || x[typeOf].parallelRoots.includes(surrogate[typeOf]);
					return not ? !condition : condition;
				});
		}
		
		/** */
		sort(leaf: Leaf)
		{
			const structs = (<Struct[]>(<Leaves.Sort>leaf).contentTypes).filter((x) => !!x).reverse();
			
			const snap = this.snapshot();
			
			snap.sort((x,y) => x[value] - y[value]);
			
			for (const struct of structs)
				snap.sort((a, b) => 
				{
					if (!(a instanceof Surrogate)) 
						if (!(b instanceof Surrogate))
							return 0;
						else return -1;
					else if (!(b instanceof Surrogate))
						return 1;
					
					const p1 = a.get(struct);
					const p2 = b.get(struct);
					const v1: number = p1 ? <any>p1[value] || 0: 0;
					const v2: number = p2 ? <any>p2[value] || 0: 0;
					return v1 - v2;
				});
			
			this.cursors = new Set(snap);
		}
		
	}
}