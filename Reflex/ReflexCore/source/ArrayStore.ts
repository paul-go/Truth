
namespace Reflex.Core
{
	/**
	 * 
	 */
	export class ArrayStore<T>
	{
		/** */
		get(index: number)
		{
			const item = this.root[index];
			return item && item.value;
		}

		/** */
		set(index: number, value: T)
		{
			if (Object.prototype.hasOwnProperty.call(this.root, index)) 
				this.changed(value, index);
			else 
				this.root[index] = { value: void 0, ref: 1 };
			
			this.root[index].value = value;
			return index;
		}

		/** */
		push(value: T)
		{
			return this.set(this.next++, value);
		}

		/** */
		mark(index: number)
		{
			this.root[index].ref++;
			return index;
		}

		/** */
		delete(index: number)
		{
			if (Object.prototype.hasOwnProperty.call(this.root, index)) 
			{
				const item = this.root[index];
				
				if (item.ref > 1) 
					item.ref--;
				
				if (item.ref === 0) 
					item.value = void 0;
			}
		}
		
		/** */
		readonly changed = force<(item: T, index: number) => void>();
		
		/** */
		private readonly root: Record<number, {
			value: T | undefined;
			ref: number;
		}> = {};
		
		/** */
		private next = 0;
	}
}
