# my-agent

A coding-assistant chat app built on the [21st Agents SDK](https://21st.dev/agents) and Next.js 16.

The agent (`agents/my-agent.ts`) is deployed to the 21st cloud. The Next.js app (`app/`) is the chat client.

## Local development

1. Copy the env file and add your 21st API key from <https://21st.dev/agents/api-keys>:

   ```bash
   cp .env.local.example .env.local
   ```

2. Install and run:

   ```bash
   npm install
   npm run dev
   ```

   App runs at http://localhost:3000.

## Project layout

```
agents/my-agent.ts          # Agent definition (model, system prompt, tools)
app/page.tsx                # Chat UI (renders <AgentChat>)
app/api/an-token/route.ts   # Server-side token exchange
app/theme.json              # Visual theme for the chat component
app/layout.tsx              # Root layout, fonts, body styles
.github/workflows/          # CI/CD
```

## Deploying the agent

```bash
npx @21st-sdk/cli login
npx @21st-sdk/cli deploy
```

Run `deploy` again after any change to `agents/`.

## Deploying the web app to Vercel via GitHub Actions

The workflow at `.github/workflows/deploy-vercel.yml` deploys to Vercel on every push to `main` (production) and on every PR (preview).

One-time setup:

1. Create a Vercel project (you can run `npx vercel link` once locally to wire it up, or import the repo in the Vercel dashboard).
2. In your Vercel project settings, add the env var `API_KEY_21ST` (Production + Preview).
3. In your GitHub repo settings → **Secrets and variables → Actions**, add three repository secrets:
   - `VERCEL_TOKEN` — from <https://vercel.com/account/tokens>
   - `VERCEL_ORG_ID` — from `.vercel/project.json` after `vercel link`
   - `VERCEL_PROJECT_ID` — from `.vercel/project.json` after `vercel link`

After that, every push to `main` deploys to production.

> **Note:** GitHub Pages cannot host this app. The chat depends on the server route `app/api/an-token/route.ts`, which Pages does not support.
