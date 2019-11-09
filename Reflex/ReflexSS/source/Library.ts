
namespace Reflex.SS
{
	export type Branch = Rule;
	export type Leaf = Command;
	export type Atomic = Core.Atomic<Branch, Leaf, string>;
	
	/**
	 * Top-level value for all possible inputs
	 * to the CSS property creation functions.
	 */
	export type CssValue = string | number | Command | Unit;
	
	/**
	 * Creates a namespace.
	 */
	export interface Namespace extends Core.IBranchNamespace<Atomic, string>
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
		low = "( --- LOW --- )",
		default = "( --- DEFAULT --- )",
		high = "( --- HIGH --- )"
	}
	
	/**
	 * 
	 */
	export class Library implements Reflex.Core.ILibrary
	{
		/** */
		constructor()
		{
			this.stream(true);
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
				emit: (options?: IEmitOptions) => this.emit(options || {}),
				stream: (enable?: boolean) => this.stream(!!enable),
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
		private emit(options: IEmitOptions)
		{
			const opt = fillOptions(options);
			
			const rules = Array.from(this.fauxSheet.values())
				.filter(rule => rule.containers.length === 0)
				.map(rule => rule.toStringArray(opt))
				.reduce((a, b) => a.concat(b), []);
			
			return rules.join(opt.line + opt.line);
		}
		
		/**
		 * Enables or disables streaming of CSS content to a generated style sheet.
		 */
		private stream(enable: boolean)
		{
			if (typeof window === "undefined" ||
				typeof document === "undefined")
				return;
			
			if (!(this.streamingEnabled = enable))
				return;
			
			if (!this.nativeSheet)
			{
				const link = document.createElement("style");
				document.head.appendChild(link);
				this.nativeSheet = <CSSStyleSheet>link.sheet;
			}
		}
		
		/**
		 * @internal
		 * 
		 */
		private readonly fauxSheet = new FauxSheet();
		
		/**
		 * @internal
		 * Stores a table of hashes of all serialized rules.
		 * Used to determine if an identical rule has already been
		 * generated. Note that this only deals with rules that are
		 * generated on the client side. Rules that were brought
		 * into the system by another means are not considered.
		 */
		private readonly ruleHashes = new Set<string>();
		
		/**
		 * @internal
		 * Stores a value that indicates whether a native CSSStyleSheet
		 * object has been created, which will be used as the storage
		 * location for CSS information generated at runtime. The member
		 * is unused outside of the browser.
		 */
		private nativeSheet?: CSSStyleSheet;
		
		/**
		 * @internal
		 * Stores whether the streaming to a CSSStyleSheet is enabled.
		 * The member is unused outside of the browser.
		 */
		private streamingEnabled?: boolean;
		
		/** */
		getDynamicNonBranch(name: string)
		{
			return (...values: any[]) =>
			{
				return new Command(name, values);
			}
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
		attachAtomic(
			atomic: any,
			owner: Branch,
			ref: Node | "prepend" | "append")
		{
			if (owner instanceof Rule)
			{
				if (typeof atomic === "number")
				{
					const nth = Math.floor(atomic);
					owner.selectorFragments.push(nth < 0 ?
						`:nth-last-child(${nth * -1})` :
						`:nth-child(${nth - 1})`);
				}
				else if (typeof atomic === "string")
				{
					if (atomic === Priority.low ||
						atomic === Priority.default ||
						atomic === Priority.high)
					{
						owner.priority = atomic;
					}
					else
					{
						const existingRule = this.fauxSheet.get(atomic);
						if (existingRule)
						{
							existingRule.containers.push(owner);
							owner.children.push(existingRule);
						}
						else owner.selectorFragments.push(atomic);
					}
				}
				else if (atomic instanceof Command)
				{
					owner.declarations.push(atomic);
				}
				else if (atomic instanceof Rule)
				{
					// Nested rule
					// This wouldn't actually happen, because 
					// the ss() function returns a string, not a rule.
					debugger;
				}
			}
		}
		
		/** */
		detachAtomic()
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
			branchFn: (...atomics: any[]) => Reflex.Core.IBranch)
		{
			this.attachAtomic(
				" " + branchFn.name.toUpperCase(),
				<Branch>branch,
				"append");
		}
		
		/** */
		returnBranch(rule: Reflex.Core.IBranch)
		{
			if (!(rule instanceof Rule))
				return rule;
			
			const cls = rule.class;
			if (!this.fauxSheet.get(cls))
				this.fauxSheet.set(cls, rule);
			  
			if (this.streamingEnabled && this.nativeSheet)
			{
				for (const cssText of rule.toStringArray())
				{
					let insertAt = 
						rule.priority === Priority.low ? ruleCountLow :
						rule.priority === Priority.default ? ruleCountLow + ruleCountDefault :
						this.nativeSheet.cssRules.length;
					
					const ruleHash = Util.calculateHash(cssText).toString(36);
					if (!this.ruleHashes.has(ruleHash))
					{
						this.nativeSheet.insertRule(cssText, insertAt);
						this.ruleHashes.add(ruleHash);
					}
					
					switch (rule.priority)
					{
						case Priority.low: ruleCountLow++; break;
						case Priority.default: ruleCountDefault++; break;
					}
				}
			}
			return cls;
		}
	}
	
	let ruleCountLow = 0;
	let ruleCountDefault = 0;
	
	/**
	 * A class that stores a series of internal maps. These maps store
	 * the generated CSS rules, as well as the internally generated 
	 * identifiers (which may become class names) that refer to them.
	 * The rules are divided into 3 maps that represent the 3 possible
	 * priority levels of rules.
	 */
	class FauxSheet
	{
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
		
		readonly low = new Map<string, Rule>();
		readonly default = new Map<string, Rule>();
		readonly high = new Map<string, Rule>();
	}
}
