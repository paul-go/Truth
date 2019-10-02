
namespace Reflex.ML.Test
{
	typeof window === "object" && setTimeout(() =>
	{
		///testBodyAttach();
		
		const functions: (() => HTMLElement | HTMLElement[])[] = [
			testNesting,
			
			// Later
			
			testAttributes,
			testClosures,
			
			testManyLevels,
			testOnce,
			testMultipleSelectors,
			testCustomEvents,
			testInterpolation,
			///testOnly,
			testStatelessForces,
			testElementChildren,
			testBasicValueStreaming,
			testImmediateValueStreaming,
			testImmediateValueStreamingOnForce,
			testChangingContentsOnForce,
			testPromises,
			testTransitions,
			testIterators,
			testAsyncIteratorsSimple,
			testAsyncIteratorsComplex,
			testRefreshMultipleForces,
			testArrayForces,
			testStatefulForces,
			testComplexForces,
			testValueBinding
			///testProxyObjects,
			
			// These don't need to be uncommented for now
			
			///testMutationWatcher,
			///testHeadElements,
			///testScrolling
		];
		
		///functions.length = 0;
		///functions.push(testArrayForces);
		
		for (const fn of functions)
		{
			const result = fn();
			const elements = Array.isArray(result) ? result : [result];
			
			document.body.append(
				ml.br(),
				ml.h1(ml(fn.name + ":")),
				...elements
			);
		}
	});
	
	/** */
	function makeNumber()
	{
		return Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);
	}

	/** */
	function makeString()
	{
		return makeNumber().toString(36);
	}

	/** */
	function testNesting()
	{
		let val = false;
		
		return ml.div(
			ml.h1(ml`Before Everything`),
			
			once("dblclick", () =>
			{
				return [
					ml.h2(ml`Added On Double Click (Goes Before)`),
					on("click", () =>
					{
						return (val = !val) ?
							ml.h3(ml`Flip On Click (true)`) : 
							ml.h4(ml(`Flip On Click (false)`));
					}),
					ml.h5(ml`Added On Double Click (Goes After)`)
				];
			}),
			
			ml.h6(ml`After Everything`)
		);
	}
	
	/** */
	function testBodyAttach()
	{
		///const array = [
		///	{ dataBody: 0 },
		///	ml.div(ml`Top level content attached directly to the body`)
		///];
		///
		///attach(array, document.body);
	}
	
	/** */
	function testAttributes()
	{
		return ml.div(
			ml`This input should have a maximum length of 5 characters`,
			
			ml.inputText({
				maxLength: 5,
				placeholder: "Type stuff here"
			})
		);
	}
	
	/** */
	function testClosures()
	{
		return [
			ml.div(
				ml`Before`,
				(e, children) =>
				{
					return ml.div(ml`From Closure`);
				},
				ml`After`
			)
		];
	}
	
	/** */
	function testManyLevels()
	{
		return ml.div(
			[[[""]]],
			[""],
			e => [
				ml.span(ml`(1)`),
				ml.span(ml`(2)`)
			]
		);
	}

	/** */
	function testOnce()
	{
		return ml.div(
			ml`Click and the text "Clicked" should be inserted. Should only work once.`,
			ml.br(),
			once("click", ev =>
			{
				return ml`Clicked`;
			}),
		);
	}
	
	/** */
	function testMultipleSelectors()
	{
		let value = 0;
		
		return ml.div(
			ml`The number below should increment on mouseup and mousedown`,
			ml.br(),
			
			on(["mouseup", "mousedown"], () =>
			{
				return ml((++value).toString());
			}).run()
		);
	}
	
	/** */
	function testOnly()
	{
		return ml.div(
			ml`Outer`,
			only("click", () =>
			{
				alert("Should be called");
			}),
			ml.div(
				ml`Inner`,
				on("click", () =>
				{
					alert("Should NOT be called.");
				})
			)
		);
	}
	
	/** */
	function testStatelessForces()
	{
		const greet = force<(name: string) => void>();
		
		return ml.div(
			ml.button(
				ml`Greet`,
				on("click", () =>
				{
					greet("Paul");
				})
			),
			ml.p(
				on(greet, name => ml`Hello ${name}.`)
			),
			on(greet, name => alert(`Hello ${name}.`))
		);
	}
	
	/** */
	function testStatefulForces()
	{
		const flag = force(false);

		return ml.div(
			// Effects that store a boolean value are given an additional 
			// method called .flip() to toggle it's internal value:
			on("click", () => flag.flip()),
			on(flag, () => flag.value ? "wide" : "narrow"),
			ml`Hello`
		);
	}
	
	/** */
	function testCustomEvents()
	{
		const fx = force<(str: string, num: number) => void>();
		
		return ml.div(
			on("click", () =>
			{
				fx("str", Math.random());
			}),
			on(fx, (str, num) =>
			{
				return num > 0.5 ? "red" : "blue";
			}).run("a", 0.75),
			
			ml`Events test. Click this. It should randomly switch between red and blue`
		);
	}

	/** */
	function testInterpolation()
	{
		return ml.div(ml`${ml.span(ml`(span 1)`)} (not span 1) ${ml.span(ml`(span 2)`)} (not span 2)`);
	}

	/** */
	function testElementChildren()
	{
		const s = ml.div(ml`1`);
		const p: Primitive = s;
		
		return ml.div(
			ml`Click to delete from the bottom`,
			ml.div(ml`1`),
			ml.div(ml`2`),
			ml.div(ml`3`),
			ml.div(ml`4`),
			ml.div(ml`5`),
			ml.div(ml`6`),
			(e, children) => on("click", () =>
			{
				children.pop();
			})
		);
	}

	/** */
	function testBasicValueStreaming()
	{
		let isDark = false;
		
		return ml.div(
			"faded",
			ml`Click to toggle the class between dark and not dark.`,
			on("click", () => (isDark = !isDark) ? "dark" : "")
		);
	}
	
	/** */
	function testImmediateValueStreaming()
	{
		let isDark = false;
		
		return ml.div(
			"faded",
			ml`Click to toggle the class between blue and green.`,
			ml.br(),
			ml`(Should start as blue)`,
			on("click", () => (isDark = !isDark) ? "blue" : "green").run()
		);
	}

	/** */
	function testImmediateValueStreamingOnForce()
	{
		const randomForClick = force(makeString());
		const randomForHover = force(makeString());
		
		return ml.div(
			ml`Click or hover to change the random number below.`,
			ml.br(),
			on([randomForClick, randomForHover], now =>
			{
				return ml(now);
			}).run(),
			
			// NOTE: You could actually do this by just returning the makeString()
			// content and omitting this line, but this is for testing purposes only.
			on(["click", "mousemove"], () =>
			{
				randomForClick.set(makeString());
			})
		);
	}

	/** */
	function testChangingContentsOnForce()
	{
		const value = force(false);
		
		return ml.div(
			ml`Click to toggle the rendering between red and blue.`,
			ml.br(),
			ml`The default should be red`,
			ml.br(),
			on(value, now =>
			{
				return now ?
					ml.div("red", ml`Value is true`) :
					ml.div("blue", ml`Value is false`);
			}).run(),
			
			on("click", () =>
			{
				value.flip();
			})
		);
	}
	
	/** */
	function testPromises()
	{
		return ml.div(
			ml.p(ml`Before`),
			new Promise(resolve =>
			{
				// Do some async stuff here
				resolve(ml.p(ml`In between`));
			}),
			ml.p(ml`After`)
		);
	}

	/** */
	function testTransitions()
	{
		let wide = false;
		
		return ml.div(
			`transition`,
			ml`Click on this element to expand and contract it.`,
			on("click", () => (wide = !wide) ? "wide" : "narrow").run()
		);
	}

	/** */
	function testIterators()
	{
		return ml.div(
			ml`There should be 3 items below this.`,
			function*()
			{
				for (let i = 0; i < 3; i++)
				{
					yield ml.div(
						`green`,
						ml(makeString())
					);
				}
			},
			ml`And nothing below this`
		);
	}
	
	/** */
	function testAsyncIteratorsSimple()
	{
		const wait = () => new Promise(r => setTimeout(r));
		
		return ml.div(
			async function*(e, children)
			{
				await wait();
				yield ml.div("red", ml`RED`);
				
				yield function*(e, children)
				{
					yield ml.div("green", ml`GREEN`);
				};
				
				yield ml.div("blue", ml`BLUE`);
			}
		);
	}
	
	/** */
	function testAsyncIteratorsComplex()
	{
		const wait = () => new Promise(r => setTimeout(r));
		
		return ml.div(
			ml`There should be 2 items below this, which are loaded asynchronously.`,
			async function*(e, children)
			{
				await wait();
				yield ml.div(`purple`, ml(makeString()));
				yield ml`(Begin nested stream)`;
				yield ml.hr();
				
				yield async function*(e, children)
				{
					await wait();
					yield ml.div(`red`, ml("Red Nested " + makeString()));
					await wait();
					yield ml.div(`green`, ml("Green Nested " + makeString()));
					await wait();
					yield ml.div(`blue`, ml("Blue Nested " + makeString()));
				};
				
				yield ml`(End nested stream)`;
				await wait();
				yield ml.div(`orange`, ml("Orange " + makeString()));
			},
			
			/*
			ml.hr(),
			ml`3 more items below this.`,
			ml.hr(),
			
			async function*(e, children)
			{
				await wait();
				yield ml.div(`red`, ml("Red Non-Nested " + makeString()));
				await wait();
				yield ml.div(`green`, ml("Green Non-Nested " + makeString()));
				await wait();
				yield ml.div(`blue`, ml("Blue Non-Nested " + makeString()));
			},
			
			ml.hr(),
			ml`...and this should be at the end.`*/
		);
	}
	
	/** */
	function testRefreshMultipleForces()
	{
		const fx1 = force();
		const fx2 = force();
		
		setTimeout(() =>
		{
			// Wait 10ms before calling fx1
			fx1();
		},
		10);
		
		return ml.div(
			on([fx1, fx2], () => [
				ml`Click on this element refresh it, and get another random number generated.
					Also, you should get another number generated on the mouseenter event.`,
				
				ml(makeNumber()),
				on("click", () => fx1())
			]).run()
		);
	}

	/** */
	function testArrayForces()
	{
		const list = force([6, 3, 8]);
		const sortFlip = force(false);
		const sortSwitch = force(false);
		const full = force(true);
		
		return ml.div(
			ml.button(
				ml`Add`,
				on("click", () => void list.push(Math.round(Math.random() * 9)))
			),
			ml.button(
				ml`Remove`,
				on("click", () => void list.pop())
			),
			ml.button(
				ml`Switch Filter`,
				on("click", () => full.flip())
			),
			ml.button(
				ml`Switch Sort`,
				on("click", () => sortSwitch.flip())
			),
			ml.button(
				ml`Flip Sorting`,
				on("click", () => sortFlip.flip())
			),
			on(list
				.filter((x) => full.value ? true : x > 5, full)
				.sort((a, b) => 
					sortSwitch.value ? 
						sortFlip.value ? 
							b - a : a - b 
							: 0, 
					sortSwitch, 
					sortFlip), 
				num => ml.div(ml(num)))
		);
	}
	
	/** */
	function testComplexForces()
	{
		class Person
		{
			greet()
			{
				alert("Hello " + this.name);
			}
			
			name = "Paul";
			numbers = [Math.random()];
		}

		const person = force(new Person());

		return ml.div(
			on(person.greet, () =>
			{
				//alert("Intercepting greet() call");
			}),
			ml.button(
				ml`Add Number`,
				on("click", () =>
				{
					//person.greet();
					person.numbers.push(Math.random());
				})
			),
			ml`${person.name}'s numbers:`,
			ml.ul(
				on(person.numbers, num => ml.li(ml` ${num} `))
			)
		);
	}
	
	/** */
	function testValueBinding()
	{
		const backing = force("Change this text");
		
		const array = [
			ml`Type in the text box below and it should sync with the div below. `,
			ml.br(),
			ml`Clicking the containing div should reset everything.`,
			ml.br(),
			ml.br(),
			on("click", ev =>
			{
				if (ev.target instanceof HTMLInputElement)
					return;
				
				backing.value = makeString();
			}),
			ml.br(),
			ml`The value is: ${backing}`,
			ml.br(),
			ml.inputText(ml.bind(backing)),
			ml.br(),
			ml.inputText(ml.bind(backing))
		];
		
		return ml.div(...array);
	}

	/** */
	function testProxyObjects()
	{
		class NestedObject
		{
			value = makeString();
		}
		
		class DataObject
		{
			str = makeString();
			num = makeNumber();
			bool = false;
			array = [new NestedObject()];
		}
		
		const proxy = force(new DataObject());
		
		return ml.div(
			ml.div(
				ml`Click to change string value`,
				on("click", ev => proxy.str.set(makeString()))
			),
			ml.div("dark", ml(proxy.str)),
			
			ml.div(
				ml`Click to change number value`,
				on("click", ev => proxy.num.set(makeNumber()))
			),
			ml.div("dark", ml(proxy.num)),
			
			ml.div( 
				ml`Click to add more elements`,
				on("click", ev => void proxy.array.push(new NestedObject()))
			),
			ml.div(
				///ml.sync(proxy.array, item =>
				///{
				///	return ml.div(ml(item.value));
				///})
			)
		);
	}

	/** * /
	function testMutationWatcher()
	{
		const elementVisible = force(false);
		const contentVisible = force(false);
		const invoked: string[] = [];
		
		function invoke(message: string)
		{
			if (invoked.length === 0)
			{
				setTimeout(() => 
				{
					alert("Triggered:\r\n\r\n" + invoked.join("\n"));
					invoked.length = 0;
				});
			}
			
			invoked.push(message);
		}
		
		return ml.div(
			ml.div(
				"Mutation-Buttons",
				ml`Test the mutation watchers. Click one of the buttons, and
					a message will display that indicates which mutation callback
					functions were invoked.`,
				ml.br(),
				
				ml.button(
					ml`Toggle Element`,
					on("click", () => elementVisible.flip())
				),
				ml.button(
					ml`Toggle Content`,
					on("click", () => contentVisible.flip())
				)
			),
			
			ml.div(
				"Mutation-Results",
				
				() =>
				{
					return on(elementVisible, visible =>
					{
						return visible && ml.div(ml(makeString()));
					});
				},
				
				on(contentVisible, visible => visible && ml(makeString())),
				
				on(ml.mutation, (kind, e) =>
				{
					invoke("ml.mutation");
				}),
				
				on(ml.mutation.element, (kind, e) =>
				{
					invoke("ml.mutation.element: " + e.textContent);
				}),
				
				on(ml.mutation.elementAdd, e =>
				{
					invoke("ml.mutation.elementAdd: " + e.textContent);
				}),
				
				on(ml.mutation.elementRemove, e =>
				{
					invoke("ml.mutation.elementRemove: " + e.textContent);
				}),
				
				on(ml.mutation.content, (kind, text) =>
				{
					invoke("ml.mutation.content: " + text.textContent);
				}),
				
				on(ml.mutation.contentAdd, text =>
				{
					invoke("ml.mutation.contentAdd: " + text.textContent);
				}),
				
				on(ml.mutation.contentRemove, text =>
				{
					invoke("ml.mutation.contentRemove: " + text.textContent);
				})
			)
		);
	}

	/** * /
	function testHeadElements()
	{
		let styleTag: HTMLStyleElement;
		
		ml.script("asdf");
		
		const code = ml.code(
			ml.meta("viewport", "initial-scale=1.0"),
			ml.styleSheet("http://bogus.testurl/style.css"),
			ml.script("http://bogus.testurl/script.js"),
			ml.script(() =>
			{
				console.log("Script text here");
			}),
			styleTag = ml.styleSheet({
				".head-elements-test CODE": {
					display: "block",
					padding: "15px",
					fontFamily: "Courier New",
					backgroundColor: "rgba(0, 0, 0, 0.2)",
					whiteSpace: "pre",
					overflow: "auto"
				}
			},
			true)
		);
		
		const htmlText = code.innerHTML.replace(/></, ">\n<");
		
		return ml.div(
			ml`This DIV should have <head> section content inside of it`,
			"head-elements-test",
			styleTag,
			ml.code(ml(htmlText))
		);
	}

	/** * /
	function testScrolling()
	{
		return ml.div(
			{ style: "width: 100px; height: 100px; overflow: scroll; border: 1px solid black; padding: 5px" },
			on("wheel", (ev, e) =>
			{
				const absX = Math.abs(ev.deltaX);
				const absY = Math.abs(ev.deltaY);
				let left = 0;
				let top = 0;
				
				if (absX >= absY * 5)
					left = ev.deltaX;
				else
					top = ev.deltaY;
				
				e.scrollBy({ left, top });
				ev.preventDefault();
			}),
			ml.div(
				ml(" x ".repeat(5000)),
				{ style: "width: 500px" }
			)
		);
	}
	*/
}
