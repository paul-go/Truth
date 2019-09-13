namespace Reflex.Talk {
	type Node = Branch | string | number | boolean;

	class Library extends Core.Library 
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
			return null;
		}

		getNamespaceComputed() 
		{
			return () => Reflex.Core.ComputedMemberType.branch;
		}

		createBranch(name: string) 
		{
			switch (name) 
			{
				case "query":
					return System.this.query();
				case "is":
					return new IsOperation();
				case "not":
					return new NotOperation();
				case "or":
					return new OrOperation();
				case "has":
					return new HasOperation();
				case "greaterThan":
					return new GreaterThanOperation();
				case "lessThan":
					return new LessThanOperation();
			}
			throw new Error(`Unidentified branch "${name}"`);
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

	export const library = new Library().namespace;
}
