import { getBggCollection, getBggUser } from "npm:bgg-xml-api-client";
import { assert } from "https://deno.land/std@0.218.0/assert/mod.ts";
import {
	Bot,
	GrammyError,
	HttpError,
} from "https://deno.land/x/grammy@v1.21.1/mod.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.33.1";

import type { Database } from "../../supabase.ts";

const botToken = Deno.env.get("TELEGRAM_BOT_TOKEN");
const supabaseUrl = Deno.env.get("SUPABASE_URL");
const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY");
assert(botToken);
assert(supabaseUrl);
assert(supabaseKey);

const supabase = createClient<Database>(supabaseUrl, supabaseKey);

export const bot = new Bot(botToken);

bot
	.filter((ctx) => ctx.chat?.type === "private")
	.command("start", (ctx) =>
		ctx.reply(
			"Hi there! I will help you find a desired board game and organise an event." +
				"Send message `/update_games $BGG_USERNAME` to share your list of games from BGG!",
		),
	);

bot.command("show_games", async (ctx) => {
	const { id } = await getBggUser({ name: ctx.match });

	if (!id) {
		const message = "No user found";
		await ctx.reply(message);
		throw new Error(message);
	}

	const { item: collection, totalitems } = await getBggCollection({
		username: ctx.match,
	});

	if (collection.length === 0) {
		const message = `Could not find a collection for user ${ctx.match}`;
		await ctx.reply(message);
		throw new Error(message);
	}

	// supabase.from("");

	await ctx.reply(
		`User ${ctx.match} owns ${totalitems} game(s):\n${collection
			.filter((item) => item.status.own === 1)
			.map((item) => `- ${item.name.text}. Played ${item.numplays} times`)
			.join("\n")}`,
	);
});

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
