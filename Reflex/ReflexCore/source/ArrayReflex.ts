
namespace Reflex.Core
{
	/**
	 * An array class that wraps an array of data objects, but is also
	 * connected to the presentation of the elements.
	 * Affecting this array causes the presented elements to also
	 * be affected.
	 */
	export interface ArrayReflex<T = any> extends Array<T>
	{
		/**
		 * Removes all occurences of the specified item from the array.
		 */
		delete(item: T): T | undefined;
		
		/**
		 * Resizes the array.
		 * Mirrors the behavior of `array.length = n`, except with support
		 * for Internet Explorer 11 and lower.
		 */
		resize(length: number): number;
		
		/**
		 * Assigns a specific index in this array.
		 * Mirrors the behavior of `array[n] = value`, except with support
		 * for Internet Explorer 11 and lower.
		 */
		set(index: number, value: T): void;
		
		/**
		 * Returns the this object after copying a section of the array identified
		 * by start and end to the same array starting at position target
		 * @param target If target is negative, it is treated as length+target
		 * where length is the length of the array.
		 * @param start If start is negative, it is treated as length+start.
		 * If end is negative, it is treated as length+end.
		 * @param end If not specified, length of the this object is used as its default value.
		 */
		moveWithin(target: number, start: number, end?: number): this;
		
		/**
		 * Returns the elements of an array that meet the condition specified in a callback function.
		 * @param callbackFn A function that accepts up to three arguments. The filter method calls
		 * the callbackFn function one time for each element in the array.
		 * @param thisArg An object to which the this keyword can refer in the callbackFn function.
		 * If thisArg is omitted, undefined is used as the this value.
		 */
		filter<S extends T>(callbackFn: (value: T, index: number, array: T[]) => value is S, thisArg?: any): S[];
		/**
		 * Returns the elements of an array that meet the condition specified in a callback function.
		 * @param callbackFn A function that accepts up to three arguments. The filter method calls
		 * the callbackFn function one time for each element in the array.
		 * @param thisArg An object to which the this keyword can refer in the callbackFn function.
		 * If thisArg is omitted, undefined is used as the this value.
		 */
		filter(callbackFn: (value: T, index: number, array: T[]) => any, thisArg?: any): T[];
		
		filter(effect: number, callbackFn: (value: T, index: number, array: T[]) => any, thisArg?: any): T[];
		
		/**
		 * Sorts an array.
		 * @param compareFn The name of the function used to determine the
		 * order of the elements. If omitted, the elements are sorted in ascending, 
		 * ASCII character order.
		 */
		sort(compareFn?: (a: T, b: T) => number): this;
		sort<T>(reflex: StatelessReflex | ArrayReflex, compareFn?: (a: T, b: T) => number): ArrayReflex;
		
		/**
		 * An effect that runs when an item is added to this array.
		 */
		readonly added: (item: T, position: number) => void;
		
		/**
		 * An effect that runs when an item is removed from this array.
		 */
		readonly removed: (item: T, position: number) => void;
		
		/**
		 * An effect that runs when an item is moved to another
		 * location in this array.
		 */
		readonly moved: (item: T, from: number, to: number) => void;
	}
	
	/** */
	export interface ArrayReflexLegacy<T> extends ArrayReflex<T>
	{
		readonly length: number;
	}
	
	/** @internal */
	export namespace ArrayReflex
	{
		/** */
		export function create<T>(source: T[]): ArrayReflex<T>
		{
			let proxy: any;
			
			const added = reflex<(item: T, position: number) => void>();
			const removed = reflex<(item: T, position: number) => void>();
			const moved = reflex<(item: T, from: number, to: number) => void>();
			
			/** */
			function push(...items: any[])
			{
				const len = source.length;
				const result = source.push(...items);
				
				for (let i = -1; ++i < items.length;)
					added(items[i], len + i);
				
				return result;
			}
			
			/** */
			function pop()
			{
				const len = source.length;
				const result = source.pop();
				
				if (source.length < len)
					removed(result!, len - 1);
				
				return result;
			}
			
			/** */
			function shift()
			{
				const len = source.length;
				const result = source.shift();
				
				if (source.length < len)
					removed(result!, 0);
				
				return result;
			}
			
			/** */
			function unshift(...items: any[])
			{
				const result = source.unshift(...items);
				
				for (let i = -1; ++i < items.length;)
					added(items[i], i);
				
				return result;
			}
			
			/** */
			function splice(start: number, deleteCount?: number, ...items: any[])
			{
				const delCount = deleteCount || 0;
				const extracted = delCount > 0 ? source.slice(start, start + delCount) : [];
				
				for (let i = -1; ++i < extracted.length;)
					removed(extracted[i], start + i);
				
				return source.splice(start, deleteCount || 0, ...items);
			}
			
			/** */
			function moveWithin(target: number, start: number, end?: number)
			{
				const slice = source.slice(start, end);
				source.splice(start, slice.length);
				source.splice(target, 0, ...slice);
				
				for (let i = -1; ++i < slice.length;)
					moved(slice[i], start + i, target + i);
				
				return proxy;
			}
			
			/** */
			function del(item: any)
			{
				for (let i = 0; i < source.length;)
				{
					const nowItem = source[i];
					
					if (nowItem === item)
					{
						source.splice(i, 1);
						removed(item, i);
					}
					else i++;
				}
			}
			
			/** */
			function resize(length: number)
			{
				const sourceLength = source.length;
				if (length > sourceLength)
					throw new RangeError("Cannot expand this array by setting the .length property.");
				
				const cut = length >= 0 && length < sourceLength ?
					source.slice(length) : 
					[];
				
				source.length = Math.max(0, length);
				
				for (let i = -1; ++i < cut.length;)
					removed(cut[i], source.length + i);
				
				return source.length;
			}
			
			/** */
			function set(index: number, value: any)
			{
				const len = source.length;
				
				if (value > len || value < 0)
					throw new RangeError("Cannot expand this array by setting uninitialized indexes.");
				
				if (index < source.length)
				{
					const spliced = source[index];
					source.splice(index, 1, value);
					removed(spliced, index);
					added(value, index);
				}
				else push(value);
			}
			
			if ("MODERN")
			{
				return proxy = <any>new Proxy(source, {
					get(source: any[], name: keyof any[])
					{
						// Overridden array functions
						switch (name)
						{
							case "push": return push;
							case "pop": return pop;
							case "shift": return shift;
							case "unshift": return unshift;
							case "splice": return splice;
							case "moveWithin": return moveWithin;
							case "delete": return del;
							case "added": return added;
							case "removed": return removed;
							case "moved": return moved;
							case "resize": return resize;
							case "set": return set;
						}
						
						// Array indexes
						const c = (<string>name).charCodeAt(0);
						if (c > 47 && c < 58)
							return source[+name | 0];
						
						// Normal array functions
						return source[name];
					},
					set(source: any[], name: any, value: any)
					{
						if (name === "length")
							resize(+value | 0);
						else
							source[name] = value;
						
						return true;
					}
				});
			}
			else
			{
				/*
				const EffectArray = (() =>
				{	
					function EffectArray(refArray)
					{
						const outArray = [];
						Object.setPrototypeOf(outArray, EffectArray.prototype);
						outArray.push(...refArray);
						return outArray;
					};
					
					EffectArray.prototype = new Array();
					
					// EffectArray.prototype.push = function(...args)
					// {
					// 	return Array.prototype.push.apply(this, args);
					// };
					
					EffectArray.prototype.pop = function()
					{
						return Array.prototype.pop.call(this);
					};
					
					return EffectArray;
				})();

				function show(...args)
				{
					alert(args.join());
				}

				const myArray = ["a", "b"];
				const effectArray = new EffectArray(myArray);
				effectArray.push("c", "d");
				show.apply(null, effectArray);
				*/
				
				return null!;
			}
		}
		
		/** */
		export function is(object: any): object is ArrayReflex
		{
			// NOTE: A different implementation of this
			// function is needed for the legacy build.
			
			if (!Array.isArray(object))
				return false;
				
			if ("MODERN")
				return isReflexFunction((<any>object).added);
			
			return false;
		}
	}
}
