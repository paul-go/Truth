
namespace Reflex
{
	/**
	 * A class that wraps a value whose changes can be observed.
	 */
	export class StatefulForce<T = any>
	{
		constructor(value: T)
		{
			this._value = value;
		}
		
		/** 
		 * Gets or sets the value of the force.
		 */
		get value()
		{
			return this._value;
		}
		set value(value: T)
		{
			if (value === this._value)
				return;
			
			let was = this._value;
			this._value = value;
			
			// Use a sliced version of the returners array instead of
			// the actual, to handle the case when external code is
			// adding returners to the force in the code that is run
			// when the force changes.
			let wasRet = was;
			let nowRet = value;
			
			// Move through all the returners, left to right, storing
			// the old values, and feeding them into the next returner.
			for (const retFn of this.returners.slice())
			{
				this._value = retFn(nowRet, wasRet);
				if (this._value !== void 0 && this._value === this._value)
				{
					wasRet = nowRet;
					nowRet = this._value;
				}
			}
			
			// In the case when some return function changed
			// the value back to what it was originally, then cancel
			// further propagation.
			if (this._value === was)
				return;
			
			this.changed(value, was);
			
			for (const watchFn of this.watchers.slice())
				watchFn(this._value, was);
		}
		
		/** @internal */
		private _value: any;
		
		/**
		 * Sets the value of the force and returns void.
		 * (Useful for force arguments in arrow functions to cancel the return value.)
		 */
		set(value: T)
		{
			this.value = value;
		}
		
		/**
		 * @internal
		 * It's important that this is an assignment rather than a function,
		 * because the event needs to be on the instance rather than in the
		 * prototype so that it's caught by the event system.
		 */
		changed = force<(now: T, was: T) => void>();
		
		/**
		 * Returns a string representation of the value of this force.
		 */
		toString()
		{
			return "" + this._value;
		}
		
		/**
		 * Returns a JavaScript primitive representation of the force.
		 */
		valueOf()
		{
			return this._value;
		}
		
		/**
		 * Adds a translation function to this force that is executed when the
		 * value of the force changes, but after the change has propagated
		 * to the rest of the system.
		 * 
		 * The return value of the function specified in the `returnFn` argument
		 * is fed to the other return functions that were added in the same way,
		 * before finally becoming the propagated value.
		 * 
		 * This method can be used to cancel the propagation of a force by
		 * simply returning the value passed in through the "was" parameter.
		 * In this case, it will be assumed that the force's internal state value
		 * hasn't actually changed, and so propagation will be cancelled.
		 * 
		 * If the returned value is undefined or NaN, these are return values
		 * are ignored, and the chain of return function calls proceeds.
		 * 
		 * @returns A reference to this force.
		 */
		return(returnFn: (now: T, was: T) => T)
		{
			if (!this.returners.includes(returnFn))
				this.returners.push(returnFn);
			
			return this;
		}
		
		/**
		 * Adds a watching function to this force that is executed after the
		 * value of the force has changed and has propagated.
		 * 
		 * @returns A reference to this force.
		 */
		watch(watchFn: (now: T, was: T) => void)
		{
			if (!this.watchers.includes(watchFn))
				this.watchers.push(watchFn);
			
			return this;
		}
		
		private readonly returners: ((now: T, was: T) => T)[] = [];
		private readonly watchers: ((now: T, was: T) => void)[] = [];
	}
	
	/**
	 * A class that wraps a boolean whose changes can be observed.
	 */
	export class BooleanForce extends StatefulForce<boolean>
	{
		/**
		 * Flips the value of the force from true to false or false to true.
		 * (Useful for force arguments in arrow functions to cancel the return value.)
		 */
		flip()
		{
			this.set(!this.value);
		}
	}
}
