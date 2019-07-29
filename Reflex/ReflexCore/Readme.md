# Reflexive Programming

## What is "Reflexive Programming"?

*Reflexive Programming* is a generalized pattern that is an elegant solution to the common programming problem of a complex tree structure, composed from reusable branches, that must be mutated in response to events. As you might suspect, the scope of applicability of reflexive programming is quite broad. The obvious areas of interest are user interfaces (web / native), managing modification of abstract syntax trees, and various bespoke APIs.

It's called *Reflexive*, because the core concept is to attach functions to the hierarchy (called "Recurrent Functions") that kick back some return value that ultimately gets attached to the main tree when called. Just like a Reflex.

Reflexive programming is a highly abstract concept that can't be demonstrated on it's own. It can only be demonstrated though the use of some other library that implements the model. So, the examples used in this document will be written from the perspective of ReflexWeb, which is a Reflexive library that facilitates the creation of complex web UIs.

## Terminology

The basic concepts of reflexive programming are as follows:

A **namespace object** is the main exported object of the reflexive library, through which all faculties of the library are accessed.

A **node** is an abstract grouping concept that refers to either a *branch* or a *leaf*.

A **branch** is a grouping construct that may have other branches, or leaves. Branches are created by calling functions on the namespace object. These branch functions are infinitely nestable, and [variadic](https://en.wikipedia.org/wiki/Variadic_function). In the ReflexWeb library, a branch is a [HTMLElement](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement) object.

A **leaf** is a region of content. Leafs are created by using the template literal syntax over the library's namespace object ``ns`content` ``. The way "content" is defined is library-specific. For example, in the ReflexWeb library, a leaf is a [Text](https://developer.mozilla.org/en-US/docs/Web/API/Text) object.

A **recurrent function** is simply a function that may be attached to some branch (and not a leaf), that may be called multiple times while connected.

A **primitive** is a parameter that is passed to a branch function. The types of allowable primitives for a given branch function is defined at the library level, but some are usable across any reflexive library, such as arrays and functions.

## Unbounded Objects

Reflexive Programming relies on the concept of *Unbounded Objects*. Unbounded objects are special objects that use infinitely recursive ES6 [Proxies](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy). Each member access is funneled back to some member access provider, which defaults to another Proxy. Unbounded objects allow the following JavaScript code to run error-free:

```typescript
const infinite = new SomeUnboundedObject();
infinite("this").wont.generate("an", "error")
	.even["though"].none("of", "this").is.defined.anywhere;
```

Such a programming API when used in pure JavaScript would be almost comically unmanageable. However, TypeScript type definitions can be used to block off the areas where the user shouldn't be allowed to go.

Unbounded objects allow for vast amounts of glue-code to be eliminated from the deployment bundle, and moved into the set of code that is only run during development. For example, the ReflexWeb library uses this technique to provide type-safe access to the entire HTML DOM (all elements and their associated attributes), without any of this actually being present in the compiled JavaScript. In fact, the entire ReflexWeb library is a mere **2.5KB** (gzipped + minified). However, the full version that includes all the TypeScript definitions is much larger.

## Reflexive Programming Over Web Interfaces

The namespace object in ReflexWeb is `ml`. Here is how a basic HTML hierarchy is created:

```typescript
const div = ml.div(
	ml.h1(ml`Title`),
	ml.p(ml`Paragraph 1`),
	ml.p(ml`Paragraph 2`)
);
```

**Explanation**: This code ultimately generates a native [HTMLDivElement](https://developer.mozilla.org/en-US/docs/Web/API/HTMLDivElement). It takes 3 primitives as parameters: an H1 and two P elements. This is a simple example, and the power of reflexive programming isn't obvious until we start getting into more complex examples.

### Attributes

Reflexive libraries typically require some way to easily make type-safe assignments to a branch. In ReflexWeb, the concrete requirement is to assign HTML attributes to elements. This is done by passing an object literal with the desired values as a primitive. Again, we're able to use the fantastic type inference features of TypeScript to make this type-safe:

```typescript
ml.img(
	{ src: "http://www.domain.com/image.png" } 
);
```

### Complex Primitives

When a reflexive library has been configured to accept a certain data type, it's automatically able to accept infinitely nested arrays of that type. Below is an example of why you might want to do this:

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

The reflex engine always flattens all passed arrays, regardless of how deeply they're nested. However, it's not just limited to arrays. Anything that is `Iterable<T>` can be provided, so the following works as expected:

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

This works because the Reflex Engine uses an internal tracking algorithm to figure out where to insert branches. It doesn't simply just append new branches at the end of what has already been inserted.

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

The Reflex engine creates a global `on()` function that takes two parameters, a *selector*, and a *callback*, making the type definition look something like:

```typescript
function on(selector, callback);
```

A *selector* is something that a reflexive library needs to be programmed to be able to accept. Remember, it's possible to have multiple reflexive libraries operating within the same JavaScript execution environment.

The purpose of the selector is so that the reflex engine can route wiring of an event to a particular library. So for example, ReflexWeb declares that it understands all the DOM event names such as `"click"` and `"focus"` as selectors. And so the following code would be routed to ReflexWeb:

```typescript
ml.div(
	on("click", ev =>
	{
		alert("Clicked!");
	});
);

// click event handler now attached to the containing div
```

As stated earlier, ReflexWeb understands strings passed as primitives to be CSS class names:

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

The Reflex engine creates 2 other global recurrent functions: `once()` and `only`. As you might expect, these functions have the same behavior as `on()`, with the difference that:

-  With `once()` the callback is disposed after it's first invocation
- With `only()`, the callback is only triggers for the branch on which it's attached. Reflexive libraries are free to interpret this as they wish. ReflexWeb for example, uses this in situations when event bubbling / event capturing should be avoided.

#### Effects & Properties

The Reflex engine has a concept known as *effects*. An effect is just a function that passes it's call arguments to a series of other functions when called. Effects are valid selectors, and so they can be passed to any recurrent function. Effects are created via the global `effect()` function, passing an example function:

```typescript
// The example function you pass to effect() is discarded immediately.
// They're only used to improve the intellisense experience.
const fx = effect((n: number, s: string) => {});

ml.div(fx, (n: number, s: string) =>
{
	alert("Effect called!");
});

ml.div(fx, (n: number, s: string) =>
{
	alert("Effect called!");
});

// The following causes two alerts to be displayed:
fx(1, "str");
```

Effects on their own are purely functional–they don't store any data of themselves. In the case when you want to store some data, you can use the `property()` function instead. A property is like an effect, except it stores a single value of one particular type. Like effects, they can also be used as selectors. And so we're able to have code like this:

```typescript
const isRed = property(false);

ml.div(
	on("click", () => isRed.value = !isRed.value),
	on(isRed, (was, now) => now ? "red" : "blue")
);

// Using a property as a selector results in the callback being sent
// two parameters. The first is the previous value, the second is the
// current value. Alternatively, the callback could have also inspected 
// the value of isRed.value to get the same result.
```

### Auto-Running

Sometimes, it's necessary to run a callback function as initialization before it's attached. This can be done with the run() function:

```typescript
const isRed = property(false);

ml.div(
	on("click", () => isRed.value = !isRed.value),
	on(isRed, (was, now) => now ? "red" : "blue").run()
);

// This does the same thing as the code above, except that
// the div is initialized with the "blue" CSS class.
```

### 2-Way Value Binding

2-way binding is a controversial feature in most UI libraries, most likely due to poor designs of the libraries themselves. Achieving 2-way binding with Reflex takes about 10 lines of code (which won't be covered here), but ReflexWeb provides a utility to reduce this to a one-liner, using the `.bind()` function:

```typescript
const str = property("content");

return ml.div(
	ml.inputText(
		ml.bind(str)
	),
	only("click", () =>
	{
		str.value = "content";
	}),
	ml(str)
);

// Properties can be passed to the namespace object. When they are,
// it produces content in the output that auto-updates when the value
// of the property changes. And so typing content in the emitted
// <input type="text"> causes the value of an adjacent text block
// to synchronize with it. Clicking anywhere on the div would cause
// the value to reset to "content".
```

### Data Object Synchronization

Synchronizing the contents of a data object with a user interface is a major pain point of many UI engines, that few (if any) have actually gotten right. The often cited reason is performance related to having to perform dirty checking and complex delta calculations. However, the reflexive programming model employs no such gymnastics, yet trivializes the problem with it's `observable()` feature:

```typescript
class Backing
{
	constructor(readonly value: string) { }
}

const sourceArray = observable([
	new Backing("a"),
	new Backing("b"),
	new Backing("c")
]);

ml.div(
	on(sourceArray, item =>
	{
		return ml.div(item.value);
	})
);

// Adjusting the contents of sourceArray will cause
// the child div to be populated with 
```

Observables are also valid selectors, so they can be passed to any recurrent function. In the above example, the callback passed to the `on()` function is called for every item in the source array, and again when the contents of that array changes. To be clear, the above example is simple. A real-world example that uses a complex object passed to the `observable()` function would need to do some checking of the input value in the `on()` callback to determine what to send back.

## Future Libraries

Although this document demonstrates ReflexWeb, the same principles could easily be applied to CSS, creating a LESS-type framework that leverages all the power of TypeScript, but applied to creating CSS. Another could be built for SVG. In the pipeline, we have native abstractions coming to support native macOS, Windows, iOS, and Android apps. The entire [Truebase](https://www.truebase.com) SDK is planned to be a Reflexive API. Stay tuned.

## Why So Much Global Namespace Pollution?

Because it simplifies the programming model, and also because the problems of "global namespace pollution" are overstated. Global namespace pollution is a problem when it's being done by `leftpad`-type libraries (that probably shouldn't exist in the first place). It's less of a problem when its being done by a library that is dictating an entire method of software architecture. We may consider another option in the future to put these global functions inside a `Reflex` namespace of some sort.
