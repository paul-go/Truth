/**
 * Contains members that replicate the behavior of
 * the language server.
 */
export namespace LanguageServer
{
	/**
	 * Position in a text document expressed as zero-based line and character offset.
	 * The offsets are based on a UTF-16 string representation. So a string of the form
	 * `a𐐀b` the character offset of the character `a` is 0, the character offset of `𐐀`
	 * is 1 and the character offset of b is 3 since `𐐀` is represented using two code
	 * units in UTF-16.
	 * 
	 * Positions are line end character agnostic. So you can not specify a position that
	 * denotes `\r|\n` or `\n|` where `|` represents the character offset.
	 */
	export interface Position {
		/**
		 * Line position in a document (zero-based).
		 * If a line number is greater than the number of lines in a document, it defaults back to the number of lines in the document.
		 * If a line number is negative, it defaults to 0.
		 */
		line: number;
		/**
		 * Character offset on a line in a document (zero-based). Assuming that the line is
		 * represented as a string, the `character` value represents the gap between the
		 * `character` and `character + 1`.
		 * 
		 * If the character value is greater than the line length it defaults back to the
		 * line length.
		 * If a line number is negative, it defaults to 0.
		 */
		character: number;
	}
	/**
	 * The Position namespace provides helper functions to work with
	 * [Position](#Position) literals.
	 */
	export declare namespace Position {
		/**
		 * Creates a new Position literal from the given line and character.
		 * @param line The position's line.
		 * @param character The position's character.
		 */
		function create(line: number, character: number): Position;
		/**
		 * Checks whether the given liternal conforms to the [Position](#Position) interface.
		 */
		function is(value: any): value is Position;
	}
	/**
	 * A range in a text document expressed as (zero-based) start and end positions.
	 * 
	 * If you want to specify a range that contains a line including the line ending
	 * character(s) then use an end position denoting the start of the next line.
	 * For example:
	 * ```ts
	 * {
	 *     start: { line: 5, character: 23 }
	 *     end : { line 6, character : 0 }
	 * }
	 * ```
	 */
	export interface Range {
		/**
		 * The range's start position
		 */
		start: Position;
		/**
		 * The range's end position.
		 */
		end: Position;
	}
	/**
	 * A text edit applicable to a text document.
	 */
	export interface TextEdit {
		/**
		 * The range of the text document to be manipulated. To insert
		 * text into a document create a range where start === end.
		 */
		range: Range;
		/**
		 * The string to be inserted. For delete operations use an
		 * empty string.
		 */
		newText: string;
	}
	/**
	 * The TextEdit namespace provides helper function to create replace,
	 * insert and delete edits more easily.
	 */
	export namespace TextEdit {
		/**
		 * Creates a replace text edit.
		 * @param range The range of text to be replaced.
		 * @param newText The new text.
		 */
		function replace(range: Range, newText: string): TextEdit
		{
			return { range: range, newText: newText };
		}
		/**
		 * Creates a insert text edit.
		 * @param position The position to insert the text at.
		 * @param newText The text to be inserted.
		 */
		function insert(position: Position, newText: string): TextEdit
		{
			return { range: { start: position, end: position }, newText };
		}
		/**
		 * Creates a delete text edit.
		 * @param range The range of text to be deleted.
		 */
		function del(range: Range): TextEdit
		{
			return { range: range, newText: "" };
		}
	}
	/**
	 * Describes the content type that a client supports in various
	 * result literals like `Hover`, `ParameterInfo` or `CompletionItem`.
	 * 
	 * Please note that `MarkupKinds` must not start with a `$`. This kinds
	 * are reserved for internal usage.
	 */
	export namespace MarkupKind {
		/**
		 * Plain text is supported as a content format
		 */
		const PlainText = 'plaintext';
		/**
		 * Markdown is supported as a content format
		 */
		const Markdown = 'markdown';
	}
	export type MarkupKind = 'plaintext' | 'markdown';
	/**
	 * A `MarkupContent` literal represents a string value which content is interpreted base on its
	 * kind flag. Currently the protocol supports `plaintext` and `markdown` as markup kinds.
	 * 
	 * If the kind is `markdown` then the value can contain fenced code blocks like in GitHub issues.
	 * See https://help.github.com/articles/creating-and-highlighting-code-blocks/#syntax-highlighting
	 * 
	 * Here is an example how such a string can be constructed using JavaScript / TypeScript:
	 * ```ts
	 * let markdown: MarkdownContent = {
	 *  kind: MarkupKind.Markdown,
	 *	value: [
	 *		'# Header',
	 *		'Some text',
	 *		'```typescript',
	 *		'someCode();',
	 *		'```'
	 *	].join('\n')
	 * };
	 * ```
	 * 
	 * *Please Note* that clients might sanitize the return markdown. A client could decide to
	 * remove HTML from the markdown to avoid script execution.
	 */
	export interface MarkupContent {
		/**
		 * The type of the Markup
		 */
		kind: MarkupKind;
		/**
		 * The content itself
		 */
		value: string;
	}
	/**
	 * The kind of a completion entry.
	 */
	export namespace CompletionItemKind {
		export const Text = 1;
		export const Method = 2;
		export const Function = 3;
		export const Constructor = 4;
		export const Field = 5;
		export const Variable = 6;
		export const Class = 7;
		export const Interface = 8;
		export const Module = 9;
		export const Property = 10;
		export const Unit = 11;
		export const Value = 12;
		export const Enum = 13;
		export const Keyword = 14;
		export const Snippet = 15;
		export const Color = 16;
		export const File = 17;
		export const Reference = 18;
		export const Folder = 19;
		export const EnumMember = 20;
		export const Constant = 21;
		export const Struct = 22;
		export const Event = 23;
		export const Operator = 24;
		export const TypeParameter = 25;
	}
	export type CompletionItemKind = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18 | 19 | 20 | 21 | 22 | 23 | 24 | 25;
	/**
	 * Defines whether the insert text in a completion item should be interpreted as
	 * plain text or a snippet.
	 */
	export namespace InsertTextFormat {
		/**
		 * The primary text to be inserted is treated as a plain string.
		 */
		const PlainText = 1;
		/**
		 * The primary text to be inserted is treated as a snippet.
		 * 
		 * A snippet can define tab stops and placeholders with `$1`, `$2`
		 * and `${3:foo}`. `$0` defines the final tab stop, it defaults to
		 * the end of the snippet. Placeholders with equal identifiers are linked,
		 * that is typing in one will update others too.
		 * 
		 * See also: https://github.com/Microsoft/vscode/blob/master/src/vs/editor/contrib/snippet/common/snippet.md
		 */
		const Snippet = 2;
	}
	export type InsertTextFormat = 1 | 2;
	/**
	 * A completion item represents a text snippet that is
	 * proposed to complete text that is being typed.
	 */
	export interface CompletionItem {
		/**
		 * The label of this completion item. By default
		 * also the text that is inserted when selecting
		 * this completion.
		 */
		label: string;
		/**
		 * The kind of this completion item. Based of the kind
		 * an icon is chosen by the editor.
		 */
		kind?: CompletionItemKind;
		/**
		 * A human-readable string with additional information
		 * about this item, like type or symbol information.
		 */
		detail?: string;
		/**
		 * A human-readable string that represents a doc-comment.
		 */
		documentation?: string | MarkupContent;
		/**
		 * Indicates if this item is deprecated.
		 */
		deprecated?: boolean;
		/**
		 * A string that should be used when comparing this item
		 * with other items. When `falsy` the [label](#CompletionItem.label)
		 * is used.
		 */
		sortText?: string;
		/**
		 * A string that should be used when filtering a set of
		 * completion items. When `falsy` the [label](#CompletionItem.label)
		 * is used.
		 */
		filterText?: string;
		/**
		 * A string that should be inserted into a document when selecting
		 * this completion. When `falsy` the [label](#CompletionItem.label)
		 * is used.
		 * 
		 * The `insertText` is subject to interpretation by the client side.
		 * Some tools might not take the string literally. For example
		 * VS Code when code complete is requested in this example `con<cursor position>`
		 * and a completion item with an `insertText` of `console` is provided it
		 * will only insert `sole`. Therefore it is recommended to use `textEdit` instead
		 * since it avoids additional client side interpretation.
		 * 
		 * @deprecated Use textEdit instead.
		 */
		insertText?: string;
		/**
		 * The format of the insert text. The format applies to both the `insertText` property
		 * and the `newText` property of a provided `textEdit`.
		 */
		insertTextFormat?: InsertTextFormat;
		/**
		 * An [edit](#TextEdit) which is applied to a document when selecting
		 * this completion. When an edit is provided the value of
		 * [insertText](#CompletionItem.insertText) is ignored.
		 * 
		 * *Note:* The text edit's range must be a [single line] and it must contain the position
		 * at which completion has been requested.
		 */
		textEdit?: TextEdit;
		/**
		 * An optional array of additional [text edits](#TextEdit) that are applied when
		 * selecting this completion. Edits must not overlap (including the same insert position)
		 * with the main [edit](#CompletionItem.textEdit) nor with themselves.
		 * 
		 * Additional text edits should be used to change text unrelated to the current cursor position
		 * (for example adding an import statement at the top of the file if the completion item will
		 * insert an unqualified type).
		 */
		additionalTextEdits?: TextEdit[];
		/**
		 * An optional set of characters that when pressed while this completion is active will accept it first and
		 * then type that character. *Note* that all commit characters should have `length=1` and that superfluous
		 * characters will be ignored.
		 */
		commitCharacters?: string[];
		/**
		 * An data entry field that is preserved on a completion item between
		 * a [CompletionRequest](#CompletionRequest) and a [CompletionResolveRequest]
		 * (#CompletionResolveRequest)
		 */
		data?: any;
	}
	/**
	 * The CompletionItem namespace provides functions to deal with
	 * completion items.
	 */
	export namespace CompletionItem {
		/**
		 * Create a completion item and seed it with a label.
		 * @param label The completion item's label
		 */
		function create(label: string): CompletionItem
		{
			return { label };
		}
	}
	/**
	 * @internal
	 * (Not used)
	 * Represents a collection of [completion items](#CompletionItem) to be presented
	 * in the editor.
	 */
	export interface CompletionList {
		/**
		 * This list it not complete. Further typing results in recomputing this list.
		 */
		isIncomplete: boolean;
		/**
		 * The completion items.
		 */
		items: CompletionItem[];
	}
	/**
	 * @internal
	 * The CompletionList namespace provides functions to deal with
	 * completion lists.
	 */
	export namespace CompletionList {
		/**
		 * Creates a new completion list.
		 * 
		 * @param items The completion items.
		 * @param isIncomplete The list is not complete.
		 */
		function create(items?: CompletionItem[], isIncomplete?: boolean): CompletionList
		{
			return { items: items ? items : [], isIncomplete: !!isIncomplete };
		}
	}
}
