
namespace Reflex.Core
{

	type SortFunction<T = any> = (a: T, b: T) => number;
	type FilterFunction<T = any> = (value: T, index: number, array: T[]) => boolean;
	
	export class ArrayReflex<T> implements Array<T>
	{
		/** */
		static create<T>(items: T[])
		{
			const store = new ArrayStore<T>();
			const view = new ArrayReflex(store);
			view.push(...items);
			return view.proxy();
		}

		[n: number]: T;

		added = reflex<(item: T, position: number) => void>();
		removed = reflex<(item: T, position: number, id: number) => void>();
		tailChange = reflex<(item: T, position: number) => void>();
		swapped = reflex<(e1: T, e2: T, i1: number, i2: number) => void>();

		positions: number[] = [];

		root: ArrayStore<T>;

		constructor(root: ArrayStore<T> | ArrayReflex<T>) 
		{
			if (root instanceof ArrayStore)
				this.root = root;
			else 
			{
				this.root = root.root;
				ReflexUtil.attachReflex(root.added, (item: T, index: number) =>
				{
					this.insertRef(index, root.positions[index]);
				});
				ReflexUtil.attachReflex(root.removed, (item: T, index: number, id: number) =>
				{
					const loc = this.positions.indexOf(id);
					if (loc > -1) this.splice(loc, 1);
				});
			}
			ReflexUtil.attachReflex(this.root.changed, () => 
			{
				this.executeFilter();
				this.executeSort();
			});
		}

		private attachedSorter?: (a: T, b: T) => number;
		private attachedFilter?: (value: T, index: number, array: ArrayReflex<T>) => boolean;

		/** */
		assignSorter(compareFn: (a: T, b: T) => number)
		{
			this.attachedSorter = compareFn;
			this.executeSort();
			return this;
		}

		/** */
		assignFilter(callbackFn: (value: T, index: number, array: ArrayReflex<T>) => boolean)
		{
			this.attachedFilter = callbackFn;
			this.executeFilter();
			return this;
		}
		
		/** */
		protected executeFilter()
		{
			if (!this.attachedFilter) 
				return;
			const positions = this.positions.filter((pos, index) =>
				!this.attachedFilter!(this.root.get(pos)!, index, this));
			positions.forEach(x => 
			{
				const loc = this.positions.indexOf(x);
				if (loc > -1) this.splice(loc, 1);
			});
		}

		/** */
		protected executeSort()
		{
			if (this.attachedSorter)
			{
				const arr = this.positions;
				const l = arr.length;
				const lastItem = arr[l - 1];
				
				for (let i = 0; i < l - 1; i++)
				{
					let changed = false;
					for (let j = 0; j < l - (i + 1); j++)
					{
						if (this.attachedSorter(this.get(j)!, this.get(j + 1)!) > 0)
						{
							changed = true;
							[arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
							this.swapped(this.get(j)!, this.get(j + 1)!, j, j + 1);
						}
					}

					if (!changed)
						break;
				}
				
				const newLastItem = arr[l - 1];
				if (lastItem !== newLastItem)
					this.tailChange(this.get(l - 1)!, l - 1);
			}
		}

		/** */
		protected filterPush(...items: T[])
		{
			if (this.attachedFilter)
				return items.filter((value, index) => this.attachedFilter!(value, index, this)).map(x => this.root.push(x));

			return items.map(x => this.root.push(x));
		}

		/** */
		insertRef(start: number, ...positions: number[])
		{
			const filtered = this.attachedFilter ?
				positions.filter((value, index) => this.attachedFilter!(this.root.get(value)!, index, this)) : positions;
			this.positions.splice(start, 0, ...filtered);
			filtered.forEach((x, i) => 
			{
				const loc = start + i;
				this.added(this.root.get(x)!, loc);
				if (!Object.prototype.hasOwnProperty.call(this, loc))
					Object.defineProperty(this, loc, {
						get()
						{
							return this.get(loc);
						},
						set(value: any)
						{
							return this.set(loc, value);
						}
					});
			});
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
		}

		private _proxy?: ArrayReflex<T>;
		
		/** */
		proxy()
		{
			// TODO: Change this if to !"PROXY"
			if ("PROXY") return this;
			if (!this._proxy)
				this._proxy = new Proxy(this, {
					get(target, prop: Extract<keyof ArrayReflex<T>, string>)
					{
						const index = parseInt(prop, 10);
						return isNaN(index) ? target[prop] : target.get(index);
					},
					set(target, prop: Extract<keyof ArrayReflex<T>, string>, value: T)
					{
						const index = parseInt(prop, 10);
						if (!isNaN(index))
							target.set(index, value);
						return true;
					}
				}) as ArrayReflex<T>;
			return this._proxy;
		}

		/** */
		get(index: number)
		{
			return this.root.get(this.positions[index]);
		}

		/** */
		set(index: number, value: T)
		{
			if (this.attachedFilter)
				if (!this.attachedFilter(value, index, this))
					this.positions.splice(index, 1);
			this.root.set(this.positions[index], value);
		}

		/** */
		realize()
		{
			return this.positions.map(x => this.root.get(x));
		}

		/** */
		toString(): string
		{
			return JSON.stringify(this.realize());
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
			const arr = ArrayReflex.create(this);
			arr.push(...items);
			return arr.proxy();
		}

		/** */
		join(separator?: string | undefined): string
		{
			return this.positions.map(x => this.root.get(x)).join(separator);
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
			const arr = new ArrayReflex(this.root);
			arr.insertRef(0, ...this.positions.slice(start, end));
			return arr.proxy();
		}
		
		/** */
		sort(compareFn: SortFunction<T>, ...reflexes: Array<StatelessReflex | StatefulReflex>): this
		{
			const arr = new ArrayReflex(this);
			arr.attachedSorter = compareFn;
			for (const reflex of reflexes)
				ReflexUtil.attachReflex(reflex instanceof StatefulReflex ? reflex.changed : reflex, () => 
					arr.executeSort()
				);
			arr.insertRef(0, ...this.positions);
			return arr.proxy() as this;
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
		every(callbackfn: (value: T, index: number, array: T[]) => unknown, thisArg?: any): boolean
		{
			for (let i = -1; ++i < this.positions.length;)
				if (!callbackfn.call(thisArg || this, this.get(i)!, i, this)) 
					return false;
			return true;
		}
		
		/** */
		some(callbackfn: (value: T, index: number, array: T[]) => unknown, thisArg?: any): boolean
		{
			for (let i = -1; ++i < this.positions.length;)
				if (callbackfn.call(thisArg || this, this.get(i)!, i, this)) 
					return true;
			return false;
		}
		
		/** */
		forEach(callbackfn: (value: T, index: number, array: T[]) => void, thisArg?: any): void
		{
			for (let i = -1; ++i < this.positions.length;)
				callbackfn.call(thisArg || this, this.get(i)!, i, this);
		}
		
		/** */
		map<U>(callbackfn: (value: T, index: number, array: T[]) => U, thisArg?: any): U[]
		{
			return ArrayReflex.create(
				this.positions.map(
					x => this.root.get(x)
				).map(
					(value, index) => callbackfn.call(thisArg || this, value!, index, this)
				));
		}
		
		/** */
		filter<S extends T>(callbackfn: FilterFunction<T>, ...reflex: Array<StatefulReflex | StatelessReflex>): ArrayReflex<S>;
		filter(callbackfn: FilterFunction<T>, ...reflex: Array<StatefulReflex | StatelessReflex>): ArrayReflex<T>;
		filter(callbackfn: FilterFunction<T>, ...reflexes: Array<StatefulReflex | StatelessReflex>)
		{
			const arr = new ArrayReflex(this);
			arr.attachedFilter = callbackfn;
			for (const reflex of reflexes)
			{
				ReflexUtil.attachReflex(reflex instanceof StatefulReflex ? reflex.changed : reflex, () => 
				{
					arr.executeFilter();
					this.positions.forEach((x, i) => 
					{
						if (arr.attachedFilter!(this.root.get(x)!, i, this) && !arr.positions.includes(x)) 
							arr.insertRef(i, x);
					});
				});
			}
			arr.insertRef(0, ...this.positions);
			return arr.proxy();
		}
		
		/** */
		reduce(callbackfn: (previousValue: T, currentValue: T, currentIndex: number, array: T[]) => T): T;
		reduce(callbackfn: (previousValue: T, currentValue: T, currentIndex: number, array: T[]) => T, initialValue: T): T;
		reduce<U>(callbackfn: (previousValue: U, currentValue: T, currentIndex: number, array: T[]) => U, initialValue: U): U;
		reduce(callbackfn: any, initialValue?: any)
		{
			return this.positions.reduce((prev, curr, ci) => callbackfn(prev, this.get(curr), ci, this), initialValue);
		}
		
		/** */
		reduceRight(callbackfn: (previousValue: T, currentValue: T, currentIndex: number, array: T[]) => T): T;
		reduceRight(callbackfn: (previousValue: T, currentValue: T, currentIndex: number, array: T[]) => T, initialValue: T): T;
		reduceRight<U>(callbackfn: (previousValue: U, currentValue: T, currentIndex: number, array: T[]) => U, initialValue: U): U;
		reduceRight(callbackfn: any, initialValue?: any)
		{
			return this.positions.reduceRight((prev, curr, ci) => callbackfn(prev, this.get(curr), ci, this), initialValue);
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
		flatMap<U, This = undefined>(callback: (this: This, value: T, index: number, array: T[]) => U | readonly U[], thisArg?: This | undefined): U[]
		{
			return []; 
			// TODO
			//throw new Error("Method not implemented.");
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
			return this; 
			// TODO 
			//throw new Error("Method not implemented.");
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
			const item = this.root.get(pos);
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
			const item = this.root.get(pos);
			this.removed(item!, 0, pos);
			this.root.delete(pos);
			return item;
		}

		/** */
		splice(start: number, deleteCount: number, ...items: T[])
		{
			const positions = this.positions.splice(start, deleteCount);
			positions.forEach((x, i) => this.removed(this.root.get(x)!, start + i, x));
			this.insertRef(start, ...this.filterPush(...items));
			const result = positions.map(x => this.root.get(x)) as T[];
			positions.forEach(x => this.root.delete(x));
			return result;
		}

		/** */
		static is<T>(object: any): object is ArrayReflex<T>
		{
			return object instanceof ArrayReflex;
		}
	}
}
