
namespace Truth
{
	/**
	 * Infinite incremental counter, used for logical clock
	 * value comparisons.
	 */
	export type ReadonlyVersion = Omit<Version, "bump" | "reset">;
	
	const n = typeof BigInt !== "undefined" ? BigInt : null;
	const msi = Number.MIN_SAFE_INTEGER;
	
	/**
	 * Infinite incremental counter, used for logical clock
	 * value comparisons.
	 */
	export class Version
	{
		/** */
		static of(other: ReadonlyVersion)
		{
			const version = this.min();
			version.equalize(other);
			return version;
		}
		
		/** */
		static next()
		{
			return new Version(this.getNextStamp());
		}
		
		/** */
		static min()
		{
			return new Version(n ? n(0) : msi);
		}
		
		/** */
		private static getNextStamp(): bigint | number
		{
			return this.nextStamp += ((n ? n(1) : 1) as any);
		}
		
		/** */
		private static nextStamp = n ? n(0) : msi + 1;
		
		/** */
		private constructor(private stamp: number | bigint) { }
		
		/** */
		copy()
		{
			return new Version(this.stamp);
		}
		
		/**
		 * Increases the internal version number to the next available value.
		 */
		bump()
		{
			this.stamp = Version.getNextStamp();
		}
		
		/**
		 * Sets the internal value of this version to the value of the
		 * other version.
		 */
		equalize(other: ReadonlyVersion)
		{
			this.stamp = (other as Version).stamp;
		}
		
		/**
		 * Returns whether this version is newer than the one specified.
		 */
		after(other: ReadonlyVersion)
		{
			return this.stamp > (other as Version).stamp;
		}
		
		/**
		 * Converts this Version into a string representation, suitable for
		 * debugging purposes.
		 */
		toString()
		{
			return this.stamp.toString();
		}
	}	
}
