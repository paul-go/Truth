
namespace Reflex.SS
{
	export type Branch = Rule;
	export type Leaf = Command;
	export type Atom = Reflex.Atom<Branch, Leaf, string>;
	
	/**
	 * Top-level value for all possible inputs
	 * to the CSS property creation functions.
	 */
	export type CssValue = string | number | Command | Unit;
	
	/**
	 * 
	 */
	export interface Namespace extends Core.IBranchNamespace<Atom, Rule>
	{
		/**
		 * Serializes all generated CSS content into a string.
		 */
		emit(options?: IEmitOptions): string;
		
		/**
		 * Toggles whether generated CSS is streamed directly into
		 * a CSS style sheet, embedded directly in the web page. 
		 * 
		 * Has no effect in the case when this library is not operating
		 * in the context of a web browser.
		 * 
		 * @param enable Whether to enable streaming.
		 * If unspecified, the value is assumed to be `true`.
		 */
		stream(enable?: boolean): void;
	}
	
	/**
	 * An enumeration that calls out the 3 levels of priority in ReflexSS.
	 */
	export enum Priority
	{
		low = "{ Priority.low }",
		default = "{ Priority.default }",
		high = "{ Priority.high }"
	}
	
	/**
	 * 
	 */
	export class Library implements Reflex.Core.ILibrary
	{
		/** */
		constructor()
		{
			InternalSheet.this.stream(true);
		}
		
		/** */
		isKnownBranch(branch: Branch)
		{
			return branch instanceof Rule;
		}
		
		/** */
		isBranchDisposed()
		{
			return false;
		}
		
		/** */
		getStaticNonBranches()
		{
			return {
				emit: (options?: IEmitOptions) => InternalSheet.this.emit(options || {}),
				stream: (enable?: boolean) => InternalSheet.this.stream(!!enable),
				/**
				 * Removes all generated CSS rules from ReflexSS's internal
				 * style sheet, as well as it's internal caches.
				 */
				reset: () => InternalSheet.this.reset(),
				/**
				 * A ReflexSS-specific priority assignment mechanism, which provides
				 * some control over where in the generated style sheet a generated 
				 * CSS rule may be placed. The 3 levels are intended for the following
				 * uses:
				 * 
				 * Low priority - Intended for establishing defaults, many of which may
				 * be overridden later, such as "CSS reset" style code. Rules with low
				 * priority are inserted at the top of the style sheet.
				 * 
				 * Default priority - Intended for main application rules. Rules with
				 * default priority are inserted in the middle of the style sheet.
				 * 
				 * High priority - Intended as a less onerous version of !important,
				 * (which isn't well supported in ReflexSS, almost by design. Rules
				 * with high priority are inserted at the bottom of the style sheet.
				 */
				priority: Priority
			};
		}
		
		/** */
		getDynamicNonBranch(name: string)
		{
			return (...values: any[]) => new Command(name, values);
		}
		
		/** */
		getChildren(target: Branch)
		{
			return (<(Branch | Leaf)[]>target.declarations).concat(target.children);
		}
		
		/** */
		getRootBranch()
		{
			return new Rule();
		}
		
		/** */
		attachAtom(
			atom: any,
			owner: Branch,
			ref: Branch | Leaf | "prepend" | "append")
		{
			if (!(owner instanceof Rule))
				return;
			
			if (typeof atom === "number")
			{
				const nth = Math.floor(atom);
				owner.selectorFragments.push(nth < 0 ?
					`:nth-last-child(${nth * -1})` :
					`:nth-child(${nth - 1})`);
			}
			else if (
				atom === Priority.low ||
				atom === Priority.default ||
				atom === Priority.high)
			{
				owner.priority = atom;
			}
			else if (typeof atom === "string")
			{
				owner.selectorFragments.push(atom);
			}
			else if (atom instanceof Rule)
			{
				atom.setContainer(owner);
				
				if (ref === "prepend")
					owner.children.unshift(atom);
				
				else if (ref === "append")
					owner.children.push(atom);
				
				else if (ref instanceof Rule)
					for (let i = owner.children.length; i-- > 0;)
						if (owner.children[i] === ref)
							return void owner.children.splice(i, 0, atom);
				
				// ReflexSS currently has no provisions for manging the
				// order of Commands in relation to other sibling rules,
				// due to the fact that this isn't a concept in CSS itself.
				// However, most code patterns involve placing the CSS
				// declarations before the rules. Therefore, in the case
				// when the input "ref" argument is another Command,
				// the best we can do is place the Rule before all other
				// Rules.
				else if (ref instanceof Command)
					owner.children.unshift(atom);
			}
		}
		
		/** */
		detachAtom()
		{
			throw new Error("Not implemented.");
		}
		
		/** */
		swapBranches()
		{
			throw new Error("Not supported.");
		}
		
		/** */
		replaceBranch()
		{
			throw new Error("Not supported.");
		}
		
		/** */
		attachAttribute()
		{
			throw new Error("Not supported.");
		}
		
		/** */
		detachAttribute()
		{
			throw new Error("Not supported.");
		}
		
		/** */
		handleBranchFunction(
			branch: Reflex.Core.IBranch, 
			branchFn: (...atoms: any[]) => Reflex.Core.IBranch)
		{
			this.attachAtom(
				" " + branchFn.name.toUpperCase(),
				<Branch>branch,
				"append");
		}
		
		/** */
		returnBranch(branch: Reflex.Core.IBranch)
		{
			if (branch instanceof Rule)
				InternalSheet.this.insertRule(branch);
			
			return branch;
		}
	}
}
