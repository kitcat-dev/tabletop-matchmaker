import { webhookCallback } from "https://deno.land/x/grammy@v1.21.1/mod.ts";

import { bot } from "./bot.ts";

console.log(`Function "telegram-bot" up and running!`);

globalThis.addEventListener("unload", () => {
	console.log("goodbye! (unload)");
});

const sigIntHandler = () => {
	console.log("interrupted! (SIGINT)");
	Deno.exit();
};
Deno.addSignalListener("SIGINT", sigIntHandler);

Deno.serve(async (req) => {
	try {
		const url = new URL(req.url);
		if (url.searchParams.get("secret") !== Deno.env.get("FUNCTION_SECRET")) {
			return new Response("not allowed", { status: 405 });
		}

		console.log("Handle request", req);

		const handleUpdate = webhookCallback(bot, "std/http");

		return await handleUpdate(req);
	} catch (err) {
		console.error("Deno error: ", err);
	}
});
