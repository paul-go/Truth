
/**
 * 
 */
function force(): () => void;
/**
 * 
 */
function force<F extends Reflex.Core.StatelessForce = () => void>(): F;
/**
 * 
 */
function force(initialValue: boolean): Reflex.Core.BooleanForce;
/**
 * 
 */
function force(initialValue: string): Reflex.Core.StatefulForce<string>;
/**
 * 
 */
function force(initialValue: number): Reflex.Core.StatefulForce<number>;
/**
 * 
 */
function force(initialValue: bigint): Reflex.Core.StatefulForce<bigint>;
/**
 * 
 */
function force<T>(backingArray: T[]): Reflex.Core.ArrayForce<T>;
/**
 * Returns an observable proxy of the specified source object.
 */
function force<T>(backingObject: T): Reflex.Core.ObjectForce<T>;
function force(initialValue?: any)
{
	const tryCreateSingle = (val: any) =>
	{
		if (val === undefined || val === null)
			return Reflex.Core.ForceUtil.createFunction();
		
		if (typeof val === "boolean")
			return new Reflex.Core.BooleanForce(val);
		
		if (typeof val === "string" || typeof val === "bigint")
			return new Reflex.Core.StatefulForce(val);
		
		if (typeof val === "number")
			return new Reflex.Core.StatefulForce(val || 0);
		
		if (Array.isArray(val))
			return Reflex.Core.ArrayForce.create(val);
		
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
				
				if (targetVal instanceof Reflex.Core.StatefulForce)
					targetVal.value = value;
				
				else if (targetVal instanceof Reflex.Core.ArrayForce)
					throw new Error("Re-assignment of arrays is not implemented.");
				
				else throw new Error("Unknown error.");
			}
			else target[property] = value;
			
			return true;
		}
	});
}
