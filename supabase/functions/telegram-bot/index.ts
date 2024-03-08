import { webhookCallback } from "https://deno.land/x/grammy@v1.21.1/mod.ts";

import { bot } from "./bot.ts";

console.log(`Function "telegram-bot" up and running!`);

const handleUpdate = webhookCallback(bot, "std/http");

Deno.serve(async (req) => {
	try {
		const url = new URL(req.url);
		if (url.searchParams.get("secret") !== Deno.env.get("FUNCTION_SECRET")) {
			return new Response("not allowed", { status: 405 });
		}

		return await handleUpdate(req);
	} catch (err) {
		console.error("Deno error: ", err);

		return new Response(JSON.stringify({ error: err.message }), {
			headers: { "Content-Type": "application/json" },
			status: 500,
		});
	}
});
