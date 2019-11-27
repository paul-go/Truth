
namespace Reflex.SS.Test
{
	/** */
	type TestResult =
		void |
		(() => boolean) |
		(() => boolean)[];
	
	/** */
	function test(label: string, fn: () => TestResult, cssTextExpected?: string)
	{
		console.log("Testing: " + label);
		
		const result = fn();
		
		if (cssTextExpected)
		{
			const cssText = ss.emit().split("\n").filter(s => !!s.trim()).join("\n");
			const expectedLines = cssTextExpected.split("\n");
			let minIndent = Number.MAX_SAFE_INTEGER;
			
			for (let i = expectedLines.length; i-- > 0;)
			{
				const line = expectedLines[i];
				
				if (line.trim() === "")
				{
					expectedLines.splice(i, 1);
					continue;
				}
				
				const indent = line.length - line.trimLeft().length;
				if (indent < minIndent)
					minIndent = indent;
			}
			
			if (minIndent === Number.MAX_SAFE_INTEGER)
				throw new Error("No CSS rule baseline specified.");
			
			for (let i = -1; ++i < expectedLines.length;)
				expectedLines[i] = expectedLines[i].slice(minIndent);
			
			const cssTextExpect = expectedLines.join("\n").trim();
			
			if (cssText !== cssTextExpect)
			{
				debugger;
				throw new Error("Test failed");
			}
		}
		
		if (result)
		{
			const resultFns = Array.isArray(result) ? result : [result];
			
			for (const resultFn of resultFns)
			{
				const result = resultFn();
				if (result)
					return;
				
				const testFnText = resultFn.toString()
					.trim()
					.replace(/^\(\)\s*=>/, "")
					.trim();
				
				console.error("FAIL: " + testFnText);
				debugger;
				resultFn();
			}
		}
		
		ss.reset();
	}
	
	/** */
	0 && test("Basic", () =>
	{
		ss(ss.color("red"));
	},
	`
	._1
	{
		color: red;
	}
	`);
	
	/** */
	0 && test("Nested Functions", () =>
	{
		ss(ss.color(ss.rgba(0, 0, 0, 0.5)));
	},
	`
	._1
	{
		color: rgba(0, 0, 0, 0.5);
	}
	`);
	
	/** */
	function testingFactoringLogic()
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
	}
	
	/** */
	0 && test("Priorities", () =>
	{
		ss(ss.priority.high, ss.color("blue"));
		ss(ss.priority.default, ss.color("green"));
		ss(ss.priority.low, ss.color("red"));
	},
	`
	._3
	{
		color: red;
	}
	._2
	{
		color: green;
	}
	._1
	{
		color: blue;
	}
	`);
	
	/** */
	0 && test("Explicit class name specified", () =>
	{
		const rule = ss(".xyz", ss.color("red"));
		return () => rule.class === "xyz";
	},
	`
	.xyz
	{
		color: red;
	}
	`);
	
	/** */
	0 && test("Dotless class name specified", () =>
	{
		//ss("abc", ss.color("red"));
	},
	`
	
	`);
	
	/** */
	0 && test("Dynamic properties", () =>
	{
		let cmd: Command;
		
		ss(
			ml.body,
			//ss.color(ss.rgba(0, 0, 0, 0.2)),
			cmd = ss.backgroundColor("green").dynamic(),
			//ss.backgroundImage(ss.linearGradient(["#333", 50..pct], ["#666", 30..pct])),
			//ss.width(ss.calc(50..pct, "+", 10..px)),
			//ss.fontFamily("-apple-system", "sans-serif"),
			//ss.boxShadow("inset", 1..px, 1..px, 5..px, ss.rgba(0, 0, 0, 0.5))
		);
		
		setTimeout(() =>
		{
			cmd.recall("red");
		},
		500);
	},
	`
	`);
	
	/** */
	test("Nested rules", () =>
	{
		let nested: Rule;
		const root = ss(
			".abc",
			ss.color("red"),
			nested = ss(
				".xyz",
				ss.color("blue")
			)
		);
		
		return [
			() => nested instanceof Rule,
			() => root instanceof Rule,
			() => !root[Reflex.atom]()
		];
	},
	`
	.abc
	{
		color: red;
	}
	.abc .xyz
	{
		color: blue;
	}
	`);
	
	/** */
	0 && test("Nested rules with different priorities", () =>
	{
		ss(
			ss.priority.high,
			ss.color("red"),
			ss(
				ss.priority.low,
				ss.color("green"),
				ss(
					ss.priority.default,
					ss.color("blue")
				)
			)
		);
	},
	`
	
	`);
	
	/** */
	test("Multiple equivalent rules", () =>
	{
		const rule1 = ss(".a", ss.color("red"));
		const rule2 = ss(".a", ss.color("red"));
	},
	`
	.a
	{
		color: red;
	}
	`);
	
	/*
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
}
