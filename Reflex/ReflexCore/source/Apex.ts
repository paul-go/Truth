
declare function Reflex(): void;

// No, no. This isn't actually a usage of the eval() function.
// This is only for development time. At runtime, the eval call
// is unwrapped. 
//
// This is just to get around the problem that there's currently
// no way to merge a namespace across multiple files, in the
// case when the namespace is also being merged with a
// function. However, because this project uses --outFile for
// bundling, the output doesn't have any JavaScript-level
// issues.
eval("function Reflex() { }");
