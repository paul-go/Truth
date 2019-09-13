namespace Reflex.Talk {
	export interface Namespace {
		(...primitives: Core.Primitive[]): Query;
		is(...primitives: Core.Primitive[]): IsOperation;
		not(...primitives: Core.Primitive[]): NotOperation;
		or(...primitives: Core.Primitive[]): OrOperation;
		has(...primitives: Core.Primitive[]): HasOperation;
		greaterThan(...primitives: Core.Primitive[]): GreaterThanOperation;
		lessThan(...primitives: Core.Primitive[]): LessThanOperation;
	}
}
