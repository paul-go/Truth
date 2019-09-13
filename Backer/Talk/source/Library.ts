namespace Reflex.Talk {
	type Node = Branch | string | number | boolean;

	class Library extends Core.Library<Namespace> 
	{
		constructor() 
		{
			super({});
		}

		isKnownBranch(branch: Core.IBranch) 
		{
			console.log("isKnownBranch", branch);
			return true;
		}

		getNamespaceStatic() 
		{
			const $ = (branchConstructor: any) => (
				...primitives: Core.Primitive[]
			) => 
			{
				const branch = new branchConstructor();
				new Core.BranchMeta(branch, primitives);
				return branch;
			};

			return {
				is: $(Operations.Is),
				not: $(Operations.Not),
				or: $(Operations.Or),
				has: $(Operations.Has),
				greaterThan: $(Operations.GreaterThan),
				lessThan: $(Operations.LessThan)
			};
		}

		getNamespaceComputed() 
		{
			return null;
		}

		createBranch(name: string): Core.IBranch 
		{
			throw new Error(`Not implemented.`);
		}

		getChildren(target: Branch) 
		{
			console.log("getChildren", target);
			return [];
		}

		isBranchDisposed(branch: Branch) 
		{
			return null;
		}

		prepareContent(content: any) 
		{
			console.log("prepareContent", content);
			return null;
		}

		attachPrimitive(
			primitive: any,
			owner: Branch,
			ref: Node | "prepend" | "append"
		) 
		{
			console.log("attachPrimitive", ...arguments);
			owner.attach(primitive);
		}

		detachPrimitive(primitive: any, owner: Branch) {}

		attachAttribute(branch: Branch, key: string, value: any) {}

		detachAttribute(branch: Branch, key: string) {}

		attachRecurrent() 
		{
			return false;
		}

		detachRecurrent() {}
	}

	const query = (...primitives: Core.Primitive[]) => 
	{
		const query = System.this.query();
		new Core.BranchMeta(query, primitives);
		return query;
	};
	export const tt: Namespace = query as any;
	Object.assign(tt, new Library().namespace);
}
