# Inventory Service

A standalone .NET 8 Web API microservice extracted from the [OrderManager monolith](https://github.com/Cognition-Partner-Workshops/app_dotnet-angular-monolith). Manages stock levels, warehouse locations, reorder alerts, and stock deductions for the decomposed OrderManager platform.

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                   Inventory Service                     │
│                                                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │  Angular 17   │  │  .NET 8 API  │  │   SQLite DB  │  │
│  │  Frontend     │──│  Controllers │──│  EF Core     │  │
│  │  (SPA)        │  │  Services    │  │  DbContext   │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
│         │                  │                             │
│         │           ┌──────────────┐                    │
│         │           │  /health     │                    │
│         │           │  /metrics    │                    │
│         │           │  /swagger    │                    │
│         │           └──────────────┘                    │
└─────────────────────────────────────────────────────────┘
         │                  │
         ▼                  ▼
   Browser Clients    OrderManager Monolith
                      (via HTTP client)
```

### Decomposition Context

This service was extracted from the `Inventory` module of the OrderManager monolith as part of a monolith-to-microservices decomposition. It conforms to the platform standard defined in [platform-engineering-shared-services](https://github.com/Cognition-Partner-Workshops/platform-engineering-shared-services).

| Before (Monolith) | After (Microservice) |
|---|---|
| Shared `AppDbContext` with all modules | Own `InventoryDbContext` with single table |
| `InventoryItem` model with FK to `Product` | `InventoryItem` with `ProductId` + `ProductName` (no FK) |
| In-process `InventoryService` class | Standalone HTTP API (`InventoryManager`) |
| Coupled to Order creation flow via direct DB access | Decoupled — monolith calls via `InventoryServiceClient` |

### Domain Boundaries

The inventory service owns:
- **Stock levels** — quantity on hand per product
- **Warehouse locations** — physical storage location identifiers
- **Reorder alerts** — low-stock detection based on configurable thresholds
- **Stock mutations** — restock (increase) and deduct (decrease) operations

It does **not** own product catalog data. Product names are denormalized into the inventory record for display purposes.

## Tech Stack

| Component | Technology | Version |
|-----------|-----------|---------|
| Backend API | .NET / ASP.NET Core | 8.0 |
| Language | C# | 12 |
| ORM | Entity Framework Core | 8.0 |
| Database | SQLite | — |
| Frontend | Angular | 17 |
| API Docs | Swagger / OpenAPI | via Swashbuckle 6.5 |
| Container | Docker (multi-stage) | Alpine-based |
| Orchestration | Kubernetes (Helm) | — |
| GitOps | ArgoCD | — |
| CI/CD | GitHub Actions | — |
| Monitoring | Prometheus (ServiceMonitor) | — |

## Getting Started

### Prerequisites

- [.NET 8 SDK](https://dotnet.microsoft.com/download/dotnet/8.0)
- [Node.js 18+](https://nodejs.org/) (for the Angular frontend)
- [Angular CLI](https://angular.io/cli) (`npm install -g @angular/cli`)

### Run Locally

```bash
# From the services/inventory-service directory:

# 1. Restore .NET dependencies
dotnet restore

# 2. Install Angular dependencies
cd client-app && npm install && cd ..

# 3. Build the Angular frontend (output goes to wwwroot)
cd client-app && npm run build && cd ..

# 4. Run the API (serves the Angular SPA too)
dotnet run --project src/InventoryService.Api/InventoryService.Api.csproj
```

The service starts on `http://localhost:5000` by default. Swagger UI is available at `/swagger`.

### Run Tests

```bash
# Run all unit tests
dotnet test

# Run with verbose output
dotnet test --verbosity normal
```

### Configuration

Configuration is managed via `appsettings.json` and environment variables:

| Setting | Default | Description |
|---------|---------|-------------|
| `ConnectionStrings:DefaultConnection` | `Data Source=inventory.db` | SQLite connection string |
| `ASPNETCORE_ENVIRONMENT` | `Development` | Runtime environment |
| `ASPNETCORE_URLS` | `http://+:8080` (container) | Listen URL |

For Kubernetes deployments, override via Helm values or environment variables:

```yaml
env:
  - name: ConnectionStrings__DefaultConnection
    value: "Data Source=/data/inventory.db"
```

## API Reference

Base path: `/api/inventory`

### GET /api/inventory

Returns all inventory items.

**Response:** `200 OK`

```json
[
  {
    "id": 1,
    "productId": 1,
    "productName": "Widget A",
    "quantityOnHand": 50,
    "reorderLevel": 10,
    "warehouseLocation": "A-01",
    "lastRestocked": "2025-01-15T10:30:00Z"
  }
]
```

### GET /api/inventory/product/{productId}

Returns inventory for a specific product.

**Parameters:**
| Name | In | Type | Description |
|------|-----|------|-------------|
| `productId` | path | `int` | Product identifier |

**Response:** `200 OK` — inventory item, or `404 Not Found`

```json
{
  "id": 1,
  "productId": 1,
  "productName": "Widget A",
  "quantityOnHand": 50,
  "reorderLevel": 10,
  "warehouseLocation": "A-01",
  "lastRestocked": "2025-01-15T10:30:00Z"
}
```

### POST /api/inventory/product/{productId}/restock

Adds stock to an inventory item.

**Parameters:**
| Name | In | Type | Description |
|------|-----|------|-------------|
| `productId` | path | `int` | Product identifier |

**Request Body:**

```json
{ "quantity": 25 }
```

**Response:** `200 OK` — updated inventory item, or `404 Not Found` if no inventory record exists.

### POST /api/inventory/product/{productId}/deduct

Deducts stock from an inventory item (used by order creation).

**Parameters:**
| Name | In | Type | Description |
|------|-----|------|-------------|
| `productId` | path | `int` | Product identifier |

**Request Body:**

```json
{ "quantity": 5 }
```

**Response:**
- `200 OK` — updated inventory item
- `404 Not Found` — no inventory record for product
- `409 Conflict` — insufficient stock

```json
{ "error": "Insufficient stock for product 1. Available: 3, Requested: 5" }
```

### GET /api/inventory/low-stock

Returns all items where `quantityOnHand <= reorderLevel`.

**Response:** `200 OK` — array of inventory items below reorder threshold.

### GET /health

Kubernetes health/readiness probe. Returns `200 OK` when the service and database are healthy.

## Project Structure

```
services/inventory-service/
├── InventoryService.sln              # Solution file
├── README.md                         # This file
├── src/
│   └── InventoryService.Api/
│       ├── InventoryService.Api.csproj
│       ├── Program.cs                # Application entry point, DI, middleware
│       ├── appsettings.json          # Configuration
│       ├── Controllers/
│       │   └── InventoryController.cs  # REST API endpoints
│       ├── Services/
│       │   └── InventoryManager.cs   # Business logic layer
│       ├── Models/
│       │   └── InventoryItem.cs      # Domain entity
│       └── Data/
│           ├── InventoryDbContext.cs  # EF Core database context
│           └── SeedData.cs           # Development seed data
├── tests/
│   └── InventoryService.Api.Tests/
│       ├── InventoryService.Api.Tests.csproj
│       └── InventoryManagerTests.cs  # Unit tests for business logic
├── client-app/                       # Angular 17 SPA frontend
│   ├── package.json
│   ├── angular.json
│   ├── tsconfig.json
│   └── src/
│       ├── main.ts
│       ├── index.html
│       ├── environments/
│       │   ├── environment.ts
│       │   └── environment.prod.ts
│       └── app/
│           ├── app.component.ts
│           ├── app.routes.ts
│           └── modules/inventory/
│               ├── inventory-list.component.ts
│               └── low-stock.component.ts
├── docker/
│   └── Dockerfile                    # Multi-stage build (Node + .NET + Alpine runtime)
├── helm/
│   └── inventory-service/
│       ├── Chart.yaml
│       ├── values.yaml               # Base values
│       ├── values-dev.yaml           # Dev environment overrides
│       ├── values-staging.yaml       # Staging environment overrides
│       └── templates/
│           ├── _helpers.tpl
│           ├── deployment.yaml
│           ├── service.yaml
│           ├── ingress.yaml
│           ├── networkpolicy.yaml
│           ├── hpa.yaml
│           └── servicemonitor.yaml
└── argocd/
    ├── application-dev.yaml          # ArgoCD app for dev namespace
    └── application-staging.yaml      # ArgoCD app for staging namespace
```

## Infrastructure

### Docker

The Dockerfile uses a three-stage build following the pattern from [`app_dotnet-angular-monolith-iac`](https://github.com/Cognition-Partner-Workshops/app_dotnet-angular-monolith-iac):

1. **client-build** — `node:20-alpine`: installs npm deps and builds the Angular SPA
2. **api-build** — `mcr.microsoft.com/dotnet/sdk:8.0`: restores NuGet packages, copies Angular output to `wwwroot/`, publishes the .NET app
3. **runtime** — `mcr.microsoft.com/dotnet/aspnet:8.0-alpine`: minimal production image exposing port 8080

```bash
# Build locally
docker build -f docker/Dockerfile -t inventory-service:local .

# Run locally
docker run -p 8080:8080 inventory-service:local
```

### Helm Chart

Deploys to Kubernetes with the following resources:

| Resource | Template | Description |
|----------|----------|-------------|
| Deployment | `deployment.yaml` | Pod spec with health probes, resource limits, env vars |
| Service | `service.yaml` | ClusterIP service on port 80 → 8080 |
| Ingress | `ingress.yaml` | nginx ingress with TLS via cert-manager |
| NetworkPolicy | `networkpolicy.yaml` | Allow ingress from nginx + monitoring; allow DNS + HTTPS egress |
| HPA | `hpa.yaml` | Horizontal Pod Autoscaler (CPU-based, disabled by default) |
| ServiceMonitor | `servicemonitor.yaml` | Prometheus metrics scraping at `/metrics` |

```bash
# Deploy to dev
helm upgrade --install inventory-service helm/inventory-service \
  -f helm/inventory-service/values.yaml \
  -f helm/inventory-service/values-dev.yaml \
  -n decomposition-dev
```

### ArgoCD

GitOps deployment via ArgoCD Application manifests:

- **Dev**: `argocd/application-dev.yaml` → deploys to `decomposition-dev` namespace
- **Staging**: `argocd/application-staging.yaml` → deploys to `decomposition-staging` namespace

Both use automated sync with pruning and self-healing enabled.

### CI/CD Pipeline

The GitHub Actions workflow (`.github/workflows/inventory-service-ci.yaml`) runs on pushes and PRs to `main` that modify `services/inventory-service/**`:

1. **test** job: Restore → Build → Run unit tests
2. **build-and-push** job (main branch only): Build Docker image → Push to ECR → Trigger ArgoCD sync

ECR repository: `599083837640.dkr.ecr.us-east-1.amazonaws.com/workshop/inventory-service`

### Platform Conformance

This service conforms to the [platform-engineering-shared-services](https://github.com/Cognition-Partner-Workshops/platform-engineering-shared-services) standard:

- [x] Own Helm chart following the monolith IaC template
- [x] ArgoCD Application manifests for GitOps deployment
- [x] Deploys to `decomposition-dev` / `decomposition-staging` namespaces
- [x] Network policies — accepts traffic only from `ingress-nginx` and `monitoring` namespaces
- [x] Prometheus metrics via ServiceMonitor
- [x] ECR for container image storage
- [x] Health check endpoint (`/health`) with database connectivity check
- [x] Own database (SQLite, no shared database)

## Monolith Integration

After extracting this service, the monolith's `OrderService.CreateOrderAsync()` calls the inventory service via HTTP instead of accessing the `InventoryItems` table directly:

```csharp
// Before (monolith): direct DB access
var inventory = await _context.InventoryItems.FirstOrDefaultAsync(i => i.ProductId == productId);
inventory.QuantityOnHand -= quantity;

// After (decomposed): HTTP call to inventory-service
await _inventoryClient.DeductStockAsync(productId, quantity);
```

The monolith registers an `InventoryServiceClient` (typed `HttpClient`) that proxies all inventory operations to this service. See the [monolith refactoring PR](https://github.com/Cognition-Partner-Workshops/app_dotnet-angular-monolith/tree/workshop-mason) for details.

### Service Communication

```
┌──────────────────┐     HTTP      ┌──────────────────┐
│  OrderManager    │──────────────▶│  Inventory       │
│  Monolith        │               │  Service         │
│                  │  POST /deduct │                  │
│  OrderService    │  GET  /       │  InventoryManager│
│  InventoryClient │  GET  /low-   │  InventoryDb     │
│                  │       stock   │  Context         │
└──────────────────┘               └──────────────────┘
```

## Development

### Adding a New Endpoint

1. Add the method to `Services/InventoryManager.cs`
2. Add the controller action to `Controllers/InventoryController.cs`
3. Add a unit test in `tests/InventoryService.Api.Tests/InventoryManagerTests.cs`
4. If the monolith needs to call it, update `InventoryServiceClient` in the monolith repo

### Database Changes

This service uses EF Core with SQLite. The schema is defined in `InventoryDbContext.OnModelCreating()`. For development, `SeedData.Initialize()` populates initial data on startup.

To add a new column:
1. Update the `InventoryItem` model
2. Update `OnModelCreating` if constraints are needed
3. Update seed data if applicable
4. The database is recreated via `EnsureCreated()` in development

### Running Both Services Together

```bash
# Terminal 1: Start the inventory service
cd services/inventory-service
dotnet run --project src/InventoryService.Api/InventoryService.Api.csproj --urls http://localhost:5002

# Terminal 2: Start the monolith (configured to call inventory service at localhost:5002)
cd app_dotnet-angular-monolith
dotnet run --project src/OrderManager.Api/OrderManager.Api.csproj --urls http://localhost:5001
```

The monolith's `appsettings.json` has `InventoryService:BaseUrl` set to `http://localhost:5002`.

## License

MIT
