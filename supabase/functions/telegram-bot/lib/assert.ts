import { AssertionError } from "https://deno.land/std@0.218.0/assert/mod.ts";
import type {
	CommandContext,
	Context,
} from "https://deno.land/x/grammy@v1.21.1/mod.ts";

export async function assertWithReply(
	condition: unknown,
	message: string,
	ctx: CommandContext<Context>,
): Promise<void> {
	if (!condition) {
		await ctx.reply(message);
		throw new AssertionError(message);
	}
}
