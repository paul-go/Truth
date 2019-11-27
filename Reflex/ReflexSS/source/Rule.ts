
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
		readonly containers: Rule[] = [];
		
		/**
		 * The atom of a Rule is it's generated CSS class, if any.
		 * This allows Rule instances to be compatible with ReflexML,
		 * i.e., so that they can be fed 
		 */
		[Reflex.atom]()
		{
			return this.class;
		}
		
		/**
		 * Returns an array of strings that are serialized CSS representation 
		 * of this Rule instance, and all rules nested inside of it.
		 */
		toStringArray(options?: IEmitOptions)
		{
			if (this.declarations.length + this.children.length === 0)
				return [];
			
			const { indent, line } = fillOptions(options);
			const rules: string[] = [];
			
			for (const rule of eachDecendentRule(this))
			{
				if (rule.declarations.length === 0)
					continue;
				
				for (const rulePath of eachRulePath(rule))
				{
					const selectorPaths = rulePath.map(fragmentsOf);
					const selectorsFactored = Util.factor(selectorPaths);
					const selectors = selectorsFactored
						.map(sel => spaceAwareJoin(sel, " "))
						.filter(sel => sel);
					
					const selector = spaceAwareJoin(selectors, ", ");
					rules.push(
						selector + line +
						"{" +
							rule.declarations
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
						"}");
				}
			}
			
			return rules;
		}
		
		/**
		 * In the case when this Rule is anonymous (meaning that it has no selector 
		 * information), this property stores a generated CSS class name, used to
		 * uniquely identify this rule.
		 * 
		 * In other cases, this property stores an empty string.
		 */
		get class()
		{
			if (this.classIndex < 0)
				this.classIndex = ++Rule.classCounter;
			
			return "_" + this.classIndex.toString(36);
		}
		
		private classIndex = -1;
		
		/**
		 * 
		 */
		get hash()
		{
			if (this._hash !== null)
				return this._hash;
			
			if (this.hasDynamic())
				return this._hash = "";
			
			const ruleText = this.toStringArray({ format: false }).join("");
			return this._hash = Util.calculateHash(ruleText).toString(36);
		}
		private _hash: string | null = null;
		
		/**
		 * @internal
		 */
		hasDynamic()
		{
			for (const rule of eachDecendentRule(this))
				if (rule.declarations.some(d => d.isDynamic))
					return true;
			
			return false;
		}
		
		/** @internal */
		static reset()
		{
			this.classCounter = 0;
		}
		
		private static classCounter = 0;
	}
	
	
	/**
	 * Returns an array containing the sub-selectors of
	 * the specified rule's fully concatenated selector.
	 */
	function fragmentsOf(rule: Rule)
	{
		const fragments = rule.selectorFragments.filter(frag => frag.trim() !== "");
		if (fragments.length === 0)
			return ["." + rule.class];
		
		const selectorLocal = fragments.join("");
		const selectorFragments = Util.splitSelector(selectorLocal);
		return selectorFragments;
	}
	
	/**
	 * Performs a string join on the specified array, optionally using
	 * the specified separator. The junction points of the concatenation
	 * are guaranteed to have at most 1 space character.
	 */
	function spaceAwareJoin(array: string[], sep = ",")
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
	 * Returns an array containing the specifed rule, and it's
	 * entire subtree of decendent rules, in breadth-first order.
	 */
	function eachDecendentRule(rule: Rule)
	{
		const out: Rule[] = [rule];
		
		for (let i = -1; ++i < out.length;)
			out.push(...out[i].children);
		
		return out;
	}
	
	/**
	 * Returns an array containing every possible path to
	 * each of the specified rule's top-level containers.
	 */
	function eachRulePath(rule: Rule)
	{
		const out: Rule[][] = [];
		const recurse = (rule: Rule, stack: Rule[]) =>
		{
			const newStack = [rule].concat(stack);
			
			if (rule.containers.length === 0)
				out.push(newStack);
			
			for (const containerRule of rule.containers)
				recurse(containerRule, newStack);
		};
		
		recurse(rule, []);
		return out;
	}
	
	/**
	 * 
	 */
	function extractIdentifyingClassNames(selector: string)
	{
		const chars = selector.split("");
		const terminatingChars = [" ", "["];
		
		let pos = 0;
		
		while (pos < chars.length)
		{
			
			
			pos++;
		}
	}
}
