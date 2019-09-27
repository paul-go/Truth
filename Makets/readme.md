
# Makets

**Makets** (Make TypeScript) is an ultra-light application and library bundling tool designed for use with the TruthStack.

## Usage

Install globally with:

```
npm install makets -g
```
Or locally in your project with:
```
npm install makets --save
```

Place an empty file called `make.ts` in the root directory of your application. This will be your build script.

Build scripts are very simple and easy to write. Everything you need will be in the `make.*` namespace. In fact, Makets is built with itself, here is what Makets's `make.ts` file looks like, which builds Makets and publishes itself to the npm registry:

```typescript
make.on("publish", async () =>
{
	make.directory("./bundle");
	make.copy("./build/source/make.js", "./bundle/main.js");
	make.copy("./build/source/make.d.ts", "./bundle/index.d.ts");
	
	make.publish({
		packageFileChanges: {
			main: "./main.js",
			scripts: {},
			bin: {
				makets: "./main.js"
			}
		}
	});
});
```

## Getting Type-Safe Make.ts Files

There are a number of ways to do this, but in the case when you've installed make.ts locally, you can simply place a triple slash comment at the top if your file:

```
/// <reference types="makets" />
```

## Execution

Makets operates on the concept of _keywords_. The script above uses one build keyword, "publish". There's no configuration necessary anywhere to setup keywords. Just trap them in a `make.on("keyword", () => ... )` , and then specify them on the command line, like so:

`makets publish ` (if installed globally)

`npx makets publish` (if installed locally)

You can specify multiple keywords from the command line, and can also pass multiple keywords to the `make.on` function.

## Hang On ... Is This Executing TypeScript Directly??

Yes and no. It turns out that you don't really need any TypeScript-specific annotations in order to put together a build script. So when you pass a file called "make.ts" to makets, it just runs the contents of the file as JavaScript. Of course, if your script has TypeScript-specific syntax here, this won't work. (Note that you can also name your file "make.js", and it will use this as a fallback if a file called "make.ts" is not found).