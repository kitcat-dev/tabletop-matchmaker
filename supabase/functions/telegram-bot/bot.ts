import { assert } from "https://deno.land/std@0.218.0/assert/mod.ts";
import {
	Bot,
	type Context,
	MemorySessionStorage,
} from "https://deno.land/x/grammy@v1.21.1/mod.ts";
import { type ChatMember } from "https://deno.land/x/grammy@v1.21.1/types.ts";
import {
	chatMembers,
	type ChatMembersFlavor,
} from "https://deno.land/x/grammy_chat_members@v1.0.12/mod.ts";

type MyContext = Context & ChatMembersFlavor;
const adapter = new MemorySessionStorage<ChatMember>();

const botToken = Deno.env.get("TELEGRAM_BOT_TOKEN");

assert(botToken);

export const bot = new Bot<MyContext>(botToken);

bot.use(chatMembers(adapter));
bot.start({
	allowed_updates: ["chat_member", "message"],
});
bot.on("message", async (ctx) => {
	const chatMember = await ctx.chatMembers.getChatMember();

	return ctx.reply(
		`Hello, ${chatMember.user.first_name}! I see you are a ${chatMember.status} of this chat!`,
	);
});
bot.command("start", (ctx) => ctx.reply("Welcome! Up and running."));
bot.command("ping", (ctx) => ctx.reply(`Pong! ${new Date()} ${Date.now()}`));
