# The Reflex Pattern

The *Reflex Pattern* is a general solution to the common programming problem of a complex tree structure, composed from many sources, many of which many be reusable, that must be mutated in response to events. As you might suspect, the scope of applicability of this pattern is quite broad. The obvious areas of interest are user interfaces (web / native), managing modification of abstract syntax trees, and various bespoke APIs.

The core concept is to attach functions to the hierarchy (called "Recurrent Functions") that kick back some return value that ultimately gets attached to the main tree when called. The Reflex pattern is a highly abstract concept that can't be demonstrated on it's own. It can only be demonstrated though the use of some other library that implements the pattern.

## Terminology

The basic concepts of the reflexive pattern are as follows:

A **reflexive library** is a library that implements the reflexive pattern in some way.

A **namespace object** is the main exported object of the reflexive library, through which all faculties of the library are accessed.

A **node** is an abstract grouping concept that refers to either a *branch* or a *leaf*.

A **branch** is a grouping construct that may have other branches, or leaves. Branches are created by calling functions on the namespace object. These branch functions are infinitely nestable, and [variadic](https://en.wikipedia.org/wiki/Variadic_function). In the ReflexML library, a branch is a [HTMLElement](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement) object.

A **leaf** is a region of content. Leafs are created by using the template literal syntax over the library's namespace object ``ns`content` ``. The way "content" is defined is library-specific. For example, in the ReflexML library, a leaf is a [Text](https://developer.mozilla.org/en-US/docs/Web/API/Text) object.

A **recurrent function** is simply a function that may be attached to some branch (and not a leaf), that may be called multiple times while connected.

A **primitive** is a parameter that is passed to a branch function. The types of allowable primitives for a given branch function is defined at the library level, but some are usable across any reflexive library, such as arrays and functions.

A **forces** are primitive or object variables that causes this reflexive kick-back behavior to occur when mutated.

## Unbounded Objects

The Reflexive pattern relies on the concept of *Unbounded Objects*. Unbounded objects are special objects that use infinitely recursive ES6 [Proxies](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy). Each member access is funneled back to some member access provider, which defaults to another Proxy. Unbounded objects allow the following JavaScript code to run error-free:

```typescript
const infinite = new SomeUnboundedObject();
infinite("this").wont.generate("an", "error")
	.even["though"].none("of", "this").is.defined.anywhere;
```

Such a programming API when used in pure JavaScript would be almost comically unmanageable. However, TypeScript type definitions can be used to block off the areas where the user shouldn't be allowed to go.

Unbounded objects allow for vast amounts of glue-code to be eliminated from the deployment bundle, and moved into the set of code that is only run during development. For example, the ReflexML library uses this technique to provide type-safe access to the entire HTML DOM (all elements and their associated attributes), without any of this actually being present in the compiled JavaScript. In fact, the entire ReflexML library is a mere **2.5KB** (gzipped + minified). However, the full version that includes all the TypeScript definitions is much larger.

## The Reflexive Pattern Applied To Web Interfaces

The namespace object in ReflexML is `ml`. Here is how a basic HTML hierarchy is created:

```typescript
const div = ml.div(
	ml.h1(ml`Title`),
	ml.p(ml`Paragraph 1`),
	ml.p(ml`Paragraph 2`)
);
```

**Explanation**: This code ultimately generates a native [HTMLDivElement](https://developer.mozilla.org/en-US/docs/Web/API/HTMLDivElement). It takes 3 primitives as parameters: an H1 and two P elements. This is a simple example, and the power of the pattern isn't obvious until we start getting into more complex examples.

### Attributes

Reflexive libraries typically require some way to easily make type-safe assignments to a branch. In ReflexML, the concrete requirement is to assign HTML attributes to elements. This is done by passing an object literal with the desired values as a primitive. Again, we're able to use the fantastic type inference features of TypeScript to make this type-safe:

```typescript
ml.img(
	{ src: "http://www.domain.com/image.png" } 
);
```

### Complex Primitives

When a Reflexive library has been configured to accept a certain data type, it's automatically able to accept infinitely nested iterables of that type. Below is an example of why you might want to do this:

```typescript
function getTopElements()
{
	return [
		ml.p(ml`a`),
		ml.p(ml`b`)
	];
}

function getBottomElements()
{
	return [
		ml.p(ml`d`),
		ml.p(ml`e`)
	];
}

function getElements()
{
	return ml.div(
		getTopElements(),
		ml.p(ml`c`),
		getBottomElements()
	);
}

/*
Creates HTML content that looks like:

<div>
	<p>a</p>
	<p>b</p>
	<p>c</p>
	<p>d</p>
	<p>e</p>
</div>
*/
```

The Reflex Core always flattens all passed arrays, regardless of how deeply they're nested. However, it's not just limited to arrays. Anything that is `Iterable<T>` can be provided, so the following works as expected:

```typescript
function* getNestedElements()
{
	yield ml.p(ml`a`);
	yield ml.p(ml`b`);
}

function getElements()
{
	return ml.div(
		getNestedElements()
	);
}
```

It's not even limited to functions that operate synchronously. Async Iterables work just the same:

```typescript
async function getNestedElements()
{
	for await (const val in someAsyncIterable)
	{
		yield ml.div( ... );
	}
}

function getElements()
{
	return ml.div(
		ml.p(ml`a`),
		getNestedElements(),
		ml.p(ml`z`)
	);
}

/*
Once the iterable has run out, the final HTML will look like:
<div>
	<p>a</p>
	... other elements returned from async iterable are here ...
	<p>z</p>
</div>
*/
```

This works because the Reflex Core uses an internal tracking algorithm to figure out where to insert branches. It doesn't simply just append new branches at the end of what has already been inserted.

### Closures

When use-cases start getting more complex, it becomes necessary to gain programmatic access to the branches (or the HTML elements) being created, *while they're being created*. React for example, has an awkward feature known as `refs` that address this issue. The Reflex solution is far cleaner. Any closure passed as a primitive to a branch function is passed 2 parameters: a reference to current branch, and a live-updated array that references the current children of the branch. For example:

```typescript
ml.div(
	(e, children) =>
	{
		// e refers to the parent div
		// children is an array of elements,
		// but would be empty given this code.
	});
);
```

The `children` value passed to these functions is a JavaScript array, with all the standard JavaScript array functions you'd expect–push, pop, unshift, shift, etc. You can use these functions to mutate the underlying model.

### Recurrent Functions

Up until this point, we've only seen hierarchy construction. We haven't seen anything actually *reflex*.

The Reflex Core creates a global `on()` function that takes two parameters, a *selector*, and a *callback*, making the type definition look something like:

```typescript
function on(selector, callback);
```

A *selector* is something that a Reflexive library needs to be programmed to be able to accept. Remember, it's possible to have multiple reflexive libraries operating within the same JavaScript execution environment.

The purpose of the selector is so that the Reflex Core can route wiring of an event to a particular library. So for example, ReflexML declares that it understands all the DOM event names such as `"click"` and `"focus"` as selectors. And so the following code would be routed to ReflexML:

```typescript
ml.div(
	on("click", ev =>
	{
		alert("Clicked!");
	});
);

// click event handler now attached to the containing div
```

As stated earlier, ReflexML understands strings passed as primitives to be CSS class names:

```typescript
ml.div("red");
// Creates a div with the CSS class name "red"
```

This really shines when we combine with an example that demonstrates reflexivity, using a recurrent function:

```typescript
ml.div(
	on("click", () => Math.random() > 0.5 ? "red" : "blue")
);

// Creates a div with a click event. When the div is clicked,
// it kicks back a class name, which is either "red" and "blue",
// based on some random number.
```

Recurrent functions can kick back any valid primitive understood by the reflexive library. And when this is combined with the fact that the global `on()` function itself returns a primitive, the options for creating expressive, reusable code become essentially limitless:

```typescript
function getEvents()
{
	return [
		on("event-1", () => ml.div( ... )),
		on("event-2", () => ({ "data-value": ...  })),
		on("event-3", () => ["class-1", "class-2"]),
		new Promise(r =>
		{
			await something;
			r(on("deferred-event", () => ... ));
		})
	];
}

ml.div(
	"div1",
	getEvents()
);

ml.div(
	"div2",
	getEvents()
);
```

### Other Recurrent Functions

The Reflex Core creates 2 other global recurrent functions: `once()` and `only`. As you might expect, these functions have the same behavior as `on()`, with the difference that:

-  With `once()` the callback is disposed after it's first invocation
- With `only()`, the callback is only triggers for the branch on which it's attached. Reflexive libraries are free to interpret this as they wish. ReflexML for example, uses this in situations when event bubbling / event capturing should be avoided.

## Designing Reflexive Libraries

At the time of this writing, the Reflex Core exposes an abstract class called `Reflex.Core.Library` that declares a variety of methods that a library must implement in order to apply reflexive pattern to the domain of the library. Building a Reflexive library is actually quite simple–only a 100 or so lines of code is necessary. The library just needs to provide an implementation for the basic operations such as branch creation, branch assignment, etc, and the Reflex Core takes care of everything else.

## Future Libraries

Although this document demonstrates ReflexML, the same principles could easily be applied to CSS, creating a LESS-type framework that leverages all the power of TypeScript, but applied to creating CSS. Another could be built for SVG. In the pipeline, we have native abstractions coming to support native macOS, Windows, iOS, and Android apps. The entire [Truebase](https://www.truebase.com) SDK is planned to be a Reflexive API. Stay tuned.

## Why So Much Global Namespace Pollution?

Because it simplifies the programming model, and also because the problems of "global namespace pollution" are overstated. Global namespace pollution is a problem when it's being done by `leftpad`-type libraries (that probably shouldn't exist in the first place). It's less of a problem when its being done by a library that is dictating an entire method of software architecture. We may consider another option in the future to put these global functions inside a `Reflex` namespace of some sort.

