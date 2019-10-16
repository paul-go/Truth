
namespace Reflex.SS
{
	/** */
	export class Rule
	{
		readonly selectorFragments: string[] = [];
		readonly declarations: Call[] = [];
		readonly children: Rule[] = [];
		readonly containers: Rule[] = [];
		
		/**
		 * Returns a serialized CSS representation of this Rule instance,
		 * and all rules nested inside of it.
		 */
		toRulesString()
		{
			if (this.declarations.length + this.children.length === 0)
				return "";
			
			const indentChar = "\t";
			const lineChar = "\n";
			const ruleTexts: string[] = [];
			
			for (const rule of eachDecendentRule(this))
			{
				for (const rulePath of eachRulePath(rule))
				{
					const selectorPaths = rulePath.map(fragmentsOf);
					const selectorsFactored = Util.factor(selectorPaths);
					const selectors = selectorsFactored
						.map(sel => spaceAwareJoin(sel, " "))
						.filter(sel => sel);
					
					const selector = spaceAwareJoin(selectors, ", ");
					
					ruleTexts.push(
						selector + lineChar +
						"{" +
							rule.declarations
								.map(d => lineChar + indentChar + d.toDeclarationString())
								.join("") + lineChar + 
						"}");
				}
			}
			
			return ruleTexts.join(lineChar);
		}
		
		/**
		 * Returns the name of the unique CSS class name
		 * generated to represent this Rule.
		 */
		get class()
		{
			if (this.classIndex < 0)
				this.classIndex = ++classCounter;
			
			return "-" + this.classIndex.toString(36);
		}
		
		private classIndex = -1;
	}
	
	let classCounter = 0;
	
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
	 * Returns an array containing the entire list of decendent
	 * sub-rules the specified rule, in breadth-first order.
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
}
