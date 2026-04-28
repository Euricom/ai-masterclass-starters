# Plan: Add SQLite + Entity Framework Core to Animals API

## Goal

Replace the in-memory `AnimalService` data layer with a persistent SQLite database via EF Core, while keeping the same API surface and validation behavior.

---

## Scope

- `packages/api/` — main changes
- `packages/api.tests/` — update unit tests to use EF Core in-memory provider
- `packages/api.tests.integration/` — integration tests should work unchanged (or with minor setup tweak)

---

## Steps

### 1. Add NuGet packages to `api.csproj`

```
Microsoft.EntityFrameworkCore.Sqlite
Microsoft.EntityFrameworkCore.Design
```

The `api.tests` project already references `api.csproj`, so it inherits EF Core.  
Add `Microsoft.EntityFrameworkCore.InMemory` to `api.tests.csproj` for unit tests.

---

### 2. Create `AnimalConfiguration`

New file: `packages/api/Data/AnimalConfiguration.cs`

- Implements `IEntityTypeConfiguration<Animal>`
- Configures table name, primary key, column types, and constraints (e.g. `IsRequired()`, `HasMaxLength()`)
- Keeps all EF-specific mapping out of the domain model

---

### 3. Create `AnimalDbContext`

New file: `packages/api/Data/AnimalDbContext.cs`

- Inherits `DbContext`
- Exposes `DbSet<Animal> Animals`
- Applies `AnimalConfiguration` in `OnModelCreating` via `modelBuilder.ApplyConfiguration(new AnimalConfiguration())`
- No seed data — seeding moves to a separate migration or startup helper

---

### 4. Keep `Animal` model clean

`Animal.cs` stays a plain C# class with no EF or validation annotations. All persistence concerns live in `AnimalConfiguration`.

---

### 5. Replace `AnimalService` with EF Core implementation

Rewrite `AnimalService.cs`:

- Constructor receives `AnimalDbContext` (injected)
- All methods become `async` (return `Task<T>`)
- Use `_context.Animals.ToListAsync()`, `FindAsync()`, `AddAsync()`, `SaveChangesAsync()` etc.
- Drop the static in-memory list and manual ID counter

Method signature changes:

| Before                                        | After                                                    |
| --------------------------------------------- | -------------------------------------------------------- |
| `IEnumerable<Animal> GetAll()`                | `Task<List<Animal>> GetAllAsync()`                       |
| `Animal? GetById(int id)`                     | `Task<Animal?> GetByIdAsync(int id)`                     |
| `Animal Create(CreateAnimalRequest)`          | `Task<Animal> CreateAsync(CreateAnimalRequest)`          |
| `Animal? Update(int id, UpdateAnimalRequest)` | `Task<Animal?> UpdateAsync(int id, UpdateAnimalRequest)` |
| `bool Delete(int id)`                         | `Task<bool> DeleteAsync(int id)`                         |

---

### 6. Update `AnimalEndpoints.cs`

- Make all route handlers `async`
- Call the new `*Async` methods and `await` them
- No changes to HTTP verbs, routes, or status codes

---

### 7. Update `Program.cs`

- Register `AnimalDbContext` with `AddDbContext<AnimalDbContext>`:
  ```csharp
  builder.Services.AddDbContext<AnimalDbContext>(options =>
      options.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection")
             ?? "Data Source=animals.db"));
  ```
- Change `AnimalService` registration from `Singleton` to `Scoped` (required by EF Core's scoped DbContext)
- Call `db.Database.EnsureCreated()` (or apply migrations) at startup

---

### 8. Add EF Core migration

From `packages/api/`:
```
dotnet ef migrations add InitialCreate
dotnet ef database update
```

This generates the `Migrations/` folder and creates `animals.db` on first run.

---

### 9. Update unit tests (`api.tests`)

Current tests instantiate `AnimalService` directly. After the change, `AnimalService` needs a `DbContext`.

- Add `Microsoft.EntityFrameworkCore.InMemory` package
- In each test, create an in-memory `AnimalDbContext`:
  ```csharp
  var options = new DbContextOptionsBuilder<AnimalDbContext>()
      .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
      .Build();
  var context = new AnimalDbContext(options);
  var service = new AnimalService(context);
  ```
- Update test assertions for async calls (`await service.GetAllAsync()`)
- Remove tests that relied on seeded data in the constructor (or seed manually in test setup)

---

### 10. Integration tests (`api.tests.integration`)

`WebApplicationFactory` spins up the real app. The SQLite DB will be created via `EnsureCreated()` at startup. Tests should continue to work. If test isolation is needed, override the connection string in the test factory to use a separate in-memory or temp-file SQLite DB.

---

## File Changelist

| File                                                     | Action                                       |
| -------------------------------------------------------- | -------------------------------------------- |
| `packages/api/api.csproj`                                | Add EF Core + SQLite packages                |
| `packages/api/Data/AnimalConfiguration.cs`               | **New** — `IEntityTypeConfiguration<Animal>` |
| `packages/api/Data/AnimalDbContext.cs`                   | **New** — DbContext, applies configuration   |
| `packages/api/Animal.cs`                                 | No changes — stays annotation-free           |
| `packages/api/AnimalService.cs`                          | Rewrite — async, EF Core                     |
| `packages/api/AnimalEndpoints.cs`                        | Update — async handlers                      |
| `packages/api/Program.cs`                                | Register DbContext, change service lifetime  |
| `packages/api/Migrations/`                               | **New** — generated by EF tooling            |
| `packages/api.tests/api.tests.csproj`                    | Add InMemory provider package                |
| `packages/api.tests/AnimalServiceTests.cs`               | Rewrite — async, in-memory DbContext         |
| `packages/api.tests.integration/AnimalEndpointsTests.cs` | Minor adjustments if needed                  |

---

## Out of scope

- No repository pattern or additional abstraction layers
- No seeding via migrations (keep it simple with `EnsureCreated`)
- No connection pooling configuration
- No multi-environment connection strings (single `appsettings.json` entry)
