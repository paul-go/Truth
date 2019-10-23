
namespace Backer.TruthTalk
{
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
		matches = 39
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
		surrogate = 67
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
		abstract readonly op: NodeOp;
		
		/** */
		get container(): Branch | null
		{
			return this._container;
		}
		private _container: Branch | null = null;
	}
	
	/** */
	export abstract class Branch extends Node
	{
		/** */
		addChild(child: Node, position = -1)
		{
			(<any>child)._container = this;
			
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
				(<any>removed)._container = null;
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
			readonly op = BranchOp.query;
		}
		
		/** */
		export class Is extends Branch
		{
			readonly op = BranchOp.is;
		}
		
		/** */
		export class Has extends Branch
		{
			readonly op = BranchOp.has;
		}
		
		/** */
		export class Not extends Branch
		{
			readonly op = BranchOp.not;
		}
		
		/** */
		export class Or extends Branch
		{
			readonly op = BranchOp.or;
		}
	}
	
	/** */
	export namespace Leaves
	{
		/** */
		export class Predicate extends Leaf
		{
			constructor(
				readonly op: PredicateOp,
				readonly operand: string | number | boolean)
			{
				super();
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
			
			readonly op = LeafOp.slice;
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
			
			readonly op = LeafOp.occurences;
		}
		
		/** */
		export class Aliased extends Leaf
		{
			readonly op = LeafOp.aliased;
		}
		
		/** */
		export class Terminals extends Leaf
		{
			readonly op = LeafOp.terminals;
		}
		
		/** */
		export class Sort extends Leaf
		{
			readonly op = LeafOp.sort;
		}
		
		/** */
		export class Reverse extends Leaf
		{
			readonly op = LeafOp.reverse;
		}
		
		/** */
		export class Surrogate extends Leaf
		{
			readonly op = LeafOp.surrogate;
		}
	}
}
