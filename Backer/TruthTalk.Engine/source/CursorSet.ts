
namespace Backer.TruthTalk
{
	export class CursorSet
	{
		cursors: Set<PLATypes>;
		
		constructor(...cursors: PLATypes[])
		{
			this.cursors = new Set(cursors);
		}
		
		snapshot()
		{
			return Array.from(this.cursors);
		}
		
		clone()
		{
			return new CursorSet(...this.snapshot());
		}
		
		filter(fn: (v: PLATypes) => boolean)
		{
			this.cursors = new Set(this.snapshot().filter(x => fn(x)));
		}
		
		query(ast: Branch | Leaf) 
		{
			if (ast instanceof Branch)
				this.branch(ast);
			else 
				this.leaf(ast);
		}
		
		branch(branch: Branch) 
		{
			switch (branch.op)
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
		
		leaf(leaf: Leaf) 
		{
			switch (leaf.op)
			{
				case LeafOp.surrogate:
					this.filter(x => x[typeOf].parallelRoots.includes((<PLATypes>leaf)[typeOf]));
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
					this.filter(x => x[typeOf].isFresh);
					break;
				case PredicateOp.equals:
					this.filter(x => x[value] == (<Leaves.Predicate>leaf).operand);
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
					break;
				case LeafOp.reverse:
					this.cursors = new Set(this.snapshot().reverse());
					break;
			}
		}
		
		contents()
		{
			this.cursors = new Set(this.snapshot().flatMap(x => x.contents).filter((x): x is PLAObject => !!x));
		}
		
		roots()
		{
			this.cursors = new Set(this.snapshot().map(x =>
				{
					while (x.parent) 
						x = x.parent;
					return x;				
				}).filter((x): x is PLAObject => !!x));
		}
		
		containers()
		{
			this.cursors = new Set(this.snapshot().map(x => x.parent).filter((x): x is PLAObject => !!x));
		}
		
		not(branch: Branch)
		{
			const instance = this.clone();
					
			for (const query of branch.children)
				instance.query(query);
			
			const snap = instance.snapshot();
			this.filter(x => !snap.includes(x));
		}
		
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
		
		occurences(leaf: Leaf)
		{
			let {
				min,
				max
			} = <Leaves.Occurences>leaf;
			
			if (!max) max = min;

			const valueMap: Record<string, PLATypes[]> = {};
			
			for (const item of this.cursors)
			{
				const val = JSON.stringify(item[value]);
				
				if (!valueMap.hasOwnProperty(val))
					valueMap[val] = [];
					
				valueMap[val].push(item);
			}
			
			this.cursors = new Set(Object.values(valueMap).filter(x => x.length >= min && x.length <= max).flat());
		}
		
		is(PLA: PLATypes, not = false)
		{
			const instance = this.clone();
			return instance.filter(x => 
				{
					const condition = x[typeOf].parallelRoots.includes(PLA[typeOf]);
					return not ? !condition : condition;
				});
		}
		
		access(obj: PLAObject, target: PLAAny)
		{
			if (!obj.is(target.root)) 
				return null;
				
			obj
		}
		
		sort(leaf: Leaf)
		{
			const PLAs = (<PLATypes[]>(<Leaves.Sort>leaf).contentTypes).reverse();
			
			
		}
		
	}
}