namespace Reflex.Talk {
	type Branch = never;
	type Node = never;

	class Library extends Core.Library 
	{
		constructor() 
		{
			super({});
		}

		isKnownBranch(branch: Core.IBranch) 
		{
			return true;
		}

		getNamespaceStatic() 
		{
			return {};
		}

		getNamespaceComputed() 
		{
			return () => Reflex.Core.ComputedMemberType.branch;
		}

		createBranch(name: string) 
		{
			return undefined as any;
		}

		getChildren(target: Branch) 
		{
			return [];
		}

		isBranchDisposed(branch: Branch) 
		{
			return null;
		}

		prepareContent(content: any) 
		{
			return null;
		}

		attachPrimitive(
			primitive: any,
			owner: Branch,
			ref: Node | "prepend" | "append"
		) {}

		detachPrimitive(primitive: any, owner: Branch) {}

		attachAttribute(branch: Branch, key: string, value: any) {}

		detachAttribute(branch: Branch, key: string) {}

		attachRecurrent() 
		{
			return false;
		}

		detachRecurrent() {}
	}
}
