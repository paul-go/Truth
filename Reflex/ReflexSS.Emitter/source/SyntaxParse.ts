
namespace Reflex.SS.Emitter
{
	/** */
	export enum Entity
	{
		component,
		combinator,
		function,
		unknown,
	}

	/** */
	export enum Component
	{
		keyword,
		dataType,
		group,
	}

	/** (Higher number is higher precedence) */
	export enum Combinator
	{
		/** Components are mandatory and should appear in that order */
		juxtaposition = 0,
		/** Components are mandatory but may appear in any order */
		doubleAmpersand = 1,
		/** At least one of the components must be present, and they may appear in any order */
		doubleBar = 2,
		/** Exactly one of the components must be present */
		singleBar = 3,
	}

	/** */
	export enum Multiplier
	{
		/** 0 or more times */
		asterisk,
		/** 1 or more times */
		plusSign,
		/** 0 or 1 time (that is optional) */
		questionMark,
		/** 1 or more times, but each occurrence separated by a comma (',') */
		hashMark,
		/** Group must produce at least 1 value */
		exclamationPoint,
		/** At least A times, at most B times */
		curlyBracet,
	}

	/** */
	export interface IMultiplierCurlyBracet
	{
		sign: Multiplier.curlyBracet;
		min: number;
		max: number;
	}

	/** */
	export interface IMultiplierSimple
	{
		sign:
			Multiplier.asterisk |
			Multiplier.plusSign |
			Multiplier.questionMark |
			Multiplier.hashMark |
			Multiplier.exclamationPoint;
	}

	/** */
	export type MultiplierType = IMultiplierCurlyBracet | IMultiplierSimple;

	/** */
	export interface INonGroupData
	{
		entity: Entity.component;
		multiplier: MultiplierType | null;
		component: Component.keyword | Component.dataType;
		value: string;
	}

	/** */
	export interface IGroupData
	{
		entity: Entity.component;
		multiplier: MultiplierType | null;
		component: Component.group;
		entities: EntityType[];
	}

	/** */
	export type ComponentType = INonGroupData | IGroupData;

	/** */
	export interface ICombinator
	{
		entity: Entity.combinator;
		combinator: Combinator;
	}

	/** */
	export interface IFunction
	{
		entity: Entity.function;
		multiplier: MultiplierType | null;
	}

	/** */
	export interface IUnknown
	{
		entity: Entity.unknown;
		multiplier: MultiplierType | null;
	}

	/** */
	export type EntityType = ComponentType | ICombinator | IFunction | IUnknown;

	const REGEX_ENTITY = /(?:^|\s)((?:[\w]+\([^\)]*\))|[^\s*+?#!{]+)([*+?#!]|{(\d+),(\d+)})?/g;
	const REGEX_DATA_TYPE = /^(<[^>]+>)/g;
	const REGEX_KEYWORD = /^([\w-]+)/g;

	/** */
	export const combinators: { [key: number]: ICombinator } =
	{
		[Combinator.juxtaposition]: {
			entity: Entity.combinator,
			combinator: Combinator.juxtaposition
		},
		[Combinator.doubleAmpersand]: {
			entity: Entity.combinator,
			combinator: Combinator.doubleAmpersand
		},
		[Combinator.doubleBar]: {
			entity: Entity.combinator,
			combinator: Combinator.doubleBar,
		},
		[Combinator.singleBar]: {
			entity: Entity.combinator,
			combinator: Combinator.singleBar,
		}
	};

	/** */
	export function parse(syntax: string): EntityType[]
	{
		const levels: EntityType[][] = [[]];
		let previousMatchWasComponent = false;
		let entityMatch: RegExpExecArray | null;
		
		while (entityMatch = REGEX_ENTITY.exec(syntax))
		{
			const [, value, ...rawMultiplier] = entityMatch;
			if (value.indexOf("(") !== -1)
			{
				deepestLevel().push({
					entity: Entity.function,
					multiplier: multiplierData(rawMultiplier)
				});
				previousMatchWasComponent = false;
				continue;
			}
			else if (value.indexOf("&&") === 0)
			{
				deepestLevel().push(combinators[Combinator.doubleAmpersand]);
				previousMatchWasComponent = false;
				continue;
			}
			else if (value.indexOf("||") === 0)
			{
				deepestLevel().push(combinators[Combinator.doubleBar]);
				previousMatchWasComponent = false;
				continue;
			}
			else if (value.indexOf("|") === 0)
			{
				deepestLevel().push(combinators[Combinator.singleBar]);
				previousMatchWasComponent = false;
				continue;
			}
			else if (value.indexOf("]") === 0)
			{
				const definitions = levels.pop();
				if (definitions)
					deepestLevel().push(
						componentGroupData(
							groupByPrecedence(definitions),
							multiplierData(rawMultiplier)
						)
					);
				
				previousMatchWasComponent = true;
				continue;
			}
			else
			{
				if (previousMatchWasComponent)
					deepestLevel().push(combinators[Combinator.juxtaposition]);
				
				if (value.indexOf("[") === 0)
				{
					levels.push([]);
					previousMatchWasComponent = false;
					continue;
				}

				let componentMatch: RegExpMatchArray | null;
				if (componentMatch = value.match(REGEX_DATA_TYPE))
				{
					const name = componentMatch[0];
					deepestLevel().push(componentData(
						Component.dataType,
						name,
						multiplierData(rawMultiplier)
					));
					previousMatchWasComponent = true;
					continue;
				}
				else if (componentMatch = value.match(REGEX_KEYWORD))
				{
					const name = componentMatch[0];
					deepestLevel().push(componentData(
						Component.keyword,
						name,
						multiplierData(rawMultiplier)
					));
					previousMatchWasComponent = true;
					continue;
				}
			}
			
			deepestLevel().push({
				entity: Entity.unknown,
				multiplier: multiplierData(rawMultiplier)
			});
		}

		function deepestLevel()
		{
			return levels[levels.length - 1];
		}

		return groupByPrecedence(levels[0]);
	}

	/** */
	export function isComponent(entity: EntityType): entity is ComponentType
	{
		return entity.entity === Entity.component;
	}

	/** */
	export function isCombinator(entity: EntityType): entity is ICombinator
	{
		return entity.entity === Entity.combinator;
	}

	/** */
	export function isCurlyBracetMultiplier(multiplier: MultiplierType): multiplier is IMultiplierCurlyBracet
	{
		return multiplier.sign === Multiplier.curlyBracet;
	}

	/** */
	export function isMandatoryMultiplied(multiplier: MultiplierType | null)
	{
		return multiplier !== null && (isCurlyBracetMultiplier(multiplier) && multiplier.min > 1);
	}

	/** */
	export function isOptionallyMultiplied(multiplier: MultiplierType | null)
	{
		return (
			multiplier !== null &&
			((isCurlyBracetMultiplier(multiplier) && multiplier.min < multiplier.max && multiplier.max > 1) ||
				multiplier.sign === Multiplier.asterisk ||
				multiplier.sign === Multiplier.plusSign ||
				multiplier.sign === Multiplier.hashMark ||
				multiplier.sign === Multiplier.exclamationPoint)
		);
	}

	/** */
	export function isMandatoryEntity(entity: EntityType)
	{
		if (isCombinator(entity))
			return entity === combinators[Combinator.doubleAmpersand] ||
				entity === combinators[Combinator.juxtaposition];
		
		if (entity.multiplier)
		{
			return (
				(isCurlyBracetMultiplier(entity.multiplier) && entity.multiplier.min > 0) ||
				entity.multiplier.sign === Multiplier.plusSign ||
				entity.multiplier.sign === Multiplier.hashMark ||
				entity.multiplier.sign === Multiplier.exclamationPoint
			);
		}

		return true;
	}

	/** */
	export function componentData(
		component: Component.keyword | Component.dataType,
		value: string,
		multiplier: MultiplierType | null = null): ComponentType
	{
		return {
			entity: Entity.component,
			component,
			multiplier,
			value,
		};
	}

	/** */
	export function componentGroupData(
		entities: EntityType[],
		multiplier: MultiplierType | null = null): ComponentType
	{
		return {
			entity: Entity.component,
			component: Component.group,
			multiplier,
			entities,
		};
	}

	/** */
	function multiplierData(raw: string[]): MultiplierType | null
	{
		if (!raw[0])
			return null;
		
		switch (raw[0].slice(0, 1))
		{
			case "*": return { sign: Multiplier.asterisk };
			case "+": return { sign: Multiplier.plusSign };
			case "?": return { sign: Multiplier.questionMark };
			case "#": return { sign: Multiplier.hashMark };
			case "!": return { sign: Multiplier.exclamationPoint };
			case "{":
				return {
					sign: Multiplier.curlyBracet,
					min: Number(raw[1]),
					max: Number(raw[2])
				};
		}
		
		return null;
	}

	/** */
	function groupByPrecedence(
		entities: EntityType[],
		precedence: number = Combinator.singleBar): EntityType[]
	{
		if (precedence < 0)
			// We've reached the lowest precedence possible
			return entities;
		
		const combinator = combinators[precedence];
		const combinatorIndexes: number[] = [];

		// Search for indexes where the combinator is used
		for (let i = entities.indexOf(combinator); i > -1; i = entities.indexOf(combinator, i + 1))
			combinatorIndexes.push(i);
		
		const nextPrecedence = precedence - 1;

		if (combinatorIndexes.length === 0)
			return groupByPrecedence(entities, nextPrecedence);
		
		const groupedEntities: EntityType[] = [];

		// Yes, what you see is correct: it's index of indexes
		// Adds one loop to finish up the last entities
		for (let i = 0; i < combinatorIndexes.length + 1; i++)
		{
			const sectionEntities = entities.slice(
				i > 0 ?
					combinatorIndexes[i - 1] + 1 : // Slice from beginning
					0,
				i < combinatorIndexes.length ?
					combinatorIndexes[i] : // Slice to end
					entities.length,
			);
			
			// Only group if there's more than one entity in between
			sectionEntities.length > 1 ?
				groupedEntities.push(componentGroupData(groupByPrecedence(sectionEntities, nextPrecedence))) :
				groupedEntities.push(...sectionEntities);
			
			if (i < combinatorIndexes.length)
				groupedEntities.push(entities[combinatorIndexes[i]]);
		}

		return groupedEntities;
	}
}
