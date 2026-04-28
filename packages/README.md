# template-dotnet-spa

A full-stack starter template combining a .NET 10 REST API with SPA frontends. The backend (C#) serves a simple CRUD API for managing animals, while three frontend options are provided:

- **React** (`packages/web-react`) — React + Vite + TypeScript with Tailwind CSS and shadcn/ui components
- **TanStack Start** (`packages/web-tanstack-start`) — TanStack Start (SSR) + TanStack Router/Query + Tailwind CSS
- **Angular** (`packages/web-ng`) — Angular + Vite + TypeScript with Tailwind CSS

All frontends and the API live in a monorepo managed by Bun workspaces.

Built as a starting point for the AI Masterclass — participants wire a frontend to the backend and build out features from there.

## Prerequisites

- [.NET 10 SDK](https://dotnet.microsoft.com/download/dotnet/10.0)
- [Bun](https://bun.sh/) (v1.3+)

## Quick start

Choose your preferred frontend and follow the setup instructions below.
If you don't plan to use the others, you can remove their entries from `package.json`, their respective folders, and related README sections.

**Frontend (React):**

```bash
# install dependencies
bun install

# start the React frontend
bun run dev:react
```

**Frontend (TanStack Start):**

```bash
bun run dev:tanstack
```

**Frontend (Angular):**

```bash
bun run dev:ng
```

**Backend:**

```bash
# run the API Service in watch mode
bun run dev:api

# run the API unit tests
bun run test:api
bun run test:api:int
```
