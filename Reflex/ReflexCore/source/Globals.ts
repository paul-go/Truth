
/**
 * 
 */
function reflex(): () => void;
/**
 * 
 */
function reflex<F extends Reflex.Core.StatelessReflex = () => void>(): F;
/**
 * 
 */
function reflex(initialValue: boolean): Reflex.Core.BooleanReflex;
/**
 * 
 */
function reflex(initialValue: string | number | bigint): Reflex.Core.StatefulReflex;
/**
 * 
 */
function reflex<T>(backingArray: T[]): Reflex.Core.ArrayReflex<T>;
/**
 * Returns an observable proxy of the specified source object.
 */
function reflex<T>(backingObject: T): Reflex.Core.EffectObject<T>;
function reflex(initialValue?: any)
{
	const tryCreateSingle = (val: any) =>
	{
		if (val === undefined || val === null)
			return Reflex.Core.ReflexUtil.createFunction();
		
		if (typeof val === "boolean")
			return new Reflex.Core.BooleanReflex(val);
		
		if (typeof val === "string" || typeof val === "bigint")
			return new Reflex.Core.StatefulReflex(val);
		
		if (typeof val === "number")
			return new Reflex.Core.StatefulReflex(val || 0);
		
		if (Array.isArray(val))
			return Reflex.Core.ArrayReflex.create(val);
		
		return null;
	};
	
	const single = tryCreateSingle(initialValue);
	if (single !== null)
		return single;
	
	const backing: { [key: string]: object; } = {};
	
	for (const key in initialValue)
	{
		// Skip past any private properties
		if (key.startsWith("_"))
			continue;
		
		const value = initialValue[key];
		
		// We can't deal with anything that starts as null or undefined
		if (value === undefined || value === null || typeof value === "function")
			continue;
		
		const single = tryCreateSingle(value);
		if (single !== null)
			backing[key] = single;
	}
	
	return new Proxy(initialValue, {
		get: (target: any, property: string) =>
		{
			if (property in backing)
				return backing[property];
			
			return target[property];
		},
		set: (target: any, property: string, value: any) =>
		{
			if (property in backing)
			{
				const targetVal = backing[property];
				
				if (targetVal instanceof Reflex.Core.StatefulReflex)
					targetVal.value = value;
				
				else if (targetVal instanceof Reflex.Core.ArrayReflex)
					throw new Error("Re-assignment of arrays is not implemented.");
				
				else throw new Error("Unknown error.");
			}
			else target[property] = value;
			
			return true;
		}
	});
}
