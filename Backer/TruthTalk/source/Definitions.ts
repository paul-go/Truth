
namespace Backer.TruthTalk
{
	export type Primitive = Reflex.Core.Primitive<Node, Branch>;
	export type Primitives = Reflex.Core.Primitives<Node, Branch>;
	
	/** */
	export interface Namespace extends
		Reflex.Core.IContainerNamespace<Primitives, Branches.Query>
	{
		/** */
		is(...primitives: Primitives[]): Branches.Is;
		
		/** */
		has(...primitives: Primitives[]): Branches.Has;
		
		/** */
		not(...primitives: Primitives[]): Branches.Not;
		
		/** */
		or(...primitives: Primitives[]): Branches.Or;
	}
}
