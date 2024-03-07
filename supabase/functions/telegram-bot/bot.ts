import { assert } from "https://deno.land/std@0.218.0/assert/mod.ts";
import {
	Bot,
	type Context,
	SessionFlavor,
	session,
	GrammyError,
	HttpError,
} from "https://deno.land/x/grammy@v1.21.1/mod.ts";
import { supabaseAdapter } from "https://deno.land/x/grammy_storages@v2.4.2/supabase/src/mod.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.33.1";

const botToken = Deno.env.get("TELEGRAM_BOT_TOKEN");
const supabaseUrl = Deno.env.get("SUPABASE_URL");
const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY");
assert(botToken);
assert(supabaseUrl);
assert(supabaseKey);

type SessionData = {
	messages: number;
	edits: number;
};

const supabase = createClient(supabaseUrl, supabaseKey);
const storage = supabaseAdapter({
	supabase,
	table: "sessions",
});

const bot = new Bot<Context & SessionFlavor<SessionData>>(botToken);

bot.use(
	session({
		storage,
		initial: () => ({ messages: 1, edits: 0 }),
	}),
);

// Collect statistics
bot.on("message", async (ctx, next) => {
	ctx.session.messages++;
	await ctx.reply(`Message received and totalling to ${ctx.session.messages}`);
	await next();
});

bot.on("edited_message", async (ctx, next) => {
	ctx.session.edits++;
	await ctx.reply(
		`Message has been updated and totalling to ${ctx.session.edits} edits`,
	);

	await next();
});

bot
	.filter((ctx) => ctx.chat?.type === "private")
	.command("start", (ctx) =>
		ctx.reply(
			"Hi there! I will count the messages in this chat so you can get your /stats!",
		),
	);

// Send statistics upon `/stats`
bot.command("stats", async (ctx) => {
	const stats = ctx.session;

	// Format stats to string
	const message = `You sent <b>${
		stats.messages
	} messages</b> since I'm here! You edited messages <b>${
		stats.edits
	} times</b>—that is <b>${
		stats.edits / stats.messages
	} edits</b> per message on average!`;

	// Send message in same chat using `reply` shortcut. Don't forget to `await`!
	await ctx.reply(message, { parse_mode: "HTML" });
});

bot.start();
bot.catch((err) => {
	const ctx = err.ctx;
	console.error(`Error while handling update ${ctx.update.update_id}:`);
	const e = err.error;
	if (e instanceof GrammyError) {
		console.error("Error in request:", e.description);
	} else if (e instanceof HttpError) {
		console.error("Could not contact Telegram:", e);
	} else {
		console.error("Unknown error:", e);
	}
});

export { bot };
