# Tabletop Matchmaker

This telegram bot is powered by Supabase Edge Functions.

## Contributing

Prerequisites:

- Deno: `curl -fsSL https://deno.land/install.sh | sh`
- Supabase: `brew install supabase/tap/supabase`
- Docker. I use [OrbStack](https://orbstack.dev/)

Login to Supabase:

```bash
supabase login
```

Start Supabase service:

```bash
supabase start
```

Serve functions locally:

```bash
supabase functions serve telegram-bot --no-verify-jwt
```

Set secrets:

1. Copy secrets from `functions/telegram-bot/.env.example` to the `.env` file
2. Set the secrets to Supabase: `supabase secrets set --env-file supabase/functions/telegram-bot/.env`

Deploy:

```bash
supabase functions deploy --no-verify-jwt telegram-bot
```

Verify functions and secrets:

```bash
supabase secrets list
supabase functions list
```

## To Do

- [ ] Set up tunneling using Ngrok to debug functions for Telegram bot locally
