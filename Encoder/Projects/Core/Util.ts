import { Type } from "../../../Truth/Core/X";
import PrimeType from "./Type";

/**
 * taken from https://stackoverflow.com/revisions/52171480/17 
 */
export function HashHash(str: string, seed = 0) {
	let h1 = 0xdeadbeef ^ seed, h2 = 0x41c6ce57 ^ seed;
	for (let i = 0, ch; i < str.length; i++) {
			ch = str.charCodeAt(i);
			h1 = Math.imul(h1 ^ ch, 2654435761);
			h2 = Math.imul(h2 ^ ch, 1597334677);
	}
	h1 = Math.imul(h1 ^ h1>>>16, 2246822507) ^ Math.imul(h2 ^ h2>>>13, 3266489909);
	h2 = Math.imul(h2 ^ h2>>>16, 2246822507) ^ Math.imul(h1 ^ h1>>>13, 3266489909);
	return 4294967296 * (2097151 & h2) + (h1>>>0);
};

export function typeHash(type: Type): number
{
	return HashHash(`${type.name}$${type.container ? type.container.name : ""}$${type.bases.map(typeHash)}`);
}

export function primePatternHash(type: PrimeType): number
{
	return HashHash(`${type.bases.hash}${type.parallels.hash}${type.patterns.hash}${type.contents.hash}`);
}

export function JSONHash(...objs: any[])
{
	return HashHash(JSON.stringify(objs));
}