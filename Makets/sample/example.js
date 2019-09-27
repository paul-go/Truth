"use strict";

var convert		=	require("convert-source-map");
var combine		=	require("combine-source-map");

var aMap = { 
	version	:	3,
	file		 :	"a.js",
	sourceRoot	 :	"",
	sources	:	[ "../a.ts" ],
	names		:	[],
	mappings		 :	";AAAA,SAAS,CAAC;IAET,OAAO,CAAC,GAAG,CAAC,IAAI,CAAC,CAAC;IAClB,OAAO,CAAC,GAAG,CAAC,IAAI,CAAC,CAAC;IAClB,OAAO,CAAC,GAAG,CAAC,IAAI,CAAC,CAAC;AACnB,CAAC",
	sourcesContent :	[ "function a()\n{\n\tconsole.log(\"a1\");\n\tconsole.log(\"a2\");\n\tconsole.log(\"a3\");\n}" ] };

var bMap = { 
	version	:	3,
	file		 :	"b.js",
	sourceRoot	 :	"",
	sources	:	[ "../b.ts" ],
	names		:	[],
	mappings		 :	";AAAA,SAAS,CAAC;IAET,OAAO,CAAC,GAAG,CAAC,IAAI,CAAC,CAAC;IAClB,OAAO,CAAC,GAAG,CAAC,IAAI,CAAC,CAAC;IAClB,OAAO,CAAC,GAAG,CAAC,IAAI,CAAC,CAAC;AACnB,CAAC",
	sourcesContent :	[ "function b()\n{\n\tconsole.log(\"b1\");\n\tconsole.log(\"b2\");\n\tconsole.log(\"b3\");\n}" ] };

var cMap = { 
	version	:	3,
	file		 :	"c.js",
	sourceRoot	 :	"",
	sources	:	[ "../c.ts" ],
	names		:	[],
	mappings		 :	";AAAA;CAAA;CAAA,CAAA,CAAA,IAAO,GAAK;CAAZ",
	sourcesContent :	[ "function c()\n{\n\tconsole.log(\"c1\");\n\tconsole.log(\"c2\");\n\tconsole.log(\"c3\");\n}" ] };

var dMap = { 
	version	:	3,
	file		 :	"d.js",
	sourceRoot	 :	"",
	sources	:	[ "../d.ts" ],
	names		:	[],
	mappings		 :	";AAAA;CAAA;CAAA,CAAA,CAAA,IAAO,GAAK;CAAZ",
	sourcesContent :	[ "function d()\n{\n\tconsole.log(\"d1\");\n\tconsole.log(\"d2\");\n\tconsole.log(\"d3\");\n}" ] };

var aComment = convert.fromObject(aMap).toComment();
var bComment = convert.fromObject(bMap).toComment();
var cComment = convert.fromObject(cMap).toComment();
var dComment = convert.fromObject(dMap).toComment();

var aFile = {
	source: "function a()\n{\n\tconsole.log(\"a1\");\n\tconsole.log(\"a2\");\n\tconsole.log(\"a3\");\n}" + "\n" + aComment
	, sourceFile: "a.js"
};

var bFile = {
	source: "function b()\n{\n\tconsole.log(\"b1\");\n\tconsole.log(\"b2\");\n\tconsole.log(\"b3\");\n}" + "\n" + bComment
	, sourceFile: "b.js"
};

var cFile = {
	source: "function c()\n{\n\tconsole.log(\"c1\");\n\tconsole.log(\"c2\");\n\tconsole.log(\"c3\");\n}" + "\n" + cComment
	, sourceFile: "c.js"
};

var dFile = {
	source: "function d()\n{\n\tconsole.log(\"d1\");\n\tconsole.log(\"d2\");\n\tconsole.log(\"d3\");\n}" + "\n" + dComment
	, sourceFile: "d.js"
};

var offset = { line: 2 };
var base64 = combine
	.create("bundle.js")
	.addFile(aFile, offset)
	.addFile(bFile, { line: offset.line + 8 })
	//.addFile(cFile, { line: offset.line + 16 })
	//.addFile(dFile, { line: offset.line + 24 })
	.base64();

console.log(base64);

//var sm = convert.fromBase64(base64).toObject();
//console.log("Combined source maps:\n", sm);
//console.log("\nMappings:\n", sm.mappings);
