
namespace Backer.TruthTalk
{
	export class CursorSet
	{
		cursors: PLATypes[];
		
		constructor(...cursors: PLATypes[])
		{
			this.cursors = cursors;
		}
		
		snapshot()
		{
			return this.cursors.slice();
		}
		
		clone()
		{
			return new CursorSet(...this.snapshot());
		}
		
		filter(fn: (v: PLATypes) => boolean)
		{
			this.cursors = this.cursors.filter(x => fn(x));
		}
		
		query(ast: Branch | Leaf, not = false) 
		{
			if (ast instanceof Branch)
				this.branch(ast, not);
			else 
				this.leaf(ast, not);
		}
		
		branch(branch: Branch, not = false) 
		{
			switch (branch.op)
			{
				case BranchOp.query:
					for (const query of branch.children)
						this.query(query, not);
						
					break;
				case BranchOp.not: 
				{
					const instance = this.clone();
					
					for (const query of branch.children)
						instance.query(query, not);
					
					const snap = instance.snapshot();
					this.filter(x => !snap.includes(x));
				}
				break;
				case BranchOp.or:
				{
					const instances = [];
					
					for (const query of branch.children)
					{
						const instance = this.clone();	
						instance.query(query, not);
						instances.push(instance);
					}
					
					const snap = instances.flat();
					this.filter(x => snap.includes(x));
				}
			}
		}
		
		leaf(leaf: Leaf, not = false) 
		{
			switch (leaf.op)
			{
				case LeafOp.surrogate:
					this.filter(x => x.is(<PLATypes>leaf));
					break;
			}
		}
	}
}