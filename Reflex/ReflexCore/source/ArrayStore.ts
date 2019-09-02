
namespace Reflex.Core
{
	export class ArrayStore<T>
	{
		root: Record<number, {value: T | undefined, ref: number}> = {};
		next = 0;

		get(index: number)
		{
			const item = this.root[index];
			return item && item.value;
		}

		set(index: number, value: T)
		{
			if(!this.root.hasOwnProperty(index)) 
				this.root[index] = {value: undefined, ref: 1};
			this.root[index].value = value;
			return index;
		}

		push(value: T)
		{
			return this.set(this.next++, value);
		}

		mark(index: number)
		{
			this.root[index].ref++;
		}

		delete(index: number)
		{
			if(this.root.hasOwnProperty(index)) 
			{
				const item = this.root[index];
				if(item.ref > 1) item.ref--;
				if(item.ref === 0) item.value = undefined;
			}
		}
	}
}
