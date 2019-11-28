
declare global
{
	/** @internal */
	const enum Const
	{
		selectorSep = "..."
	}

	/** @internal */
	const enum BlockSize
	{
		branch = 4,
		text = 2,
		stream = 6,
	}
	
	/**
	 * @internal
	 * Used to be able to discover the ILibrary instance used by Reflex ML.
	 */
	const ml: object;
}

export { }
