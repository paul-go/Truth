
namespace Reflex.Core
{
	/** */
	export abstract class Meta
	{
		constructor(readonly locator: Locator) { }
	}
	
	/** */
	export abstract class StemMeta extends Meta
	{
		constructor(locator?: Locator)
		{
			super(locator || new Locator(LocatorType.leaf));
		}
	}
	
	/**
	 * Stores the information about a single attribute.
	 * Although attributes can come in a large object literal
	 * that specifies many attributes together, the atomic
	 * translator function splits them up into smaller metas,
	 * which is done because some values may be static,
	 * and others may be behind a force.
	 */
	export class AttributeMeta extends StemMeta
	{
		constructor(
			readonly key: string,
			readonly value: any)
		{
			super();
		}
	}
	
	/**
	 * 
	 */
	export abstract class Auxilary
	{
		protected constructor() { }
		
		/** Enforce nominal type. */
		private readonly auxiliary: undefined;
	}
	
	/**
	 * Stores information about some value that is known
	 * to the library that will be applied to some branch.
	 */
	export class ValueMeta extends StemMeta
	{
		constructor(readonly value: string | number | bigint | Auxilary)
		{
			super();
		}
	}
	
	/** */
	export class ClosureMeta extends StemMeta
	{
		constructor(readonly closure: Function)
		{
			super();
		}
	}
	
	/** */
	export abstract class ContainerMeta extends Meta { }
	
	/**
	 * 
	 */
	export abstract class StreamMeta extends ContainerMeta
	{
		constructor(
			readonly containerMeta: ContainerMeta,
			locator?: Locator)
		{
			super(locator || new Locator(LocatorType.stream));
		}
	}
}
