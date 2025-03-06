export class MessageBuffer {
	constructor() {
		this.buffer = new Map(); // chatId -> accumulated messages
		this.timeout = 60000; // 1 minute timeout to reset buffer
		this.timeouts = new Map(); // chatId -> timeout handle
	}

	addMessage(chatId, text) {
		// Reset existing timeout if any
		if (this.timeouts.has(chatId)) {
			clearTimeout(this.timeouts.get(chatId));
		}

		// Initialize or append to buffer
		if (!this.buffer.has(chatId)) {
			// Check if this is the start of an essay
			this.buffer.set(chatId, text);
		} else {
			const currentText = this.buffer.get(chatId);
			this.buffer.set(chatId, currentText + "\n" + text);
		}

		// Set timeout to clear buffer
		const timeoutHandle = setTimeout(() => {
			console.log(`Buffer timeout for chat ${chatId}`);
			this.buffer.delete(chatId);
			this.timeouts.delete(chatId);
		}, this.timeout);
		this.timeouts.set(chatId, timeoutHandle);

		// Check if essay is complete
		const completeText = this.buffer.get(chatId);
		console.log(this.isCompleteEssay(completeText));
		if (this.isCompleteEssay(completeText)) {
			// Clear buffer and timeout
			this.buffer.delete(chatId);
			this.timeouts.delete(chatId);
			clearTimeout(timeoutHandle);
			return completeText;
		}

		return null; // Essay not complete yet
	}

	isCompleteEssay(text) {
		// Check if text starts with संवाद and ends with signature
		const hasStart = text.includes("संवाद");
		const hasEnd =
			text.includes("सर्वजीत दुबे") ||
			text.includes("सर्वजीत दुबे🙏") ||
			text.includes("सर्वजीत दुबे🌹") ||
			text.includes("सर्वजीत दुबे🙏🌹");

		return hasStart && hasEnd;
	}
}
