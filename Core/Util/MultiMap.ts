
/**
 * @internal
 * A Map of the generic key and value types.
 * Supports keys that refer to multiple values.
 */
export class MultiMap<TKey, TVal> extends Map<TKey, TVal[]>
{
	/** */
	has(key: TKey, value?: TVal)
	{
		const values = this.get(key);
		if (!values)
			return false;
		
		if (value !== undefined)
			return values.includes(value);
		
		return true;
	}
	
	/** */
	add(key: TKey, value: TVal)
	{
		if (value)
		{
			const values = this.get(key);
			if (values)
			{
				if (!values.includes(value))
					values.push(value);
			}
			else
			{
				this.set(key, [value]);
			}
		}
		
		return this;
	}
	
	/** */
	delete(key: TKey, value?: TVal)
	{
		if (value === undefined)
			return !!super.delete(key);
		
		const storedValues = super.get(key);
		if (storedValues === undefined)
			return false;
		
		if (storedValues.length === 1 && storedValues[0] === value)
		{
			super.delete(key);
			return true;
		}
		
		const valueIdx = storedValues.indexOf(value);
		if (valueIdx < 0)
			return false;
		
		storedValues.splice(valueIdx, 1);
		return true;
	}
}
