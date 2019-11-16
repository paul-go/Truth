
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
			if (!Object.prototype.hasOwnProperty.call(this.root, index)) 
				this.root[index] = { value: undefined, ref: 1 };
			else 
				this.changed(value, index);
			
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
					item.value = undefined;
			}
		}
		
		/** */
		readonly changed = force<(item: T, index: number) => void>();
		
		/** */
		private root: Record<number, {
			value: T | undefined;
			ref: number;
		}> = {};
		
		/** */
		private next = 0;
	}
}
