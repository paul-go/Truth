
namespace Reflex.ML.Test
{
	setTimeout(async () =>
	{
		const e = ml.div(
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
		);
		
		const result = await ML.render(e);
		document.body.innerHTML = result.html;
		eval(result.js);
	});
}
