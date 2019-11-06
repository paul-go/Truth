
namespace Reflex.Core
{
	/**
	 * The interface that Reflex layers must implement. 
	 * 
	 * A "Layer" is less specific than a "Library" in that a layer
	 * cannot define it's own branch types, only it's own leaf
	 * types. Layers are meant to sit on top of Libraries, providing
	 * abstraction.
	 */
	export interface ILayer
	{
		/**
		 * 
		 */
		attachAtomic(atomic: any, branch: IBranch, ref: Ref): void;
		
		/**
		 * 
		 */
		detachAtomic(atomic: any, branch: IBranch): void;
	}
}
