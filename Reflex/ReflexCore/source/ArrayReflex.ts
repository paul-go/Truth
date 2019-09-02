
namespace Reflex.Core
{
	
	export class ArrayReflex<T> implements Array<T>
	{

		static create<T>(items: T[])
		{	
			const store = new ArrayStore<T>();
			const view = new ArrayReflex(store);
			view.push(...items);
			return view.proxy();
		}

		[n: number]: T;

		private attachedSorter?: (a: T, b: T) => number;
		private attachedFilter?: (value: T, index: number, array: ArrayReflex<T>) => boolean;

		assignSorter(compareFn: (a: T, b: T) => number)
		{
			this.attachedSorter = compareFn;
			this.executeSort();
			return this;
		}

		assignFilter(callbackFn: (value: T, index: number, array: ArrayReflex<T>) => boolean)
		{
			this.attachedFilter = callbackFn;
			this.positions = this.positions.filter((pos, index) => this.attachedFilter!(this.get(pos)!, index, this));
			return this;
		}
		
		protected executeSort()
		{
			if(this.attachedSorter)
			{
				const oldState = this.positions.slice();
				this.positions.sort((a, b) => this.attachedSorter!(this.get(a)!, this.get(b)!));
				const trash = new Set();
				for(let i = -1; ++i < this.positions.length;)
				{
					const v = this.positions[i];
					if(v !== oldState[i])
					{
						const oldIndex = oldState.indexOf(v);
						if(oldIndex >= 0) 
						{
							if(trash.has(oldIndex)) continue;
							trash.add(i);
							console.log(this.get(v), this.get(i), oldIndex, i);
							this.swaped(this.get(v)!, this.get(i)!, oldIndex, i);
						}
					}
				}
			}
		}

		protected filterPush(...items: T[])
		{
			if(this.attachedFilter)
				return items.filter((value, index) => this.attachedFilter!(value, index, this)).map(x => this.root.push(x));
			else 
				return items.map(x => this.root.push(x));
		}

		insertRef(start: number, ...positions: number[])
		{
			const filtered = this.attachedFilter ? 
				positions.filter((value, index) => this.attachedFilter!(this.get(value)!, index, this)) : positions;
			this.positions.push(...filtered);
			filtered.forEach((x, i) => this.added(this.get(x)!, x));
			this.executeSort();
		}

		get length() 
		{
			return this.positions.length;
		}

		set length(i: number)
		{
			this.positions.length = i;
		}

		private _proxy?: ArrayReflex<T>;
		proxy()
		{
			if(!this._proxy) 
				this._proxy = new Proxy(this, {
					get(target, prop: Extract<keyof ArrayReflex<T>, string>)
					{
						const index = parseInt(prop);
						return isNaN(index) ? target[prop] : target.get(index);
					},
					set(target, prop: Extract<keyof ArrayReflex<T>, string>, value: T)
					{
						const index = parseInt(prop);
						if(!isNaN(index))
							target.set(index, value);
						return true;
					}
				}) as ArrayReflex<T>;
			return this._proxy;
		}

		get(index: number)
		{
			return this.root.get(this.positions[index]);
		}

		set(index: number, value: T)
		{
			if(this.attachedFilter)
				if(!this.attachedFilter(value, index, this))
					this.positions.splice(index, 1);
			this.root.set(this.positions[index], value);
			this.executeSort();
		}

		realize(){
			return this.positions.map(x => this.get(x));
		}

		toString(): string
		{
			return JSON.stringify(this.positions.map(this.get));
		}

		toLocaleString(): string
		{
			return this.toString();
		}

		concat(...items: ConcatArray<T>[]): T[];
		concat(...items: (T | ConcatArray<T>)[]): T[];
		concat(...items: any[])
		{
			const arr = ArrayReflex.create(this);
			arr.push(...items);
			return arr.proxy();
		}

		join(separator?: string | undefined): string
		{
			return this.positions.map(x => this.root.get(x)).join(separator);
		}
		reverse()
		{
			this.positions.reverse();
			return this;
		}
		slice(start?: number | undefined, end?: number | undefined): T[]
		{
			const arr = new ArrayReflex(this);
			arr.positions = this.positions.slice(start, end);
			return arr.proxy();
		}
		sort(compareFn?: ((a: T, b: T) => number) | undefined): this
		{
			const arr = new ArrayReflex(this);
			arr.attachedSorter = compareFn;
			arr.insertRef(0, ...this.positions);
			return arr.proxy() as this;
		}
		indexOf(searchElement: T, fromIndex = 0): number
		{
			for(let i = fromIndex - 1; ++i < this.positions.length;)
				if(this.get(i) === searchElement) return i;
			return -1;
		}
		lastIndexOf(searchElement: T, fromIndex?: number | undefined): number
		{
			for(let i = this.positions.length; --i > -1;)
				if(this.get(i) === searchElement) return i;
			return -1;
		}
		every(callbackfn: (value: T, index: number, array: T[]) => unknown, thisArg?: any): boolean
		{
			for(let i = -1; ++i < this.positions.length;)
				if(!callbackfn.call(thisArg || this, this.get(i)!, i, this)) return false;
			return true;
		}
		some(callbackfn: (value: T, index: number, array: T[]) => unknown, thisArg?: any): boolean
		{
			for(let i = -1; ++i < this.positions.length;)
				if(callbackfn.call(thisArg || this, this.get(i)!, i, this)) return true;
			return false;
		}
		forEach(callbackfn: (value: T, index: number, array: T[]) => void, thisArg?: any): void
		{
			for(let i = -1; ++i < this.positions.length;)
				callbackfn.call(thisArg || this, this.get(i)!, i, this);
		}
		map<U>(callbackfn: (value: T, index: number, array: T[]) => U, thisArg?: any): U[]
		{
			return ArrayReflex.create(this.positions.map(x => this.root.get(x)).map((value, index) => callbackfn.call(thisArg||this, value!, index, this)));
		}
		filter<S extends T>(callbackfn: (value: T, index: number, array: T[]) => value is S, thisArg?: any): S[];
		filter(callbackfn: (value: T, index: number, array: T[]) => unknown, thisArg?: any): T[];
		filter(callbackfn: any, thisArg?: any)
		{
			const arr = new ArrayReflex(this);
			arr.attachedFilter = callbackfn.bind(thisArg || arr);
			return arr.proxy();
		}
		reduce(callbackfn: (previousValue: T, currentValue: T, currentIndex: number, array: T[]) => T): T;
		reduce(callbackfn: (previousValue: T, currentValue: T, currentIndex: number, array: T[]) => T, initialValue: T): T;
		reduce<U>(callbackfn: (previousValue: U, currentValue: T, currentIndex: number, array: T[]) => U, initialValue: U): U;
		reduce(callbackfn: any, initialValue?: any)
		{
			return this.positions.reduce((prev, curr, ci) => callbackfn(this.get(prev), this.get(curr), ci, this), initialValue);
		}
		reduceRight(callbackfn: (previousValue: T, currentValue: T, currentIndex: number, array: T[]) => T): T;
		reduceRight(callbackfn: (previousValue: T, currentValue: T, currentIndex: number, array: T[]) => T, initialValue: T): T;
		reduceRight<U>(callbackfn: (previousValue: U, currentValue: T, currentIndex: number, array: T[]) => U, initialValue: U): U;
		reduceRight(callbackfn: any, initialValue?: any)
		{
			return this.positions.reduceRight((prev, curr, ci) => callbackfn(this.get(prev), this.get(curr), ci, this), initialValue);
		}
		find<S extends T>(predicate: (this: void, value: T, index: number, obj: T[]) => value is S, thisArg?: any): S | undefined;
		find(predicate: (value: T, index: number, obj: T[]) => unknown, thisArg?: any): T | undefined;
		find(predicate: any, thisArg?: any)
		{
			for(let i = -1; ++i < this.positions.length;)
				if(predicate.call(thisArg || this, this.get(i)!, i, this)) return this.get(i)!;
		}
		findIndex(predicate: (value: T, index: number, obj: T[]) => unknown, thisArg?: any): number
		{
			for(let i = -1; ++i < this.positions.length;)
				if(predicate.call(thisArg || this, this.get(i)!, i, this)) return i;
			return -1;
		}
		fill(value: T, start?: number | undefined, end?: number | undefined): this
		{
			for(let i = (start || 0) - 1; ++i < (end || this.positions.length);)
				this.set(i, value);
			return this;
		}
		copyWithin(target: number, start: number, end?: number | undefined): this
		{
			this.positions.copyWithin(target, start, end);
			return this;
		}
		*[Symbol.iterator](): IterableIterator<T>
		{
			for(let i = -1; ++i < this.positions.length;)
				yield this.get(i)!;
		}
		*entries(): IterableIterator<[number, T]>
		{
			for(let i = -1; ++i < this.positions.length;)
				yield [i, this.get(i)!];
		}
		*keys(): IterableIterator<number>
		{
			for(let i = -1; ++i < this.positions.length;)
				yield i;
		}
		*values(): IterableIterator<T>
		{
			for(let i = -1; ++i < this.positions.length;)
				yield this.get(i)!;
		}
		[Symbol.unscopables](): { copyWithin: boolean; entries: boolean; fill: boolean; find: boolean; findIndex: boolean; keys: boolean; values: boolean; }
		{
			return this.positions[Symbol.unscopables]();
		}
		includes(searchElement: T, fromIndex: number = 0): boolean
		{
			for(let i = fromIndex - 1; ++i < this.positions.length;)
				if(this.get(i) === searchElement) return true;
			return false;
		}
		flatMap<U, This = undefined>(callback: (this: This, value: T, index: number, array: T[]) => U | readonly U[], thisArg?: This | undefined): U[]
		{
			return []; // TODO
			//throw new Error("Method not implemented.");
		}
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
			return this; // TODO 
			//throw new Error("Method not implemented.");
		}
		
		added = reflex<(item: T, position: number) => void>();
		removed = reflex<(item: T, position: number) => void>();
		swaped = reflex<(e1: T, e2: T, i1: number, i2: number) => void>();

		positions: number[] = [];

		root: ArrayStore<T>;

		constructor(root: ArrayStore<T> | ArrayReflex<T>) 
		{ 
			if(root instanceof ArrayStore) 
				this.root = root;
			else 
			{
				this.root = root.root;
				ReflexUtil.attachReflex(root.added, (item: T, index: number) =>
				{
					this.insertRef(index, root.positions[index]);	
				});
			}
		}

		push(...items: T[])
		{
			this.insertRef(this.length, ...this.filterPush(...items));
			return this.positions.length;
		}

		pop()
		{
			if(this.positions.length < 1) return void 0;
			const pos = this.positions.pop()!;
			const item = this.root.get(pos);
			this.root.delete(pos);
			return item;
		}

		unshift(...items: T[])
		{
			this.insertRef(0, ...this.filterPush(...items));
			return this.positions.length;
		}

		shift()
		{
			if(this.positions.length < 1) return void 0;
			const pos = this.positions.shift()!;
			const item = this.root.get(pos);
			this.root.delete(pos);
			return item;
		}

		splice(start: number, deleteCount: number, ...items: T[])
		{
			const positions = this.positions.splice(start, deleteCount);
			this.insertRef(start, ...this.filterPush(...items));
			const result = positions.map(x => this.root.get(x)) as T[];
			positions.forEach(x => this.root.delete(x));
			return result;
		}

		static is<T>(object: any): object is ArrayReflex<T>
		{
			return object instanceof ArrayReflex;
		}
		
	}
}
