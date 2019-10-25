
namespace Backer.TruthTalk
{
	export class Library implements Reflex.Core.ILibrary
	{
		/** */
		isKnownLeaf(leaf: any)
		{
			return leaf instanceof Node
		}
		
		/** */
		isKnownBranch(branch: Branch)
		{
			return branch instanceof Node;
		}
		
		/** */
		isBranchDisposed(branch: Reflex.Core.IBranch)
		{
			return branch instanceof Branch && branch.container !== null;
		}
		
		/** */
		getStaticBranches()
		{
			const branches: any = {};
			
			Object.entries(Branches).forEach(([branchName, branchCtor]) =>
			{
				const name = branchName.toLowerCase();
				branches[name] = () => new branchCtor();
			});
			
			return branches;
		}
		
		/** */
		getStaticNonBranches()
		{
			const leaves: any = {};
			
			for (const [key, value] of Object.entries(Leaves))
				leaves[key.toLowerCase()] = (arg1: PredicateOp, arg2: number) => new value(arg1, arg2);
				
			return leaves;
		}
		
		/** */
		getChildren(target: Branch)
		{
			return target.children;
		}
		
		/** */
		createContainer()
		{
			return new Branches.Query();
		}
		
		/** */
		attachPrimitive(
			primitive: Node,
			owner: Branch,
			ref: Node | "prepend" | "append")
		{
			if (!(primitive instanceof Node))
				return;
			
			const pos =
				ref === "append" ? -1 :
				ref === "prepend" ? 0 :
				// Places the item at the end, in the case when 
				// ref wasn't found in the owner. )This should
				// never actually happen.)
				owner.children.indexOf(ref) + 1 || -1;
			
			owner.addChild(primitive, pos);
		}
		
		/** */
		detachPrimitive(primitive: Node, owner: Branch)
		{
			owner.removeChild(primitive);
		}
		
		/** */
		swapBranches(branch1: Branch, branch2: Branch)
		{
			if (branch1.container === null || branch2.container === null)
				throw new Error("Cannot swap top-level branches.");
			
			if (branch1.container !== branch2.container)
				throw new Error("Can only swap branches from the same container.");
			
			const container = branch1.container;
			const idx1 = container.children.indexOf(branch1);
			const idx2 = container.children.indexOf(branch2);
			const idxMax = Math.max(idx1, idx2);
			const idxMin = Math.min(idx1, idx2);
			const removedMax = container.removeChild(idxMax);
			const removedMin = container.removeChild(idxMin);
			
			if (!removedMax || !removedMin)
				throw new Error("Internal Error.");
			
			container.addChild(removedMax, idxMin);
			container.addChild(removedMin, idxMax);
		}
		
		/** */
		replaceBranch(branch1: Branch, branch2: Branch)
		{
			if (branch1.container === null)
				throw new Error("Cannot replace top-level branches.");
			
			const container = branch1.container;
			const idx = container.children.indexOf(branch1);
			container.removeChild(idx);
			container.addChild(branch2, idx);
		}
		
		/** */
		attachAttribute(branch: Branch, key: string, value: any)
		{
			throw new Error("Not supported.");
		}
		
		/** */
		detachAttribute(branch: Branch, key: string)
		{
			throw new Error("Not supported.");
		}
		
		/** */
		attachRecurrent(
			kind: Reflex.Core.RecurrentKind,
			target: Reflex.Core.IBranch,
			selector: any,
			callback: Reflex.Core.RecurrentCallback,
			rest: any[])
		{
			throw new Error("Not supported.");
			return false;
		}
		
		/** */
		detachRecurrent(
			target: Reflex.Core.IBranch,
			selector: any,
			callback: Reflex.Core.RecurrentCallback)
		{
			throw new Error("Not supported.");
			return false;
		}
	}
}

/**
 * Global library object.
 */
const tt = Reflex.Core.createContainerNamespace<Backer.TruthTalk.Namespace>(
	new Backer.TruthTalk.Library(),
	true);
