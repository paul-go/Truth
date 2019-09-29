import { promises as FS } from "fs";
import { parse, Document, Type} from "../../../Truth/Core/X";
import { RawDataPatternMap } from "./CLI";

/**
 * Scans truth file and provides type information for Encoder
 */
export default class Scanner 
{
	/**
	 * Load and parse truth file
	 */ 
	static async fromFile(path: string, patterns: RawDataPatternMap)
	{
		const Content = await FS.readFile(path, "utf-8");
		const Doc = await parse(Content);
		return new Scanner(Doc, patterns);
	}
	
	/** 
	 * Store for types that doesn't match with patterns
	 */
	codeList: Set<Type>;
	
	/**
	 *  Store for result of pattern match
	 */  
	store: Record<string, Set<Type>> = {};
	
	/**
	 * 
	 */
	constructor(public document: Document, public patterns: RawDataPatternMap)
	{
		this.codeList = new Set<Type>();
		
		document.types.forEach(x => this.scanContent(x));
		
		for (const key in patterns)
		{
			this.store[key] = new Set<Type>();
			this.storeTypes(key, patterns[key]);	
		}
	}
	
	scanContent(type: Type)
	{
		this.codeList.add(type);
		type.contents.forEach(x => this.scanContent(x));
	}	
	
	/**
	 * Stores types matching with given patterns according to given key
	 */
	storeTypes(key: string, patterns: RegExp[])
	{
		const store = this.store[key];
		
		for (const pattern of patterns) 
			for (const type of this.scanPattern(pattern))
				store.add(type);
	}
	
	/**
	 * Finds matching document root types with given pattern
	 */
	scanPattern(pattern: RegExp)
	{
		const match = this.document.types.filter(x => pattern.test(x.name));
		for (const type of match)
			this.codeList.delete(type);
		return match;
	}
	
	
}