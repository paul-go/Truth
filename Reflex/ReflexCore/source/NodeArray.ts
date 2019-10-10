
declare namespace Reflex.Core
{
	export interface MetaArray<T extends Meta = Meta>
	{
		/**
		 * Moves a section of this array identified by start and end to
		 * to another location within this array, starting at the specified
		 * target position.
		 * 
		 * @param target If target is negative, it is treated as length+target where length is the
		 * length of the array.
		 * @param start If start is negative, it is treated as length+start. If end is negative, it
		 * is treated as length+end.
		 * @param end If not specified, length of the this object is used as its default value.
		 */
		moveWithin(target: number, start: number, end: number): this;
		
		/**
		 * Gets or sets the length of the array. This is a number one higher 
		 * than the highest element defined in an array.
		 */
		length: number;
		
		/**
		 * Appends new elements to an array, and returns the new length of the array.
	       * @param children New elements of the Array.
		 */
		push(...children: Meta[]): number;
		
		/**
		 * Removes the last element from an array and returns it.
		 */
		pop(): Meta | undefined;
		
		/**
		 * Removes the first element from an array and returns it.
		 */
		shift(): Meta | undefined;
		
		/**
		 * Inserts new elements at the start of an array.
		 * @param children  Elements to insert at the start of the array.
		 */
		unshift(...children: Meta[]): number;
		
		/**
		 * Reverses the elements in the array.
		 */
		reverse(): this;
		
		/**
		 * Returns a section of an array.
		 * @param start The beginning of the specified portion of the array.
		 * @param end The end of the specified portion of the array.
		 */
		slice(start?: number, end?: number): MetaArray<T>;
		
		/**
		 * Removes elements from an array and, if necessary, inserts new elements in their
		 * place, returning the deleted elements.
		 * @param start The zero-based location in the array from which to start removing elements.
		 * @param deleteCount The number of elements to remove.
		 */
		splice(start: number, deleteCount?: number): Meta[];
		
		/**
		 * Removes elements from an array and, if necessary, inserts new elements in their place,
		 * returning the deleted elements.
		 * @param start The zero-based location in the array from which to start removing elements.
		 * @param deleteCount The number of elements to remove.
		 * @param items Elements to insert into the array in place of the deleted elements.
		 */
		splice(start: number, deleteCount?: number, ...items: Meta[]): Meta[];
		
		/**
		 * Sorts an array.
		 * @param compareFn The name of the function used to determine the
		 * order of the elements. If omitted, the elements are sorted in ascending, 
		 * ASCII character order.
		 */
		sort<T>(reference: T[], compareFn: (a: T, b: T) => number): this;
		sort<T>(reference: T[]): this;
		sort<T>(compareFn: (a: Meta, b: Meta) => number): this;
		
		/**
	       * Returns the index of the first occurrence of a value in an array.
	       * @param searchMeta The value to locate in the array.
	       * @param fromIndex The array index at which to begin the search. 
		 * If fromIndex is omitted, the search starts at index 0.
	       */
		indexOf(searchMeta: Meta, fromIndex?: number): number;
		
		/**
	       * Returns the index of the last occurrence of a specified value in an array.
	       * @param searchMeta The value to locate in the array.
	       * @param fromIndex The array index at which to begin the search. 
		 * If fromIndex is omitted, the search starts at the last index in the array.
	       */
		lastIndexOf(searchMeta: Meta, fromIndex?: number): number;
	}
}
