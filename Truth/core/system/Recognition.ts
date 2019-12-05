
namespace Truth
{
	/** 
	 * @internal
	 * (Not implemented)
	 * A class that specifies behavior around the recognition 
	 * of patterns found within documents.
	 */
	export class Recognition
	{
		/** */
		constructor() { }
		
		/** Whether File URIs should be recognized in statements. */
		fileUris = RecognitionState.on;
		
		/** Whether HTTP URIs should be recognized in statements. */
		httpUris = RecognitionState.on;
		
		/** Whether regular expressions should be recognized in statements. */
		regularExpressions = RecognitionState.on;
		
		/** Whether comments should be recognized in statements. */
		comments = RecognitionState.on;
	}
	
	export const enum RecognitionState
	{
		/** Indicates that a pattern is recognized by the system. */
		on,
		
		/** Indicates that a pattern is not recognized by the system. */
		off,
		
		/** Indicates that a pattern is recognized by the system, and omitted. */
		omitted
	}
}
