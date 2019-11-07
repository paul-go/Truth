
namespace Reflex.SS.Emitter
{
	const cssTypeUrl = "https://raw.githubusercontent.com/frenic/csstype/master/index.d.ts";
	const mdnSyntaxesUrl = "https://raw.githubusercontent.com/mdn/data/master/css/syntaxes.json";
	
	export class Scrape
	{
		/**
		 * Ad-hoc regex-based doc comment scraper that extracts
		 * the TypeScript doc comments from CSS type, and returns
		 * them as an array.
		 */
		static async propertiesAndComments()
		{
			const res = await fetch(cssTypeUrl);
			const dtsText: string = await res.text();
			
			const properties = new Map<string, string[]>();
			const docCommentL = "/**\n";
			const docCommentR = "*/\n";
			const nameL1 = " **`";
			const nameL2 = " `**";
			const nameR1 = "`** ";
			const nameR2 = "**` ";
			
			let pos = 0;
			while (pos < dtsText.length)
			{
				let from = dtsText.indexOf(docCommentL, pos);
				if (from < 0)
					break;
				
				from += docCommentL.length;
				
				const to = dtsText.indexOf(docCommentR, from);
				if (to < 0)
					break;
				
				pos = to;
				
				const commentLines = dtsText.slice(from, to)
					.split("\n")
					.map(s => s.trim())
					.map(s => s.replace(/^\*\s*/, ""));
				
				while (commentLines.length && commentLines[0] === "")
					commentLines.shift();
				
				while (commentLines.length && commentLines[commentLines.length - 1] === "")
					commentLines.pop();
				
				const line0 = commentLines[0];
				
				const idxNameL = Math.max(
					line0.indexOf(nameL1),
					line0.indexOf(nameL2));
					
				const idxNameR = Math.max(
					line0.indexOf(nameR1, idxNameL),
					line0.indexOf(nameR2, idxNameL)
				);
				
				if (idxNameL < 0 || idxNameR < 0)
					continue;
				
				const propertyName = line0.slice(idxNameL + nameL1.length, idxNameR);
				if (!properties.has(propertyName))
					properties.set(propertyName, commentLines);
			}
			
			return properties;
		}
		
		/**
		 * 
		 */
		static async functions()
		{
			const res = await fetch(mdnSyntaxesUrl);
			const json = await res.json();
			const names = Object.keys(json)
				.filter(k => k.endsWith("()"))
				.map(s => s.slice(0, -2));
			
			// For some reason, the MDN data doesn't classify "url()"
			// as a function, so we need to add it on here.
			names.push("url");
			names.sort();
			
			return names;
		}
	}
}
