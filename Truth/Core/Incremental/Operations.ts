import * as X from "../X";


/**
 * A class of methods that execute the vertification-supporting 
 * operations of the system.
 */
export class Operations
{
	/** @internal */
	constructor(private readonly program: X.Program) { }
	
	/**
	 * Collects all annotations that have been applied to the
	 * type referenced by the specified Pointer.
	 * 
	 * @returns An array of types representing the collected
	 * annotations, but with any redundant types pruned.
	 */
	execAnnotationCollection(declaration: X.Pointer)
	{
		// 1 - Convert declaration pointer into a type URI
		// 2 - Pass the type URI to the Fragmenter, get back
		// a series of pointers that match the tip
		// 3 - Get the statements that contain each pointer
		// 4 - Get the annotations attached to each statement
		// 5 - Get the subject for each annotation
		// 6 - De-dup the subjects, return
		
		return [new X.Subject("")];
	}
	
	/**
	 * 
	 */
	execFindSupergraphEquivalents()
	{
		
	}
	
	/**
	 * 
	 */
	execFindAncestorEquivalents()
	{
		
	}
	
	/**
	 * Attempts to infer the type associated with the
	 * specified declaration-side Pointer. Performs base
	 * type inference, falling back to ancestry type
	 * inference if base type inference fails.
	 * 
	 * @returns Null in the case when there are is-a side
	 * types defined on the type referenced by the
	 * specified Pointer, and the associated type is
	 * therefore explicit rather than inferrable.
	 */
	execInference(declaration: X.Pointer)
	{
		const collectedTypes = this.execAnnotationCollection(declaration);
		if (!collectedTypes)
			return null;
		
		
	}
	
	/**
	 * Attempts to infer the bases that should be implicitly
	 * applied to the specified type, by searching for equivalently
	 * named types contained within the specified type's 
	 * Supergraph.
	 * 
	 * @param origin The type on which to perform inference.
	 * It is expected to be unannotated.
	 * 
	 * @returns An array of types representing the inferred
	 * bases. In the case when the specified type has multiple
	 * supers, and two or more of these supers have a type
	 * whose name matches the specified type, but differ 
	 * in their bases, multiple bases may be inferred and 
	 * and included in the returned array. However, this only
	 * happens in the case when these bases cannot be
	 * pruned down to a single type.
	 * 
	 * If no bases could be inferred, an empty array is
	 * returned.
	 */
	execSupergraphInference(origin: X.Type)
	{
		return 1 > 0 ? null : [new X.Type([])];
	}
	
	/**
	 * A strategy for inference that occurs when the
	 * type is an unbased introduction. Operates by 
	 * scanning up the ancestry to determine if there
	 * is a matching type.
	 * 
	 * Attempts to infer the bases that should be added
	 * applied to the specified type, by searching for the
	 * type's equivalents named types explicitly specified
	 * within the specified type's ancestry of scopes.
	 * 
	 * @param origin The type on which to perform 
	 * inference. It is expected to be unannotated.
	 * 
	 * @returns A type object representing the inferred
	 */
	execAncestorInference(origin: X.Type)
	{
		return 1 > 0 ? null : new X.Type([]);
	}
	
	/**
	 * Performs the Polymorphic Base Resolution (PTR)
	 * algorithm as defined by the specification.
	 * 
	 * @returns An array of types that found at
	 * 
	 * Base resolution occurs when trying to resolve the
	 * basings of a given type.
	 * 
	 * The result of this method is a either the fully computed
	 * base-tree, or a base-tree that is sufficiently constructed 
	 * to the point where a guarantee can be made about the
	 * origins of the type referenced in the specified Pointer.
	 */
	execResolution(origin: X.Pointer)
	{
		// Does this method need return a series of pointers?
		// Or should it return the pointers organized into a tree
		// with Relation objects to lay the foundation to deal
		// with regex resolution?
		
		return [new X.Type([])];
	}
	
	/**
	 * 
	 * Computes the set of types imposed by bases of 
	 * containing types.
	 * 
	 * If the parent type is a plural, the contract is not computed
	 * in a way that has anything to do with equivalents. The
	 * algorithm simply looks at the bases defined by the 
	 * parent type, and uses these types as the contract.
	 * 
	 * Computes the set of types with which a specified
	 * type T is expected to comply. The argument is a
	 * has-a side pointer that references the type T. 
	 * If type T is being introduced (as opposed to being
	 * overridden) in the scope where hasaPointer is
	 * pointing, then T has an open contract, and
	 * null is returned.
	 */
	execFindExpectation(declaration: X.Pointer)
	{
		return <X.Type>null!;
	}
	
	/**
	 * The plurality of a type is computed by traversing the
	 * type's supergraph and determining if all pathways 
	 * leading back to all root bases involve crossing the 
	 * path of a pluralized type. In the case when one or more
	 * of these pathways cross pluralized types, and one or
	 * more do not, an error is generated.
	 */
	execPluralityCheck(origin: X.Type)
	{
		// How specifically should this be implemented?
		// Should all possible pathways back to the root
		// be computed, and then checked for plurality
		// status? Or is there an easier method?
	}
	
	/**
	 * Executes a search for all terms that are visible
	 * at the specified location.
	 * 
	 * The argument 
	 * 
	 * @returns ?
	 */
	execReusablesSearch(statement: X.Statement)
	{
		
	}
	
	/**
	 * Executes a search for all terms that are dependent
	 * upon a type T, referenced via the specified has-a
	 * side Pointer. 
	 * 
	 * The search occurs across the scope in which the
	 * specified Pointer exists, and continues deeply into
	 * any scopes nested inside.
	 * 
	 * @returns An array containing Pointer objects that
	 * reference types which are dependent upon type T.
	 */
	execDependentsSearch(hasaPointer: X.Pointer)
	{
		return <X.Pointer[]>[];
	}
}
