namespace Reflex.Talk
{
	export class Library extends Core.Library<Namespace> 
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
			const $ = (BranchConstructor: any) => (...primitives: Core.Primitive[]) => 
			{
				const branch = new BranchConstructor();
				new Core.BranchMeta(branch, primitives);
				return branch;
			};

			return {
				is: $(Operations.Is),
				not: $(Operations.Not),
				or: $(Operations.Or),
				has: $(Operations.Has),
				greaterThan: $(Operations.GreaterThan),
				lessThan: $(Operations.LessThan),
				equals: $(Operations.Equals)
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

		getChildren(target: TalkBranch) 
		{
			return target.getChildren();
		}

		isBranchDisposed(branch: TalkBranch) 
		{
			return null;
		}

		prepareContent(content: any) 
		{
			console.log("prepareContent", content);
			return content;
		}

		attachPrimitive(primitive: any, owner: TalkBranch, ref: AttachRef<any>) 
		{
			owner.attach(primitive, ref);
		}

		detachPrimitive(primitive: any, owner: TalkBranch) 
		{
			owner.detach(primitive);
		}

		attachAttribute(branch: TalkBranch, key: string, value: any) 
		{
			throw new Error(`Not implemented.`);
		}

		detachAttribute(branch: TalkBranch, key: string) 
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

		return new Promise(resolve =>
			Reflex.Core.ReadyState.await(() => resolve(query))
		);
	};
	
	export const tt: Namespace = <any>query;
	Object.assign(tt, new Library().namespace);
}
