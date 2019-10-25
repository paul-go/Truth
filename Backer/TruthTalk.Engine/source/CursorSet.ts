
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
				{
					const instance = this.clone();
					
					for (const query of branch.children)
						instance.query(query);
					
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
						instance.query(query);
						instances.push(instance);
					}
					
					const snap = instances.flat();
					this.filter(x => snap.includes(x));
				}
				case BranchOp.has:
					
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
	}
}