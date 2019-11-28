
namespace Reflex.SS
{
	/**
	 * A class that stores the information about a CSS rule
	 * relevant to the library.
	 */
	export class Rule
	{
		/**
		 * Sets the priority of the rule. Low, default, and high
		 * priority indicate that the rule should be inserted at
		 * the top, middle, and bottom section of the style sheet.
		 */
		priority = Priority.default;
		
		readonly selectorFragments: string[] = [];
		readonly declarations: Command[] = [];
		readonly children: Rule[] = [];
		
		/**
		 * Gets the CSS class that uniquely identifies this Rule.
		 * 
		 * In the case when this Rule is anonymous (meaning that it has no selector 
		 * information), this property stores a generated CSS class name, used to
		 * uniquely identify this rule.
		 * 
		 * In other cases, this property stores an empty string.
		 */
		get instanceClass()
		{
			if (this.instanceClassCount < 0)
				this.instanceClassCount = ++Rule.classCounter;
			
			return "_" + this.instanceClassCount.toString(36);
		}
		private instanceClassCount = -1;
		
		/**
		 * @reword
		 * Returns a CSS class name, that is unique to each set of CSS declarations
		 * contained by this Rule, as well as all child rules.
		 */
		get structuralClass()
		{
			if (this._hash !== null)
				return this._hash;
			
			const hashContent = this.getSubtree().map(rule =>
			{
				// It's important that the toString() method is not called on 
				// the "this" because that would result in a stack overflow. 
				// Instead, the "this" rule's declarations are serialized.
				return rule === this ?
					rule.selectorFragments.concat(rule.declarations.map(d => d.toString())) :
					rule.toString();
			});
		
			return this._hash = Util.calculateHash(hashContent).toString(36);
		}
		private _hash: string | null = null;
		
		/**
		 * 
		 */
		getStructuralSelector()
		{
			return this.getSelector(this.structuralClass);
		}
		
		/**
		 * Returns the 
		 */
		getInstanceSelector()
		{
			return this.getSelector(this.instanceClass);
		}
		
		/**
		 * Returns the final compiled selector of this Rule.
		 */
		private getSelector(cls: string)
		{
			const ancestry = this.getAncestry();
			const selectorPaths = ancestry.map(rule =>
			{
				const fragments = rule.selectorFragments.filter(frag => frag.trim() !== "");
				if (fragments.length === 0)
					return ["." + cls];
				
				const selectorLocal = fragments.join("");
				const selectorFragments = Util.splitSelector(selectorLocal);
				return selectorFragments;
			});
			
			const selectorsFactored = Util.factor(selectorPaths);
			const selectors = selectorsFactored
				.map(sel => this.spaceAwareJoin(sel, " "))
				.filter(sel => sel);
			
			return this.spaceAwareJoin(selectors, ", ");
		}
		
		/**
		 * Performs a string join on the specified array, optionally using
		 * the specified separator. The junction points of the concatenation
		 * are guaranteed to have at most 1 space character.
		 */
		private spaceAwareJoin(array: string[], sep = ",")
		{
			if (array.length === 0)
				return "";
			
			if (sep.trim().length === 0 && sep.length > 0)
				return array.map(item => item.trim()).join(" ");
			
			const out: string[] = [];
			for (let i = -1; ++i < array.length;)
				if (array[i] !== "")
					out.push(array[i], sep);
			
			out.length--;
			
			for (let i = -1; ++i < out.length - 1;)
			{
				const now = out[i];
				const next = out[i + 1];
				const space = now.endsWith(" ") || next.startsWith(" ") ? " " : "";
				out[i] = now.trimEnd() + space;
				out[i + 1] = next.trimStart();
			}
			
			return out.join("").trim();
		}
		
		/**
		 * Gets the Rule that contains this one, or null in the case
		 * when the Rule has not been added as a child of another Rule.
		 */
		get container()
		{
			return this._container;
		}
		
		/**
		 * Assigns this Rule's containing Rule. Can only be done once.
		 */
		setContainer(value: Rule)
		{
			if (this._container !== null)
				throw new Error(
					"Cannot reset the container of this Rule, " +
					"because it has already been assigned");
			
			this._container = value;
		}
		private _container: Rule | null = null;
		
		/**
		 * The atom of a Rule is it's generated CSS class, if any.
		 * This allows Rule instances to be compatible with ReflexML,
		 * i.e., so that they can be fed in as a parameter to ml.tag() calls,
		 * and atomize as CSS class names.
		 */
		[Reflex.atom]()
		{
			return this.selectorFragments.length === 0 ?
				[this.structuralClass, this.instanceClass] :
				[];
		}
		
		/**
		 * Returns an array of strings that are serialized CSS representation 
		 * of this Rule instance, and all rules nested inside of it.
		 */
		toString(options?: IEmitOptions): string
		{
			const { indent, line } = fillOptions(options);
			return this.getStructuralSelector() + line +
				"{" +
					this.declarations
						.sort((a, b) =>
						{
							// The declarations need to be sorted so that rules
							// that are otherwise identical, other than the ordering
							// of two unrelated properties still generate the same hash.
							const an = a.callingName;
							const bn = b.callingName;
							return (an === bn || an < bn) ? -1 : 1;
						})
						.map(d => line + indent + d.toString())
						.join("") + line + 
				"}";
		}
		
		/**
		 * Returns an array with the ancestry of containers,
		 * starting with the current Rule at the left-most side of the array.
		 */
		getAncestry()
		{
			const out: Rule[] = [this];
			
			let i = 0;
			while (++i < 1000)
			{
				const nextContainer = out[out.length - 1].container;
				if (!nextContainer)
					break;
				
				out.unshift(nextContainer);
			}
			
			if (i >= 1000)
				throw new Error("Internal error.");
			
			return out;
		}
		
		/**
		 * Returns an array containing the specifed rule, and it's
	 	 * entire subtree of decendent rules, in breadth-first order.
		 */
		getSubtree()
		{
			const out: Rule[] = [this];
		
			for (let i = -1; ++i < out.length;)
				out.push(...out[i].children);
			
			return out;
		}
		
		/** @internal */
		static reset()
		{
			this.classCounter = 0;
		}
		
		/** Counter variable used to generate new CSS "instance" classes. */
		private static classCounter = 0;
	}
}
