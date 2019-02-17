/// <reference path="../../Build/Release/truth.d.ts" />
/// <reference path="editor.d.ts" />

program.on(Truth.CauseEditComplete, data =>
{
	console.log("edit complete from hook.");
});


