# Inventory Microservice

Standalone microservice for inventory management, decomposed from the [OrderManager monolith](https://github.com/Cognition-Partner-Workshops/app_dotnet-angular-monolith). Owns all data related to product stock levels, warehouse locations, restocking, and low-stock alerts.

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                   Inventory Service                      │
│                                                          │
│  ┌──────────┐   ┌────────────────┐   ┌───────────────┐ │
│  │ Angular  │   │  .NET 8 Web    │   │  SQLite DB    │ │
│  │ Frontend │──▶│  API (REST)    │──▶│  (EF Core)    │ │
│  └──────────┘   └────────────────┘   └───────────────┘ │
│                        │                                 │
│                   /health                                │
│                   /swagger                               │
│                   /metrics                               │
└─────────────────────────────────────────────────────────┘
        ▲                    ▲
        │                    │
   Ingress NGINX        Order Service
   (external)           (HTTP client)
```

### Key Design Decisions

| Decision | Rationale |
|----------|-----------|
| Denormalized `ProductName` and `Sku` on `InventoryItem` | Avoids cross-service calls to Products service for display |
| Separate `/check` and `/deduct` endpoints | Order service can verify stock before committing, then deduct atomically |
| SQLite for persistence | Matches monolith pattern; easily swapped for PostgreSQL in production |
| Health check at `/health` | Platform standard for liveness/readiness probes |

## Tech Stack

| Component | Technology |
|-----------|-----------|
| Backend | .NET 8, C# 12, ASP.NET Core Web API |
| ORM | Entity Framework Core 8 (SQLite) |
| Frontend | Angular 17, TypeScript 5.2 |
| API Docs | Swagger / OpenAPI 3.0 |
| Container | Multi-stage Docker (Alpine-based) |
| Orchestration | Kubernetes (Helm chart) |
| GitOps | ArgoCD |
| CI/CD | GitHub Actions |
| Monitoring | Prometheus ServiceMonitor |

## Project Structure

```
app_dotnet-angular-microservices/
├── InventoryService.sln                   # Solution file
├── src/inventory-service/
│   ├── InventoryService.Api/              # .NET 8 Web API
│   │   ├── Controllers/                   # REST controllers
│   │   ├── Models/                        # EF Core entity models
│   │   ├── DTOs/                          # Request/response DTOs
│   │   ├── Services/                      # Business logic layer
│   │   ├── Data/                          # DbContext and seed data
│   │   ├── Program.cs                     # Application entry point
│   │   └── appsettings.json               # Configuration
│   └── client-app/                        # Angular 17 frontend
│       ├── src/app/modules/inventory/     # Inventory components
│       └── src/app/modules/shared/        # Shared services
├── tests/inventory-service/
│   └── InventoryService.Api.Tests/        # xUnit tests
├── iac/inventory-service/
│   ├── docker/Dockerfile                  # Multi-stage build
│   ├── helm/inventory-service/            # Helm chart
│   │   ├── templates/                     # K8s manifests
│   │   ├── values.yaml                    # Default values
│   │   ├── values-dev.yaml                # Dev overrides
│   │   └── values-staging.yaml            # Staging overrides
│   └── argocd/                            # ArgoCD applications
├── .github/workflows/
│   └── inventory-service-ci.yaml          # CI/CD pipeline
└── docs/
    └── inventory-service-openapi.yaml     # OpenAPI 3.0 specification
```

## Getting Started

### Prerequisites

- .NET 8 SDK
- Node.js 20+
- Angular CLI (`npm install -g @angular/cli`)

### Run the API

```bash
# Restore dependencies
dotnet restore InventoryService.sln

# Run the API (port 5062)
dotnet run --project src/inventory-service/InventoryService.Api/InventoryService.Api.csproj
```

The API will be available at `http://localhost:5062`. Swagger UI at `http://localhost:5062/swagger`.

### Run the Frontend (standalone dev mode)

```bash
cd src/inventory-service/client-app
npm install
ng serve --port 4201
```

Frontend at `http://localhost:4201`.

### Run Tests

```bash
dotnet test InventoryService.sln --verbosity normal
```

## API Reference

Full OpenAPI specification: [`docs/inventory-service-openapi.yaml`](docs/inventory-service-openapi.yaml)

### Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/inventory` | List all inventory items |
| `GET` | `/api/inventory/{id}` | Get item by ID |
| `GET` | `/api/inventory/product/{productId}` | Get item by product ID |
| `POST` | `/api/inventory` | Create new inventory record |
| `POST` | `/api/inventory/product/{productId}/restock` | Restock a product |
| `GET` | `/api/inventory/product/{productId}/check?quantity=N` | Check stock availability |
| `POST` | `/api/inventory/product/{productId}/deduct` | Deduct stock (for Order service) |
| `GET` | `/api/inventory/low-stock` | List low-stock items |
| `GET` | `/health` | Health check |
| `GET` | `/swagger` | Swagger UI |

### Example Requests

```bash
# List all inventory
curl http://localhost:5062/api/inventory

# Check stock for product 1
curl "http://localhost:5062/api/inventory/product/1/check?quantity=10"

# Restock product 1
curl -X POST http://localhost:5062/api/inventory/product/1/restock \
  -H "Content-Type: application/json" \
  -d '{"quantity": 100}'

# Deduct stock (called by Order service)
curl -X POST http://localhost:5062/api/inventory/product/1/deduct \
  -H "Content-Type: application/json" \
  -d '{"quantity": 5}'
```

## Infrastructure

### Docker

Multi-stage build following the monolith IaC pattern:

```bash
docker build -f iac/inventory-service/docker/Dockerfile -t inventory-service .
docker run -p 8080:8080 inventory-service
```

### Helm

```bash
helm upgrade --install inventory-service iac/inventory-service/helm/inventory-service \
  -f iac/inventory-service/helm/inventory-service/values-dev.yaml \
  -n decomposition-dev
```

### ArgoCD

```bash
kubectl apply -f iac/inventory-service/argocd/application-dev.yaml
kubectl apply -f iac/inventory-service/argocd/application-staging.yaml
```

### CI/CD Pipeline

The GitHub Actions workflow (`.github/workflows/inventory-service-ci.yaml`):

1. **Build & Test** — Restores, builds, and runs xUnit tests
2. **Angular Build** — Installs deps and builds the Angular app
3. **Docker Push** (main only) — Builds image and pushes to ECR
4. **ArgoCD Sync** — ArgoCD auto-syncs from the Helm chart

### Platform Conformance

This service conforms to the [platform-engineering-shared-services](https://github.com/Cognition-Partner-Workshops/platform-engineering-shared-services) standard:

- **Namespaces**: `decomposition-dev`, `decomposition-staging`
- **Network Policies**: Default-deny with explicit ingress from `ingress-nginx` and `monitoring`
- **Monitoring**: ServiceMonitor for Prometheus scraping at `/metrics`
- **Health Probes**: Liveness and readiness at `/health`
- **HPA**: Horizontal Pod Autoscaler enabled in staging (2–4 replicas)
- **ECR**: `599083837640.dkr.ecr.us-east-1.amazonaws.com/workshop/inventory-service`

## Monolith Integration

The OrderManager monolith has been refactored to call this service via HTTP instead of accessing inventory data directly through EF Core. The monolith now uses an `InventoryServiceClient` that:

1. Calls `GET /api/inventory/product/{id}/check?quantity=N` before creating orders
2. Calls `POST /api/inventory/product/{id}/deduct` to reserve stock during order creation
3. Proxies `GET /api/inventory` and other read endpoints for the monolith frontend

Configuration in the monolith's `appsettings.json`:

```json
{
  "InventoryService": {
    "BaseUrl": "http://inventory-service.decomposition-dev.svc.cluster.local"
  }
}
```

## License

MIT
