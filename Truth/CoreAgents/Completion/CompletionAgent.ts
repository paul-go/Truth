type CompletionItem = Truth.LanguageServer.CompletionItem;


Hooks.Completion.contribute(hook =>
{
	const pip = hook.document.program.inspect(
		hook.document, 
		hook.line, 
		hook.offset);
	
	const kind = Truth.StatementAreaKind;
	
	if (pip.area === kind.void)
		return new Truth.CompletionResult([]);
	
	const items: CompletionItem[] = [];
	
	if (pip.area === kind.whitespace)
	{
		const statement = pip.parent;
		if (!statement)
			throw 0;
		
		// Find the reusables that are
		// visible underneath this statement.
		return new Truth.CompletionResult([]);
	}
	else if (pip.area === kind.declarationVoid || pip.area === kind.annotationVoid)
	{
		// This is probably reusables again
		// Or maybe the overrides
	}
	else if (pip.area === kind.declaration || pip.area === kind.annotation)
	{
		// Find the last subject, and use that
		// as the filtration mechanism.
	}
	
	// Build this out
	while (false)
	{
		const completionItem = <CompletionItem>{
			label: "parsedUri.pointer.subject.toString()",
			kind: Truth.LanguageServer.CompletionItemKind.Class,
			documentation: ""
		}
		
		items.push(completionItem);
	}
	
	return new Truth.CompletionResult(items);
});
