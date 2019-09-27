
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
				 * specified effect variable.
				 * 
				 * Uses the effect variable's .value property when connected to an
				 * HTMLInputElement, otherwise, the .textContent property is used.
				 */
				bind<T extends string | number | bigint>(effectVariable: Reflex.Core.StatefulReflex<T>)
				{
					const assign = (value: string | null) =>
					{
						value = value || "";
						
						switch (typeof effectVariable.value)
						{
							case "string":
								effectVariable.set(<any>value);
								break;
							
							case "number":
								effectVariable.set(<any>parseInt(value, 10));
								break;
							
							case "bigint":
								effectVariable.set(<any>BigInt(value));
						}
					};
					
					return (e: HTMLElement) =>
						isInput(e) ?
							[
								{ value: effectVariable },
								on("input", () => assign(e.value)).run()
							] :
							[
								ml(effectVariable),
								on("input", () => assign(e.textContent)).run()
							];
				},
				
				/**
				 * Serializes the specified DOM Node instance.
				 */
				emit(target: Node | Node[], options?: IEmitOptions)
				{
					return emit(target, options);
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
		
		/** */
		swapElement(branch1: Branch, branch2: Branch)
		{
			branch2.parentElement!.insertBefore(this.tempMark, branch2);
			branch1.parentElement!.insertBefore(branch2, branch1);
			this.tempMark.parentElement!.insertBefore(branch1, this.tempMark);
			this.tempMark.remove();
		}
		
		private tempMark = document.createComment("");
	
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

/**
 * Global library accessor.
 * (This should be conditionally globalized.)
 */
const ml = Reflex.Core.createNamespaceObject<Reflex.ML.Namespace>(
	window,
	new Reflex.ML.Library());
