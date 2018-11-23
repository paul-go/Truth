import * as X from "./X";


/**
 * A Functor is a class that acts as a layer ontop
 * of a Strand. It provides various methods to
 * aid in the construction of Type objects.
 */
export class Functor
{
	/**
	 * Creates a new Functor from the specified Strand.
	 * If a Functor already exists whose Strand matches
	 * the one specified, the existing Functor is returned
	 * instead.
	 */
	static get(strand: X.Strand)
	{
		const document = getDocument(strand);
		const stamp = document.version;
		const program = document.program;
		const map = this.cache.get(program) || (() =>
		{
			const map = new Map<string, Functor>();
			this.cache.set(program, map);
			return map;
		})();
		
		// The map must be cleared out whenever
		// a new edit cycle has been detected.
		if (map.size > 0)
		{
			const iter = map.values().next();
			if (!iter.done)
				if (iter.value.stamp.newerThan(stamp))
					map.clear();
		}
		
		const strandStr = strand.toString();
		const existingNode = map.get(strandStr);
		if (existingNode)
			return existingNode;
		
		const newNode = new Functor(strand, stamp);
		map.set(strandStr, newNode);
		return newNode;
	}
	
	/** */
	private static readonly cache = new WeakMap<X.Program, Map<string, Functor>>();
	
	/** */
	private constructor(
		/**
		 * Stores a reference to the Strand from which the values
		 * of the properties in this Functor are derived.
		 */
		private readonly strand: X.Strand,
		/**
		 * Stores a reference to the stamp assigned to the 
		 * document at the time this Functor was instantiated.
		 */
		readonly stamp: X.VersionStamp)
	{ }
	
	/**
	 * Gets the name of this Functor, which will eventually
	 * become the name of the Type to which this Functor
	 * will correspond. The name is a stringified representation
	 * of the related Subject in the document.
	 */
	get name()
	{
		return this._name !== null ? 
			this._name :
			this._name = this.atom.subject.toString();
	}
	private _name: string | null = null;
	
	/** */
	get atom(): X.Atom
	{
		const mols = this.strand.molecules;
		return mols[mols.length - 1].localAtom;
	}
	
	/**
	 * Gets a Uri object that uniquely identifies this Functor in the
	 * type tree, which includes the path to the containing document,
	 * as well as the type path that corresponds to this Functor.
	 */
	get uri()
	{
		if (this._uri)
			return this._uri;
		
		const doc = getDocument(this);
		const typePath = this.strand.molecules
			.map(m => m.localAtom.subject.toString());
		
		return this._uri = doc.sourceUri.extend([], typePath);
	}
	private _uri: X.Uri | null = null;
	
	/**
	 * Gets a reference to the Functor that directly
	 * contains this Functor.
	 */
	get container()
	{
		if (this._container !== undefined)
			return this._container;
		
		return this._container = Functor.get(this.strand.retract(1));
	}
	private _container: Functor | null | undefined = undefined;
	
	/**
	 * Gets the array of Functors that contain this one,
	 * in the order of their containment, starting with the
	 * directly containing Functor.
	 */
	get containers(): ReadonlyArray<Functor>
	{
		if (this._containers)
			return this._containers;
		
		const containers: Functor[] = [];
		let nextContainer = this.container;
		
		while (nextContainer !== null)
		{
			containers.push(nextContainer);
			nextContainer = nextContainer.container;
		}
		
		return this._containers = containers;
	}
	private _containers: ReadonlyArray<Functor> | null = null;
	
	/**
	 * Gets an array that contains the Functors that were
	 * created as a result of declarations being explicitly
	 * specified.
	 */
	get contents(): Functor[]
	{
		if (this._contents)
			return this._contents;
		
		const fragmenter = getProgram(this).fragmenter;
		const strands = fragmenter.queryContents(this.uri);
		const functors = strands.map(s => Functor.get(s));
		return this._contents = functors;
	}
	private _contents: Functor[] | null = null;
	
	/**
	 * 
	 */
	get sources(): Functor[]
	{
		if (this._sources)
			return this._sources;
		
		const sources: Functor[] = [];
		
		if (this.container)
		{
			for (const containerSrc of this.container.sources)
			{
				const sourceFunctors = containerSrc.contents
					.find(fntr => fntr.name === this.name);
				
				// Attempt resolution through abstraction
				if (sourceFunctors)
				{
					sources.push(sourceFunctors);
					continue;
				}
				
				// Attempt resolution through containment
				const containerFunctors = this.getFunctorsFromContainment(this.name);
				if (containerFunctors.length)
				{
					sources.push(...containerFunctors);
				}
			}
		}
		else
		{
			const document = getDocument(this);
			const fragmenter = document.program.fragmenter;
			
			for (const refName of this.referencedNames)
			{
				const testUri = document.sourceUri.extend([], refName);
				const strand = fragmenter.query(testUri);
				if (strand)
				{
					sources.push(Functor.get(strand));
				}
				else
				{
					const mols = this.strand.molecules;
					const allAtoms = mols[mols.length - 1].referencedAtoms;
					const relevantAtoms = allAtoms.filter(atom => 
						atom.subject.toString() === refName);
					
					this._orphans.push(...relevantAtoms);
				}
			}
		}
		
		return this._sources = sources;
	}
	private _sources: Functor[] | null = null;
	
	/**
	 * Gets an array of Atoms that could not be resolved to a Functor.
	 */
	get orphans(): X.Atom[]
	{
		// Trigger the computation of sources, which populates
		// the orphans array. Design refactoring needed.
		this.sources;
		return this._orphans.slice();
	}
	private _orphans: X.Atom[] = [];
	
	/**
	 * Gets an array containing the names of potential
	 * Functors that this Function references.
	 */
	get referencedNames(): ReadonlyArray<string>
	{
		if (this._referencedNames)
			return this._referencedNames;
		
		const names = new Set<string>();
		
		for (const molecule of this.strand.molecules)
			for (const atom of molecule.referencedAtoms)
				names.add(atom.subject.toString());
		
		return this._referencedNames = Array.from(names);
	}
	private _referencedNames: ReadonlyArray<string> | null = null;
	
	/**
	 * Scans upwards through this Functor's containment
	 * hierarchy, and produces an array of Functor instances
	 * whose name matches the one specified.
	 * 
	 * For example, given the document below, and beginning
	 * enumeration from "C" and searching for "T", the yielded 
	 * Functors would be: [T, T, T].
	 * 
	 * T
	 * A
	 *     T
	 *     B
	 *         T
	 *         C
	 * 
	 * This method answers the question: "Which Functors 
	 * does the name "X" refer to in this Functor's containment
	 * hierarchy?".
	 */
	getFunctorsFromContainment(refFunctorName: string)
	{
		if (!this.referencedNames.includes(refFunctorName))
			throw X.ExceptionMessage.invalidArgument();
		
		const out: Functor[] = [];
		const document = getDocument(this);
		const fragmenter = document.program.fragmenter;
		const testUris = this.containers
			.map(container => container.uri.extend([], refFunctorName))
			.concat(document.sourceUri.extend([], refFunctorName));
		
		for (const testUri of testUris)
		{
			const strand = fragmenter.query(testUri);
			if (strand)
				out.push(Functor.get(strand));
		}
		
		return out;
	}
	
	/**
	 * Traverses through this Functor's abstraction DAG,
	 * and produces an array of Functor instances whose name
	 * matches the one specified. If the name is omitted, the
	 * traversal uses this Functor's name as the match
	 * predicate.
	 * 
	 * For example, given the document below, and beginning the
	 * enumeration from "A/B/C", the returned Functors would
	 * be: [A/B/C, Y/B/C, X/B/C]
	 * 
	 * X
	 *     B
	 *         C
	 * Y
	 *     B
	 *         C
	 * Z
	 *     B
	 *         C
	 * A : X, Y, Z
	 *     B
	 *         C
	 * 
	 * This method answers the question: "Where are all the
	 * Functors that may contribute annotations to this Functor?"
	 */
	private getFunctorsFromAbstraction(refFunctorName?: string): Functor[]
	{
		// DEAD Method
		
		if (refFunctorName)
			if (!this.referencedNames.includes(refFunctorName))
				throw X.ExceptionMessage.invalidArgument();
		
		const out: Functor[] = [];
		const directive = this.uri
			.retract(0, 1)
			.extend([], refFunctorName || "")
			.typePath;
		
		const stack: string[] = [];
		const containers = this.containers.slice().reverse();
		
		// You need to do the one-level peek maneuver here.
		
		const recurse = () =>
		{
			
		}
		
		return out;
	}
}


/** */
function getUriFromAtoms(atoms: X.Atom[])
{
	if (atoms.length === 0)
		throw X.ExceptionMessage.invalidArgument();
	
	const doc = getDocument(atoms[0]);
	const segments = atoms.map(atom => atom.pointers[0].subject.toString());
	return doc.sourceUri.extend([], segments);
}


/** */
function getProgram(input: X.Atom | X.Strand | Functor)
{
	return getDocument(input).program;
}


/** */
function getDocument(input: X.Atom | X.Strand | Functor)
{
	if (input instanceof X.Atom)
		return input.pointers[0].statement.document;
	
	if (input instanceof X.Strand)
		return input.molecules[0].localAtom.pointers[0].statement.document;
	
	if (input instanceof Functor)
		input.atom.pointers[0].statement.document;
	
	throw X.ExceptionMessage.unknownState();
}


/**
 * 
 */
export class Base
{
	constructor(
		/**
		 * 
		 */
		readonly route: FunctorResolveRoute,
		/**
		 * 
		 */
		readonly functor: Functor,
		/**
		 * 
		 */
		readonly bases: ReadonlyArray<Base>)
	{ }
}


/**
 * Defines a series of Stops that describe the route that the
 * resolution algorithm took to navigate from one Functor
 * to another.
 */
export class FunctorResolveRoute
{
	/** */
	constructor(readonly stops: Stop[])
	{
		if (stops.length === 0)
			throw X.ExceptionMessage.invalidArgument();
	}
	
	/** Gets the Functor where the resolution algorithm began. */
	get origin()
	{
		return this.stops[0].functor;
	}
}

/**
 * 
 */
export class Stop
{
	constructor(
		readonly relation: StopRelation | null,
		readonly functor: Functor)
	{ }
}

/**
 * 
 */
export enum StopRelation
{
	container,
	base
}
