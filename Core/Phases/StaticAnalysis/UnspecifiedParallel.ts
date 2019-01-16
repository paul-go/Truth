import * as X from "../../X";


/**
 * An "unspecified parallel" is a marker object used to
 * maintain the connectedness of a parallel graph. For
 * example, consider the following document:
 * 
 * Class1
 * 	Property : Animal
 * Class2 : Class1
 * Class3 : Class2
 * 	Property : Rabbit
 * 
 * In this case, the parallel graph connecting Class3's
 * Property type through to it's apex parallel (which
 * would be Class1/Property), would have an
 * UnspecifiedParallel object created, and residing
 * within the Class2 type.
 * 
 * UnspecifiedParallels were originally intended for
 * use by the type representation in order to perform
 * operations such as collecting specified and unspecified
 * adjacent types, however, it appears now that this
 * may not be sufficient given the current design of the
 * system.
 */
export class UnspecifiedParallel extends X.Parallel
{
	/**
	 * Constructs a UnspecifiedParallel object, or returns a
	 * pre-existing one that corresponds to the specified Node.
	 */
	static maybeConstruct(
		uri: X.Uri,
		container: X.Parallel,
		context: X.LayerContext)
	{
		return X.Parallel.getExistingParallel(uri, context) || 
			new X.UnspecifiedParallel(uri, container, context);
	}
	
	/** */
	private constructor(
		uri: X.Uri,
		container: X.Parallel,
		context: X.LayerContext)
	{
		super(uri, container, context);
	}
	
	/** */
	descend(typeName: string): UnspecifiedParallel
	{
		return new UnspecifiedParallel(
			this.uri.extend([], typeName),
			this,
			this.context);
	}
}
