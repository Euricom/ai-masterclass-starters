# web-react

React frontend for the dotnet-spa template. Uses Vite, TypeScript, Tailwind CSS v4, shadcn/ui, and openapi-fetch to connect to the .NET API.

## Getting Started

```bash
# from the workspace root
bun run dev:react

# or from this directory
bun run dev
```

The dev server runs on http://localhost:5173. Make sure the API is running (`bun run dev:api` from the root).

## Scripts

| Script    | Description                       |
| --------- | --------------------------------- |
| `dev`     | Start dev server                  |
| `build`   | Production build                  |
| `preview` | Preview production build          |
| `test`    | Run tests with Vitest             |
| `gen:api` | Regenerate API types from OpenAPI |
| `check`   | Run lint and format checks        |

## Project Structure

```
src/
  api/              API client (openapi-fetch, generated types)
  components/       Shared and UI components (shadcn/ui)
  context/          React context providers
  features/         Feature modules
  hooks/            Custom hooks
  lib/              Utilities
  styles/           Global styles
  App.tsx           Root component
  main.tsx          Entry point
```
