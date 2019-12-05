
namespace Reflex.Core
{
	const callbacks: (() => void)[] = [];
	
	/**
	 * Stores the number of outstanding asynchronous operations
	 * are waiting to be completed, so that the ready state callbacks
	 * can be triggered.
	 */
	let outstanding = 0;
	
	export const ReadyState =
	{
		/**
		 * Adds the specified function to the list of callbacks to invoke
		 * when all outstanding asynchronous operations have completed.
		 * In the case when there are no outstanding callbacks, the function
		 * is called immediately.
		 */
		await(callback: () => void)
		{
			if (outstanding < 1)
				callback();
			else
				callbacks.push(callback);
		},
		
		/** Increment the ready state. */
		inc()
		{
			outstanding++;
		},
		
		/** Decrement the ready state. */
		dec()
		{
			outstanding--;
			if (outstanding < 0)
				outstanding = 0;
			
			if (outstanding === 0)
			{
				const fns = callbacks.slice();
				callbacks.length = 0;
				
				for (let i = -1; ++i < fns.length;)
					fns[i]();
			}
		}
	};
}
