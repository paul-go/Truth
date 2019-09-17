
namespace Reflex.ML
{
	/** */
	export class Library extends Core.Library<Namespace>
	{
		constructor()
		{
			super(window);
		}
		
		/** */
		isKnownBranch(branch: Core.IBranch)
		{
			if (branch instanceof Element)
				return true;
			
			const e = <Element>branch;
			return typeof e.tagName === "string" && e.ELEMENT_NODE === 1;
		}
		
		/** */
		getNamespaceStatic()
		{
			return {
				bind: (evar: Reflex.Core.StatefulReflex) => (e: HTMLElement) =>
				{
					return this.isInput(e) ?
						[
							{ value: evar },
							on("input", () =>
							{
								evar.set(e.value);
							}).run()
						] :
						[
							ml(evar),
							on("input", () => evar.set(e.textContent || "")).run()
						];
				}
			};
		}
		
		/** */
		getNamespaceComputed()
		{
			return () => Reflex.Core.ComputedMemberType.branch;
		}
		
		/** */
		createBranch(name: string)
		{
			if (!name.startsWith("input"))
				return document.createElement(name);
			
			const e = document.createElement("input");
			e.type = name.slice(5).toLowerCase();
			return e;
		}
		
		/** */
		getChildren(target: Branch)
		{
			return new NodeArray(target);
		}
		
		/** */
		isBranchDisposed(branch: Branch)
		{
			return !document.body.contains(branch);
		}
		
		/** */
		prepareContent(content: any)
		{
			if (typeof content === "string" || 
				typeof content === "number" ||
				typeof content === "bigint")
				return new Text("" + content);
			
			return null;
		}
		
		/** */
		attachPrimitive(
			primitive: any,
			owner: Branch,
			ref: Node | "prepend" | "append")
		{
			if (typeof primitive === "string")
				return owner.classList.add(primitive);
			
			if (typeof primitive === "number" ||
				typeof primitive === "bigint" ||
				typeof primitive === "boolean")
				primitive = new Text("" + primitive);
			
			if (primitive instanceof Element || primitive instanceof Text)
			{
				if (ref === "prepend")
					return owner.prepend(primitive);
				
				if (ref === "append")
					return owner.append(primitive);
				
				if (ref instanceof Element && primitive instanceof Element)
					return void ref.insertAdjacentElement("afterend", primitive);
				
				if (ref === owner.lastChild)
					return void owner.append(primitive);
				
				const nodes = owner.childNodes;
				for (let i = nodes.length - 1; i-- > 0;)
					if (nodes[i] === ref)
						return void owner.insertBefore(primitive, nodes[i + 1]);
			}
		}
		
		/** */
		detachPrimitive(primitive: any, owner: Branch)
		{
			if (primitive instanceof Element || primitive instanceof Text)
				primitive.remove();
			
			else if (typeof primitive === "string")
				owner.classList.remove(primitive);
		}
		
		private tempMark = document.createComment("");
		/** */
		swapElement(branch1: Branch, branch2: Branch)
		{
			branch2.parentElement!.insertBefore(this.tempMark, branch2);
			branch1.parentElement!.insertBefore(branch2, branch1);
			this.tempMark.parentElement!.insertBefore(branch1, this.tempMark);
			this.tempMark.remove();
		}
	
		/** */
		replaceElement(branch1: Branch, branch2: Branch)
		{
			branch1.replaceWith(branch2);
		}
		
		/** */
		attachAttribute(branch: Branch, key: string, value: any)
		{
			if (key in branch)
				(<any>branch)[key] = value;
			else
				branch.setAttribute(key, "" + value);
		}
		
		/** */
		detachAttribute(branch: Branch, key: string)
		{
			branch.removeAttribute(key);
		}
		
		/** */
		attachRecurrent(
			kind: Reflex.Core.RecurrentKind,
			target: Branch,
			selector: any,
			callback: Reflex.Core.RecurrentCallback<Reflex.ML.Primitives>)
		{
			if (typeof selector !== "string")
				return false;
			
			if (!(target instanceof Window || target instanceof Node))
				return false;
			
			if (!("on" + selector in target))
				return false;
			
			target.addEventListener(selector, callback);
			return true;
		}
		
		/** */
		detachRecurrent(
			target: Branch,
			selector: any,
			callback: Reflex.Core.RecurrentCallback<Reflex.ML.Primitives>): void
		{
			if (typeof selector === "string")
				target.removeEventListener(selector, callback);
		}
		
		/** */
		private isInput(e: HTMLElement): e is HTMLInputElement
		{
			return e instanceof HTMLInputElement;
		}
	}
	
	/**
	 * Stores the global "ml" object used to create HTML elements.
	 */
	export const namespace = new Library().namespace;
}

/**
 * Global library accessor.
 * (This should be conditionally globalized.)
 */
const ml = Reflex.ML.namespace;
