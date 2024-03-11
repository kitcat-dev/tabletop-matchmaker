import { getBggCollection, getBggUser } from "npm:bgg-xml-api-client";
import { assert } from "https://deno.land/std@0.218.0/assert/mod.ts";
import {
	Bot,
	GrammyError,
	HttpError,
} from "https://deno.land/x/grammy@v1.21.1/mod.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.33.1";

import type { Database } from "../../supabase.ts";
import { assertWithReply } from "./lib/assert.ts";

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
			"Hi there! I will help you find a desired board game and organise an event.\n" +
				"Press /help to see commands.",
		),
	);

await bot.api.setMyCommands([
	{ command: "start", description: "Start the bot" },
	{ command: "help", description: "Show help text" },
	{
		command: "show_all_games",
		description: "List games of all users in the chat",
	},
	{
		command: "update_my_games",
		description:
			"Add your games to the list. It's required to provide $BGG_USERNAME after the command.",
	},
]);

bot.command("update_my_games", async (ctx) => {
	const { id } = await getBggUser({ name: ctx.match });
	await assertWithReply(id, "No user found", ctx);

	const telegramUsername = ctx.message?.from.username;
	await assertWithReply(
		telegramUsername,
		`Could not receive Telegram username: ${ctx.message?.from}`,
		ctx,
	);

	const bggUsername = ctx.match.trim();
	await assertWithReply(
		bggUsername,
		"Please provide your username on BoardGameGeek",
		ctx,
	);

	const { item: collection } = await getBggCollection({
		username: bggUsername,
	});
	await assertWithReply(
		collection.length,
		`Could not find a BGG collection for user ${bggUsername}`,
		ctx,
	);

	const { data: users, error: userError } = await supabase
		.from("users")
		.upsert(
			{
				bgg_username: bggUsername,
				telegram_username: telegramUsername,
			},
			{
				onConflict: "bgg_username",
			},
		)
		.select();
	assert(users, "Could not insert user data to database.");

	const ownGames = collection.filter((item) => item.status.own === 1);
	const { data: prevGamesState } = await supabase.from("games").select("id");
	const prevGamesIds = new Set(prevGamesState?.map((item) => item.id));
	const newGames = ownGames.filter(
		(game) => !prevGamesIds.has(String(game.objectid)),
	);

	const { data: games, error: gamesError } = await supabase
		.from("games")
		.upsert(
			ownGames.map((item) => ({
				id: item.objectid.toString(),
				name: item.name.text,
			})),
		)
		.select();
	assert(games, "Could not insert game data to database.");

	const currentUser = users[0];
	const { error: usersToGamesError } = await supabase
		.from("users_to_games")
		.upsert(
			games.map((game) => ({ game_id: game.id, user_id: currentUser.id })),
		);
	await assertWithReply(
		userError === null && gamesError === null && usersToGamesError === null,
		"Could not link username with games",
		ctx,
	);

	const newGamesMessage = `New (${newGames.length}):\n${newGames
		.map((item) => `- ${item.name.text}`)
		.join("\n")}`;
	ctx.reply(
		`${bggUsername} has ${ownGames.length} game(s). ${
			newGames.length ? newGamesMessage : ""
		}`,
	);
});

bot.command("show_games", async (ctx) => {
	const { id } = await getBggUser({ name: ctx.match });

	if (!id) {
		const message = "No BGG user found";
		await ctx.reply(message);
		throw new Error(message);
	}

	const { item: collection, totalitems } = await getBggCollection({
		username: ctx.match,
	});

	if (collection.length === 0) {
		const message = `Could not find a BGG collection for user ${ctx.match}`;
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
