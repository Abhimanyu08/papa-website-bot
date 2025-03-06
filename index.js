import TelegramBot from "node-telegram-bot-api";
import { handleNewEssay } from "./messageHandler.js";
import dotenv from "dotenv";
dotenv.config();

const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: true });

bot.on("message", async (msg) => {
	// Log incoming messages during development

	// Only process messages from authorized user
	console.log(msg.from.username);
	if (msg.from.username === process.env.FATHER_TELEGRAM_ID) {
		try {
			const result = await handleNewEssay(msg);

			// Only send success message when essay is complete
			if (result.status === "success") {
				bot.sendMessage(msg.chat.id, result.message);
				bot.sendMessage(msg.chat.id, result.url);
			} else if (result.status === "incomplete") {
				// Optionally send an acknowledgment for partial messages
				// bot.sendMessage(msg.chat.id, result.message);
			}
		} catch (error) {
			console.error("Error processing message:", error);
			bot.sendMessage(
				msg.chat.id,
				"Sorry, there was an error processing your essay."
			);
		}
	} else {
		bot.sendMessage(
			msg.chat.id,
			"Sorry, I only accept essays from authorized users."
		);
	}
});

console.log("Bot is running...");
