
declare global
{
	interface IVizObject
	{
		readonly name?: string;
		readonly toString: () => string;
	}
	
	function viz(root: IVizObject | null, fn: (value: IVizObject) => any): void;
}

export { }
