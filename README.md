# Inventory Service

A standalone .NET 8 Web API microservice extracted from the [OrderManager monolith](https://github.com/Cognition-Partner-Workshops/app_dotnet-angular-monolith). Manages stock levels, warehouse locations, reorder alerts, and stock reservations for the decomposed OrderManager platform.

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
│         └───────────│  /swagger    │                    │
│                     └──────────────┘                    │
└─────────────────────────────────────────────────────────┘
         ▲                    ▲
         │                    │
    Browser users    OrderManager monolith
                    (HTTP client calls)
```

## Decomposition Context

### Before (Monolith)
All modules (Orders, Products, Customers, Inventory) shared one codebase, one database, and one deployment unit.

### After (Microservice)
The Inventory domain is extracted into this standalone service with:
- Its own .NET 8 Web API and EF Core DbContext
- Its own SQLite database (`inventory.db`)
- Its own Angular 17 frontend for inventory management
- Independent CI/CD pipeline, Dockerfile, and Helm chart
- The monolith now calls this service via HTTP instead of in-process

### Domain Boundaries

| Owned by Inventory Service | Owned by Monolith |
|---------------------------|-------------------|
| Stock levels (QuantityOnHand) | Orders |
| Warehouse locations | Products catalog |
| Reorder alerts (low-stock) | Customer data |
| Stock reservations (reserve) | Order-Inventory orchestration |

## Tech Stack

| Component | Technology | Version |
|-----------|-----------|---------|
| Backend API | ASP.NET Core | 8.0 |
| ORM | Entity Framework Core | 8.0 |
| Database | SQLite | 3.x |
| Frontend | Angular | 17.x |
| Container | Docker (multi-stage) | Alpine |
| Orchestration | Kubernetes + Helm | 3.x |
| GitOps | ArgoCD | 2.x |
| CI/CD | GitHub Actions | -- |
| Registry | Amazon ECR | -- |

## Getting Started

### Prerequisites

- [.NET 8 SDK](https://dotnet.microsoft.com/download/dotnet/8.0)
- [Node.js 20+](https://nodejs.org/) (for Angular frontend)
- [Docker](https://www.docker.com/) (optional, for container builds)

### Run Locally

```bash
# Clone and checkout
git clone https://github.com/Cognition-Partner-Workshops/app_dotnet-angular-microservices.git
cd app_dotnet-angular-microservices
git checkout workshop-mason

# Restore and run
dotnet restore
dotnet run --project src/InventoryService.Api/InventoryService.Api.csproj

# Service is available at:
#   API:     http://localhost:5000/api/inventory
#   Swagger: http://localhost:5000/swagger
#   Health:  http://localhost:5000/health
```

### Run Tests

```bash
dotnet test --verbosity normal
```

### Docker Build

```bash
docker build -f docker/Dockerfile -t inventory-service:local .
docker run -p 8080:8080 inventory-service:local

# Verify at http://localhost:8080/health
```

## Configuration

| Setting | Default | Description |
|---------|---------|-------------|
| `ConnectionStrings:DefaultConnection` | `Data Source=inventory.db` | SQLite connection string |
| `ASPNETCORE_ENVIRONMENT` | `Development` | Runtime environment |
| `ASPNETCORE_URLS` | `http://+:8080` (Docker) | Listen URL |

## API Reference

Full API documentation: [`docs/api-specification.md`](docs/api-specification.md)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/inventory` | List all inventory items |
| `GET` | `/api/inventory/product/{productId}` | Get inventory by product ID |
| `POST` | `/api/inventory/product/{productId}/restock` | Add stock to a product |
| `POST` | `/api/inventory/product/{productId}/reserve` | Reserve stock (used by monolith) |
| `GET` | `/api/inventory/low-stock` | Get items below reorder level |
| `GET` | `/health` | Kubernetes health probe |

### Quick Examples

```bash
# List all inventory
curl http://localhost:5000/api/inventory | jq .

# Get inventory for product 1
curl http://localhost:5000/api/inventory/product/1 | jq .

# Restock product 1 with 25 units
curl -X POST http://localhost:5000/api/inventory/product/1/restock \
  -H "Content-Type: application/json" \
  -d '{"quantity": 25}' | jq .

# Reserve 5 units of product 1 (used by order service)
curl -X POST http://localhost:5000/api/inventory/product/1/reserve \
  -H "Content-Type: application/json" \
  -d '{"quantity": 5}' | jq .

# Get low-stock items
curl http://localhost:5000/api/inventory/low-stock | jq .
```

## Project Structure

```
.
├── .github/workflows/          # CI/CD pipelines
│   ├── build-push.yaml         # Docker build + ECR push
│   └── inventory-service-ci.yaml # PR build + test
├── argocd/                     # ArgoCD application manifests
│   ├── application-dev.yaml
│   └── application-staging.yaml
├── client-app/                 # Angular 17 frontend
│   ├── src/app/modules/inventory/
│   │   ├── inventory-list.component.ts
│   │   ├── low-stock.component.ts
│   │   ├── inventory.model.ts
│   │   └── inventory.service.ts
│   └── ...
├── docker/
│   └── Dockerfile              # Multi-stage build (Node → .NET SDK → Alpine runtime)
├── docs/
│   ├── api-specification.md    # Detailed API reference
│   ├── architecture.md         # Architecture decision record
│   └── deployment.md           # Deployment and operations guide
├── helm/inventory-service/     # Helm chart
│   ├── Chart.yaml
│   ├── templates/
│   │   ├── deployment.yaml
│   │   ├── service.yaml
│   │   ├── ingress.yaml
│   │   ├── hpa.yaml
│   │   ├── networkpolicy.yaml
│   │   └── servicemonitor.yaml
│   ├── values.yaml             # Base values
│   ├── values-dev.yaml         # Dev overrides
│   └── values-staging.yaml     # Staging overrides
├── src/InventoryService.Api/   # .NET 8 Web API
│   ├── Controllers/
│   │   └── InventoryController.cs
│   ├── Data/
│   │   ├── InventoryDbContext.cs
│   │   └── SeedData.cs
│   ├── Models/
│   │   ├── InventoryItem.cs
│   │   └── RestockRequest.cs
│   ├── Services/
│   │   └── InventoryItemService.cs
│   └── Program.cs
├── tests/InventoryService.Api.Tests/
├── InventoryService.sln
└── README.md
```

## Infrastructure

### Docker Multi-Stage Build

| Stage | Base Image | Purpose |
|-------|-----------|---------|
| 1. `client-build` | `node:20-alpine` | Build Angular SPA |
| 2. `api-build` | `dotnet/sdk:8.0` | Restore, build, publish .NET API |
| 3. `runtime` | `dotnet/aspnet:8.0-alpine` | Minimal production image |

### Helm Chart

| Resource | Description |
|----------|-------------|
| Deployment | Pod spec with health probes, resource limits |
| Service | ClusterIP on port 80 → 8080 |
| Ingress | nginx ingress with TLS |
| HPA | Horizontal Pod Autoscaler (configurable) |
| NetworkPolicy | Restrict traffic to ingress-nginx + monitoring |
| ServiceMonitor | Prometheus metrics scraping |

### ArgoCD Deployment

| Environment | Namespace | Ingress Host | Values File |
|------------|-----------|--------------|-------------|
| Dev | `decomposition-dev` | `inventory-service-dev.workshop.local` | `values-dev.yaml` |
| Staging | `decomposition-staging` | `inventory-service-staging.workshop.local` | `values-staging.yaml` |

### CI/CD Pipeline

1. **On PR**: `dotnet restore` → `dotnet build` → `dotnet test`
2. **On push to main**: Build Docker image → Push to ECR (`599083837640.dkr.ecr.us-east-1.amazonaws.com/workshop/inventory-service`) → ArgoCD auto-sync

## Platform Conformance

| Requirement | Status |
|------------|--------|
| Health endpoint (`/health`) | Done |
| Prometheus metrics (`/metrics`) | Done |
| Helm chart with resource limits | Done |
| Network policy (default deny) | Done |
| HPA for autoscaling | Done |
| ArgoCD application manifests | Done |
| Multi-stage Docker build | Done |
| GitHub Actions CI/CD | Done |
| ECR image repository | Done |
| Environment-specific values | Done |

## Monolith Integration

The OrderManager monolith communicates with this service via a typed `HttpClient`:

```
OrderManager (monolith)                 Inventory Service
┌────────────────────┐                  ┌──────────────────┐
│ OrderService       │                  │                  │
│   └─ CreateOrder() │──POST /reserve──▶│ InventoryController│
│                    │                  │   └─ ReserveStock()│
│ InventoryController│                  │                  │
│   └─ GetAll()     │──GET  /──────────▶│   └─ GetAll()    │
│   └─ Restock()    │──POST /restock───▶│   └─ Restock()   │
└────────────────────┘                  └──────────────────┘
```

### Monolith Configuration

In the monolith's `appsettings.json`:
```json
{
  "InventoryService": {
    "BaseUrl": "http://localhost:5000"
  }
}
```

In Kubernetes, this URL points to the in-cluster service:
```
http://inventory-service.decomposition-dev.svc.cluster.local
```

## Development Guide

### Adding a New Endpoint

1. Add the method to `Services/InventoryItemService.cs`
2. Add the controller action to `Controllers/InventoryController.cs`
3. Add XML doc comments for Swagger generation
4. Write tests in `tests/InventoryService.Api.Tests/`
5. Update `docs/api-specification.md`

### Database Changes

This service uses EF Core with SQLite. To add a new field:

1. Update the model in `Models/InventoryItem.cs`
2. Update `Data/InventoryDbContext.cs` if needed
3. Update `Data/SeedData.cs` for development data
4. Run locally to verify migrations apply cleanly

### Running Both Services Together

```bash
# Terminal 1: Start inventory service
cd app_dotnet-angular-microservices
dotnet run --project src/InventoryService.Api/InventoryService.Api.csproj --urls http://localhost:5002

# Terminal 2: Start monolith (configured to call inventory service)
cd app_dotnet-angular-monolith
dotnet run --project src/OrderManager.Api/OrderManager.Api.csproj --urls http://localhost:5001
```

## See Also

- [Detailed API Specification](docs/api-specification.md)
- [Architecture Decision Record](docs/architecture.md)
- [Deployment & Operations Guide](docs/deployment.md)
- [OpenAPI Spec](docs/openapi-spec.yaml)
- [Monolith Repository](https://github.com/Cognition-Partner-Workshops/app_dotnet-angular-monolith)
- [Platform Shared Services](https://github.com/Cognition-Partner-Workshops/platform-engineering-shared-services)
- [Monolith IaC Patterns](https://github.com/Cognition-Partner-Workshops/app_dotnet-angular-monolith-iac)

## License

See [LICENSE](LICENSE).
