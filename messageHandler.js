import { MessageBuffer } from "./messageBuffer.js";
import { GitHubService } from "./github.js";
import { extractEssayDetails } from "./extractEssay.js";

const messageBuffer = new MessageBuffer();
export async function handleNewEssay(msg) {
	const github = new GitHubService();

	const chatId = msg.chat.id;
	const text = msg.text;

	// Add message to buffer and check if essay is complete
	console.log(chatId);
	const completeEssay = messageBuffer.addMessage(chatId, text);

	if (!completeEssay) {
		// Essay not complete yet, wait for more messages
		return {
			status: "incomplete",
			message: "Message received, waiting for complete essay...",
		};
	}

	// Process complete essay
	try {
		// Extract essay details from complete text
		const essayDetails = extractEssayDetails(completeEssay);

		// Format as markdown
		const markdown = formatMarkdown(essayDetails);

		// save markdown to a file

		// Create GitHub commit
		await github.createEssayCommit(
			essayDetails.title,
			markdown,
			essayDetails.date
		);

		return {
			status: "success",
			message: "Essay processed and published successfully!",
		};
	} catch (error) {
		console.error("Error processing complete essay:", error);
		throw error;
	}
}

export function formatMarkdown({ title, content, date }) {
	return `---
title: "${title}"
date: ${date}
---

${content}`;
}
