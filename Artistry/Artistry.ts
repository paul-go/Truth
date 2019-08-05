
/**
 * 
 */
const globalSettings = {
	spacesPerTab: 6,
	spaceWidth: 0
};

/**
 * 
 */
const cssClasses = {
	container: "view-lines",
	line: "view-line",
	comment: "mtk1"
};

/**
 * 
 */
function initialize()
{
	// We need to wait for the editor to initialize. There doesn't appear
	// to be a callback for this, so we're just polling every 10ms to see
	// if it's safe to proceed.
	const viewLines = document.getElementsByClassName(cssClasses.container);
	if (viewLines.length === 0)
		return void setTimeout(() => initialize(), 10);
	
	globalSettings.spaceWidth = calculateSpaceWidth();
	
	for (let i = -1; ++i < viewLines.length;)
	{
		const el = viewLines[i];
		if (el instanceof HTMLElement)
			maybeConvertLine(el);
	}
	
	setTimeout(() =>
	{
		document.addEventListener("animationstart", evt =>
		{
			if (evt.animationName === "view-line-inserted")
				if (evt.target instanceof HTMLElement)
				{
					maybeConvertLine(evt.target);
					clearClosingCommentQueue();
				}
		});
	});
}

/**
 * Computes the width of one space, in em units.
 */
function calculateSpaceWidth()
{
	const viewLines = document.getElementsByClassName(cssClasses.container)[0];
	
	const testLine = document.createElement("div");
	testLine.style.top = "5000px";
	testLine.style.height = "30px";
	testLine.classList.add(cssClasses.line, "test-line");
	testLine.style.pointerEvents = "none";
	testLine.innerHTML = `
		<span>
			<span class="${cssClasses.comment}">&nbsp;</span>
		</span>`;
	
	viewLines.append(testLine);
	
	const span = testLine.getElementsByClassName("mtk1")[0];
	const width = span.getBoundingClientRect().width;
	viewLines.removeChild(testLine);
	
	return width;
}

/**
 * 
 */
function maybeConvertLine(viewLine: HTMLElement)
{
	const lineInfo = classifyLine(viewLine);
	
	if (!lineInfo.isBlockCommentStart &&
		!lineInfo.isBlockCommentMid &&
		!lineInfo.isBlockCommentEnd &&
		!lineInfo.isLineComment &&
		!lineInfo.isDeadComment &&
		!lineInfo.isAttentionComment &&
		!lineInfo.isSectionComment)
		return;
	
	viewLine.setAttribute("data-comment", "");
	
	let pxAdjust = globalSettings.spaceWidth * lineInfo.nbspCount;
	if (lineInfo.isBlockCommentEnd || lineInfo.isBlockCommentMid)
		pxAdjust -= globalSettings.spaceWidth;
	
	viewLine.style.backgroundPositionX = pxAdjust + "px";
	
	if (lineInfo.isBlockCommentStart ||
		lineInfo.isBlockCommentMid ||
		lineInfo.isBlockCommentEnd)
		viewLine.setAttribute("data-block-comment", "");
	
	if (lineInfo.isSectionComment)
		viewLine.setAttribute("data-section-comment", "");
	
	if (lineInfo.isLineComment)
		viewLine.setAttribute("data-line-comment", "");
	
	if (lineInfo.isDeadComment)
		viewLine.setAttribute("data-dead-comment", "");
	
	if (lineInfo.isAttentionComment)
		viewLine.setAttribute("data-attention-comment", "");
}

/**
 * 
 */
function classifyLine(viewLine: HTMLElement)
{
	const getMetrics = (viewLine: HTMLElement) =>
	{
		const text = viewLine.textContent || "";
		const trim = text.trim();
		const trimLeft = text.trimLeft();
		const nbspCount = text.length - trimLeft.length;
		const tabCount = Math.floor(nbspCount / globalSettings.spacesPerTab);
		const spaceCount = nbspCount % globalSettings.spacesPerTab;
		
		return { trim, trimLeft, nbspCount, tabCount, spaceCount };
	}
	
	const getIsBlockCommentMid = (viewLine: Element | null) =>
	{
		if (!(viewLine instanceof HTMLElement))
			return false;
		
		const m = getMetrics(viewLine);
		
		return m.nbspCount > 0 &&
			(m.trim === "*" || m.trimLeft.startsWith("* ") || m.trimLeft.startsWith("*" + s));
	}
	
	const m = getMetrics(viewLine);
	const s = String.fromCodePoint(160);
	
	const isBlockCommentStart = m.trim.startsWith("/**");
	const isBlockCommentMid = getIsBlockCommentMid(viewLine);
	
	const isBlockCommentEnd = (() =>
	{
		if (m.trim !== "*/")
			return false;
		
		const previousLine = findPreviousLine(viewLine);
		if (!previousLine)
		{
			closingCommentQueue.push(viewLine);
			return false;
		}
		
		return m.trim === "*/" &&
			getIsBlockCommentMid(previousLine);
	})();
	
	const isLineComment = 
		m.trim === "//" || 
		m.trimLeft.startsWith("// ") ||
		m.trimLeft.startsWith("//" + s);
	
	const isDeadComment = m.trimLeft.startsWith("///");
	
	const isAttentionComment = 
		m.trim === "//!" ||
		m.trimLeft.startsWith("//! ") ||
		m.trimLeft.startsWith("//!" + s) ||
		m.trimLeft.startsWith(`//${s}eslint-disable-next-line` + s) ||
		m.trimLeft.startsWith(`/*${s}eslint` + s);
	
	const isSectionComment =
		m.trim === "//#" || m.trim.startsWith("//#" + s) || m.trim.startsWith("//# ");
	
	return {
		isBlockCommentStart,
		isBlockCommentMid,
		isBlockCommentEnd,
		isLineComment,
		isDeadComment,
		isAttentionComment,
		isSectionComment,
		tabCount: m.tabCount,
		spaceCount: m.spaceCount,
		nbspCount: m.nbspCount
	};
}

/**
 * Finds the element that represents the previous line in the document.
 * Note that this isn't as simple as a call to previousElementSibling,
 * because the Monaco editor in VS Code does not necessarily order
 * the underlying elements in document-order.
 */
function findPreviousLine(viewLine: HTMLElement)
{
	const refTop = parseInt(viewLine.style.top || "", 10) || 0;
	const lineHeight = parseInt(viewLine.style.height || "") || 30;
	const target = refTop - lineHeight + "px";
	
	// In most cases, the previous element is actually the one we're
	// looking for, so it can be returned efficiently.
	if (viewLine.previousElementSibling instanceof HTMLElement)
		if (viewLine.previousElementSibling.style.top === target)
			return viewLine.previousElementSibling;
	
	// Otherwise, we need to search all lines.
	const container = viewLine.parentElement;
	if (!(container instanceof HTMLElement))
		return null;
	
	for (let i = container.childElementCount; i-- > 0;)
	{
		const item = container.children.item(i);
		if (item instanceof HTMLElement)
		{
			if (item.style.top === target)
				return item;
		}
	}
	
	return null;
}

/**
 * The coloring of closing block comments is dependent on
 * the previous line. However, the previous line may not actually
 * be rendered in the document. Therefore, the element is added
 * to a queue, which we attempt to clear out when the next line
 * is fed into the view (which is when the document is scrolled).
 */
function clearClosingCommentQueue()
{
	for (let i = closingCommentQueue.length; i-- > 0;)
	{
		const viewLine = closingCommentQueue[i];
		const hasPrevious = findPreviousLine(viewLine);
		if (hasPrevious)
		{
			closingCommentQueue.splice(i, 1);
			maybeConvertLine(viewLine);
		}
	}
}

/** */
const closingCommentQueue: HTMLElement[] = [];

/** Node.js ESNEXT string methods */
interface String
{
	/** Removes whitespace from the left end of a string. */
	trimLeft(): string;
	
	/** Removes whitespace from the right end of a string. */
	trimRight(): string;
}

setTimeout(() => initialize());
