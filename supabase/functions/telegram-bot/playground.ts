import { assert } from "https://deno.land/std@0.218.0/assert/mod.ts";
import "https://deno.land/x/dotenv@v3.2.2/load.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.33.1";
import { getBggCollection, getBggUser } from "npm:bgg-xml-api-client";

import type { Database } from "../../supabase.ts";

const supabaseUrl = Deno.env.get("SUPABASE_URL");
const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY");

assert(supabaseUrl);
assert(supabaseKey);

const supabase = createClient<Database>(supabaseUrl, supabaseKey);

const telegramUsername = "dreemer";
const bggUsername = "dreemer"; // random username

const { id } = await getBggUser({ name: bggUsername });

if (!id) {
	const message = "No user found";
	throw new Error(message);
}

const { item: collection, totalitems } = await getBggCollection({
	username: bggUsername,
});

if (collection.length === 0) {
	const message = `Could not find a collection for user ${bggUsername}`;
	throw new Error(message);
}

const { data: userData } = await supabase
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

// console.log(
// 	`User ${bggUsername} owns ${totalitems} game(s):\n${collection
// 		.filter((item) => item.status.own === 1)
// 		.map((item) => `- ${item.name.text}. Played ${item.numplays} times`)
// 		.slice(0, 15)
// 		.join("\n")}`,
// );

const { data: gamesData } = await supabase
	.from("games")
	.upsert(
		collection
			.filter((item) => item.status.own === 1)
			.map((item) => ({
				id: item.objectid.toString(),
				name: item.name.text,
			})),
	)
	.select();

if (userData?.length && gamesData?.length) {
	await supabase
		.from("users_to_games")
		.upsert(
			gamesData.map((game) => ({ game_id: game.id, user_id: userData[0].id })),
		);

	const { data, error } = await supabase.from("users").select(`
        id,
        bgg_username,
        games ( id, name )
    `);

	console.log(data);

	const gamesOfAslanator = data?.find(
		(item) => item.bgg_username === "aslanator",
	)?.games;
	const myGames = data?.find((item) => item.bgg_username === "dreemer")?.games;

	const intersection = gamesOfAslanator?.filter((item) =>
		myGames?.map((myGame) => myGame.id)?.includes(item.id),
	);

	console.log("Intersection:", intersection);
}

Deno.exit();
