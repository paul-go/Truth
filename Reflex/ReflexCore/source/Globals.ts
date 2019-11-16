
/**
 * Returns a force function that remotely triggers some behavior when invoked.
 */
function force(): () => void;
/**
 * Returns a StatelessForce that remotely triggers some behavior when the
 * internal value is changed.
 */
function force<F extends Reflex.Core.StatelessForce = () => void>(): F;
/**
 * Returns a BooleanForce object that remotely triggers some behavior
 * when the internal boolean value is changed.
 */
function force(initialValue: boolean): Reflex.Core.BooleanForce;
/**
 * Returns an ArrayForce object that remotely triggers some behavior
 * when the array is modified.
 */
function force<T>(backingArray: T[]): Reflex.Core.ArrayForce<T>;
/**
 * Returns a StatelessForce object that remotely triggers some
 * behavior when the internal object value is changed.
 */
function force<T extends {}>(initialValue: T): Reflex.Core.StatefulForce<T>;
function force(val?: any)
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
	
	if (typeof val === "object" || typeof val === "symbol")
		return new Reflex.Core.StatefulForce(val);
	
	throw new Error("Cannot create a force from this value.");
}
