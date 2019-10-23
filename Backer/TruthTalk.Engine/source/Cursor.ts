
namespace Backer.TruthTalk
{
	
	export class Cursor
	{
		active = true;
		possibilities: null | number = null;
		sum = false;
		
		constructor(public value: PLATypes) { }	
		
		resolve(condition: boolean, not = false)
		{
			if (!this.active) return;
			
			if (not) 
				condition = !condition;
				
			if (this.possibilities)
			{
				this.sum = this.sum || condition;
				this.possibilities--;
			}
			
			if (this.possibilities === 0)
			{
				this.active = this.sum;
				this.possibilities = null;
			}
			else 
			{
				this.active = condition;
			}
				
		}
		
		query(ast: Branch | Leaf, not = false) 
		{
			if (!this.active) return;
			
			if (ast instanceof Branch)
				this.branch(ast, not);
			else 
				this.leaf(ast, not);
			return this.active;
		}
		
		branch(branch: Branch, not = false) 
		{
			let processor: (ast: Branch | Leaf, not?: boolean) => boolean | void = this.query;
			switch (branch.op)
			{
				case BranchOp.not:
					not = !not;
					break;
				case BranchOp.has:
					processor = this.has;
					break;
				case BranchOp.or:
					this.possibilities = branch.children.length;
					break;
			}
			for (const query of branch.children)
				processor.call(this, query, not);
		}
		
		leaf(leaf: Leaf, not = false) 
		{
			switch (leaf.op)
			{
				case LeafOp.surrogate:
					this.resolve(this.value.is(<PLATypes>leaf), not);
					break;
			}
		}
		
		or(options = 1)
		{
			this.possibilities = options;
			
		}
		
		has(ast: Branch | Leaf, not = false)
		{
			const root = this.value;
			if (!(root instanceof PLAObject)) return;
			
			for (const content of root)
			{
				this.value = content;
				this.query(ast, not);
			}
			this.value = root;
		
		}
	}
}