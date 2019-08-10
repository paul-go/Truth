
namespace Reflex.ML.Test
{
	setTimeout(async () =>
	{
		const e = 
			ml.html(
				ml.body(
					ml.div(
						ml.div(
							on((e, num, str) =>
							{
								console.log("Num: " + num);
								console.log("Str: " + str);
								return str;
							},
							34123,
							"class-name"),
							
							on("click", (ev, e) =>
							{
								alert("Hello");
							}),
							ml`Hey`
						)
					)
				),
				ml.script({ src: "../../ReflexCore/build/source/reflex-core.js" }),
				ml.script({ src: "../build/source/reflex-ml.js" })
			);
		
		const result = await ML.render(e, {
			format: true,
			doctype: true,
			restoreScriptURL: ""
		});
		
		console.log(result.html);
		
		const srcdoc = result.html.replace(/"/g, '\"');
		document.body.append(ml.iframe({ srcdoc }));
	});
}
