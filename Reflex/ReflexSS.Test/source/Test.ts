/// <reference path="../../ReflexML/build/reflex-ml.d.ts" />

namespace Reflex.SS.Test
{
	let vals = [
		[1, 2],
		[3, 4, 5],
		[6, 7, 8, 9]
	];
	
	vals = [
		[1, 2],
		[3, 4]
	];
	
	for (const path of Util.factor(vals))
		console.log(path.join());
	
	console.log("------------");
	
	ss(
		ml.body,
		ss.backgroundColor("red")
	);
	
	ss(
		ml.a,
		ss.textAlign("left"),
		ss.textDecoration("none"),
		ss(
			" .left, .right",
			ss.textAlign("center"),
			ss(
				" .box, .round",
				ss.textAlign("right")
			)
		)
	);
	
	/*
	ss(
		" A, B",
		", C, D",
		ss.textAlign("left"),
		ss(
			" E, F",
			", G, H",
			ss.textAlign("center"),
			ss(
				" I, J",
				", K, L",
				ss.textAlign("right")
			)
		)
	);
	*/
	
	/*
	const imgA = ss.backgroundImage(
		[ss.url("img1.png")],
		[ss.url("img2.png")],
		[ss.url("img3.png")]);
		
	const imgB = ss.backgroundImage(
		ss.url("img4.png")
	);
	
	const className = ss(
		":before",
		ss.textAlign("left"),
		ss.textIndent(10..px),
		imgA,
		imgB,
		ss(
			ss.width(ss.calc(100..pct, "-", 10..px))
		)
	);
	*/
	
	console.log(ss.emit());
}
