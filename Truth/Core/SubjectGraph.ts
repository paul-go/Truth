import * as X from "./X";


/**
 * 
 */
export class SubjectGraph
{
	/** */
	constructor()
	{
		// Attach to hooks, keep graph updated
		// Reject circular dependencies
		// Maintain topologic sorting
	}
	
	/** */
	getWhatThisIs(subject: X.Subject)
	{
		
	}
	
	/** */
	getWhatIsThis(subject: X.Subject)
	{
		
	}
	
	/** */
	getWhatThisHas(subject: X.Subject)
	{
		
	}
	
	/** */
	getWhatHasThis(subject: X.Subject)
	{
		
	}
	
	/**
	 * Set of all subjects loaded in the entire system.
	 */
	private readonly allSubjects = new Set<X.Subject>();
}


/**
 * 
 */
class SubjectNode
{
	constructor(subject: X.Subject)
	{
		this.subject = subject;
	}
	
	/** */
	readonly subject: X.Subject;
	
	/** */
	readonly is: SubjectNode[] = [];
	
	/** */
	readonly isThis: SubjectNode[] = [];
	
	/** */
	readonly has: SubjectNode[] = [];
	
	/** */
	readonly hasThis: SubjectNode[] = [];
}
