# Finance OS Core

## Project info

**URL**: https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID

## Quick start (recommended)

Use the bootstrap script to install dependencies and run all baseline checks in one command:

```sh
./scripts/bootstrap.sh
```

This script helps avoid common local issues (for example, stale `node_modules` folders or inherited proxy variables), then runs:

- `npm run lint`
- `npm run test`
- `npm run build`

If all three pass, the app is in a healthy baseline state and ready for module work (connectors, integrations, and feature slices).

## Manual local setup

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install dependencies.
npm install

# Step 4: Start the development server.
npm run dev
```

## Development workflow for upcoming modules

To keep connector/module development stable, use this routine before opening a PR:

1. `npm run lint`
2. `npm run test`
3. `npm run build`

## Tech stack

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## Deployment

Open [Lovable](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) and click **Share -> Publish**.

## Custom domains

To connect a domain, go to **Project > Settings > Domains** and click **Connect Domain**.

Reference: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)
