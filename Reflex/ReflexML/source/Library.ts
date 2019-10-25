
namespace Reflex.ML
{
	export class Library implements Reflex.Core.ILibrary
	{
		/** */
		isKnownBranch(branch: Reflex.Core.IBranch)
		{
			if (branch instanceof Element)
				return true;
			
			const e = <Element>branch;
			return typeof e.tagName === "string" && e.ELEMENT_NODE === 1;
		}
		
		/** */
		isBranchDisposed(branch: Reflex.Core.IBranch)
		{
			return branch instanceof HTMLElement &&
				!document.body.contains(branch);
		}
		
		/** */
		getStaticNonBranches()
		{
			const isInput = (e: HTMLElement): e is HTMLInputElement =>
				e.ELEMENT_NODE === 1 &&
					["input", "textarea"].includes(e.tagName);
			
			return {
				/**
				 * Causes the connected HTMLElement to be data-bound to the
				 * specified Force.
				 * 
				 * Uses the Force's .value property when connected to an
				 * HTMLInputElement, otherwise, the .textContent property is used.
				 */
				bind<T extends string | number | bigint>(
					statefulForce: Reflex.Core.StatefulForce<T>): (e: HTMLElement) => any
				{
					const assign = (value: string | null) =>
					{
						value = value || "";
						
						switch (typeof statefulForce.value)
						{
							case "string":
								statefulForce.set(<any>value);
								break;
							
							case "number":
								statefulForce.set(<any>parseInt(value, 10));
								break;
							
							case "bigint":
								statefulForce.set(<any>BigInt(value));
						}
					};
					
					return (e: HTMLElement) =>
						isInput(e) ?
							[
								{ value: statefulForce },
								on("input", () => assign(e.value)).run()
							] :
							[
								ml(statefulForce),
								on("input", () => assign(e.textContent)).run()
							];
				}
			};
		}
		
		/** */
		getDynamicBranch(name: string)
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
		createContent(content: any)
		{
			if (typeof content === "string" || 
				typeof content === "number" ||
				typeof content === "bigint")
				return new Text("" + content);
			
			return null;
		}
		
		/** */
		attachAtomic(
			atomic: any,
			owner: Branch,
			ref: Node | "prepend" | "append")
		{
			if (typeof atomic === "string")
				return owner.classList.add(atomic);
			
			if (typeof atomic === "number" ||
				typeof atomic === "bigint" ||
				typeof atomic === "boolean")
				atomic = new Text("" + atomic);
			
			if (atomic instanceof Element || atomic instanceof Text)
			{
				if (ref === "prepend")
					return owner.prepend(atomic);
				
				if (ref === "append")
					return owner.append(atomic);
				
				if (ref instanceof Element && atomic instanceof Element)
					return void ref.insertAdjacentElement("afterend", atomic);
				
				if (ref === owner.lastChild)
					return void owner.append(atomic);
				
				const nodes = owner.childNodes;
				for (let i = nodes.length - 1; i-- > 0;)
					if (nodes[i] === ref)
						return void owner.insertBefore(atomic, nodes[i + 1]);
			}
		}
		
		/** */
		detachAtomic(atomic: any, owner: Branch)
		{
			if (atomic instanceof Element || atomic instanceof Text)
				atomic.remove();
			
			else if (typeof atomic === "string")
				owner.classList.remove(atomic);
		}
		
		/** */
		swapBranches(branch1: Branch, branch2: Branch)
		{
			branch2.parentElement!.insertBefore(this.transientMarker, branch2);
			branch1.parentElement!.insertBefore(branch2, branch1);
			this.transientMarker.parentElement!.insertBefore(branch1, this.transientMarker);
			this.transientMarker.remove();
		}
		
		/**
		 * This comment object is inserted into the DOM as a placeholder,
		 * and removed.
		 */
		private readonly transientMarker = document.createComment("");
	
		/** */
		replaceBranch(branch1: Branch, branch2: Branch)
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
			target: Reflex.Core.IBranch,
			selector: any,
			callback: Reflex.Core.RecurrentCallback,
			rest: any[])
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
			target: Reflex.Core.IBranch,
			selector: any,
			callback: Reflex.Core.RecurrentCallback)
		{
			if (target instanceof HTMLElement)
				if (typeof selector === "string")
					target.removeEventListener(selector, callback);
		}
	}
}
