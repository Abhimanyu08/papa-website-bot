export function extractEssayDetails(text) {
	// Initial basic implementation - you might want to adapt this
	// based on how your father formats his messages
	const lines = text.split("\n");
	let title = "";
	let content = text;
	const date = new Date().toISOString();

	// Try to extract title from common patterns
	const titlePatterns = [
		/\*"(.+?)"\*/, // *"title"*
		/\*'(.+?)'\*/, // *'title'*
		/"(.+?)"/, // "title"
		/संवाद\s*\n\s*\*"(.+?)"\*/, // संवाद followed by *"title"*
		/संवाद\s*\n\s*\*'(.+?)'\*/, // संवाद followed by *'title'*
		/संवाद\s*\n\s*\*(.+?)\*/, // संवाद followed by *title*
		/संवाद\s*\n\s*"(.+?)"/, // संवाद followed by "title"
	];

	for (const pattern of titlePatterns) {
		const match = text.match(pattern);
		if (match) {
			title = match[1].trim();
			break;
		}
	}

	// If no title found, use first line
	if (!title && lines.length > 0) {
		title = lines[0].replace(/[*"]/g, "").trim();
		if (title === "संवाद" && lines.length > 1) {
			title = lines[1].replace(/[*"]/g, "").trim();
		}
	}

	return {
		title,
		content,
		date,
	};
}
