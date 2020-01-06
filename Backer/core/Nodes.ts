
namespace Backer.TruthTalk
{
	/**
	 * 
	 */
	export const op = Symbol("op");
	
	/**
	 * 
	 */
	export const container = Symbol("container");
	
	/** */
	export enum BranchOp
	{
		query = 1,
		is = 2,
		has = 3,
		not = 4,
		or = 5,
	}
	
	/** */
	export enum PredicateOp
	{
		equals = 30,
		greaterThan = 31,
		greaterThanOrEquals = 32,
		lessThan = 33,
		lessThanOrEquals = 34,
		alike = 35,
		startsWith = 36,
		endsWith  = 37,
		includes = 38,
		matches = 39,
		named = 40
	}
	
	/** */
	export enum LeafOp
	{
		predicate = 60,
		slice = 61,
		occurences = 62,
		aliased = 63,
		terminals = 64,
		sort = 65,
		reverse = 66,
		surrogate = 67,
		containers = 68,
		roots = 69,
		contents = 70,
		leaves = 71,
		fresh = 72,
		names = 73,
		sum = 74,
		avg = 75,
		min = 76,
		max = 77,
		count = 78
	}
	
	/** */
	export type NodeOp =
		BranchOp | 
		LeafOp |
		PredicateOp;
	
	//# Abstract Classes
	
	/** */
	export abstract class Node
	{
		abstract readonly [op]: NodeOp;
		
		readonly [container]: Branch | null = null;
		
		[Reflex.atom](destination: Branch)
		{
			destination.addChild(this);
		}
		
		setContainer(cont: Branch | null)
		{
			//@ts-ignore
			this[container] = cont;
		}
	}
	
	/** */
	export abstract class Branch extends Node
	{
		/** */
		addChild(child: Node, position = -1)
		{
			child.setContainer(this);
			
			if (position === -1)
				return void this._children.push(child);
			
			const at = this._children.length - position + 1;
			this._children.splice(at, 0, child);
			return child;
		}
		
		/** */
		removeChild(child: Node): Node | null;
		removeChild(childIdx: number) : Node| null;
		removeChild(param: Node | number)
		{
			const childIdx = param instanceof Node ?
				this._children.indexOf(param) :
				param;
			
			if (childIdx > 0)
			{
				const removed = this._children.splice(childIdx, 1)[0];
				removed.setContainer(null);
				return removed;
			}
			
			return null;
		}
		
		/** */
		get children(): readonly (Branch | Leaf)[]
		{
			return this._children;
		}
		private readonly _children: (Branch | Leaf)[] = [];
	}
	
	/** */
	export abstract class Leaf extends Node { }
	
	//# Concrete Classes
	
	/** */
	export namespace Branches
	{
		/** */
		export class Query extends Branch
		{
			readonly [op] = BranchOp.query;
		}
		
		/** */
		export class Is extends Branch
		{
			readonly [op] = BranchOp.is;
		}
		
		/** */
		export class Has extends Branch
		{
			readonly [op] = BranchOp.has;
		}
		
		/** */
		export class Not extends Branch
		{
			readonly [op] = BranchOp.not;
		}
		
		/** */
		export class Or extends Branch
		{
			readonly [op] = BranchOp.or;
		}
	}
	
	/** */
	export namespace Leaves
	{
		/** */
		export class Predicate extends Leaf
		{
			readonly [op]: PredicateOp;
			
			constructor(
				opv: PredicateOp,
				readonly operand: string | number | boolean)
			{
				super();
				//@ts-ignore
				this[op] = opv;
			}
		}
		
		/** */
		export class Slice extends Leaf
		{
			constructor(
				readonly start: number, 
				readonly end?: number)
			{
				super();
			}
			
			readonly [op] = LeafOp.slice;
		}
		
		/** */
		export class Occurences extends Leaf
		{
			constructor(
				readonly min: number,
				readonly max: number = min)
			{
				super();
			}
			
			readonly [op] = LeafOp.occurences;
		}
		
		/** */
		export class Aliased extends Leaf
		{
			readonly [op] = LeafOp.aliased;
		}
		
		/** */
		export class Leaves extends Leaf
		{
			readonly [op] = LeafOp.leaves;
		}
		
		/** */
		export class Fresh extends Leaf
		{
			readonly [op] = LeafOp.fresh;
		}
		/** */
		export class Terminals extends Leaf
		{
			readonly [op] = LeafOp.terminals;
		}
		
		/** */
		export class Sort extends Leaf
		{
			
			constructor(
				...contentTypes: Object[])
			{
				super();
				this.contentTypes = contentTypes;
			}
			
			readonly contentTypes: Object[];
			readonly [op] = LeafOp.sort;
		}
		
		/** */
		export class Reverse extends Leaf
		{
			readonly [op] = LeafOp.reverse;
		}
		
		/** */
		export class Surrogate extends Leaf
		{
			readonly [op] = LeafOp.surrogate;
		}
		
		/** */
		export class Containers extends Leaf
		{
			readonly [op] = LeafOp.containers;
		}
		
		/** */
		export class Roots extends Leaf
		{
			readonly [op] = LeafOp.roots;
		}
		
		/** */
		export class Contents extends Leaf
		{
			readonly [op] = LeafOp.contents;
		}
		
		/** */
		export class Names extends Leaf
		{
			readonly [op] = LeafOp.names;
		}
		
		/** */
		export class Sum extends Leaf
		{
			readonly [op] = LeafOp.sum;
		}
		
		/** */
		export class Avg extends Leaf
		{
			readonly [op] = LeafOp.avg;
		}
		
		/** */
		export class Min extends Leaf
		{
			readonly [op] = LeafOp.min;
		}
		
		/** */
		export class Max extends Leaf
		{
			readonly [op] = LeafOp.max;
		}
		
		/** */
		export class Count extends Leaf
		{
			readonly [op] = LeafOp.count;
		}
	}
}
