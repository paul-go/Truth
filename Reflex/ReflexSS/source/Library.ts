
namespace Reflex.SS
{
	export class Library implements Reflex.Core.ILibrary
	{
		/** */
		isKnownBranch(branch: Branch)
		{
			return branch instanceof Rule || branch instanceof Call;
		}
		
		/** */
		isKnownLeaf(leaf: object)
		{
			return leaf instanceof Call;
		}
		
		/** */
		isBranchDisposed(branch: Reflex.Core.IBranch)
		{
			return false;
		}
		
		/** */
		getStaticNonBranches()
		{
			return {
				emit: (options: IEmitOptions) => emit(options),
				debug: () =>
				{
					return Array.from(this.styleSheet.values())
						.filter(rule => rule.containers.length === 0)
						.map(rule => rule.toRulesString())
						.join("\n");
				}
			};
		}
		
		/** */
		getDynamicNonBranch(name: string)
		{
			return (...values: any[]) =>
			{
				return new Call(name, values);
			}
		}
		
		/** */
		getChildren(target: Branch)
		{
			if (target instanceof Rule)
				return (<Branch[]>target.declarations).concat(target.children);
			
			return target.values;
		}
		
		/** */
		createContainer()
		{
			return new Rule();
		}
		
		/** */
		attachPrimitive(
			primitive: any,
			owner: Branch,
			ref: Node | "prepend" | "append")
		{
			if (owner instanceof Rule)
			{
				if (primitive instanceof Rule)
				{
					// Nested rule
					debugger;
				}
				else if (primitive instanceof Call)
				{
					owner.declarations.push(primitive);
				}
				else if (typeof primitive === "string")
				{
					const existingRule = this.styleSheet.get(primitive);
					if (existingRule)
					{
						existingRule.containers.push(owner);
						owner.children.push(existingRule);
					}
					else owner.selectorFragments.push(primitive);
				}
				else if (typeof primitive === "number")
				{
					let nth = Math.floor(primitive);
					return nth < 0 ?
						`:nth-last-child(${nth * -1})` :
						`:nth-child(${nth - 1})`;
				}
			}
		}
		
		/** */
		detachPrimitive(primitive: Node, owner: Branch)
		{
			throw new Error("Not implemented.");
		}
		
		/** */
		swapBranches(branch1: Branch, branch2: Branch)
		{
			throw new Error("Not supported.");
		}
		
		/** */
		replaceBranch(branch1: Branch, branch2: Branch)
		{
			throw new Error("Not supported.");
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
		handleBranchFunction(
			branch: Reflex.Core.IBranch, 
			branchFn: (...primitives: any[]) => Reflex.Core.IBranch)
		{
			this.attachPrimitive(
				" " + branchFn.name.toUpperCase(),
				<Branch>branch,
				"append");
		}
		
		/** */
		returnBranch(branch: Reflex.Core.IBranch)
		{
			if (branch instanceof Rule)
			{
				const cls = branch.class;
				if (!this.styleSheet.has(cls))
					this.styleSheet.set(cls, branch);
				
				return cls;
			}
			
			return branch;
		}
		
		/**
		 * An internal map that stores all of the generated CSS rules,
		 * as well as the internally generated identifiers (which may 
		 * become class names) that refer to them.
		 */
		private readonly styleSheet = new Map<string, Rule>();
	}
}

/**
 * Global library object.
 */
const ss = Reflex.Core.createContainerNamespace<Reflex.SS.Namespace>(
	new Reflex.SS.Library(),
	true);


