
namespace Reflex
{
	type SortFunction<T = any> = (a: T, b: T) => number;
	type FilterFunction<T = any> = (value: T, index: number, array: T[]) => boolean;
	
	/**
	 * 
	 */
	export class ArrayForce<T> implements Array<T>
	{
		/** */
		static create<T>(items: T[])
		{
			const store = new Core.ArrayStore<T>();
			const view = new ArrayForce(store);
			view.push(...items);
			return view.proxy();
		}
		
		/** */
		[n: number]: T;
		
		readonly added = force<(item: T, position: number) => void>();
		readonly removed = force<(item: T, position: number, id: number) => void>();
		readonly moved = force<(e1: T, e2: T, i1: number, i2: number) => void>();
		readonly tailChange = force<(item: T, position: number) => void>();
		
		/** */
		readonly positions: number[] = [];
		
		/** */
		readonly root: Core.ArrayStore<T>;
		
		/** */
		constructor(root: Core.ArrayStore<T> | ArrayForce<T>)
		{
			if (root instanceof Core.ArrayStore)
			{	
				this.root = root;
			}
			else 
			{
				this.root = root.root;
				
				Core.ForceUtil.attachForce(root.added, (item: T, index: number) =>
				{
					this.insertRef(index, root.positions[index]);
				});
				
				Core.ForceUtil.attachForce(root.removed, (item: T, index: number, id: number) =>
				{
					const loc = this.positions.indexOf(id);
					if (loc > -1) 
						this.splice(loc, 1);
				});
			}
			Core.ForceUtil.attachForce(this.root.changed, () => 
			{
				this.executeFilter();
				this.executeSort();
			});
		}

		private sortFn?: (a: T, b: T) => number;
		private filterFn?: (value: T, index: number, array: ArrayForce<T>) => boolean;

		/** 
		 * @internal
		 */
		assignSorter(sortFn: (a: T, b: T) => number)
		{
			this.sortFn = sortFn;
			this.executeSort();
			return this;
		}

		/** 
		 * @internal
		 */
		assignFilter(filterFn: (value: T, index: number, array: ArrayForce<T>) => boolean)
		{
			this.filterFn = filterFn;
			this.executeFilter();
			return this;
		}
		
		/** */
		protected executeFilter()
		{
			if (this.filterFn)
			{
				for (let i = this.positions.length; --i >= 0;)
				{
					const position = this.positions[i];
					if (!this.filterFn(this.getRoot(position), i, this))
					{
						const loc = this.positions.indexOf(position);
						if (loc > -1) 
							this.splice(loc, 1);
						else 
							debugger;
					}
				}
			}
		}

		/** */
		protected executeSort()
		{
			if (this.sortFn)
			{
				const array = this.positions;
				const length = array.length;
				const lastItem = array[length - 1];
				
				for (let i = -1; ++i < length - 1;)
				{
					let changed = false;
					for (let n = -1; ++n < length - (i + 1);)
					{
						if (this.sortFn(this.get(n)!, this.get(n + 1)!) > 0)
						{
							changed = true;
							[array[n], array[n + 1]] = [array[n + 1], array[n]];
							this.moved(this.get(n)!, this.get(n + 1)!, n, n + 1);
						}
					}

					if (!changed)
						break;
				}
				
				const newLastItem = array[length - 1];
				if (lastItem !== newLastItem)
					this.tailChange(this.get(length - 1)!, length - 1);
			}
		}

		/** */
		protected filterPush(...items: T[])
		{
			if (this.filterFn)
				return items
					.filter((value, index) => this.filterFn!(value, index, this))
					.map(x => this.root.push(x));

			return items.map(x => this.root.push(x));
		}
		
		/**
		 * Defines getter and setter for index number properties ex. arr[5]
		 */
		private defineIndex(index: number)
		{
			if (!"NOPROXY")
				return;
			
			if (!Object.prototype.hasOwnProperty.call(this, index))
			{	
				Object.defineProperty(this, index, {
					get()
					{
						return this.get(index);
					},
					set(value: any)
					{
						return this.set(index, value);
					}
				});
			}
		}

		/** 
		 * @internal
		 * Inserts positions from parameters into positions array of this
		 * All positions are filtered if there is a filter function assigned to this
		 * Triggers the added Force
		 * Defines index for processed locations
		 */
		protected insertRef(start: number, ...positions: number[])
		{
			const filtered = this.filterFn ?
				positions.filter((value, index) => 
					this.filterFn!(this.getRoot(value), start + index, this)) :
				positions;
			
			this.positions.splice(start, 0, ...filtered);
			
			for (let i = -1; ++i < filtered.length;)
			{
				const item = filtered[i];
				const loc = start + i;
				console.log(this.getRoot(item), loc);
				this.added(this.getRoot(item), loc);
				this.defineIndex(loc);
			}
			
			this.executeSort(); 
		}
		
		/** */
		get length() 
		{
			return this.positions.length;
		}

		/** */
		set length(i: number)
		{
			this.splice(i, this.positions.length - i);
			this.positions.length = i;
		}
		
		/** 
		 * @internal
		 */
		proxy()
		{
			if ("NOPROXY") 
				return this;
			
			if (!this._proxy)
			{
				this._proxy = new Proxy(this, {
					get(target, prop: Extract<keyof ArrayForce<T>, string>)
					{
						const index = parseInt(prop, 10);
						return index !== index ? target[prop] : target.get(index);
					},
					set(target, prop: Extract<keyof ArrayForce<T>, string>, value: T)
					{
						const index = parseInt(prop, 10);
						if (index !== index)
							target.set(index, value);
							
						return true;
					}
				}) as ArrayForce<T>;
			}
				
			return this._proxy;
		}
		
		/** */
		private _proxy?: ArrayForce<T>;

		/** */
		get(index: number)
		{
			return this.getRoot(this.positions[index]);
		}
		
		/** */
		private getRoot(index: number)
		{
			return this.root.get(index)!;
		}

		/** */
		set(index: number, value: T)
		{
			if (this.filterFn)
				if (!this.filterFn(value, index, this))
					this.positions.splice(index, 1);
					
			this.root.set(this.positions[index], value);
		}

		/** 
		 * Returns snapshot of this as a js array 
		 */
		snapshot()
		{
			return this.positions.map(x => this.getRoot(x));
		}

		/** */
		toString(): string
		{
			return JSON.stringify(this.snapshot());
		}

		/** */
		toLocaleString(): string
		{
			return this.toString();
		}

		/** */
		concat(...items: ConcatArray<T>[]): T[];
		concat(...items: (T | ConcatArray<T>)[]): T[];
		concat(...items: any[])
		{
			const array = ArrayForce.create<T>(this.snapshot() as T[]);
			array.push(...items);
			return array.proxy();
		}

		/** */
		join(separator?: string | undefined): string
		{
			return this.snapshot().join(separator);
		}
		
		/** */
		reverse()
		{
			this.positions.reverse();
			return this;
		}
		
		/** */
		slice(start?: number | undefined, end?: number | undefined): T[]
		{
			const array = new ArrayForce(this.root);
			array.insertRef(0, ...this.positions.slice(start, end));
			return array.proxy();
		}
		
		/** */
		sort(compareFn: SortFunction<T>, ...forces: Array<StatelessForce | StatefulForce>): this
		{
			const array = new ArrayForce(this);
			array.sortFn = compareFn;
			
			for (const fo of forces)
				Core.ForceUtil.attachForce(
					fo instanceof StatefulForce ?
						fo.changed : fo, array.executeSort
				);
				
			array.insertRef(0, ...this.positions);
			return array.proxy() as this;
		}
		
		/** */
		indexOf(searchElement: T, fromIndex = 0): number
		{
			for (let i = fromIndex - 1; ++i < this.positions.length;)
				if (this.get(i) === searchElement) 
					return i;
					
			return -1;
		}
		
		/** */
		lastIndexOf(searchElement: T, fromIndex?: number | undefined): number
		{
			for (let i = fromIndex || this.positions.length; --i > -1;)
				if (this.get(i) === searchElement) 
					return i;
					
			return -1;
		}
		
		/** */
		every(callbackFn: (value: T, index: number, array: T[]) => unknown, thisArg?: any): boolean
		{
			for (let i = -1; ++i < this.positions.length;)
				if (!callbackFn.call(thisArg || this, this.get(i), i, this)) 
					return false;
					
			return true;
		}
		
		/** */
		some(callbackFn: (value: T, index: number, array: T[]) => unknown, thisArg?: any): boolean
		{
			for (let i = -1; ++i < this.positions.length;)
				if (callbackFn.call(thisArg || this, this.get(i)!, i, this)) 
					return true;
					
			return false;
		}
		
		/** */
		forEach(callbackFn: (value: T, index: number, array: T[]) => void, thisArg?: any): void
		{
			for (let i = -1; ++i < this.positions.length;)
				callbackFn.call(thisArg || this, this.get(i), i, this);
		}
		
		/** */
		map<U>(callbackFn: (value: T, index: number, array: T[]) => U, thisArg?: any): U[]
		{
			return ArrayForce.create(
				this.positions
					.map(x => this.getRoot(x))
					.map((value, index) => callbackFn.call(thisArg || this, value, index, this))
			);
		}
		
		/** */
		filter<S extends T>(callbackFn: FilterFunction<T>, ...force: Array<StatefulForce | StatelessForce>): ArrayForce<S>;
		filter(callbackFn: FilterFunction<T>, ...force: Array<StatefulForce | StatelessForce>): ArrayForce<T>;
		filter(callbackFn: FilterFunction<T>, ...forces: Array<StatefulForce | StatelessForce>)
		{
			const array = new ArrayForce(this);
			array.filterFn = callbackFn;
			
			for (const fo of forces)
			{
				Core.ForceUtil.attachForce(fo instanceof StatefulForce ? fo.changed : fo, () => 
				{
					array.executeFilter();
					this.positions.forEach((x, i) => 
					{
						if (array.filterFn!(this.getRoot(x), i, this) && !array.positions.includes(x)) 
							array.insertRef(i, x);
					});
				});
			}
			
			array.insertRef(0, ...this.positions);
			return array.proxy();
		}
		
		/** */
		reduce(callbackFn: (previousValue: T, currentValue: T, currentIndex: number, array: T[]) => T): T;
		reduce(callbackFn: (previousValue: T, currentValue: T, currentIndex: number, array: T[]) => T, initialValue: T): T;
		reduce<U>(callbackFn: (previousValue: U, currentValue: T, currentIndex: number, array: T[]) => U, initialValue: U): U;
		reduce(callbackFn: any, initialValue?: any)
		{
			return this.positions
				.reduce((prev, curr, ci) => callbackFn(prev, this.get(curr), ci, this), initialValue);
		}
		
		/** */
		reduceRight(callbackFn: (previousValue: T, currentValue: T, currentIndex: number, array: T[]) => T): T;
		reduceRight(callbackFn: (previousValue: T, currentValue: T, currentIndex: number, array: T[]) => T, initialValue: T): T;
		reduceRight<U>(callbackFn: (previousValue: U, currentValue: T, currentIndex: number, array: T[]) => U, initialValue: U): U;
		reduceRight(callbackFn: any, initialValue?: any)
		{
			return this.positions
				.reduceRight((prev, curr, ci) => callbackFn(prev, this.get(curr), ci, this), initialValue);
		}
		
		/** */
		find<S extends T>(predicate: (this: void, value: T, index: number, obj: T[]) => value is S, thisArg?: any): S | undefined;
		find(predicate: (value: T, index: number, obj: T[]) => unknown, thisArg?: any): T | undefined;
		find(predicate: any, thisArg?: any)
		{
			for (let i = -1; ++i < this.positions.length;)
				if (predicate.call(thisArg || this, this.get(i)!, i, this)) 
					return this.get(i)!;
		}
		
		/** */
		findIndex(predicate: (value: T, index: number, obj: T[]) => unknown, thisArg?: any): number
		{
			for (let i = -1; ++i < this.positions.length;)
				if (predicate.call(thisArg || this, this.get(i)!, i, this)) 
					return i;
					
			return -1;
		}
		
		/** */
		fill(value: T, start?: number | undefined, end?: number | undefined): this
		{
			for (let i = (start || 0) - 1; ++i < (end || this.positions.length);)
				this.set(i, value);
				
			return this;
		}
		
		/** */
		copyWithin(target: number, start: number, end?: number | undefined): this
		{
			this.positions.copyWithin(target, start, end);
			return this;
		}
		
		/** */
		*[Symbol.iterator](): IterableIterator<T>
		{
			for (let i = -1; ++i < this.positions.length;)
				yield this.get(i)!;
		}
		
		/** */
		*entries(): IterableIterator<[number, T]>
		{
			for (let i = -1; ++i < this.positions.length;)
				yield [i, this.get(i)!];
		}
		
		/** */
		*keys(): IterableIterator<number>
		{
			for (let i = -1; ++i < this.positions.length;)
				yield i;
		}
		
		/** */
		*values(): IterableIterator<T>
		{
			for (let i = -1; ++i < this.positions.length;)
				yield this.get(i)!;
		}
		
		/** */
		[Symbol.unscopables]()
		{
			return this.positions[Symbol.unscopables]();
		}
		
		/** */
		includes(searchElement: T, fromIndex: number = 0): boolean
		{
			for (let i = fromIndex - 1; ++i < this.positions.length;)
				if (this.get(i) === searchElement) 
					return true;
					
			return false;
		}
		
		/** */
		flatMap<U, This = undefined>(
			callback: (this: This, value: T, index: number, array: T[]) => U | readonly U[], 
			thisArg?: This | undefined): U[]
		{
			return this.snapshot().flatMap(callback, thisArg); 
		}
		
		/** */
		flat<U>(this: U[][][][][][][][], depth: 7): U[];
		flat<U>(this: U[][][][][][][], depth: 6): U[];
		flat<U>(this: U[][][][][][], depth: 5): U[];
		flat<U>(this: U[][][][][], depth: 4): U[];
		flat<U>(this: U[][][][], depth: 3): U[];
		flat<U>(this: U[][][], depth: 2): U[];
		flat<U>(this: U[][], depth?: 1 | undefined): U[];
		flat<U>(this: U[], depth: 0): U[];
		flat<U>(depth?: number | undefined): any[];
		flat(depth?: any)
		{
			return this.snapshot().flat(depth);
		}

		/** */
		push(...items: T[])
		{
			this.insertRef(this.length, ...this.filterPush(...items));
			return this.positions.length;
		}

		/** */
		pop()
		{
			if (this.positions.length < 1) 
				return void 0;
				
			const pos = this.positions.pop()!;
			const item = this.getRoot(pos);
			this.removed(item!, this.positions.length, pos);
			this.root.delete(pos);
			return item;
		}

		/** */
		unshift(...items: T[])
		{
			this.insertRef(0, ...this.filterPush(...items));
			return this.positions.length;
		}

		/** */
		shift()
		{
			if (this.positions.length < 1) 
				return void 0;
				
			const pos = this.positions.shift()!;
			const item = this.getRoot(pos);
			this.removed(item!, 0, pos);
			this.root.delete(pos);
			return item;
		}

		/** */
		splice(start: number, deleteCount: number, ...items: T[])
		{
			const positions = this.positions.splice(start, deleteCount);
			positions.forEach((x, i) => this.removed(this.getRoot(x), start + i, x));
			this.insertRef(start, ...this.filterPush(...items));
			const result = positions.map(x => this.getRoot(x));
			positions.forEach(x => this.root.delete(x));
			return result;
		}
	}
}
