# web-ng

Angular frontend for the dotnet-spa template. Uses Angular CLI, Vite, TypeScript, Tailwind CSS v4, and ng-openapi-gen to connect to the .NET API.

## Getting Started

```bash
# from the workspace root
bun run dev:ng

# or from this directory
bun run dev
```

The dev server runs on http://localhost:4200. Make sure the API is running (`bun run dev:api` from the root).

## Scripts

| Script    | Description                        |
| --------- | ---------------------------------- |
| `dev`     | Start dev server                   |
| `build`   | Production build                   |
| `test`    | Run tests                          |
| `gen:api` | Regenerate API client from OpenAPI |
| `check`   | Run lint and format checks         |

## Project Structure

```
src/
  api/              Generated API client (ng-openapi-gen)
  app/              App module, components, and routes
  styles.css        Global styles (Tailwind CSS entry)
  main.ts           Entry point
```
