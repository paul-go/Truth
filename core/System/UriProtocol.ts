
namespace Truth
{
	/**
	 * An enumeration that lists all availble protocols
	 * supported by the system. The list can be enumerated
	 * via Uri.eachProtocol()
	 */
	export enum UriProtocol
	{
		none = "",
		unknown = "?",
		file = "file:",
		https = "https:",
		http = "http:",
		
		/**
		 * @internal
		 * Internal URIs (which are URIs that refer to an in-memory document)
		 * are sourced from the gopher protocol. Yes, the gopher protocol. This
		 * is because it's the only protocol that will parse through the standard
		 * URL constructor in V8, other than the standard protocols (http, https).
		 * (Other JavaScript engines seem to parse all protocols, even made-up 
		 * ones).
		 */
		memory = "memory:"
	}
	
	export namespace UriProtocol
	{
		/**
		 * @returns A UriProtocol member from the specified string.
		 */
		export function resolve(value: string): UriProtocol | null
		{
			const vals = Object.values(UriProtocol) as string[];
			const idx = vals.indexOf(value);
			return idx < 0 ? null : vals[idx] as UriProtocol;
		}
	}
}
