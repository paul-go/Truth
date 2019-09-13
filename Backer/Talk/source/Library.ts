namespace Reflex.Talk {
	class Library extends Core.Library<Namespace> 
	{
		constructor() 
		{
			super({});
		}

		isKnownBranch(branch: Core.IBranch) 
		{
			return branch instanceof Operation || branch instanceof Query;
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
			return content;
		}

		attachPrimitive(primitive: any, owner: Branch, ref: AttachRef<any>) 
		{
			owner.attach(primitive, ref);
		}

		detachPrimitive(primitive: any, owner: Branch) 
		{
			owner.detach(primitive);
		}

		attachAttribute(branch: Branch, key: string, value: any) 
		{
			throw new Error(`Not implemented.`);
		}

		detachAttribute(branch: Branch, key: string) 
		{
			throw new Error(`Not implemented.`);
		}

		attachRecurrent() 
		{
			return false;
		}

		detachRecurrent() 
		{
			throw new Error(`Not implemented.`);
		}
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
