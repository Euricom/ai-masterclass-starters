## [Unreleased]

### 2026-04-24

#### Added
- `api`: migrated the Animals module from an in-memory list to SQLite via EF Core.

#### Chore
- Added SQLite database files to `.gitignore`.

### 2026-04-22

#### Changed
- Moved `@angular/platform-browser-dynamic` from root devDependencies into `packages/web-ng` dependencies.

#### Removed
- Dropped the `web-ng` workspace entry from root devDependencies.
- Removed the Blazor full-stack architecture section from `docs/architecture.md` (no Blazor package in the repo).

### 2026-04-20

#### Added
- Timesheet Zone PRD and implementation plan (`docs/`).
- Architecture and requirements documentation (`docs/`).
- Claude product development workflow skills.

#### Removed
- Unused `@analogjs/vite-plugin-angular` dependency from `web-ng`.

### 2026-04-02

#### Added
- `web-tanstack-start` package: TanStack Start frontend with minimal layout, home page, and `/animals` route fetching from the API.
- `web-ng` animals page under `modules/animals` that fetches and displays animals in a table, with routing that redirects root to `/animals`.

#### Changed
- Updated READMEs for all frontend packages and the root.
- Regenerated `ng-openapi-gen` API client for `web-ng`; reformatted animals page template.
- Renamed `web-ng` `start` script to `dev` for workspace consistency.
- Switched `web-ng` from Vite to the Angular CLI; added a sample test.
- Simplified `web-ng` template, added Tailwind, and integrated the animal API.
- Reformatted `web-react` API files.

#### Fixed
- Removed `emitDecoratorMetadata` and restored the `web-ng` app component template.

#### Removed
- Unused `@analogjs/vite-plugin-angular` dependency from `web-ng`.
- Leftover Vite `index.html` and unused Vite dev script from `web-ng`.

#### Chore
- Added `platform-browser-dynamic` and `web-ng` workspace dependencies.

### 2026-03-30

#### Added
- Initial `api` package: .NET 10 Web API with in-memory CRUD for animal resources, shared utilities for API grouping/response models, and dev HTTP samples.
- Initial `web` React frontend: Bun workspace, Vite 8, React 19, Tailwind CSS 4, initial shadcn UI components, and TypeScript path aliases.
- Unit and integration test projects for the API.
- Scalar integration for API documentation and OpenAPI support.
- Vitest and automated API type generation for the web package.
- Type-safe animal API client using `openapi-fetch` with full CRUD and exported DTO types derived from the API schema.
- Angular frontend scaffold in `packages/web-ng`.

#### Changed
- Refactored API into service-based modules with data validation.
- Configured monorepo-wide linting and formatting with vite-plus.
- Updated README and VS Code settings for developer experience.
- Renamed `packages/web` to `packages/web-react` to support multiple frontend frameworks.
- Updated README to document React and Angular frontend options.

#### Initial
- Initial commit.
