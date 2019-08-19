setTimeout(async () => 
{
	debugger;

	b();

	c();

	d();
}, 
0);

if ("DEBUG")
{
	console.log("(chuckles) I'm in danger.");
}

if ("MODERN") 
{
	console.log("I'm here!");
}
