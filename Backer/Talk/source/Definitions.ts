namespace Reflex.Talk {
	export interface Namespace {
		(...primitives: Core.Primitive[]): Query;
		is(...primitives: Core.Primitive[]): Operations.Is;
		not(...primitives: Core.Primitive[]): Operations.Not;
		or(...primitives: Core.Primitive[]): Operations.Or;
		has(...primitives: Core.Primitive[]): Operations.Has;
		greaterThan(...primitives: Core.Primitive[]): Operations.GreaterThan;
		lessThan(...primitives: Core.Primitive[]): Operations.LessThan;
	}
}
