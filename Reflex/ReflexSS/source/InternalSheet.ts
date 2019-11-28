
namespace Reflex.SS
{
	/**
	 * @internal
	 * An internal intermediate representation of a CSSStyleSheet used
	 * to determine the regions of rules that belong to each priority level.
	 * 
	 * A class that stores a series of internal maps. These maps store
	 * the generated CSS rules, as well as the internally generated 
	 * identifiers (which may become class names) that refer to them.
	 * The rules are divided into 3 maps that represent the 3 possible
	 * priority levels of rules.
	 */
	export class InternalSheet
	{
		/**
		 * Accessor for the sole internal 
		 */
		static get this()
		{
			return this._this || (this._this = new InternalSheet());
		}
		private static _this: InternalSheet | null = null;
		
		/** */
		private constructor() { }
		
		/** @internal */
		insertRule(rule: Rule)
		{
			const cls = rule.instanceClass;
			if (!this.get(cls))
				this.set(cls, rule);
			
			if (this.streamingEnabled && this.nativeSheet)
			{
				const subtree = rule.getSubtree();
				
				for (const rule of subtree)
				{
					const low = this.nativeRuleCountLow;
					const def = this.nativeRuleCountDefault;
					const insertAt =
						rule.priority === Priority.low ? low :
						rule.priority === Priority.default ? low + def :
						this.nativeSheet.cssRules.length;
					
					const cssText = rule.toString();
					this.nativeSheet.insertRule(cssText, insertAt);
					const cssRule = this.nativeSheet.cssRules.item(insertAt);
					
					if (typeof CSSStyleRule === "function")
						if (cssRule instanceof CSSStyleRule)
							this.structuralRuleMap.set(rule, cssRule);
					
					switch (rule.priority)
					{
						case Priority.low: this.nativeRuleCountLow++; break;
						case Priority.default: this.nativeRuleCountDefault++; break;
					}
				}
			}
		}
		
		/**
		 * Returns the instance-side (as opposed to the structural-side) 
		 * native CSSRule associated with the specified Rule instance.
		 * Returns null in the case when the instance-side CSS rule has
		 * not been added to the CSS DOM.
		 */
		getNativeInstanceRule(rule: Rule)
		{
			// Safety check, in the case when somehow this code ends
			// up getting executing outside of a browser.
			if (typeof CSSGroupingRule !== "function")
				return null;
			
			return this.instanceRuleMap.get(rule) || (() =>
			{
				const structuralRule = this.structuralRuleMap.get(rule);
				if (!structuralRule)
					return null;
				
				const [ruleIdx, container] = this.findRuleIndex(structuralRule);
				if (container === null)
					return null;
				
				const insertIdx = ruleIdx + 1;
				const structuralCssText = rule.getInstanceSelector() + "{}";
				container.insertRule(structuralCssText, insertIdx);
				
				if (rule.priority === Priority.low)
					this.nativeRuleCountLow++;
				
				else if (rule.priority === Priority.default)
					this.nativeRuleCountDefault++;
				
				const instanceRule = <CSSStyleRule>container.cssRules[insertIdx];
				this.instanceRuleMap.set(rule, instanceRule);
				return instanceRule;
			})();
		}
		
		/**
		 * Returns the index of the rule within it's container,
		 * whether that's a CSSStyleSheet, or a CSSGroupingRule.
		 */
		private findRuleIndex(rule: CSSStyleRule): [number, CssContainer | null]
		{
			const container =
				rule.parentRule instanceof CSSGroupingRule ? rule.parentRule :
				rule.parentStyleSheet ? rule.parentStyleSheet :
				null;
			
			if (container)
				for (let i = container.cssRules.length; i-- > 0;)
					if (container.cssRules[i] === rule)
						return [i, container];
			
			return [-1, null];
		}
		
		/** */
		emit(options: IEmitOptions)
		{
			const opt = fillOptions(options);
			
			const rules = Array.from(this.values())
				.filter(rule => !rule.container)
				.map(rule => rule.getSubtree().map(rule => rule.toString(opt)))
				.reduce((a, b) => a.concat(b), []);
			
			return rules.join(opt.line + opt.line);
		}
		
		/**
		 * Enables or disables streaming of CSS content to a generated style sheet.
		 */
		stream(enable: boolean)
		{
			if (typeof window === "undefined" ||
				typeof document === "undefined")
				return;
			
			if (!(this.streamingEnabled = enable))
				return;
			
			if (!this.nativeSheet)
			{
				const styleTag = document.createElement("style");
				styleTag.setAttribute("data-reflex-ss", "");
				document.head.appendChild(styleTag);
				this.nativeSheet = <CSSStyleSheet>styleTag.sheet;
			}
		}
		
		/**
		 * Removes all generated CSS rules from ReflexSS's internal
		 * style sheet, as well as it's internal caches.
		 */
		reset()
		{
			this.clear();
			Rule.reset();
			
			this.nativeRuleCountLow = 0;
			this.nativeRuleCountDefault = 0;
			this.ruleHashes.clear();
			
			while (this.nativeSheet?.cssRules.length)
				this.nativeSheet.deleteRule(0);
		}
		
		/** */
		get(className: string)
		{
			return this.low.get(className) || 
				this.default.get(className) ||
				this.high.get(className);
		}
		
		/** */
		set(className: string, rule: Rule)
		{
			switch (rule.priority)
			{
				case Priority.low: this.low.set(className, rule); break;
				case Priority.default: this.default.set(className, rule); break;
				case Priority.high: this.high.set(className, rule); break;
			}
		}
		
		/** */
		*values()
		{
			for (const value of this.low.values())
				yield value;
			
			for (const value of this.default.values())
				yield value;
			
			for (const value of this.high.values())
				yield value;
		}
		
		/** */
		clear()
		{
			this.low.clear();
			this.default.clear();
			this.high.clear();
		}
		
		/**
		 * Stores a value that indicates whether a native CSSStyleSheet
		 * object has been created, which will be used as the storage
		 * location for CSS information generated at runtime. The member
		 * is unused outside of the browser.
		 */
		private nativeSheet?: CSSStyleSheet;
		
		/**
		 * Stores whether the streaming to a CSSStyleSheet is enabled.
		 * The member is unused outside of the browser.
		 */
		private streamingEnabled?: boolean;
		
		private nativeRuleCountLow = 0;
		private nativeRuleCountDefault = 0;
		
		/** */
		private ruleHashes = new Set<string>();
		
		/**
		 * @reword
		 * A WeakMap that makes associations between ReflexSS's Rule instances
		 * and native CSSStyleRule instances, which is necessary to support dynamic
		 * Commands.
		 */
		private readonly structuralRuleMap = new WeakMap<Rule, CSSStyleRule>();
		
		/**
		 * @reword
		 */
		private readonly instanceRuleMap = new WeakMap<Rule, CSSStyleRule>();
		
		readonly low = new Map<string, Rule>();
		readonly default = new Map<string, Rule>();
		readonly high = new Map<string, Rule>();
	}
	
	interface CssContainer
	{
		readonly cssRules: CSSRuleList;
		deleteRule(index: number): void;
		insertRule(rule: string, index: number): number;
	}
}
