
namespace Reflex.ML
{
	const cssText = `
		HTML *
		{
			font-family: "Helvetica Neue", sans-serif;
		}
		DIV
		{
			border: 2px solid rgba(0, 0, 0, 0.25);
			border-radius: 4px;
			margin-bottom: 10px;
			padding: 20px;
			background-color: rgba(0, 0, 0, 0.05);
		}
		.dark
		{
			background-color: rgba(0, 0, 0, 0.3);
			border-color: rgba(0, 0, 0, 0.5);
		}
		.red
		{
			background-color: hsla(0, 80%, 50%, 0.3);
			border-color: hsla(0, 80%, 50%, 0.5);
		}
		.orange
		{
			background-color: hsla(32, 80%, 50%, 0.3);
			border-color: hsla(32, 80%, 50%, 0.5);
		}
		.green
		{
			background-color: hsla(120, 80%, 50%, 0.3);
			border-color: hsla(120, 80%, 50%, 0.5);
		}
		.blue
		{
			background-color: hsla(210, 80%, 50%, 0.3);
			border-color: hsla(210, 80%, 50%, 0.5);
		}
		.purple
		{
			background-color: hsla(285, 80%, 50%, 0.3);
			border-color: hsla(285, 80%, 50%, 0.5);
		}
		.faded
		{
			opacity: 0.66;
		}
		.transition
		{
			transition-duration: 0.5s;
		}
		.wide
		{
			width: 65%;
		}
		.narrow
		{
			width: 95%;
		}
		BODY > H1
		{
			margin-top: 1em;
			font-size: 1em;
		}
		.noptr *
		{
			pointer-events: none;
		}`;
	
	const style = document.createElement("style");
	style.type = "text/css";
	style.textContent = cssText;
	document.head.append(style);
}
